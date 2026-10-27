import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryFeedbackDto) {
    const {
      search,
      status,
      category,
      priority,
      motelId,
      roomId,
      tenantId,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.FeedbackWhereInput = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (motelId) where.motelId = motelId;
    if (roomId) where.roomId = roomId;
    if (tenantId) where.tenantId = tenantId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        include: {
          tenant: { select: { id: true, fullName: true, phoneNumber: true } },
          motel: { select: { id: true, name: true } },
          room: { select: { id: true, roomCode: true, roomName: true } },
          createdBy: { select: { id: true, fullName: true } },
          assignedTo: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        tenant: { select: { id: true, fullName: true, phoneNumber: true } },
        motel: { select: { id: true, name: true } },
        room: { select: { id: true, roomCode: true, roomName: true } },
        createdBy: { select: { id: true, fullName: true } },
        assignedTo: { select: { id: true, fullName: true } },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  async create(dto: CreateFeedbackDto, userId: string) {
    // Validate tenant exists
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: dto.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Validate motel exists
    const motel = await this.prisma.motel.findUnique({
      where: { id: dto.motelId },
    });
    if (!motel) {
      throw new NotFoundException('Motel not found');
    }

    // Validate room exists if provided
    if (dto.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: dto.roomId },
      });
      if (!room) {
        throw new NotFoundException('Room not found');
      }
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priority: dto.priority ?? 'MEDIUM',
        images: dto.images ?? [],
        tenantId: dto.tenantId,
        motelId: dto.motelId,
        roomId: dto.roomId,
        createdById: userId,
      },
      include: {
        tenant: { select: { id: true, fullName: true, phoneNumber: true } },
        motel: { select: { id: true, name: true } },
        room: { select: { id: true, roomCode: true, roomName: true } },
        createdBy: { select: { id: true, fullName: true } },
        assignedTo: { select: { id: true, fullName: true } },
      },
    });

    return feedback;
  }

  async update(id: string, dto: UpdateFeedbackDto) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id } });
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    const updateData: Prisma.FeedbackUpdateInput = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.resolution !== undefined) updateData.resolution = dto.resolution;
    if (dto.images !== undefined) updateData.images = dto.images;
    if (dto.assignedToId !== undefined) {
      updateData.assignedTo = { connect: { id: dto.assignedToId } };
    }
    if (dto.tenantId !== undefined) {
      updateData.tenant = { connect: { id: dto.tenantId } };
    }
    if (dto.motelId !== undefined) {
      updateData.motel = { connect: { id: dto.motelId } };
    }
    if (dto.roomId !== undefined) {
      updateData.room = dto.roomId
        ? { connect: { id: dto.roomId } }
        : { disconnect: true };
    }

    const updated = await this.prisma.feedback.update({
      where: { id },
      data: updateData,
      include: {
        tenant: { select: { id: true, fullName: true, phoneNumber: true } },
        motel: { select: { id: true, name: true } },
        room: { select: { id: true, roomCode: true, roomName: true } },
        createdBy: { select: { id: true, fullName: true } },
        assignedTo: { select: { id: true, fullName: true } },
      },
    });

    return updated;
  }

  async getStats(motelId?: string) {
    const where: Prisma.FeedbackWhereInput = {};
    if (motelId) where.motelId = motelId;

    const groups = await this.prisma.feedback.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const stats = { new: 0, inProgress: 0, resolved: 0, closed: 0, total: 0 };
    for (const group of groups) {
      const count = group._count;
      stats.total += count;
      switch (group.status) {
        case 'NEW':
          stats.new = count;
          break;
        case 'IN_PROGRESS':
          stats.inProgress = count;
          break;
        case 'RESOLVED':
          stats.resolved = count;
          break;
        case 'CLOSED':
          stats.closed = count;
          break;
      }
    }

    return stats;
  }
}
