import { useState } from 'react'
import { Settings, FileDown } from 'lucide-react'
import { useDashboard, useRecentTransactions, useExpenseBreakdown } from '@/hooks/use-dashboard'
import { useMotels } from '@/hooks/use-motels'
import { useExpenses } from '@/hooks/use-expenses'
import { useInvoices } from '@/hooks/use-invoices'
import { downloadExcel, type ExcelSheet } from '@/lib/excel-export'
import { DashboardFinanceSummary } from '@/pages/dashboard/components/dashboard-finance-summary'
import { DashboardRevenueChart } from '@/pages/dashboard/components/dashboard-revenue-chart'
import { DashboardExpenseBreakdown } from '@/pages/dashboard/components/dashboard-expense-breakdown'
import { DashboardBuildingOccupancy } from '@/pages/dashboard/components/dashboard-building-occupancy'
import { DashboardAnalysisCard } from '@/pages/dashboard/components/dashboard-analysis-card'
import { DashboardTransactionsTable } from '@/pages/dashboard/components/dashboard-transactions-table'

type PeriodTab = 'Thang' | 'Quy' | 'Nam'

const periodMonths: Record<PeriodTab, number> = {
  Thang: 6,
  Quy: 12,
  Nam: 24,
}

// ─── Label maps for export ─────────────────────────────────────────────────
const TX_CATEGORY_LABELS: Record<string, string> = {
  CASH: 'Tien mat',
  BANK_TRANSFER: 'Chuyen khoan',
  OTHER: 'Khac',
}

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  MAINTENANCE: 'Bao tri / Sua chua',
  UTILITIES: 'Tien ich',
  SUPPLIES: 'Vat tu / Van phong pham',
  CLEANING: 'Ve sinh',
  SECURITY: 'An ninh / Bao ve',
  OTHER: 'Chi phi khac',
}

const EXPENSE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Cho duyet',
  APPROVED: 'Da duyet',
  PAID: 'Da chi',
  CANCELLED: 'Da huy',
}

const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nhap',
  ISSUED: 'Da phat hanh',
  PARTIALLY_PAID: 'Thanh toan 1 phan',
  PAID: 'Da thanh toan',
  OVERDUE: 'Qua han',
}

function fmtDate(d: string): string {
  try { return new Date(d).toLocaleDateString('vi-VN') } catch { return d }
}

