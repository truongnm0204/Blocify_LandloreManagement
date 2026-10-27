import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronRight, Printer, FileDown, RefreshCw, Pencil,
  AlertTriangle, CheckCircle2, Clock, XCircle, Plus,
  Building2, DoorOpen, Users, Phone, CreditCard, Banknote, X, UserPlus,
} from 'lucide-react'
import { useContract, useActivateContract, useTerminateContract, useAddContractTenant, useRemoveContractTenant } from '@/hooks/use-contracts'
import { useInvoices } from '@/hooks/use-invoices'
import { useTenants } from '@/hooks/use-tenants'
import { openPrintWindow } from '@/lib/print-utils'
import { buildContractPrintHtml } from './components/contract-print-template'
import type { ContractStatus, InvoiceStatus } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatVnd(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + ' tỷ ₫'
  if (value >= 1_000_000) return Math.round(value / 1_000_000) + ' tr ₫'
  return value.toLocaleString('vi-VN') + ' ₫'
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/** Days remaining from today to endDate */
function daysRemaining(endDate?: string | null): number | null {
  if (!endDate) return null
  const diff = new Date(endDate).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const CONTRACT_STATUS_CFG: Record<ContractStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  DRAFT:     { label: 'Nháp',          bg: 'bg-gray-100',  text: 'text-gray-600',  icon: <Clock className="h-3.5 w-3.5" /> },
  ACTIVE:    { label: 'Đang hiệu lực', bg: 'bg-[#dcfce7]', text: 'text-green-700', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  ENDED:     { label: 'Đã kết thúc',   bg: 'bg-gray-100',  text: 'text-gray-500',  icon: <XCircle className="h-3.5 w-3.5" /> },
  CANCELLED: { label: 'Đã huỷ',        bg: 'bg-red-50',    text: 'text-red-600',   icon: <XCircle className="h-3.5 w-3.5" /> },
}

const INVOICE_STATUS_CFG: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  DRAFT:          { label: 'Nháp',       bg: 'bg-gray-100',  text: 'text-gray-600' },
  ISSUED:         { label: 'Đã phát',    bg: 'bg-blue-50',   text: 'text-blue-700' },
  PARTIALLY_PAID: { label: 'Trả 1 phần', bg: 'bg-amber-50',  text: 'text-amber-700' },
  PAID:           { label: 'Đã thanh',   bg: 'bg-[#dcfce7]', text: 'text-green-700' },
  OVERDUE:        { label: 'Quá hạn',    bg: 'bg-red-50',    text: 'text-red-600' },
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-50 py-2.5 last:border-0">
      <span className="flex-shrink-0 text-xs text-[#7b7a7d]">{label}</span>
      <span className="text-right text-sm font-medium text-[#323235]">{value}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Terminate modal
// ─────────────────────────────────────────────────────────────────────────────

function TerminateModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: (date: string, reason: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-[#323235]">Chấm dứt hợp đồng</p>
            <p className="text-xs text-[#7b7a7d]">Hành động này không thể hoàn tác</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#323235]">Ngày chấm dứt</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#323235]">Lý do (tuỳ chọn)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Nhập lý do chấm dứt hợp đồng..."
              className="resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#323235] hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={() => onConfirm(date, reason)}
            disabled={isPending || !date}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? 'Đang xử lý...' : 'Xác nhận chấm dứt'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Add co-tenant modal
// ─────────────────────────────────────────────────────────────────────────────

function AddCoTenantModal({
  contractId,
  excludeIds,
  onClose,
}: {
  contractId: string
  excludeIds: string[]
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const addMutation = useAddContractTenant()

  const { data: tenantsData } = useTenants(
    search.trim().length >= 1 ? { search: search.trim(), limit: 10 } : { limit: 0 }
  )
  const results = (tenantsData?.data ?? []).filter((t) => !excludeIds.includes(t.id))

  function handleSelect(tenantId: string) {
    addMutation.mutate(
      { contractId, tenantId },
      { onSuccess: () => onClose() },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-[#323235]">Thêm người ở cùng</p>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-4 w-4 text-[#7b7a7d]" />
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowDropdown(e.target.value.trim().length >= 1) }}
            onFocus={() => search.trim().length >= 1 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Tìm kiếm khách thuê..."
            autoFocus
            className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
          />
          {showDropdown && results.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-md">
              {results.map((t) => (
                <li
                  key={t.id}
                  onMouseDown={() => handleSelect(t.id)}
                  className="cursor-pointer px-3 py-2.5 text-sm hover:bg-[#f0f9ff]"
                >
                  <p className="font-medium text-[#323235]">{t.fullName}</p>
                  <p className="text-xs text-[#7b7a7d]">{t.phoneNumber}</p>
                </li>
              ))}
            </ul>
          )}
          {showDropdown && search.trim().length >= 1 && results.length === 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-[#7b7a7d] shadow-md">
              Không tìm thấy khách thuê
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-[#7b7a7d]">Người ở cùng không chịu trách nhiệm thanh toán hợp đồng.</p>
        {addMutation.isPending && (
          <p className="mt-2 text-xs text-[#1d5fa8]">Đang thêm...</p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export function ContractDetailPage() {
  const { contractId: id = '' } = useParams<{ contractId: string }>()
  const navigate = useNavigate()
  const [showTerminateModal, setShowTerminateModal] = useState(false)
  const [showAddCoTenantModal, setShowAddCoTenantModal] = useState(false)

  const { data: contract, isLoading, error } = useContract(id)
  const activateMutation = useActivateContract()
  const terminateMutation = useTerminateContract()
  const removeCoTenantMutation = useRemoveContractTenant()

  // Fetch recent invoices for this contract
  const { data: invoicesResp } = useInvoices({ contractId: id, limit: 5 })
  const contractInvoices = invoicesResp?.data ?? []

  // ── loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] animate-pulse">
        <div className="mb-6 h-6 w-48 rounded bg-gray-200" />
        <div className="flex gap-6">
          <div className="flex-1 space-y-5">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-gray-200" />)}
          </div>
          <div className="w-[300px] space-y-5">
            {[1, 2].map((i) => <div key={i} className="h-40 rounded-xl bg-gray-200" />)}
          </div>
        </div>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-red-500">Không tìm thấy hợp đồng. Vui lòng thử lại.</p>
        <button onClick={() => navigate('/contracts')} className="mt-3 text-sm text-[#1d5fa8] hover:underline">
          Quay lại danh sách
        </button>
      </div>
    )
  }

  // ── derived values ────────────────────────────────────────────────────────
  const statusCfg = CONTRACT_STATUS_CFG[contract.status] ?? CONTRACT_STATUS_CFG.DRAFT
  const remaining = daysRemaining(contract.endDate)

  // Representative tenant
  const repTenant = contract.representativeTenant
    ?? contract.contractTenants?.find((ct) => ct.isRepresentative)?.tenant

  // Co-tenants (non-representative)
  const coTenants = (contract.contractTenants ?? []).filter((ct) => !ct.isRepresentative)

  // All current tenant IDs to exclude from add modal
  const currentTenantIds = [
    ...(repTenant ? [repTenant.id] : []),
    ...coTenants.map((ct) => ct.tenant?.id).filter(Boolean) as string[],
  ]

  // Timeline entries
  const timeline = [
    { date: contract.signedDate, label: 'Ký hợp đồng' },
    { date: contract.startDate, label: 'Bắt đầu thuê' },
    ...(contract.endDate ? [{ date: contract.endDate, label: 'Kết thúc hợp đồng' }] : []),
  ].filter((e) => e.date)

  const handleTerminate = (date: string, reason: string) => {
    terminateMutation.mutate(
      { id, data: { terminationDate: date, reason: reason || undefined } },
      { onSuccess: () => setShowTerminateModal(false) },
    )
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[1100px]">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-[#7b7a7d]">
        <button onClick={() => navigate('/')} className="hover:text-[#323235]">Trang chủ</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate('/contracts')} className="hover:text-[#323235]">Hợp đồng</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#323235]">{contract.contractCode ?? id.slice(0, 8)}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {contract.contractCode && (
              <span className="rounded-md bg-[#d5e3ff] px-2.5 py-0.5 text-xs font-semibold text-[#1d5fa8]">
                {contract.contractCode}
              </span>
            )}
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-[#323235]">
            {contract.room?.roomName ?? contract.room?.roomCode ?? 'Phòng'}
            {contract.motel ? ` — ${contract.motel.name}` : ''}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openPrintWindow({
              title: `Hop dong ${contract.contractCode ?? contract.id.slice(0, 8)}`,
              content: buildContractPrintHtml(contract),
            })}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            In hợp đồng
          </button>
          <button
            onClick={() => openPrintWindow({
              title: `Hop dong ${contract.contractCode ?? contract.id.slice(0, 8)}`,
              content: buildContractPrintHtml(contract),
            })}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
          >
            <FileDown className="h-4 w-4" />
            Xuất PDF
          </button>
          <button
            onClick={() => navigate(`/contracts/${id}/edit`)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </button>
          {contract.status === 'DRAFT' && (
            <button
              onClick={() => activateMutation.mutate(id)}
              disabled={activateMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {activateMutation.isPending ? 'Đang kích hoạt...' : 'Kích hoạt'}
            </button>
          )}
          {contract.status === 'ACTIVE' && (
            <button
              onClick={() => setShowTerminateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
            >
              <RefreshCw className="h-4 w-4" />
              Chấm dứt HĐ
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-6">
        {/* ── Left column ──────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1 space-y-5">

          {/* Tenant info card */}
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#1d5fa8]" />
              <h4 className="text-sm font-semibold text-[#323235]">Thông tin khách thuê</h4>
            </div>
            {repTenant ? (
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#d5e3ff] text-base font-bold text-[#1d5fa8]">
                  {repTenant.fullName.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#323235]">{repTenant.fullName}</p>
                  {repTenant.phoneNumber && (
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-[#7b7a7d]">
                      <Phone className="h-3.5 w-3.5" />
                      {repTenant.phoneNumber}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-[#d5e3ff] px-2.5 py-0.5 text-xs font-semibold text-[#1d5fa8]">
                  Đại diện
                </span>
              </div>
            ) : (
              <p className="text-sm text-[#7b7a7d]">Chưa có thông tin khách thuê</p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#f5f6fa] p-3">
                <p className="flex items-center gap-1 text-xs text-[#7b7a7d]">
                  <Banknote className="h-3.5 w-3.5" /> Giá thuê/tháng
                </p>
                <p className="mt-1 text-base font-semibold text-[#323235]">{formatVnd(contract.rentAmount)}</p>
              </div>
              <div className="rounded-lg bg-[#f5f6fa] p-3">
                <p className="flex items-center gap-1 text-xs text-[#7b7a7d]">
                  <CreditCard className="h-3.5 w-3.5" /> Tiền đặt cọc
                </p>
                <p className="mt-1 text-base font-semibold text-[#323235]">{formatVnd(contract.depositAmount)}</p>
              </div>
              {(contract.serviceFee ?? 0) > 0 && (
                <div className="rounded-lg bg-[#f5f6fa] p-3">
                  <p className="text-xs text-[#7b7a7d]">Phí dịch vụ/tháng</p>
                  <p className="mt-1 text-sm font-semibold text-[#323235]">{formatVnd(contract.serviceFee!)}</p>
                </div>
              )}
              {(contract.numberOfOccupants ?? 0) > 0 && (
                <div className="rounded-lg bg-[#f5f6fa] p-3">
                  <p className="text-xs text-[#7b7a7d]">Số người ở</p>
                  <p className="mt-1 text-sm font-semibold text-[#323235]">{contract.numberOfOccupants} người</p>
                </div>
              )}
            </div>
          </div>

          {/* Co-tenants */}
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#323235]">
                Người ở cùng {coTenants.length > 0 ? `(${coTenants.length})` : ''}
              </h4>
              {contract.status === 'ACTIVE' && (
                <button
                  onClick={() => setShowAddCoTenantModal(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#1d5fa8] px-3 py-1.5 text-xs font-medium text-[#1d5fa8] transition-colors hover:bg-blue-50"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Thêm người ở cùng
                </button>
              )}
            </div>
            {coTenants.length === 0 ? (
              <p className="text-sm text-[#7b7a7d]">Chưa có người ở cùng</p>
            ) : (
              <div className="space-y-2">
                {coTenants.map((ct) => (
                  <div key={ct.id} className="flex items-center gap-3 rounded-lg bg-[#f5f6fa] px-3 py-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#d5e3ff] text-xs font-bold text-[#1d5fa8]">
                      {(ct.tenant?.fullName ?? '?').split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#323235]">{ct.tenant?.fullName ?? '—'}</p>
                      {ct.tenant?.phoneNumber && (
                        <p className="text-xs text-[#7b7a7d]">{ct.tenant.phoneNumber}</p>
                      )}
                    </div>
                    {contract.status === 'ACTIVE' && ct.tenant?.id && (
                      <button
                        onClick={() => removeCoTenantMutation.mutate({ contractId: id, tenantId: ct.tenant!.id })}
                        disabled={removeCoTenantMutation.isPending}
                        title="Xoá khỏi hợp đồng"
                        className="flex-shrink-0 rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rental period */}
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h4 className="mb-3 text-sm font-semibold text-[#323235]">Thời hạn thuê</h4>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-[#7b7a7d]">Bắt đầu</p>
                <p className="text-sm font-semibold text-[#323235]">{formatDate(contract.startDate)}</p>
              </div>
              <div className="h-px flex-1 border-t border-dashed border-gray-300" />
              <div className="text-right">
                <p className="text-xs text-[#7b7a7d]">Kết thúc</p>
                <p className="text-sm font-semibold text-[#323235]">
                  {contract.endDate ? formatDate(contract.endDate) : 'Không xác định'}
                </p>
              </div>
            </div>
            {remaining !== null && (
              <div className={`mt-3 rounded-lg px-3 py-2 text-center ${
                remaining < 0 ? 'bg-red-50' : remaining <= 30 ? 'bg-amber-50' : 'bg-blue-50'
              }`}>
                <span className={`text-sm font-semibold ${
                  remaining < 0 ? 'text-red-600' : remaining <= 30 ? 'text-amber-700' : 'text-[#1d5fa8]'
                }`}>
                  {remaining < 0
                    ? `Đã quá hạn ${Math.abs(remaining)} ngày`
                    : remaining === 0
                    ? 'Hết hạn hôm nay'
                    : `Còn lại ${remaining} ngày`}
                </span>
              </div>
            )}
            {contract.notes && (
              <div className="mt-3 rounded-lg bg-[#f5f6fa] px-3 py-2">
                <p className="text-xs text-[#7b7a7d]">Ghi chú</p>
                <p className="mt-0.5 text-sm text-[#323235]">{contract.notes}</p>
              </div>
            )}
          </div>

          {/* Recent invoices table */}
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h4 className="text-sm font-semibold text-[#323235]">Hoá đơn gần đây</h4>
              <button onClick={() => navigate('/invoices')} className="text-xs text-[#1d5fa8] hover:underline">
                Xem tất cả
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc] text-left text-[10px] font-bold uppercase tracking-widest text-[#7b7a7d]">
                  <th className="px-5 py-3">Mã HĐ</th>
                  <th className="px-5 py-3">Kỳ thanh toán</th>
                  <th className="px-5 py-3">Tổng tiền</th>
                  <th className="px-5 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contractInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-[#7b7a7d]">Chưa có hoá đơn nào</td>
                  </tr>
                ) : (
                  contractInvoices.map((inv) => {
                    const cfg = INVOICE_STATUS_CFG[inv.status] ?? { label: inv.status, bg: 'bg-gray-100', text: 'text-gray-600' }
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => navigate(`/invoices/${inv.id}`)}
                        className="cursor-pointer transition-colors hover:bg-[#f5f6fa]"
                      >
                        <td className="px-5 py-3 text-sm font-medium text-[#1d5fa8]">{inv.invoiceCode}</td>
                        <td className="px-5 py-3 text-sm text-[#323235]">
                          Tháng {inv.invoiceMonth}/{inv.invoiceYear}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold text-[#323235]">{formatVnd(inv.totalAmount)}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-5 py-3">
              <button
                onClick={() => navigate('/invoices/generate')}
                className="flex items-center gap-2 text-sm font-medium text-[#1d5fa8] transition-colors hover:text-[#174d8a]"
              >
                <Plus className="h-4 w-4" />
                Tạo hoá đơn mới
              </button>
            </div>
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <div className="w-[300px] flex-shrink-0 space-y-5">

          {/* Property info */}
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#1d5fa8]" />
              <h4 className="text-sm font-semibold text-[#323235]">Thông tin tài sản</h4>
            </div>
            <InfoRow label="Phòng" value={
              <span className="flex items-center gap-1">
                <DoorOpen className="h-3.5 w-3.5 text-[#7b7a7d]" />
                {contract.room?.roomName ?? contract.room?.roomCode ?? '—'}
              </span>
            } />
            <InfoRow label="Tòa nhà" value={contract.motel?.name ?? '—'} />
            {contract.motel?.address && (
              <InfoRow label="Địa chỉ" value={<span className="text-xs">{contract.motel.address}</span>} />
            )}
            <InfoRow label="Ngày ký" value={formatDate(contract.signedDate)} />
          </div>

          {/* Timeline */}
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h4 className="mb-4 text-sm font-semibold text-[#323235]">Dòng thời gian</h4>
            <div className="relative space-y-4 pl-5">
              <div className="absolute left-1.5 top-1 h-full w-px bg-gray-200" />
              {timeline.map((entry, idx) => (
                <div key={idx} className="relative flex gap-3">
                  <div className={`absolute -left-4 mt-1 h-2.5 w-2.5 rounded-full border-2 ${
                    idx === 0 ? 'border-[#1d5fa8] bg-[#1d5fa8]' : 'border-gray-300 bg-white'
                  }`} />
                  <div>
                    <p className="text-[10px] text-[#7b7a7d]">{formatDate(entry.date)}</p>
                    <p className="text-sm font-medium text-[#323235]">{entry.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone — only for ACTIVE contracts */}
          {contract.status === 'ACTIVE' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h4 className="text-sm font-semibold text-red-700">Vùng nguy hiểm</h4>
              </div>
              <p className="mb-4 text-xs text-red-600">
                Chấm dứt hợp đồng sẽ giải phóng phòng và huỷ mọi quyền truy cập của khách thuê.
              </p>
              <button
                onClick={() => setShowTerminateModal(true)}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Chấm dứt hợp đồng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add co-tenant modal */}
      {showAddCoTenantModal && (
        <AddCoTenantModal
          contractId={id}
          excludeIds={currentTenantIds}
          onClose={() => setShowAddCoTenantModal(false)}
        />
      )}

      {/* Terminate modal */}
      {showTerminateModal && (
        <TerminateModal
          onConfirm={handleTerminate}
          onCancel={() => setShowTerminateModal(false)}
          isPending={terminateMutation.isPending}
        />
      )}
    </div>
  )
}
