import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { RoomStatus, ContractStatus } from '@prisma/client';

function serializeRoom(room: Record<string, unknown>) {
  const { roomName, baseRentPrice, description, depositSuggested, area, ...rest } = room;
  return {
    ...rest,
    name: roomName,
    baseRent: baseRentPrice != null ? parseFloat(String(baseRentPrice)) : 0,
    area: area != null ? parseFloat(String(area)) : null,
    depositSuggested:
      depositSuggested != null ? parseFloat(String(depositSuggested)) : null,
    notes: description,
  };
}

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  private async verifyMotelAccess(motelId: string, ownerId: string) {
    const motel = await this.prisma.motel.findFirst({
      where: { id: motelId, ownerId },
    });
    if (!motel) {
      throw new NotFoundException('Motel not found');
    }
    return motel;
  }

  async findAll(motelId: string, ownerId: string, query: QueryRoomDto) {
    await this.verifyMotelAccess(motelId, ownerId);

    const where: Record<string, unknown> = { motelId };
    if (query.status) where.status = query.status;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        orderBy: { roomCode: 'asc' },
        skip,
        take: limit,
        include: {
          contracts: {
            where: { status: ContractStatus.ACTIVE },
            take: 1,
            select: {
              representativeTenant: {
                select: { id: true, fullName: true },
              },
            },
          },
        },
      }),
      this.prisma.room.count({ where }),
    ]);

    return {
      data: rooms.map((r) => {
        const activeTenant = r.contracts[0]?.representativeTenant ?? null;
        const { contracts: _c, ...roomData } = r as Record<string, unknown>;
        return { ...serializeRoom(roomData), currentTenant: activeTenant };
      }),
      total,
      page,
      limit,
    };
  }

  async findOne(motelId: string, id: string, ownerId: string) {
    await this.verifyMotelAccess(motelId, ownerId);

    const room = await this.prisma.room.findFirst({
      where: { id, motelId },
      include: {
        contracts: {
          where: { status: ContractStatus.ACTIVE },
          select: {
            id: true,
            contractCode: true,
            startDate: true,
            endDate: true,
            rentAmount: true,
            status: true,
          },
          take: 1,
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const serialized = serializeRoom(room as unknown as Record<string, unknown>);
    return {
      ...serialized,
      contracts: room.contracts.map((c) => ({
        ...c,
        rentAmount: parseFloat(String(c.rentAmount)),
      })),
    };
  }

  async create(motelId: string, dto: CreateRoomDto, ownerId: string) {
    await this.verifyMotelAccess(motelId, ownerId);

    const existing = await this.prisma.room.findUnique({
      where: { motelId_roomCode: { motelId, roomCode: dto.roomCode } },
    });

    if (existing) {
      throw new ConflictException(
        'Room code already exists in this motel',
      );
    }

    const room = await this.prisma.room.create({
      data: {
        motelId,
        roomCode: dto.roomCode,
        roomName: dto.name,
        baseRentPrice: dto.baseRent,
        floor: dto.floor,
        area: dto.area,
        depositSuggested: dto.depositSuggested,
        maxOccupants: dto.maxOccupants,
        description: dto.notes,
      },
    });

    return serializeRoom(room as unknown as Record<string, unknown>);
  }

  async update(
    motelId: string,
    id: string,
    dto: UpdateRoomDto,
    ownerId: string,
  ) {
    await this.verifyMotelAccess(motelId, ownerId);

    const room = await this.prisma.room.findFirst({ where: { id, motelId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Validate status transitions
    if (dto.status) {
      if (dto.status === RoomStatus.VACANT) {
        const activeContract = await this.prisma.contract.findFirst({
          where: { roomId: id, status: ContractStatus.ACTIVE },
        });
        if (activeContract) {
          throw new BadRequestException(
            'Cannot set room to VACANT while an active contract exists',
          );
        }
      }

      if (dto.status === RoomStatus.OCCUPIED) {
        throw new BadRequestException(
          'OCCUPIED status is set automatically by contract activation',
        );
      }
    }

    // Check roomCode uniqueness if changing
    if (dto.roomCode && dto.roomCode !== room.roomCode) {
      const codeConflict = await this.prisma.room.findUnique({
        where: {
          motelId_roomCode: { motelId, roomCode: dto.roomCode },
        },
      });
      if (codeConflict) {
        throw new ConflictException('Room code already exists in this motel');
      }
    }

    const updated = await this.prisma.room.update({
      where: { id },
      data: {
        ...(dto.roomCode !== undefined ? { roomCode: dto.roomCode } : {}),
        ...(dto.name !== undefined ? { roomName: dto.name } : {}),
        ...(dto.baseRent !== undefined
          ? { baseRentPrice: dto.baseRent }
          : {}),
        ...(dto.floor !== undefined ? { floor: dto.floor } : {}),
        ...(dto.area !== undefined ? { area: dto.area } : {}),
        ...(dto.depositSuggested !== undefined
          ? { depositSuggested: dto.depositSuggested }
          : {}),
        ...(dto.maxOccupants !== undefined
          ? { maxOccupants: dto.maxOccupants }
          : {}),
        ...(dto.notes !== undefined
          ? { description: dto.notes }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });

    return serializeRoom(updated as unknown as Record<string, unknown>);
  }

  // --- Flat route methods (used by /rooms controller) ---

  async findAllFlat(query: QueryRoomDto) {
    const where: Record<string, unknown> = {};
    if (query.motelId) where.motelId = query.motelId;
    if (query.status) where.status = query.status;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        include: {
          motel: { select: { id: true, name: true } },
          contracts: {
            where: { status: ContractStatus.ACTIVE },
            take: 1,
            select: {
              id: true,
              contractCode: true,
              status: true,
              representativeTenant: {
                select: { id: true, fullName: true, phoneNumber: true },
              },
              contractTenants: {
                select: {
                  tenantId: true,
                  isRepresentative: true,
                  tenant: {
                    select: { id: true, fullName: true, phoneNumber: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { roomCode: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.room.count({ where }),
    ]);

    return {
      data: rooms.map((r) => {
        const activeContract = r.contracts[0] ?? null;
        const { contracts: _c, ...roomData } = r as Record<string, unknown>;
        const serialized = serializeRoom(roomData);
        return {
          ...serialized,
          contracts: activeContract
            ? [{
                ...activeContract,
                tenants: activeContract.contractTenants.map((ct) => ({
                  isRepresentative: ct.isRepresentative,
                  tenant: ct.tenant,
                })),
              }]
            : [],
        };
      }),
      total,
      page,
      limit,
    };
  }

  async findOneById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        motel: { select: { id: true, name: true } },
        contracts: {
          where: { status: ContractStatus.ACTIVE },
          select: {
            id: true,
            contractCode: true,
            startDate: true,
            endDate: true,
            rentAmount: true,
            status: true,
            // include tenants so frontend can display occupant list
            contractTenants: {
              select: {
                id: true,
                tenantId: true,
                isRepresentative: true,
                tenant: {
                  select: { id: true, fullName: true, phoneNumber: true },
                },
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const serialized = serializeRoom(room as unknown as Record<string, unknown>);
    return {
      ...serialized,
      contracts: room.contracts.map((c) => {
        const { contractTenants, ...rest } = c as typeof c & { contractTenants?: unknown[] }
        return {
          ...rest,
          rentAmount: parseFloat(String(c.rentAmount)),
          // map contractTenants → tenants to match frontend Room type
          tenants: contractTenants ?? [],
        }
      }),
    };
  }

  async createFlat(dto: CreateRoomDto, ownerId: string) {
    if (!dto.motelId) {
      throw new BadRequestException('motelId is required');
    }
    return this.create(dto.motelId, dto, ownerId);
  }

  async updateById(id: string, dto: UpdateRoomDto, ownerId: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return this.update(room.motelId, id, dto, ownerId);
  }

  async removeById(id: string, ownerId: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return this.remove(room.motelId, id, ownerId);
  }

  async remove(motelId: string, id: string, ownerId: string) {
    await this.verifyMotelAccess(motelId, ownerId);

    const room = await this.prisma.room.findFirst({ where: { id, motelId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const contractCount = await this.prisma.contract.count({
      where: { roomId: id },
    });

    if (contractCount > 0) {
      throw new ForbiddenException(
        'Cannot delete room with contract history',
      );
    }

    await this.prisma.room.delete({ where: { id } });

    return { message: 'Room deleted successfully' };
  }
}