export function FinancialReportPage() {
  const [activeTab, setActiveTab] = useState<PeriodTab>('Thang')
  const [selectedMotelId, setSelectedMotelId] = useState<string>('')
  const { data, isLoading } = useDashboard(selectedMotelId || undefined)
  const { data: motelsData } = useMotels(1, 100)
  const motels = motelsData?.data ?? []

  // Data for export
  const { data: allTransactions } = useRecentTransactions(500, selectedMotelId || undefined)
  const { data: expensesData } = useExpenses({ page: 1, limit: 500, motelId: selectedMotelId || undefined })
  const { data: invoicesData } = useInvoices({ page: 1, limit: 500, motelId: selectedMotelId || undefined })
  const { data: breakdownData } = useExpenseBreakdown(selectedMotelId || undefined)

  const selectedMotelName = selectedMotelId
    ? motels.find((m) => m.id === selectedMotelId)?.name ?? ''
    : 'Tat ca toa nha'

  const handleExportReport = () => {
    if (!data) return
    const today = fmtDate(new Date().toISOString())

    // ── Sheet 1: TONG HOP ──────────────────────────────────────────────────
    const summarySheet: ExcelSheet = {
      name: 'Tong hop',
      title: `BAO CAO TAI CHINH - ${selectedMotelName.toUpperCase()} - ${today}`,
      headers: ['Chi tieu', 'Gia tri', 'Don vi'],
      colWidths: [35, 20, 14],
      rowHeights: { 0: 32, 2: 22 },
      rows: [
        // Tai chinh
        ['', '', ''],
        ['TAI CHINH', '', ''],
        ['Doanh thu thang', data.finance.monthlyRevenue, 'VND'],
        ['Tong cong no', data.finance.totalReceivables, 'VND'],
        ['Tong chi phi', data.finance.totalExpenses, 'VND'],
        ['Loi nhuan rong', data.finance.netProfit, 'VND'],
        ['', '', ''],
        // Co cau chi phi
        ['CO CAU CHI PHI', '', ''],
        ...(breakdownData ?? []).map((b) => [
          EXPENSE_CATEGORY_LABELS[b.category] ?? b.category,
          b.amount,
          `${b.percentage}%`,
        ] as (string | number)[]),
        ['', '', ''],
        // Phong
        ['TINH HINH PHONG', '', ''],
        ['Tong so phong', data.rooms.total, 'phong'],
        ['Phong trong', data.rooms.vacant, 'phong'],
        ['Phong da thue', data.rooms.occupied, 'phong'],
        ['Ty le lan', data.rooms.occupancyRate, '%'],
        ['', '', ''],
        // Hop dong
        ['HOP DONG', '', ''],
        ['Dang hieu luc', data.contracts.active, 'hop dong'],
        ['Sap het han', data.contracts.expiringSoon, 'hop dong'],
        ['', '', ''],
        // Hoa don
        ['HOA DON', '', ''],
        ['Chua thanh toan', data.invoices.unpaid, 'hoa don'],
        ['Qua han', data.invoices.overdue, 'hoa don'],
      ],
    }

    // ── Sheet 2: HOA DON (Invoices with electricity/water/service breakdown) ─
    const invoices = invoicesData?.data ?? []
    const invoiceSheet: ExcelSheet = {
      name: 'Hoa don',
      title: `DANH SACH HOA DON - ${selectedMotelName.toUpperCase()}`,
      headers: [
        'STT', 'Ma HD', 'Phong', 'Nguoi thue', 'Ky',
        'Tien phong', 'Tien dien', 'Tien nuoc', 'Phi DV', 'Phu thu', 'Giam gia',
        'Tong cong', 'Da tra', 'Con lai', 'Trang thai',
      ],
      colWidths: [5, 12, 10, 20, 10, 14, 14, 14, 14, 12, 12, 16, 14, 14, 16],
      rowHeights: { 0: 32, 2: 22 },
      rows: invoices.map((inv, idx) => [
        idx + 1,
        inv.invoiceCode,
        inv.room?.roomCode ?? '',
        inv.representativeTenant?.fullName ?? '',
        `${inv.invoiceMonth}/${inv.invoiceYear}`,
        inv.rentAmount,
        inv.electricityAmount,
        inv.waterAmount,
        inv.serviceFeeAmount,
        inv.surchargeAmount,
        inv.discountAmount,
        inv.totalAmount,
        inv.paidAmount,
        inv.totalAmount - inv.paidAmount,
        INVOICE_STATUS_LABELS[inv.status] ?? inv.status,
      ]),
    }

    // Invoice totals
    if (invoices.length > 0) {
      const totals = invoices.reduce(
        (acc, inv) => ({
          rent: acc.rent + inv.rentAmount,
          elec: acc.elec + inv.electricityAmount,
          water: acc.water + inv.waterAmount,
          service: acc.service + inv.serviceFeeAmount,
          surcharge: acc.surcharge + inv.surchargeAmount,
          discount: acc.discount + inv.discountAmount,
          total: acc.total + inv.totalAmount,
          paid: acc.paid + inv.paidAmount,
        }),
        { rent: 0, elec: 0, water: 0, service: 0, surcharge: 0, discount: 0, total: 0, paid: 0 },
      )
      invoiceSheet.rows.push(
        Array(15).fill(''),
        [
          '', '', '', 'TONG CONG', '',
          totals.rent, totals.elec, totals.water, totals.service,
          totals.surcharge, totals.discount, totals.total, totals.paid,
          totals.total - totals.paid, '',
        ],
      )
    }

    // ── Sheet 3: CHI PHI VAN HANH (Operational expenses) ────────────────────
    const expenses = expensesData?.data ?? []
    const expenseSheet: ExcelSheet = {
      name: 'Chi phi van hanh',
      title: `CHI PHI VAN HANH - ${selectedMotelName.toUpperCase()}`,
      headers: ['STT', 'Ngay', 'Toa nha', 'Danh muc', 'Mo ta', 'Ghi chu', 'Trang thai', 'So tien (VND)'],
      colWidths: [5, 14, 20, 18, 35, 25, 14, 18],
      rowHeights: { 0: 32, 2: 22 },
      rows: expenses.map((exp, idx) => [
        idx + 1,
        fmtDate(exp.date),
        exp.motel?.name ?? '',
        EXPENSE_CATEGORY_LABELS[exp.category] ?? exp.category,
        exp.description,
        exp.note ?? '',
        EXPENSE_STATUS_LABELS[exp.status] ?? exp.status,
        exp.amount,
      ]),
    }

    if (expenses.length > 0) {
      const totalExp = expenses.reduce((s, e) => s + e.amount, 0)
      const paidExp = expenses.filter((e) => e.status === 'PAID').reduce((s, e) => s + e.amount, 0)
      const pendingExp = expenses.filter((e) => e.status === 'PENDING' || e.status === 'APPROVED').reduce((s, e) => s + e.amount, 0)
      expenseSheet.rows.push(
        Array(8).fill(''),
        ['', '', '', '', '', 'Tong chi phi', '', totalExp],
        ['', '', '', '', '', 'Da chi', '', paidExp],
        ['', '', '', '', '', 'Cho xu ly', '', pendingExp],
      )
    }

    // ── Sheet 4: GIAO DICH (All transactions) ──────────────────────────────
    const transactions = allTransactions ?? []
    const txSheet: ExcelSheet = {
      name: 'Giao dich',
      title: `LICH SU GIAO DICH - ${selectedMotelName.toUpperCase()}`,
      headers: ['STT', 'Ngay', 'Noi dung', 'Loai', 'Phuong thuc', 'So tien (VND)'],
      colWidths: [5, 14, 45, 8, 16, 18],
      rowHeights: { 0: 32, 2: 22 },
      rows: transactions.map((tx, idx) => [
        idx + 1,
        fmtDate(tx.date),
        tx.description,
        tx.type === 'income' ? 'Thu' : 'Chi',
        TX_CATEGORY_LABELS[tx.category] ?? tx.category,
        tx.type === 'income' ? tx.amount : -tx.amount,
      ]),
    }

    if (transactions.length > 0) {
      const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      txSheet.rows.push(
        Array(6).fill(''),
        ['', '', 'Tong thu', '', '', totalIncome],
        ['', '', 'Tong chi', '', '', totalExpense],
        ['', '', 'CHENH LECH', '', '', totalIncome - totalExpense],
      )
    }

    const filename = `bao-cao-tai-chinh-${today.replace(/\//g, '-')}.xlsx`
    downloadExcel(filename, [summarySheet, invoiceSheet, expenseSheet, txSheet])
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Quan ly</span>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Bao cao tai chinh</span>
      </nav>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Bao cao Tai chinh</h2>
          <p className="mt-0.5 text-sm text-[#7b7a7d]">
            Theo doi cac thong ke tai chinh ve van hanh toa nha
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period tabs */}
          <div className="flex rounded-lg border border-gray-200 bg-white">
            {(['Thang', 'Quy', 'Nam'] as PeriodTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#1d5fa8] text-white first:rounded-l-lg last:rounded-r-lg'
                    : 'text-[#7b7a7d] hover:text-[#323235]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Motel filter */}
          <select
            value={selectedMotelId}
            onChange={(e) => setSelectedMotelId(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          >
            <option value="">Tat ca toa nha</option>
            {motels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Export button */}
          <button
            onClick={handleExportReport}
            disabled={!data}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            Xuat Excel
          </button>

          {/* Customize button */}
          <button className="flex items-center gap-1.5 rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]">
            <Settings className="h-4 w-4" />
            Tuy chinh bao cao
          </button>
        </div>
      </div>

      {/* Finance summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : (
        <DashboardFinanceSummary data={data} />
      )}

      {/* Revenue chart + Expense breakdown */}
      <div className="flex gap-4">
        <DashboardRevenueChart
          months={periodMonths[activeTab]}
          motelId={selectedMotelId || undefined}
        />
        <div className="w-[380px] flex-shrink-0">
          <DashboardExpenseBreakdown motelId={selectedMotelId || undefined} />
        </div>
      </div>

      {/* Building occupancy + Analysis card */}
      <div className="flex gap-4">
        <div className="flex-1">
          <DashboardBuildingOccupancy />
        </div>
        <div className="w-[320px] flex-shrink-0">
          <DashboardAnalysisCard data={data} />
        </div>
      </div>

      {/* Recent transactions table */}
      <DashboardTransactionsTable motelId={selectedMotelId || undefined} />
    </div>
  )
}
