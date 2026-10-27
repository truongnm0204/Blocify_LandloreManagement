import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { InvoiceStatus } from '@prisma/client';

function serializePayment(payment: Record<string, unknown>) {
  return {
    ...payment,
    amount: parseFloat(String(payment.amount)),
  };
}

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  private generatePaymentCode(): string {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PAY${y}${m}${d}-${rand}`;
  }

  /** Determine invoice status based on paid vs total */
  private resolveInvoiceStatus(paidAmount: number, totalAmount: number): InvoiceStatus {
    if (paidAmount <= 0) return InvoiceStatus.ISSUED;
    if (paidAmount >= totalAmount) return InvoiceStatus.PAID;
    return InvoiceStatus.PARTIALLY_PAID;
  }

  async findAll(query: QueryPaymentDto) {
    const { invoiceId, motelId, paymentMethod, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (invoiceId) where.invoiceId = invoiceId;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (motelId) where.invoice = { motelId };

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          invoice: {
            select: { id: true, invoiceCode: true, totalAmount: true, paidAmount: true, status: true },
          },
          recordedBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: data.map((p) => serializePayment(p as unknown as Record<string, unknown>)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          select: {
            id: true, invoiceCode: true, totalAmount: true,
            paidAmount: true, status: true, invoiceMonth: true, invoiceYear: true,
            room: { select: { id: true, roomCode: true, roomName: true } },
          },
        },
        recordedBy: { select: { id: true, fullName: true } },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return serializePayment(payment as unknown as Record<string, unknown>);
  }

  async create(dto: CreatePaymentDto, userId: string) {
    // Validate invoice exists
    const invoice = await this.prisma.invoice.findUnique({ where: { id: dto.invoiceId } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Only ISSUED or PARTIALLY_PAID or OVERDUE invoices can receive payments
    const payableStatuses: InvoiceStatus[] = [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE];
    if (!payableStatuses.includes(invoice.status)) {
      throw new BadRequestException('Payments can only be recorded for ISSUED, PARTIALLY_PAID, or OVERDUE invoices');
    }

    // Check payment doesn't exceed remaining balance
    const totalAmount = parseFloat(String(invoice.totalAmount));
    const currentPaid = parseFloat(String(invoice.paidAmount));
    const remaining = totalAmount - currentPaid;

    if (dto.amount > remaining) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) exceeds remaining balance (${remaining})`,
      );
    }

    // Transaction: create payment + update invoice paidAmount + status
    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          paymentCode: this.generatePaymentCode(),
          invoiceId: dto.invoiceId,
          amount: dto.amount,
          paymentDate: new Date(dto.paymentDate),
          paymentMethod: dto.paymentMethod,
          referenceNumber: dto.referenceNumber,
          note: dto.note,
          recordedById: userId,
        },
        include: {
          invoice: { select: { id: true, invoiceCode: true } },
          recordedBy: { select: { id: true, fullName: true } },
        },
      });

      // Update invoice paidAmount and status
      const newPaidAmount = currentPaid + dto.amount;
      const newStatus = this.resolveInvoiceStatus(newPaidAmount, totalAmount);

      await tx.invoice.update({
        where: { id: dto.invoiceId },
        data: { paidAmount: newPaidAmount, status: newStatus },
      });

      return created;
    });

    return serializePayment(payment as unknown as Record<string, unknown>);
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Only allow updating note and referenceNumber (not amount)
    const updateData: Record<string, unknown> = {};
    if (dto.referenceNumber !== undefined) updateData.referenceNumber = dto.referenceNumber;
    if (dto.note !== undefined) updateData.note = dto.note;

    const updated = await this.prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        invoice: { select: { id: true, invoiceCode: true } },
        recordedBy: { select: { id: true, fullName: true } },
      },
    });

    return serializePayment(updated as unknown as Record<string, unknown>);
  }
}
