import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMotelDto } from './dto/create-motel.dto';
import { UpdateMotelDto } from './dto/update-motel.dto';
import { MotelStatus, RoomStatus } from '@prisma/client';

// Prisma Decimal fields are returned as Decimal objects; convert to plain numbers
function toPlainMotel(motel: Record<string, unknown>) {
  return {
    ...motel,
    defaultElectricityPrice: parseFloat(String(motel.defaultElectricityPrice ?? 0)),
    defaultWaterPrice: parseFloat(String(motel.defaultWaterPrice ?? 0)),
    defaultServiceFee: parseFloat(String(motel.defaultServiceFee ?? 0)),
  };
}

@Injectable()
export class MotelService {
  constructor(private prisma: PrismaService) {}

  async findAll(ownerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { ownerId };

    const [motels, total] = await Promise.all([
      this.prisma.motel.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { rooms: true } },
          rooms: { select: { status: true } },
        },
      }),
      this.prisma.motel.count({ where }),
    ]);

    const data = motels.map((m) => {
      const totalRooms = m._count.rooms;
      const occupiedRooms = m.rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length;
      const vacantRooms = m.rooms.filter((r) => r.status === RoomStatus.VACANT).length;
      const maintenanceRooms = m.rooms.filter((r) => r.status === RoomStatus.MAINTENANCE).length;

      // Remove raw rooms array from response, keep only counts
      const { rooms: _rooms, _count: _c, ...motelData } = m as Record<string, unknown>;
      return {
        ...toPlainMotel(motelData),
        totalRooms,
        occupiedRooms,
        vacantRooms,
        maintenanceRooms,
      };
    });

    return { data, total, page, limit };
  }

  async findOne(id: string, ownerId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [motel, revenueResult] = await Promise.all([
      this.prisma.motel.findFirst({
        where: { id, ownerId },
        include: {
          _count: { select: { rooms: true } },
          rooms: { select: { status: true } },
        },
      }),
      this.prisma.payment.aggregate({
        where: { paymentDate: { gte: startOfMonth, lte: endOfMonth }, invoice: { motelId: id } },
        _sum: { amount: true },
      }),
    ]);

    if (!motel) {
      throw new NotFoundException('Motel not found');
    }

    const totalRooms = motel._count.rooms;
    const occupiedRooms = motel.rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length;
    const vacantRooms = motel.rooms.filter((r) => r.status === RoomStatus.VACANT).length;
    const maintenanceRooms = motel.rooms.filter((r) => r.status === RoomStatus.MAINTENANCE).length;
    const monthlyRevenue = revenueResult._sum.amount
      ? parseFloat(String(revenueResult._sum.amount))
      : 0;

    const { rooms: _rooms, _count: _c, ...motelData } = motel as Record<string, unknown>;
    return {
      ...toPlainMotel(motelData),
      stats: { totalRooms, occupiedRooms, vacantRooms, maintenanceRooms, monthlyRevenue },
    };
  }

  async create(dto: CreateMotelDto, ownerId: string) {
    const existing = await this.prisma.motel.findFirst({
      where: { name: dto.name, ownerId },
    });

    if (existing) {
      throw new ConflictException('Motel name already exists for this owner');
    }

    const created = await this.prisma.motel.create({
      data: {
        name: dto.name,
        address: dto.address,
        description: dto.description,
        defaultElectricityPrice: dto.defaultElectricityPrice,
        defaultWaterPrice: dto.defaultWaterPrice,
        defaultServiceFee: dto.defaultServiceFee ?? 0,
        paymentDueDay: dto.paymentDueDay,
        images: dto.images ?? [],
        ownerId,
      },
    });

    return toPlainMotel(created as unknown as Record<string, unknown>);
  }

  async update(id: string, dto: UpdateMotelDto, ownerId: string) {
    const motel = await this.prisma.motel.findFirst({ where: { id, ownerId } });

    if (!motel) {
      throw new NotFoundException('Motel not found');
    }

    if (dto.name && dto.name !== motel.name) {
      const nameConflict = await this.prisma.motel.findFirst({
        where: { name: dto.name, ownerId, id: { not: id } },
      });
      if (nameConflict) {
        throw new ConflictException('Motel name already exists for this owner');
      }
    }

    const updated = await this.prisma.motel.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.defaultElectricityPrice !== undefined
          ? { defaultElectricityPrice: dto.defaultElectricityPrice }
          : {}),
        ...(dto.defaultWaterPrice !== undefined
          ? { defaultWaterPrice: dto.defaultWaterPrice }
          : {}),
        ...(dto.defaultServiceFee !== undefined
          ? { defaultServiceFee: dto.defaultServiceFee }
          : {}),
        ...(dto.paymentDueDay !== undefined
          ? { paymentDueDay: dto.paymentDueDay }
          : {}),
        ...(dto.images !== undefined ? { images: dto.images } : {}),
        ...(dto.autoInvoice !== undefined ? { autoInvoice: dto.autoInvoice } : {}),
      },
    });

    return toPlainMotel(updated as unknown as Record<string, unknown>);
  }

  async remove(id: string, ownerId: string) {
    const motel = await this.prisma.motel.findFirst({ where: { id, ownerId } });

    if (!motel) {
      throw new NotFoundException('Motel not found');
    }

    if (motel.status === MotelStatus.INACTIVE) {
      throw new BadRequestException('Motel is already inactive');
    }

    const occupiedCount = await this.prisma.room.count({
      where: { motelId: id, status: RoomStatus.OCCUPIED },
    });

    if (occupiedCount > 0) {
      throw new ForbiddenException(
        'Cannot deactivate motel with occupied rooms',
      );
    }

    const removed = await this.prisma.motel.update({
      where: { id },
      data: { status: MotelStatus.INACTIVE },
    });

    return toPlainMotel(removed as unknown as Record<string, unknown>);
  }
}
