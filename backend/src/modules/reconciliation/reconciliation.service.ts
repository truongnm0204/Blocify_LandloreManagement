import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReconcileBatchDto } from './dto/reconcile-batch.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class ReconciliationService {
  constructor(private prisma: PrismaService) {}

  private generatePaymentCode(): string {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `REC${y}${m}${d}-${rand}`;
  }

  private resolveInvoiceStatus(paidAmount: number, totalAmount: number): InvoiceStatus {
    if (paidAmount <= 0) return InvoiceStatus.ISSUED;
    if (paidAmount >= totalAmount) return InvoiceStatus.PAID;
    return InvoiceStatus.PARTIALLY_PAID;
  }

  /**
   * Process a batch of reconciled payments from AI-parsed bank statement.
   * Each item creates a payment and updates the invoice status.
   */
  async reconcileBatch(dto: ReconcileBatchDto, userId: string) {
    const results: { success: boolean; invoiceId: string; paymentId?: string; error?: string }[] = [];

    for (const item of dto.items) {
      try {
        const invoice = await this.prisma.invoice.findUnique({
          where: { id: item.invoiceId },
        });

        if (!invoice) {
          results.push({ success: false, invoiceId: item.invoiceId, error: 'Invoice not found' });
          continue;
        }

        const payableStatuses: InvoiceStatus[] = [
          InvoiceStatus.ISSUED,
          InvoiceStatus.PARTIALLY_PAID,
          InvoiceStatus.OVERDUE,
        ];

        if (!payableStatuses.includes(invoice.status)) {
          results.push({
            success: false,
            invoiceId: item.invoiceId,
            error: `Invoice status ${invoice.status} is not payable`,
          });
          continue;
        }

        const totalAmount = parseFloat(String(invoice.totalAmount));
        const currentPaid = parseFloat(String(invoice.paidAmount));
        const remaining = totalAmount - currentPaid;

        // Cap payment at remaining balance
        const payAmount = Math.min(item.amount, remaining);

        if (payAmount <= 0) {
          results.push({
            success: false,
            invoiceId: item.invoiceId,
            error: 'Invoice already fully paid',
          });
          continue;
        }

        const payment = await this.prisma.$transaction(async (tx) => {
          const created = await tx.payment.create({
            data: {
              paymentCode: this.generatePaymentCode(),
              invoiceId: item.invoiceId,
              amount: payAmount,
              paymentDate: new Date(item.paymentDate),
              paymentMethod: item.paymentMethod,
              referenceNumber: item.referenceNumber,
              note: item.rawText ? `[AI Reconciliation] ${item.rawText}` : '[AI Reconciliation]',
              recordedById: userId,
            },
          });

          const newPaidAmount = currentPaid + payAmount;
          const newStatus = this.resolveInvoiceStatus(newPaidAmount, totalAmount);

          await tx.invoice.update({
            where: { id: item.invoiceId },
            data: { paidAmount: newPaidAmount, status: newStatus },
          });

          return created;
        });

        results.push({ success: true, invoiceId: item.invoiceId, paymentId: payment.id });
      } catch (err) {
        results.push({
          success: false,
          invoiceId: item.invoiceId,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    return {
      total: dto.items.length,
      success: successCount,
      failed: dto.items.length - successCount,
      results,
    };
  }

  /**
   * Get reconciliation history (payments created via AI reconciliation).
   */
  async getHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { note: { startsWith: '[AI Reconciliation]' } },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceCode: true,
              totalAmount: true,
              paidAmount: true,
              status: true,
              room: { select: { id: true, roomCode: true } },
              representativeTenant: { select: { id: true, fullName: true } },
            },
          },
          recordedBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where: { note: { startsWith: '[AI Reconciliation]' } } }),
    ]);

    return {
      data: data.map((p) => ({
        ...p,
        amount: parseFloat(String(p.amount)),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
