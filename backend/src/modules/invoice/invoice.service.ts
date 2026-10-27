import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { ContractStatus, InvoiceStatus, InvoiceItemType } from '@prisma/client';

function serializeInvoice(invoice: Record<string, unknown>): Record<string, unknown> {
  const serialized: Record<string, unknown> = {
    ...invoice,
    rentAmount: parseFloat(String(invoice.rentAmount)),
    electricityAmount: parseFloat(String(invoice.electricityAmount)),
    waterAmount: parseFloat(String(invoice.waterAmount)),
    serviceFeeAmount: parseFloat(String(invoice.serviceFeeAmount)),
    surchargeAmount: parseFloat(String(invoice.surchargeAmount)),
    discountAmount: parseFloat(String(invoice.discountAmount)),
    totalAmount: parseFloat(String(invoice.totalAmount)),
    paidAmount: parseFloat(String(invoice.paidAmount)),
  };

  // Serialize nested invoiceItems if present
  if (Array.isArray(invoice.invoiceItems)) {
    serialized.invoiceItems = (invoice.invoiceItems as Record<string, unknown>[]).map((item) => ({
      ...item,
      quantity: item.quantity != null ? parseFloat(String(item.quantity)) : null,
      unitPrice: item.unitPrice != null ? parseFloat(String(item.unitPrice)) : null,
      amount: parseFloat(String(item.amount)),
    }));
  }

  // Serialize nested payments if present
  if (Array.isArray(invoice.payments)) {
    serialized.payments = (invoice.payments as Record<string, unknown>[]).map((p) => ({
      ...p,
      amount: parseFloat(String(p.amount)),
    }));
  }

  // Serialize nested meterReading if present
  if (invoice.meterReading && typeof invoice.meterReading === 'object') {
    const mr = invoice.meterReading as Record<string, unknown>;
    serialized.meterReading = {
      ...mr,
      electricityPrevious: parseFloat(String(mr.electricityPrevious)),
      electricityCurrent: parseFloat(String(mr.electricityCurrent)),
      electricityUsage: parseFloat(String(mr.electricityUsage)),
      electricityUnitPrice: parseFloat(String(mr.electricityUnitPrice)),
      waterPrevious: parseFloat(String(mr.waterPrevious)),
      waterCurrent: parseFloat(String(mr.waterCurrent)),
      waterUsage: parseFloat(String(mr.waterUsage)),
      waterUnitPrice: parseFloat(String(mr.waterUnitPrice)),
    };
  }

  return serialized;
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private prisma: PrismaService) {}

  private generateInvoiceCode(): string {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV${y}${m}${d}-${rand}`;
  }

  async findAll(query: QueryInvoiceDto) {
    const { motelId, roomId, contractId, status, invoiceMonth, invoiceYear, dateFrom, dateTo, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (motelId) where.motelId = motelId;
    if (roomId) where.roomId = roomId;
    if (contractId) where.contractId = contractId;
    if (status) where.status = status;
    if (invoiceMonth) where.invoiceMonth = invoiceMonth;
    if (invoiceYear) where.invoiceYear = invoiceYear;

    // Date range filter on billingDate
    if (dateFrom || dateTo) {
      const billingDate: Record<string, Date> = {};
      if (dateFrom) billingDate.gte = new Date(dateFrom);
      if (dateTo) billingDate.lte = new Date(dateTo);
      where.billingDate = billingDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          room: { select: { id: true, roomCode: true, roomName: true } },
          motel: { select: { id: true, name: true } },
          contract: { select: { id: true, contractCode: true } },
          representativeTenant: { select: { id: true, fullName: true, phoneNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: data.map((inv) => serializeInvoice(inv as unknown as Record<string, unknown>)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        room: { select: { id: true, roomCode: true, roomName: true } },
        motel: { select: { id: true, name: true } },
        contract: { select: { id: true, contractCode: true } },
        representativeTenant: { select: { id: true, fullName: true, phoneNumber: true, citizenId: true } },
        meterReading: true,
        invoiceItems: { orderBy: { sortOrder: 'asc' } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return serializeInvoice(invoice as unknown as Record<string, unknown>);
  }

  async generate(dto: CreateInvoiceDto, userId: string) {
    // Validate contract exists and is ACTIVE
    const contract = await this.prisma.contract.findUnique({
      where: { id: dto.contractId },
      include: {
        room: { include: { motel: true } },
        representativeTenant: true,
      },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }
    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Invoice can only be generated for ACTIVE contracts');
    }

    // Check unique: one invoice per contract per month/year
    const existing = await this.prisma.invoice.findUnique({
      where: {
        contractId_invoiceMonth_invoiceYear: {
          contractId: dto.contractId,
          invoiceMonth: dto.invoiceMonth,
          invoiceYear: dto.invoiceYear,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Invoice already exists for this contract/month/year');
    }

    return this.generateInternal({
      contract,
      invoiceMonth: dto.invoiceMonth,
      invoiceYear: dto.invoiceYear,
      billingDate: dto.billingDate,
      dueDate: dto.dueDate,
      surchargeAmount: dto.surchargeAmount,
      discountAmount: dto.discountAmount,
      autoGenerated: false,
      userId,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateInternal(params: {
    contract: any;
    invoiceMonth: number;
    invoiceYear: number;
    billingDate?: string;
    dueDate?: string;
    surchargeAmount?: number;
    discountAmount?: number;
    autoGenerated?: boolean;
    userId: string;
  }): Promise<Record<string, unknown>> {
    const { contract, invoiceMonth, invoiceYear, autoGenerated = false, userId } = params;

    // Find meter reading for this room+month+year (optional)
    const meterReading = await this.prisma.meterReading.findUnique({
      where: {
        roomId_readingMonth_readingYear: {
          roomId: contract.roomId,
          readingMonth: invoiceMonth,
          readingYear: invoiceYear,
        },
      },
    });

    // Build snapshots
    const roomSnapshot = JSON.stringify({
      roomCode: contract.room.roomCode,
      roomName: contract.room.roomName,
    });
    const tenantSnapshot = JSON.stringify({
      fullName: contract.representativeTenant.fullName,
      phoneNumber: contract.representativeTenant.phoneNumber,
      citizenId: contract.representativeTenant.citizenId,
    });

    // Calculate amounts
    // Rent multiplied by payment cycle (quarterly=3, yearly=12, monthly=1)
    const cycleMultiplier = contract.paymentCycle === 'QUARTERLY' ? 3
      : contract.paymentCycle === 'YEARLY' ? 12
      : 1;
    const rentAmount = parseFloat(String(contract.rentAmount)) * cycleMultiplier;
    const serviceFeeAmount = parseFloat(String(contract.serviceFee));
    const surchargeAmount = params.surchargeAmount ?? 0;
    const discountAmount = params.discountAmount ?? 0;

    let electricityAmount = 0;
    let waterAmount = 0;

    if (meterReading) {
      electricityAmount = parseFloat(String(meterReading.electricityUsage)) * parseFloat(String(meterReading.electricityUnitPrice));
      waterAmount = parseFloat(String(meterReading.waterUsage)) * parseFloat(String(meterReading.waterUnitPrice));
    }

    const totalAmount = rentAmount + electricityAmount + waterAmount + serviceFeeAmount + surchargeAmount - discountAmount;

    // Build invoice items
    const invoiceItems: {
      itemType: InvoiceItemType;
      description: string;
      quantity: number | null;
      unitPrice: number | null;
      amount: number;
      sortOrder: number;
    }[] = [];

    let sortOrder = 0;

    // Build rent description based on payment cycle
    const cycleLabel = contract.paymentCycle === 'QUARTERLY' ? ' (3 thang)'
      : contract.paymentCycle === 'YEARLY' ? ' (12 thang)'
      : '';
    const monthlyRent = parseFloat(String(contract.rentAmount));

    invoiceItems.push({
      itemType: InvoiceItemType.ROOM_RENT,
      description: `Tien phong${cycleLabel}`,
      quantity: cycleMultiplier,
      unitPrice: monthlyRent,
      amount: rentAmount,
      sortOrder: sortOrder++,
    });

    if (meterReading) {
      const elecUsage = parseFloat(String(meterReading.electricityUsage));
      const elecUnitPrice = parseFloat(String(meterReading.electricityUnitPrice));
      invoiceItems.push({
        itemType: InvoiceItemType.ELECTRICITY,
        description: `Tien dien (${elecUsage} kWh)`,
        quantity: elecUsage,
        unitPrice: elecUnitPrice,
        amount: electricityAmount,
        sortOrder: sortOrder++,
      });

      const waterUsage = parseFloat(String(meterReading.waterUsage));
      const waterUnitPrice = parseFloat(String(meterReading.waterUnitPrice));
      invoiceItems.push({
        itemType: InvoiceItemType.WATER,
        description: `Tien nuoc (${waterUsage} m3)`,
        quantity: waterUsage,
        unitPrice: waterUnitPrice,
        amount: waterAmount,
        sortOrder: sortOrder++,
      });
    }

    if (serviceFeeAmount > 0) {
      invoiceItems.push({
        itemType: InvoiceItemType.SERVICE_FEE,
        description: 'Phi dich vu',
        quantity: 1,
        unitPrice: serviceFeeAmount,
        amount: serviceFeeAmount,
        sortOrder: sortOrder++,
      });
    }

    if (surchargeAmount > 0) {
      invoiceItems.push({
        itemType: InvoiceItemType.SURCHARGE,
        description: 'Phu thu',
        quantity: null,
        unitPrice: null,
        amount: surchargeAmount,
        sortOrder: sortOrder++,
      });
    }

    if (discountAmount > 0) {
      invoiceItems.push({
        itemType: InvoiceItemType.DISCOUNT,
        description: 'Giam gia',
        quantity: null,
        unitPrice: null,
        amount: -discountAmount,
        sortOrder: sortOrder++,
      });
    }

    // Create invoice + items in transaction
    const invoice = await this.prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          invoiceCode: this.generateInvoiceCode(),
          motelId: contract.room.motel.id,
          roomId: contract.roomId,
          contractId: contract.id,
          representativeTenantId: contract.representativeTenantId,
          meterReadingId: meterReading?.id ?? null,
          invoiceMonth,
          invoiceYear,
          billingDate: params.billingDate ? new Date(params.billingDate) : new Date(),
          dueDate: params.dueDate
            ? new Date(params.dueDate)
            : contract.paymentDay
              ? new Date(invoiceYear, invoiceMonth - 1, Math.min(contract.paymentDay, 28))
              : null,
          roomSnapshot,
          tenantSnapshot,
          rentAmount,
          electricityAmount,
          waterAmount,
          serviceFeeAmount,
          surchargeAmount,
          discountAmount,
          totalAmount,
          paidAmount: 0,
          status: InvoiceStatus.DRAFT,
          autoGenerated,
          createdById: userId,
          invoiceItems: {
            create: invoiceItems,
          },
        },
        include: {
          room: { select: { id: true, roomCode: true, roomName: true } },
          contract: { select: { id: true, contractCode: true } },
          representativeTenant: { select: { id: true, fullName: true } },
          invoiceItems: { orderBy: { sortOrder: 'asc' } },
        },
      });

      return created;
    });

    return serializeInvoice(invoice as unknown as Record<string, unknown>);
  }

  async update(id: string, dto: UpdateInvoiceDto, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { invoiceItems: true },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT invoices can be updated');
    }

    const updateData: Record<string, unknown> = { updatedById: userId };

    if (dto.dueDate !== undefined) updateData.dueDate = new Date(dto.dueDate);
    if (dto.note !== undefined) updateData.note = dto.note;

    // Recalculate total if surcharge or discount changed
    const surcharge = dto.surchargeAmount ?? parseFloat(String(invoice.surchargeAmount));
    const discount = dto.discountAmount ?? parseFloat(String(invoice.discountAmount));

    if (dto.surchargeAmount !== undefined) updateData.surchargeAmount = dto.surchargeAmount;
    if (dto.discountAmount !== undefined) updateData.discountAmount = dto.discountAmount;

    if (dto.surchargeAmount !== undefined || dto.discountAmount !== undefined) {
      const rent = parseFloat(String(invoice.rentAmount));
      const elec = parseFloat(String(invoice.electricityAmount));
      const water = parseFloat(String(invoice.waterAmount));
      const service = parseFloat(String(invoice.serviceFeeAmount));
      updateData.totalAmount = rent + elec + water + service + surcharge - discount;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.invoice.update({
        where: { id },
        data: updateData,
        include: {
          room: { select: { id: true, roomCode: true, roomName: true } },
          invoiceItems: { orderBy: { sortOrder: 'asc' } },
        },
      });

      // Update surcharge/discount invoice items if amounts changed
      if (dto.surchargeAmount !== undefined) {
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: id, itemType: InvoiceItemType.SURCHARGE },
        });
        if (dto.surchargeAmount > 0) {
          const maxSort = await tx.invoiceItem.findFirst({
            where: { invoiceId: id },
            orderBy: { sortOrder: 'desc' },
          });
          await tx.invoiceItem.create({
            data: {
              invoiceId: id,
              itemType: InvoiceItemType.SURCHARGE,
              description: 'Phu thu',
              quantity: null,
              unitPrice: null,
              amount: dto.surchargeAmount,
              sortOrder: (maxSort?.sortOrder ?? 0) + 1,
            },
          });
        }
      }

      if (dto.discountAmount !== undefined) {
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: id, itemType: InvoiceItemType.DISCOUNT },
        });
        if (dto.discountAmount > 0) {
          const maxSort = await tx.invoiceItem.findFirst({
            where: { invoiceId: id },
            orderBy: { sortOrder: 'desc' },
          });
          await tx.invoiceItem.create({
            data: {
              invoiceId: id,
              itemType: InvoiceItemType.DISCOUNT,
              description: 'Giam gia',
              quantity: null,
              unitPrice: null,
              amount: -dto.discountAmount,
              sortOrder: (maxSort?.sortOrder ?? 0) + 1,
            },
          });
        }
      }

      // Re-fetch invoice with fresh items after modifications
      const fresh = await tx.invoice.findUnique({
        where: { id },
        include: {
          room: { select: { id: true, roomCode: true, roomName: true } },
          invoiceItems: { orderBy: { sortOrder: 'asc' } },
        },
      });

      return fresh!;
    });

    return serializeInvoice(updated as unknown as Record<string, unknown>);
  }

  async issue(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT invoices can be issued');
    }

    return this.issueInternal(id, invoice.meterReadingId, userId);
  }

  private async issueInternal(
    invoiceId: string,
    meterReadingId: string | null,
    userId: string,
  ): Promise<Record<string, unknown>> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const issued = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.ISSUED,
          updatedById: userId,
        },
        include: {
          room: { select: { id: true, roomCode: true, roomName: true } },
          contract: { select: { id: true, contractCode: true } },
          invoiceItems: { orderBy: { sortOrder: 'asc' } },
        },
      });

      // Lock associated meter reading
      if (meterReadingId) {
        await tx.meterReading.update({
          where: { id: meterReadingId },
          data: { isLocked: true, updatedById: userId },
        });
      }

      return issued;
    });

    return serializeInvoice(updated as unknown as Record<string, unknown>);
  }

  // --- Auto-invoice methods ---

  private isBillingMonth(cycle: string | null, month: number): boolean {
    switch (cycle) {
      case 'QUARTERLY': return [1, 4, 7, 10].includes(month);
      case 'YEARLY': return month === 1;
      default: return true; // MONTHLY or null
    }
  }

  async autoGenerateForAllMotels(): Promise<{
    generated: number;
    skipped: number;
    failed: number;
    errors: string[];
  }> {
    const now = new Date();
    const invoiceMonth = now.getMonth() + 1;
    const invoiceYear = now.getFullYear();

    // Find ACTIVE contracts where motel has autoInvoice enabled
    const contracts = await this.prisma.contract.findMany({
      where: {
        status: ContractStatus.ACTIVE,
        motel: { autoInvoice: true },
      },
      include: {
        room: { include: { motel: true } },
        representativeTenant: true,
      },
    });

    let generated = 0, skipped = 0, failed = 0;
    const errors: string[] = [];

    for (const contract of contracts) {
      // Check if this month is a billing month for this cycle
      if (!this.isBillingMonth(contract.paymentCycle, invoiceMonth)) {
        skipped++;
        continue;
      }

      try {
        // Check duplicate
        const existing = await this.prisma.invoice.findUnique({
          where: {
            contractId_invoiceMonth_invoiceYear: {
              contractId: contract.id,
              invoiceMonth,
              invoiceYear,
            },
          },
        });
        if (existing) {
          skipped++;
          continue;
        }

        await this.generateInternal({
          contract,
          invoiceMonth,
          invoiceYear,
          autoGenerated: true,
          userId: 'SYSTEM',
        });
        generated++;
      } catch (err) {
        failed++;
        errors.push(`Contract ${contract.id}: ${(err as Error).message}`);
      }
    }

    this.logger.log(`autoGenerateForAllMotels: month=${invoiceMonth}/${invoiceYear}, contracts=${contracts.length}`);
    return { generated, skipped, failed, errors };
  }

  async autoIssueReadyInvoices(): Promise<{
    issued: number;
    failed: number;
    errors: string[];
  }> {
    // Find DRAFT invoices that were auto-generated for motels with autoInvoice enabled
    const drafts = await this.prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.DRAFT,
        autoGenerated: true,
        motel: { autoInvoice: true },
      },
    });

    let issued = 0, failed = 0;
    const errors: string[] = [];

    for (const invoice of drafts) {
      try {
        await this.issueInternal(invoice.id, invoice.meterReadingId, 'SYSTEM');
        issued++;
      } catch (err) {
        failed++;
        errors.push(`Invoice ${invoice.invoiceCode}: ${(err as Error).message}`);
      }
    }

    return { issued, failed, errors };
  }
}
