import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

const MOTEL_INCLUDE = {
  select: { id: true, name: true },
};

function mapExpense(e: Record<string, unknown>) {
  return {
    ...e,
    amount: e.amount != null ? parseFloat(String(e.amount)) : null,
  };
}

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryExpenseDto) {
    const { motelId, category, status, dateFrom, dateTo, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (motelId) where.motelId = motelId;
    if (category) where.category = category;
    if (status) where.status = status;

    if (dateFrom || dateTo) {
      where.date = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }

    if (search) {
      where.description = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: { motel: MOTEL_INCLUDE },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data: data.map((e) => mapExpense(e as unknown as Record<string, unknown>)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { motel: MOTEL_INCLUDE },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return mapExpense(expense as unknown as Record<string, unknown>);
  }

  async create(dto: CreateExpenseDto) {
    const motel = await this.prisma.motel.findUnique({ where: { id: dto.motelId } });
    if (!motel) {
      throw new NotFoundException('Motel not found');
    }

    const expense = await this.prisma.expense.create({
      data: {
        motelId: dto.motelId,
        category: dto.category,
        amount: dto.amount,
        description: dto.description,
        note: dto.note,
        date: new Date(dto.date),
        images: dto.images ?? [],
      },
      include: { motel: MOTEL_INCLUDE },
    });

    return mapExpense(expense as unknown as Record<string, unknown>);
  }

  async update(id: string, dto: UpdateExpenseDto) {
    const existing = await this.prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Expense not found');
    }

    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.note !== undefined ? { note: dto.note } : {}),
        ...(dto.date !== undefined ? { date: new Date(dto.date) } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.images !== undefined ? { images: dto.images } : {}),
      },
      include: { motel: MOTEL_INCLUDE },
    });

    return mapExpense(expense as unknown as Record<string, unknown>);
  }
}
