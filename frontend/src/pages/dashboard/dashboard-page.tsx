import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, FileText, TrendingUp, AlertTriangle,
  Plus, Download, DoorOpen, Users,
} from 'lucide-react'
import {
  useDashboard,
  useRevenueTrend,
  useMotelOccupancy,
  useExpenseBreakdown,
} from '@/hooks/use-dashboard'
import { useInvoices } from '@/hooks/use-invoices'
import {
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  Tooltip, Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { InvoiceStatus } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatVnd(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + ' tỷ ₫'
  if (value >= 1_000_000) return Math.round(value / 1_000_000) + ' tr ₫'
  return value.toLocaleString('vi-VN') + ' ₫'
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

type PeriodTab = 'Thang' | 'Quy' | 'Nam'
const PERIOD_MONTHS: Record<PeriodTab, number> = { Thang: 6, Quy: 12, Nam: 24 }

const STATUS_CFG: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  DRAFT:          { label: 'Nháp',        bg: 'bg-gray-100',  text: 'text-gray-600' },
  ISSUED:         { label: 'Đã phát',     bg: 'bg-blue-50',   text: 'text-blue-700' },
  PARTIALLY_PAID: { label: 'Trả 1 phần',  bg: 'bg-amber-50',  text: 'text-amber-700' },
  PAID:           { label: 'Đã thanh',    bg: 'bg-[#d5e3ff]', text: 'text-[#00529a]' },
  OVERDUE:        { label: 'Quá hạn',     bg: 'bg-red-50',    text: 'text-red-700' },
}

const EXPENSE_LABELS: Record<string, { label: string; color: string }> = {
  ELECTRICITY: { label: 'Điện',      color: '#f59e0b' },
  WATER:       { label: 'Nước',      color: '#3b82f6' },
  SERVICE_FEE: { label: 'Dịch vụ',   color: '#8b5cf6' },
  SURCHARGE:   { label: 'Phụ thu',   color: '#ef4444' },
}

const ROOM_STATUS_COLORS = {
  occupied:    '#1d5fa8',
  vacant:      '#22c55e',
  maintenance: '#f59e0b',
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string | number
  sub: string
  subColor?: string
  trend?: string       // e.g. "+12%"
  trendUp?: boolean
  accentBar?: string   // tailwind bg class for bottom bar
}

function StatCard({ icon, iconBg, label, value, sub, subColor, trend, trendUp, accentBar }: StatCardProps) {
  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(14,14,15,0.06)]">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        {trend && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#7b7a7d]">{label}</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#323235]">{value}</p>
      </div>
      <p className={`text-xs font-medium ${subColor ?? 'text-[#7b7a7d]'}`}>{sub}</p>
      {accentBar && <div className={`absolute bottom-0 left-0 h-[3px] w-full ${accentBar}`} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DashboardPage
// ─────────────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<PeriodTab>('Thang')

  const { data, isLoading } = useDashboard()
  const { data: revenueTrend } = useRevenueTrend(PERIOD_MONTHS[period])
  const { data: motels } = useMotelOccupancy()
  const { data: expenses } = useExpenseBreakdown()
  const { data: invoicesResp } = useInvoices({ page: 1, limit: 6 })

  // ── derived values ─────────────────────────────────────────────────────────
  const totalRooms      = data?.rooms.total ?? 0
  const occupiedRooms   = data?.rooms.occupied ?? 0
  const vacantRooms     = data?.rooms.vacant ?? 0
  const maintenanceRooms = data?.rooms.maintenance ?? 0
  const activeContracts = data?.contracts.active ?? 0
  const expiringSoon    = data?.contracts.expiringSoon ?? 0
  const monthlyRevenue  = data?.finance.monthlyRevenue ?? 0
  const totalReceivables = data?.finance.totalReceivables ?? 0
  const overdueCount    = data?.invoices.overdue ?? 0
  const unpaidCount     = data?.invoices.unpaid ?? 0
  const occupancyRate   = data?.rooms.occupancyRate ?? 0
  const recentInvoices  = invoicesResp?.data ?? []

  // Donut data — room status breakdown
  const roomDonutData = [
    { name: 'Đang thuê',    value: occupiedRooms,    color: ROOM_STATUS_COLORS.occupied },
    { name: 'Trống',        value: vacantRooms,      color: ROOM_STATUS_COLORS.vacant },
    { name: 'Bảo trì',     value: maintenanceRooms, color: ROOM_STATUS_COLORS.maintenance },
  ].filter((d) => d.value > 0)

  // Expense breakdown for horizontal bars
  const expenseData = (expenses ?? []).map((e) => ({
    ...e,
    label: EXPENSE_LABELS[e.category]?.label ?? e.category,
    color: EXPENSE_LABELS[e.category]?.color ?? '#94a3b8',
  }))

  const paidPct = monthlyRevenue > 0
    ? Math.round(((monthlyRevenue - totalReceivables) / monthlyRevenue) * 100)
    : 0

  const chartData = revenueTrend ?? []

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 pb-4">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#323235]">Bảng điều khiển</h1>
          <p className="mt-1 text-sm text-[#7b7a7d]">Tổng quan tình trạng vận hành và tài chính</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex rounded-xl border border-gray-200 bg-white p-1">
            {(['Thang', 'Quy', 'Nam'] as PeriodTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setPeriod(t)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                  period === t
                    ? 'bg-[#1d5fa8] text-white shadow-sm'
                    : 'text-[#7b7a7d] hover:text-[#323235]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#323235] transition-colors hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Xuất
          </button>
          <button
            onClick={() => navigate('/contracts/new')}
            className="flex items-center gap-2 rounded-xl bg-[#1d5fa8] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#174d8a]"
          >
            <Plus className="h-4 w-4" />
            Hợp đồng mới
          </button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[160px] animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          <StatCard
            icon={<Building2 className="h-5 w-5 text-[#1d5fa8]" />}
            iconBg="bg-[#d5e3ff]"
            iconColor="#1d5fa8"
            label="Tổng phòng"
            value={totalRooms}
            sub={`${occupancyRate}% đang có người thuê`}
            subColor="text-[#1d5fa8]"
            accentBar="bg-[#1d5fa8]"
          />
          <StatCard
            icon={<FileText className="h-5 w-5 text-violet-600" />}
            iconBg="bg-violet-50"
            iconColor="#7c3aed"
            label="Hợp đồng hiệu lực"
            value={activeContracts}
            sub={expiringSoon > 0 ? `${expiringSoon} sắp hết hạn` : 'Không có hợp đồng sắp hết hạn'}
            subColor={expiringSoon > 0 ? 'text-amber-600' : 'text-[#7b7a7d]'}
            accentBar="bg-violet-400"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            iconColor="#059669"
            label="Doanh thu tháng"
            value={formatVnd(monthlyRevenue)}
            sub={`Đã thu: ${paidPct}% • Còn lại: ${formatVnd(totalReceivables)}`}
            subColor="text-emerald-600"
            accentBar="bg-emerald-500"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
            iconBg="bg-red-50"
            iconColor="#ef4444"
            label="Nợ quá hạn"
            value={overdueCount}
            sub={`${unpaidCount} hoá đơn chưa thanh toán`}
            subColor={overdueCount > 0 ? 'text-red-500' : 'text-[#7b7a7d]'}
            accentBar={overdueCount > 0 ? 'bg-red-500' : 'bg-gray-200'}
          />
        </div>
      )}

      {/* ── Row 2: Revenue chart (wide) + Room donut ───────────────────── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Revenue area/bar chart — spans 2 cols */}
        <div className="col-span-2 rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(14,14,15,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#323235]">Doanh thu & Chi phí</p>
              <p className="text-xs text-[#7b7a7d]">{PERIOD_MONTHS[period]} tháng gần nhất</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#7b7a7d]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1d5fa8]" />Doanh thu
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e2e8f0]" />Chi phí
              </span>
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="flex h-[260px] items-center justify-center text-sm text-[#7b7a7d]">Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ left: -10, right: 8 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1d5fa8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1d5fa8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#94a3b8" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7b7a7d' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v: number) => Math.round(v / 1_000_000) + 'tr'}
                  tick={{ fontSize: 11, fill: '#7b7a7d' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [formatVnd(v), name === 'revenue' ? 'Doanh thu' : 'Chi phí']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="expenses" name="expenses" stroke="#94a3b8" strokeWidth={2} fill="url(#gradExpenses)" dot={false} />
                <Area type="monotone" dataKey="revenue"  name="revenue"  stroke="#1d5fa8" strokeWidth={2.5} fill="url(#gradRevenue)" dot={false} activeDot={{ r: 4, fill: '#1d5fa8' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Room status donut */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(14,14,15,0.06)]">
          <p className="mb-1 font-semibold text-[#323235]">Tình trạng phòng</p>
          <p className="mb-4 text-xs text-[#7b7a7d]">Tổng {totalRooms} phòng</p>

          {totalRooms === 0 ? (
            <div className="flex h-[180px] items-center justify-center text-sm text-[#7b7a7d]">Chưa có dữ liệu</div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={roomDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {roomDonutData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [v + ' phòng']}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center overlay text — absolute trick inside relative wrapper */}
              <div className="relative -mt-[148px] flex w-full flex-col items-center justify-center" style={{ height: 110 }}>
                <p className="text-3xl font-extrabold text-[#1d5fa8]">{occupancyRate}%</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7b7a7d]">Lấp đầy</p>
              </div>

              {/* Legend */}
              <div className="mt-2 flex w-full flex-col gap-2">
                {roomDonutData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-[#5f5f61]">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#323235]">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Occupancy per motel (bars) + Expense breakdown ──────── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Per-motel occupancy — horizontal bar chart */}
        <div className="col-span-2 rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(14,14,15,0.06)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#323235]">Tỉ lệ lấp đầy theo tòa nhà</p>
              <p className="text-xs text-[#7b7a7d]">Tỉ lệ phòng đang có người thuê</p>
            </div>
            <button onClick={() => navigate('/motels')} className="text-xs font-semibold text-[#1d5fa8] hover:underline">
              Xem tất cả
            </button>
          </div>

          {(!motels || motels.length === 0) ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-[#7b7a7d]">Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(160, motels.length * 46)}>
              <BarChart
                data={motels.map((m) => ({ name: m.name, rate: m.occupancyRate, occupied: m.occupied, total: m.total }))}
                layout="vertical"
                margin={{ left: 8, right: 24 }}
                barSize={16}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => v + '%'} tick={{ fontSize: 11, fill: '#7b7a7d' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: '#323235', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number, _n: string, props) => [`${v}% (${props.payload?.occupied}/${props.payload?.total} phòng)`]}
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="rate" name="Lấp đầy" radius={[0, 6, 6, 0]} background={{ fill: '#f8fafc', radius: [0, 6, 6, 0] }}>
                  {(motels ?? []).map((m, idx) => (
                    <Cell
                      key={idx}
                      fill={m.occupancyRate >= 80 ? '#1d5fa8' : m.occupancyRate >= 50 ? '#60a5fa' : '#94a3b8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expense breakdown */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(14,14,15,0.06)]">
          <div className="mb-6">
            <p className="font-semibold text-[#323235]">Chi phí tháng này</p>
            <p className="text-xs text-[#7b7a7d]">Phân loại theo danh mục</p>
          </div>

          {expenseData.length === 0 ? (
            <div className="flex h-[160px] items-center justify-center text-sm text-[#7b7a7d]">Chưa có dữ liệu</div>
          ) : (
            <div className="flex flex-col gap-4">
              {expenseData.map((e) => (
                <div key={e.category}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                      <span className="font-medium text-[#323235]">{e.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#323235]">{e.percentage}%</span>
                      <span className="text-[#7b7a7d]">{formatVnd(e.amount)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#f1f5f9]">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${e.percentage}%`, background: e.color }}
                    />
                  </div>
                </div>
              ))}

              {/* Quick actions */}
              <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-4">
                <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 rounded-lg bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-[#323235] hover:bg-gray-100 transition-colors">
                  <FileText className="h-3.5 w-3.5 text-[#1d5fa8]" />
                  Quản lý hoá đơn
                </button>
                <button onClick={() => navigate('/meter-readings')} className="flex items-center gap-2 rounded-lg bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-[#323235] hover:bg-gray-100 transition-colors">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  Chỉ số điện nước
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Recent invoices ──────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(14,14,15,0.06)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d5e3ff]">
              <FileText className="h-4 w-4 text-[#1d5fa8]" />
            </div>
            <div>
              <p className="font-semibold text-[#323235]">Hoá đơn gần đây</p>
              <p className="text-xs text-[#7b7a7d]">{invoicesResp?.meta.total ?? 0} hoá đơn tổng cộng</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/invoices')}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-[#323235] hover:bg-gray-50 transition-colors"
          >
            Xem tất cả →
          </button>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8fafc]">
              {['Khách thuê', 'Phòng', 'Ngày', 'Số tiền', 'Trạng thái'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#7b7a7d]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentInvoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-[#7b7a7d]">Chưa có hoá đơn nào</td>
              </tr>
            ) : (
              recentInvoices.map((inv) => {
                const tenantName = inv.representativeTenant?.fullName ?? '—'
                const initials = tenantName !== '—'
                  ? tenantName.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
                  : '?'
                const cfg = STATUS_CFG[inv.status] ?? { label: inv.status, bg: 'bg-gray-100', text: 'text-gray-600' }

                return (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="cursor-pointer transition-colors hover:bg-[#f5f6fa]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#d5e3ff] text-xs font-bold text-[#1d5fa8]">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#323235]">{tenantName}</p>
                          <p className="text-[10px] text-[#7b7a7d]">{inv.invoiceCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#323235]">{inv.room?.roomName ?? inv.room?.roomCode ?? '—'}</p>
                      <p className="text-[10px] text-[#7b7a7d]">{inv.room?.roomCode ?? ''}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#7b7a7d]">{formatDate(inv.billingDate)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#323235]">{formatVnd(inv.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-50 px-6 py-4">
          <div className="flex items-center gap-4 text-xs text-[#7b7a7d]">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {recentInvoices.length} hoá đơn hiển thị
            </span>
            <span className="flex items-center gap-1">
              <DoorOpen className="h-3.5 w-3.5" />
              {overdueCount} quá hạn
            </span>
          </div>
          <button onClick={() => navigate('/invoices')} className="text-xs font-bold text-[#1d5fa8] hover:underline">
            Xem tất cả hoá đơn →
          </button>
        </div>
      </div>

    </div>
  )
}
