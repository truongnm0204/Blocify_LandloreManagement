import { useState } from 'react'
import { User, Crown, ExternalLink, UserPlus, X, FilePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Room } from '@/types'
import { useTenants } from '@/hooks/use-tenants'
import { useAddContractTenant, useRemoveContractTenant } from '@/hooks/use-contracts'

interface Props {
  room: Room
}

// ─────────────────────────────────────────────────────────────────────────────
// Add co-tenant modal (inline, reused from contract detail context)
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
        {addMutation.isPending && <p className="mt-2 text-xs text-[#1d5fa8]">Đang thêm...</p>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Room tenant list with smart action buttons
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Displays all tenants of the active contract.
 * - No active contract → button to create new contract
 * - Active contract + room not full → button to add co-tenant (modal)
 * - Active contract, ACTIVE status → X button to remove co-tenant
 */
export function RoomTenantList({ room }: Props) {
  const navigate = useNavigate()
  const [showAddModal, setShowAddModal] = useState(false)
  const removeCoTenantMutation = useRemoveContractTenant()

  const activeContract = room.contracts?.find((c) => c.status === 'ACTIVE')
  const tenants = activeContract?.tenants ?? []

  // IDs already in the contract (to exclude from search)
  const currentTenantIds = tenants.map((ct) => ct.tenantId).filter(Boolean) as string[]

  // Whether room still has capacity for more co-tenants
  const hasCapacity = room.maxOccupants == null || tenants.length < room.maxOccupants

  // ── No active contract: prompt to create one ──────────────────────────────
  if (!activeContract) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-[#323235]">Người thuê</h3>
        <p className="mb-4 text-sm text-[#7b7a7d]">Phòng hiện chưa có người thuê.</p>
        {room.status !== 'MAINTENANCE' && (
          <button
            onClick={() => {
              const params = new URLSearchParams({ roomId: room.id })
              if (room.motelId) params.set('motelId', room.motelId)
              navigate(`/contracts/new?${params.toString()}`)
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
          >
            <FilePlus className="h-4 w-4" />
            Đăng ký hợp đồng mới
          </button>
        )}
      </section>
    )
  }

  // ── Has active contract ───────────────────────────────────────────────────
  return (
    <>
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#323235]">
            Người thuê ({tenants.length})
          </h3>
          <button
            onClick={() => navigate(`/contracts/${activeContract.id}`)}
            className="flex items-center gap-1 text-xs text-[#1d5fa8] hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Xem hợp đồng
          </button>
        </div>

        {/* Tenant cards */}
        <div className="space-y-3">
          {tenants.map((ct) => {
            const tenant = ct.tenant
            if (!tenant) return null
            return (
              <div
                key={ct.id}
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f8fafc] px-4 py-3"
              >
                {/* Avatar */}
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c8e6ff]">
                  <User className="h-4 w-4 text-[#1d5fa8]" />
                  {ct.isRepresentative && (
                    <span
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400"
                      title="Đại diện"
                    >
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-[#323235]">{tenant.fullName}</p>
                    {ct.isRepresentative && (
                      <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                        Đại diện
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  {/* Remove — only non-representative co-tenants */}
                  {!ct.isRepresentative && ct.tenantId && (
                    <button
                      onClick={() => removeCoTenantMutation.mutate({
                        contractId: activeContract.id,
                        tenantId: ct.tenantId,
                      })}
                      disabled={removeCoTenantMutation.isPending}
                      title="Xoá khỏi hợp đồng"
                      className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {/* Link to tenant detail */}
                  <button
                    onClick={() => navigate(`/tenants/${ct.tenantId}`)}
                    className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100 hover:text-[#1d5fa8]"
                    title="Xem chi tiết người thuê"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Add co-tenant button — only if room still has capacity */}
        {hasCapacity && (
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-[#1d5fa8] transition-colors hover:bg-blue-50"
          >
            <UserPlus className="h-4 w-4" />
            Thêm người ở cùng
          </button>
        )}

        {/* Contract code footer */}
        {activeContract.contractCode && (
          <p className="mt-3 text-xs text-[#7b7a7d]">
            Hợp đồng: <span className="font-medium">{activeContract.contractCode}</span>
          </p>
        )}
      </section>

      {showAddModal && (
        <AddCoTenantModal
          contractId={activeContract.id}
          excludeIds={currentTenantIds}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  )
}
