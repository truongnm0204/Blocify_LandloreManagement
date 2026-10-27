import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RoomStatus, ContractStatus, InvoiceStatus, ExpenseStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(motelId?: string) {
    const motelFilter = motelId ? { motelId } : {};

    const [
      totalRooms,
      vacantRooms,
      occupiedRooms,
      maintenanceRooms,
      activeContracts,
      expiringContracts,
      unpaidInvoices,
      overdueInvoices,
      monthlyRevenue,
      totalReceivables,
      totalExpenses,
    ] = await Promise.all([
      this.prisma.room.count({ where: motelFilter }),
      this.prisma.room.count({ where: { ...motelFilter, status: RoomStatus.VACANT } }),
      this.prisma.room.count({ where: { ...motelFilter, status: RoomStatus.OCCUPIED } }),
      this.prisma.room.count({ where: { ...motelFilter, status: RoomStatus.MAINTENANCE } }),
      this.prisma.contract.count({
        where: { ...motelFilter, status: ContractStatus.ACTIVE },
      }),
      this.prisma.contract.count({
        where: {
          ...motelFilter,
          status: ContractStatus.ACTIVE,
          endDate: {
            not: null,
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
        },
      }),
      this.prisma.invoice.count({
        where: {
          ...motelFilter,
          status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID] },
        },
      }),
      this.prisma.invoice.count({
        where: { ...motelFilter, status: InvoiceStatus.OVERDUE },
      }),
      this.getCurrentMonthRevenue(motelId),
      this.getTotalReceivables(motelId),
      this.getCurrentMonthExpenses(motelId),
    ]);

    return {
      rooms: {
        total: totalRooms,
        vacant: vacantRooms,
        occupied: occupiedRooms,
        maintenance: maintenanceRooms,
        occupancyRate: totalRooms > 0
          ? Math.round((occupiedRooms / totalRooms) * 100)
          : 0,
      },
      contracts: {
        active: activeContracts,
        expiringSoon: expiringContracts,
      },
      invoices: {
        unpaid: unpaidInvoices,
        overdue: overdueInvoices,
      },
      finance: {
        monthlyRevenue,
        totalReceivables,
        totalExpenses,
        netProfit: monthlyRevenue - totalExpenses,
      },
    };
  }

  async getRevenueByMonth(months: number, motelId?: string) {
    const safeMonths = Math.min(Math.max(1, months || 6), 36);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - safeMonths + 1, 1);

    const invoiceFilter: Record<string, unknown> = {
      OR: [
        { invoiceYear: { gt: startDate.getFullYear() } },
        {
          invoiceYear: startDate.getFullYear(),
          invoiceMonth: { gte: startDate.getMonth() + 1 },
        },
      ],
      status: { in: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID] },
    };
    if (motelId) invoiceFilter.motelId = motelId;

    const invoices = await this.prisma.invoice.findMany({
        where: invoiceFilter,
        select: {
          invoiceMonth: true,
          invoiceYear: true,
          totalAmount: true,
          paidAmount: true,
          electricityAmount: true,
          waterAmount: true,
          serviceFeeAmount: true,
          surchargeAmount: true,
        },
      });

      // Fetch PAID operational expenses for the same period
      const expenseFilter: Record<string, unknown> = {
        status: ExpenseStatus.PAID,
        date: { gte: startDate },
      };
      if (motelId) expenseFilter.motelId = motelId;

      const operationalExpenses = await this.prisma.expense.findMany({
        where: expenseFilter,
        select: { date: true, amount: true },
      });

      const result: { month: string; revenue: number; expenses: number }[] = [];
      for (let i = 0; i < safeMonths; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - safeMonths + 1 + i, 1);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();

        const monthInvoices = invoices.filter(
          (inv) => inv.invoiceMonth === m && inv.invoiceYear === y,
        );

        const revenue = monthInvoices.reduce(
          (sum, inv) => sum + parseFloat(String(inv.paidAmount)),
          0,
        );

        const invoiceExpenses = monthInvoices.reduce(
          (sum, inv) =>
            sum +
            parseFloat(String(inv.electricityAmount)) +
            parseFloat(String(inv.waterAmount)) +
            parseFloat(String(inv.serviceFeeAmount)) +
            parseFloat(String(inv.surchargeAmount)),
          0,
        );

        // Sum PAID operational expenses for this month
        const monthOperational = operationalExpenses
          .filter((e) => {
            const ed = new Date(e.date);
            return ed.getMonth() + 1 === m && ed.getFullYear() === y;
          })
          .reduce((sum, e) => sum + parseFloat(String(e.amount)), 0);

        result.push({
          month: `Th${m}/${y}`,
          revenue: Math.round(revenue),
          expenses: Math.round(invoiceExpenses + monthOperational),
        });
      }

      return result;
  }

  async getExpenseBreakdown(motelId?: string) {
    const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const invoiceFilter: Record<string, unknown> = {
        invoiceMonth: currentMonth,
        invoiceYear: currentYear,
        status: { not: InvoiceStatus.DRAFT },
      };
      if (motelId) invoiceFilter.motelId = motelId;

      const invoices = await this.prisma.invoice.findMany({
        where: invoiceFilter,
        select: {
          electricityAmount: true,
          waterAmount: true,
          serviceFeeAmount: true,
          surchargeAmount: true,
        },
      });

      const electricity = invoices.reduce(
        (sum, inv) => sum + parseFloat(String(inv.electricityAmount)),
        0,
      );
      const water = invoices.reduce(
        (sum, inv) => sum + parseFloat(String(inv.waterAmount)),
        0,
      );
      const serviceFee = invoices.reduce(
        (sum, inv) => sum + parseFloat(String(inv.serviceFeeAmount)),
        0,
      );
      const surcharge = invoices.reduce(
        (sum, inv) => sum + parseFloat(String(inv.surchargeAmount)),
        0,
      );

      // Include PAID operational expenses for current month
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

      const expenseWhere: Record<string, unknown> = {
        status: ExpenseStatus.PAID,
        date: { gte: startOfMonth, lte: endOfMonth },
      };
      if (motelId) expenseWhere.motelId = motelId;

      const operationalExpenses = await this.prisma.expense.groupBy({
        by: ['category'],
        where: expenseWhere,
        _sum: { amount: true },
      });

      const categories = [
        { category: 'ELECTRICITY', amount: Math.round(electricity) },
        { category: 'WATER', amount: Math.round(water) },
        { category: 'SERVICE_FEE', amount: Math.round(serviceFee) },
        { category: 'SURCHARGE', amount: Math.round(surcharge) },
        // Append operational expense categories
        ...operationalExpenses.map((e) => ({
          category: e.category as string,
          amount: Math.round(e._sum.amount ? parseFloat(String(e._sum.amount)) : 0),
        })),
      ].filter((c) => c.amount > 0);

      const total = categories.reduce((sum, c) => sum + c.amount, 0);

      return categories.map((c) => ({
        ...c,
        percentage: total > 0 ? Math.round((c.amount / total) * 100) : 0,
      }));
  }

  async getMotelOccupancy() {
    const motels = await this.prisma.motel.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          rooms: {
            select: { status: true },
          },
        },
      });

      return motels.map((motel) => {
        const total = motel.rooms.length;
        const occupied = motel.rooms.filter(
          (r) => r.status === RoomStatus.OCCUPIED,
        ).length;
        return {
          motelId: motel.id,
          name: motel.name,
          occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
          total,
          occupied,
        };
      });
  }

  async getRecentTransactions(limit: number, motelId?: string) {
    const safeLimit = Math.min(Math.max(1, limit || 10), 50);
    const where: Record<string, unknown> = {};
      if (motelId) where.invoice = { motelId };

      const payments = await this.prisma.payment.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        take: safeLimit,
        select: {
          id: true,
          amount: true,
          paymentDate: true,
          paymentMethod: true,
          note: true,
          invoice: {
            select: {
              invoiceCode: true,
              room: { select: { roomCode: true, roomName: true } },
              representativeTenant: { select: { fullName: true } },
            },
          },
        },
      });

      return payments.map((p) => {
        const roomName = p.invoice?.room?.roomName || p.invoice?.room?.roomCode || '';
        const tenantName = p.invoice?.representativeTenant?.fullName || '';
        return {
          id: p.id,
          date: p.paymentDate.toISOString(),
          description: `${tenantName} - ${roomName}`,
          category: p.paymentMethod,
          amount: parseFloat(String(p.amount)),
          type: 'income' as const,
        };
      });
  }

  private async getCurrentMonthRevenue(motelId?: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const where: Record<string, unknown> = {
      paymentDate: { gte: startOfMonth, lte: endOfMonth },
    };
    if (motelId) {
      where.invoice = { motelId };
    }

    const result = await this.prisma.payment.aggregate({
      where,
      _sum: { amount: true },
    });

    return result._sum.amount ? parseFloat(String(result._sum.amount)) : 0;
  }

  private async getCurrentMonthExpenses(motelId?: string): Promise<number> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const invoiceWhere: Record<string, unknown> = {
      invoiceMonth: currentMonth,
      invoiceYear: currentYear,
      status: { not: InvoiceStatus.DRAFT },
    };
    if (motelId) invoiceWhere.motelId = motelId;

    const invoices = await this.prisma.invoice.findMany({
      where: invoiceWhere,
      select: {
        electricityAmount: true,
        waterAmount: true,
        serviceFeeAmount: true,
        surchargeAmount: true,
      },
    });

    const invoiceExpenses = invoices.reduce(
      (sum, inv) =>
        sum +
        parseFloat(String(inv.electricityAmount)) +
        parseFloat(String(inv.waterAmount)) +
        parseFloat(String(inv.serviceFeeAmount)) +
        parseFloat(String(inv.surchargeAmount)),
      0,
    );

    // Include PAID operational expenses (maintenance, utilities, cleaning, etc.)
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const expenseWhere: Record<string, unknown> = {
      status: ExpenseStatus.PAID,
      date: { gte: startOfMonth, lte: endOfMonth },
    };
    if (motelId) expenseWhere.motelId = motelId;

    const operationalResult = await this.prisma.expense.aggregate({
      where: expenseWhere,
      _sum: { amount: true },
    });

    const operationalExpenses = operationalResult._sum.amount
      ? parseFloat(String(operationalResult._sum.amount))
      : 0;

    return invoiceExpenses + operationalExpenses;
  }

  private async getTotalReceivables(motelId?: string): Promise<number> {
    const where: Record<string, unknown> = {
      status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
    };
    if (motelId) where.motelId = motelId;

    const invoices = await this.prisma.invoice.findMany({
      where,
      select: { totalAmount: true, paidAmount: true },
    });

    return invoices.reduce((sum, inv) => {
      const total = parseFloat(String(inv.totalAmount));
      const paid = parseFloat(String(inv.paidAmount));
      return sum + (total - paid);
    }, 0);
  }
}
