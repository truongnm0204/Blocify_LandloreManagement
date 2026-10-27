import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMeterReadingDto } from './dto/create-meter-reading.dto';
import { UpdateMeterReadingDto } from './dto/update-meter-reading.dto';
import { QueryMeterReadingDto } from './dto/query-meter-reading.dto';
import { QueryMeterReadingStatsDto } from './dto/query-meter-reading-stats.dto';
import { ContractStatus } from '@prisma/client';
import { getMeterReadingStats } from './meter-reading-stats.helper';

function serializeMeterReading(reading: Record<string, unknown>) {
  return {
    ...reading,
    electricityPrevious: parseFloat(String(reading.electricityPrevious)),
    electricityCurrent: parseFloat(String(reading.electricityCurrent)),
    electricityUsage: parseFloat(String(reading.electricityUsage)),
    electricityUnitPrice: parseFloat(String(reading.electricityUnitPrice)),
    waterPrevious: parseFloat(String(reading.waterPrevious)),
    waterCurrent: parseFloat(String(reading.waterCurrent)),
    waterUsage: parseFloat(String(reading.waterUsage)),
    waterUnitPrice: parseFloat(String(reading.waterUnitPrice)),
  };
}

@Injectable()
export class MeterReadingService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryMeterReadingDto) {
    const { motelId, roomId, readingMonth, readingYear, isLocked, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (motelId) where.motelId = motelId;
    if (roomId) where.roomId = roomId;
    if (readingMonth) where.readingMonth = readingMonth;
    if (readingYear) where.readingYear = readingYear;
    if (isLocked !== undefined) where.isLocked = isLocked;

    const [data, total] = await Promise.all([
      this.prisma.meterReading.findMany({
        where,
        include: {
          room: {
            select: {
              id: true,
              roomCode: true,
              roomName: true,
              contracts: {
                where: { status: ContractStatus.ACTIVE },
                take: 1,
                select: {
                  id: true,
                  contractCode: true,
                  representativeTenant: { select: { id: true, fullName: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.meterReading.count({ where }),
    ]);

    return {
      data: data.map((r) => serializeMeterReading(r as unknown as Record<string, unknown>)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStats(query: QueryMeterReadingStatsDto) {
    return getMeterReadingStats(this.prisma, query);
  }

  async findOne(id: string) {
    const reading = await this.prisma.meterReading.findUnique({
      where: { id },
      include: {
        room: { select: { id: true, roomCode: true, roomName: true } },
        motel: { select: { id: true, name: true } },
        contract: { select: { id: true, contractCode: true } },
      },
    });

    if (!reading) {
      throw new NotFoundException('Meter reading not found');
    }

    return serializeMeterReading(reading as unknown as Record<string, unknown>);
  }

  async create(dto: CreateMeterReadingDto, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
      include: { motel: true },
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const existing = await this.prisma.meterReading.findUnique({
      where: {
        roomId_readingMonth_readingYear: {
          roomId: dto.roomId,
          readingMonth: dto.readingMonth,
          readingYear: dto.readingYear,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Meter reading already exists for this room/month/year');
    }

    if (dto.electricityCurrent < dto.electricityPrevious) {
      throw new BadRequestException('Electricity current reading must be >= previous reading');
    }
    if (dto.waterCurrent < dto.waterPrevious) {
      throw new BadRequestException('Water current reading must be >= previous reading');
    }

    const activeContract = await this.prisma.contract.findFirst({
      where: { roomId: dto.roomId, status: ContractStatus.ACTIVE },
    });

    const electricityUnitPrice = dto.electricityUnitPrice ?? parseFloat(String(room.motel.defaultElectricityPrice));
    const waterUnitPrice = dto.waterUnitPrice ?? parseFloat(String(room.motel.defaultWaterPrice));
    const electricityUsage = dto.electricityCurrent - dto.electricityPrevious;
    const waterUsage = dto.waterCurrent - dto.waterPrevious;

    const reading = await this.prisma.meterReading.create({
      data: {
        motelId: room.motel.id,
        roomId: dto.roomId,
        contractId: activeContract?.id ?? null,
        readingMonth: dto.readingMonth,
        readingYear: dto.readingYear,
        electricityPrevious: dto.electricityPrevious,
        electricityCurrent: dto.electricityCurrent,
        electricityUsage,
        electricityUnitPrice,
        waterPrevious: dto.waterPrevious,
        waterCurrent: dto.waterCurrent,
        waterUsage,
        waterUnitPrice,
        recordedDate: dto.recordedDate ? new Date(dto.recordedDate) : new Date(),
        note: dto.note,
        createdById: userId,
      },
      include: {
        room: { select: { id: true, roomCode: true, roomName: true } },
      },
    });

    return serializeMeterReading(reading as unknown as Record<string, unknown>);
  }

  async update(id: string, dto: UpdateMeterReadingDto, userId: string) {
    const reading = await this.prisma.meterReading.findUnique({ where: { id } });
    if (!reading) {
      throw new NotFoundException('Meter reading not found');
    }

    if (reading.isLocked) {
      throw new BadRequestException('Locked meter reading cannot be updated');
    }

    const elecPrev = dto.electricityPrevious ?? parseFloat(String(reading.electricityPrevious));
    const elecCurr = dto.electricityCurrent ?? parseFloat(String(reading.electricityCurrent));
    const waterPrev = dto.waterPrevious ?? parseFloat(String(reading.waterPrevious));
    const waterCurr = dto.waterCurrent ?? parseFloat(String(reading.waterCurrent));

    if (elecCurr < elecPrev) {
      throw new BadRequestException('Electricity current reading must be >= previous reading');
    }
    if (waterCurr < waterPrev) {
      throw new BadRequestException('Water current reading must be >= previous reading');
    }

    const updateData: Record<string, unknown> = { updatedById: userId };

    if (dto.electricityPrevious !== undefined) updateData.electricityPrevious = dto.electricityPrevious;
    if (dto.electricityCurrent !== undefined) updateData.electricityCurrent = dto.electricityCurrent;
    if (dto.waterPrevious !== undefined) updateData.waterPrevious = dto.waterPrevious;
    if (dto.waterCurrent !== undefined) updateData.waterCurrent = dto.waterCurrent;
    if (dto.electricityUnitPrice !== undefined) updateData.electricityUnitPrice = dto.electricityUnitPrice;
    if (dto.waterUnitPrice !== undefined) updateData.waterUnitPrice = dto.waterUnitPrice;
    if (dto.recordedDate !== undefined) updateData.recordedDate = new Date(dto.recordedDate);
    if (dto.note !== undefined) updateData.note = dto.note;

    if (dto.electricityPrevious !== undefined || dto.electricityCurrent !== undefined) {
      updateData.electricityUsage = elecCurr - elecPrev;
    }
    if (dto.waterPrevious !== undefined || dto.waterCurrent !== undefined) {
      updateData.waterUsage = waterCurr - waterPrev;
    }

    const updated = await this.prisma.meterReading.update({
      where: { id },
      data: updateData,
      include: {
        room: { select: { id: true, roomCode: true, roomName: true } },
      },
    });

    return serializeMeterReading(updated as unknown as Record<string, unknown>);
  }

  async lock(id: string, userId: string) {
    const reading = await this.prisma.meterReading.findUnique({ where: { id } });
    if (!reading) {
      throw new NotFoundException('Meter reading not found');
    }

    if (reading.isLocked) {
      throw new BadRequestException('Meter reading is already locked');
    }

    const updated = await this.prisma.meterReading.update({
      where: { id },
      data: { isLocked: true, updatedById: userId },
      include: {
        room: { select: { id: true, roomCode: true, roomName: true } },
      },
    });

    return serializeMeterReading(updated as unknown as Record<string, unknown>);
  }
}
