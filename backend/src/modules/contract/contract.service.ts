import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { QueryContractDto } from './dto/query-contract.dto';
import { TerminateContractDto } from './dto/terminate-contract.dto';
import { ContractStatus, RoomStatus } from '@prisma/client';

function serializeContract(contract: Record<string, unknown>) {
  return {
    ...contract,
    rentAmount: parseFloat(String(contract.rentAmount)),
    depositAmount: parseFloat(String(contract.depositAmount)),
    serviceFee: parseFloat(String(contract.serviceFee)),
    paymentDay: contract.paymentDay ?? null,
    paymentCycle: contract.paymentCycle ?? 'MONTHLY',
  };
}

@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  private generateContractCode(): string {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HD${y}${m}${d}-${rand}`;
  }

  async findAll(query: QueryContractDto) {
    const { motelId, roomId, status, startDateFrom, startDateTo, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (motelId) where.motelId = motelId;
    if (roomId) where.roomId = roomId;
    if (status) where.status = status;

    // Date range filter on startDate
    if (startDateFrom || startDateTo) {
      const startDate: Record<string, Date> = {};
      if (startDateFrom) startDate.gte = new Date(startDateFrom);
      if (startDateTo) startDate.lte = new Date(startDateTo);
      where.startDate = startDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        include: {
          room: { select: { id: true, roomCode: true, roomName: true } },
          motel: { select: { id: true, name: true } },
          representativeTenant: {
            select: { id: true, fullName: true, phoneNumber: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contract.count({ where }),
    ]);

    return {
      data: data.map((c) => serializeContract(c as unknown as Record<string, unknown>)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        room: { select: { id: true, roomCode: true, roomName: true, motelId: true } },
        motel: { select: { id: true, name: true, address: true } },
        representativeTenant: {
          select: { id: true, fullName: true, phoneNumber: true },
        },
        contractTenants: {
          include: {
            tenant: {
              select: { id: true, fullName: true, phoneNumber: true, citizenId: true },
            },
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return serializeContract(contract as unknown as Record<string, unknown>);
  }

  async create(dto: CreateContractDto, userId: string) {
    // Validate room exists
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
      include: { motel: { select: { id: true } } },
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Validate no active contract for this room
    const activeContract = await this.prisma.contract.findFirst({
      where: { roomId: dto.roomId, status: ContractStatus.ACTIVE },
    });
    if (activeContract) {
      throw new ConflictException('Room already has an active contract');
    }

    // Validate tenants exist and exactly one representative
    const representativeCount = dto.tenants.filter((t) => t.isRepresentative).length;
    if (representativeCount !== 1) {
      throw new BadRequestException('Exactly one tenant must be marked as representative');
    }

    const tenantIds = dto.tenants.map((t) => t.tenantId);
    const existingTenants = await this.prisma.tenant.findMany({
      where: { id: { in: tenantIds } },
    });
    if (existingTenants.length !== tenantIds.length) {
      throw new NotFoundException('One or more tenants not found');
    }

    const representativeTenantId = dto.tenants.find((t) => t.isRepresentative)!.tenantId;

    const contract = await this.prisma.contract.create({
      data: {
        contractCode: this.generateContractCode(),
        motelId: room.motel.id,
        roomId: dto.roomId,
        representativeTenantId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        signedDate: dto.signedDate ? new Date(dto.signedDate) : undefined,
        rentAmount: dto.rentAmount,
        depositAmount: dto.depositAmount,
        serviceFee: dto.serviceFee ?? 0,
        occupantCount: dto.occupantCount ?? dto.tenants.length,
        paymentDay: dto.paymentDay ?? null,
        paymentCycle: (dto.paymentCycle as 'MONTHLY' | 'QUARTERLY' | 'YEARLY') ?? 'MONTHLY',
        note: dto.note,
        status: ContractStatus.DRAFT,
        createdById: userId,
        contractTenants: {
          create: dto.tenants.map((t) => ({
            tenantId: t.tenantId,
            isRepresentative: t.isRepresentative,
            joinedAt: new Date(),
          })),
        },
      },
      include: {
        room: { select: { id: true, roomCode: true, roomName: true } },
        representativeTenant: {
          select: { id: true, fullName: true, phoneNumber: true },
        },
        contractTenants: {
          include: {
            tenant: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    return serializeContract(contract as unknown as Record<string, unknown>);
  }

  async update(id: string, dto: UpdateContractDto, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT contracts can be updated');
    }

    // Validate tenants if provided
    if (dto.tenants) {
      const representativeCount = dto.tenants.filter((t) => t.isRepresentative).length;
      if (representativeCount !== 1) {
        throw new BadRequestException('Exactly one tenant must be marked as representative');
      }

      const tenantIds = dto.tenants.map((t) => t.tenantId);
      const existingTenants = await this.prisma.tenant.findMany({
        where: { id: { in: tenantIds } },
      });
      if (existingTenants.length !== tenantIds.length) {
        throw new NotFoundException('One or more tenants not found');
      }
    }

    const representativeTenantId = dto.tenants
      ? dto.tenants.find((t) => t.isRepresentative)!.tenantId
      : undefined;

    // Use transaction to update contract + tenants atomically
    const updated = await this.prisma.$transaction(async (tx) => {
      // Replace tenants if provided
      if (dto.tenants) {
        await tx.contractTenant.deleteMany({ where: { contractId: id } });
        await tx.contractTenant.createMany({
          data: dto.tenants.map((t) => ({
            contractId: id,
            tenantId: t.tenantId,
            isRepresentative: t.isRepresentative,
            joinedAt: new Date(),
          })),
        });
      }

      return tx.contract.update({
        where: { id },
        data: {
          ...(dto.startDate !== undefined
            ? { startDate: new Date(dto.startDate) }
            : {}),
          ...(dto.endDate !== undefined
            ? { endDate: new Date(dto.endDate) }
            : {}),
          ...(dto.signedDate !== undefined
            ? { signedDate: new Date(dto.signedDate) }
            : {}),
          ...(dto.rentAmount !== undefined
            ? { rentAmount: dto.rentAmount }
            : {}),
          ...(dto.depositAmount !== undefined
            ? { depositAmount: dto.depositAmount }
            : {}),
          ...(dto.serviceFee !== undefined
            ? { serviceFee: dto.serviceFee }
            : {}),
          ...(dto.occupantCount !== undefined
            ? { occupantCount: dto.occupantCount }
            : {}),
          ...(dto.note !== undefined ? { note: dto.note } : {}),
          ...(dto.paymentDay !== undefined ? { paymentDay: dto.paymentDay } : {}),
          ...(dto.paymentCycle !== undefined ? { paymentCycle: dto.paymentCycle as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' } : {}),
          ...(representativeTenantId
            ? { representativeTenantId }
            : {}),
          updatedById: userId,
        },
        include: {
          room: { select: { id: true, roomCode: true, roomName: true } },
          contractTenants: {
            include: {
              tenant: { select: { id: true, fullName: true } },
            },
          },
        },
      });
    });

    return serializeContract(updated as unknown as Record<string, unknown>);
  }

  async activate(id: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT contracts can be activated');
    }

    // Check no other active contract for this room
    const activeContract = await this.prisma.contract.findFirst({
      where: {
        roomId: contract.roomId,
        status: ContractStatus.ACTIVE,
        id: { not: id },
      },
    });
    if (activeContract) {
      throw new ConflictException('Room already has an active contract');
    }

    // Transaction: activate contract + set room OCCUPIED
    const updated = await this.prisma.$transaction(async (tx) => {
      const activated = await tx.contract.update({
        where: { id },
        data: {
          status: ContractStatus.ACTIVE,
          signedDate: contract.signedDate ?? new Date(),
          updatedById: userId,
        },
        include: {
          room: { select: { id: true, roomCode: true, roomName: true } },
          representativeTenant: {
            select: { id: true, fullName: true },
          },
        },
      });

      await tx.room.update({
        where: { id: contract.roomId },
        data: { status: RoomStatus.OCCUPIED },
      });

      return activated;
    });

    return serializeContract(updated as unknown as Record<string, unknown>);
  }

  async terminate(id: string, dto: TerminateContractDto, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Only ACTIVE contracts can be terminated');
    }

    // Transaction: end contract + set room VACANT
    const updated = await this.prisma.$transaction(async (tx) => {
      const terminated = await tx.contract.update({
        where: { id },
        data: {
          status: ContractStatus.ENDED,
          endDate: new Date(dto.terminationDate),
          note: dto.terminationReason
            ? `${contract.note ? contract.note + ' | ' : ''}Terminated: ${dto.terminationReason}`
            : contract.note,
          updatedById: userId,
        },
        include: {
          room: { select: { id: true, roomCode: true, roomName: true } },
        },
      });

      // Set room to VACANT only if no other active/draft contract
      const otherContract = await tx.contract.findFirst({
        where: {
          roomId: contract.roomId,
          status: { in: [ContractStatus.ACTIVE, ContractStatus.DRAFT] },
          id: { not: id },
        },
      });

      if (!otherContract) {
        await tx.room.update({
          where: { id: contract.roomId },
          data: { status: RoomStatus.VACANT },
        });
      }

      return terminated;
    });

    return serializeContract(updated as unknown as Record<string, unknown>);
  }

  async cancel(id: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT contracts can be cancelled');
    }

    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.CANCELLED,
        updatedById: userId,
      },
    });

    return serializeContract(updated as unknown as Record<string, unknown>);
  }

  async findActiveByRoom(roomId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { roomId, status: ContractStatus.ACTIVE },
      include: {
        room: { select: { id: true, roomCode: true, roomName: true } },
        representativeTenant: {
          select: { id: true, fullName: true, phoneNumber: true },
        },
        contractTenants: {
          include: {
            tenant: {
              select: { id: true, fullName: true, phoneNumber: true },
            },
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('No active contract found for this room');
    }

    return serializeContract(contract as unknown as Record<string, unknown>);
  }

  /**
   * Add a secondary tenant to an ACTIVE contract.
   * The new tenant is NOT the representative and has no billing responsibility.
   * Representative is never changed by this method.
   */
  async addTenant(contractId: string, tenantId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { contractTenants: { where: { leftAt: null } } },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Can only add tenants to ACTIVE contracts');
    }

    // Ensure tenant exists
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    // Prevent duplicates (active, not left yet)
    const alreadyIn = contract.contractTenants.some((ct) => ct.tenantId === tenantId);
    if (alreadyIn) throw new ConflictException('Tenant is already in this contract');

    const ct = await this.prisma.contractTenant.create({
      data: {
        contractId,
        tenantId,
        isRepresentative: false, // always false — representative never changes via this flow
        joinedAt: new Date(),
      },
      include: {
        tenant: { select: { id: true, fullName: true, phoneNumber: true } },
      },
    });

    return ct;
  }

  /**
   * Remove a secondary (non-representative) tenant from an ACTIVE contract.
   * Sets leftAt timestamp, does not delete the record.
   */
  async removeTenant(contractId: string, tenantId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Can only remove tenants from ACTIVE contracts');
    }

    // Disallow removing the representative
    if (contract.representativeTenantId === tenantId) {
      throw new BadRequestException(
        'Cannot remove the representative tenant. Terminate the contract instead.',
      );
    }

    const ct = await this.prisma.contractTenant.findFirst({
      where: { contractId, tenantId, leftAt: null },
    });
    if (!ct) throw new NotFoundException('Tenant not found in this contract');

    await this.prisma.contractTenant.update({
      where: { id: ct.id },
      data: { leftAt: new Date() },
    });

    return { message: 'Tenant removed from contract' };
  }
}
