import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Car, FileText, Calendar, Bike } from 'lucide-react'
import { useTenant } from '@/hooks/use-tenants'
import { useVehicles } from '@/hooks/use-vehicles'
import type { TenantStatus, VehicleType } from '@/types'

const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  MOTORCYCLE: 'Xe may',
  CAR: 'O to',
  BICYCLE: 'Xe dap',
  ELECTRIC_BIKE: 'Xe dap dien',
  OTHER: 'Khac',
}

const STATUS_CONFIG: Record<TenantStatus, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: 'Dang hoat dong', bg: 'bg-green-50', text: 'text-green-700' },
  INACTIVE: { label: 'Ngung hoat dong', bg: 'bg-gray-100', text: 'text-gray-600' },
  BLACKLISTED: { label: 'Chan', bg: 'bg-red-50', text: 'text-red-700' },
}

const CONTRACT_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: 'Dang hoat dong', bg: 'bg-green-50', text: 'text-green-700' },
  EXPIRED: { label: 'Het han', bg: 'bg-gray-100', text: 'text-gray-600' },
  TERMINATED: { label: 'Da cham dut', bg: 'bg-red-50', text: 'text-red-700' },
  CANCELLED: { label: 'Da huy', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  PENDING: { label: 'Cho xu ly', bg: 'bg-blue-50', text: 'text-blue-700' },
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN')
  } catch {
    return dateStr
  }
}

export function TenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>()
  const navigate = useNavigate()

  const { data: tenant, isLoading } = useTenant(tenantId ?? '')
  const { data: vehiclesData } = useVehicles({ tenantId: tenantId ?? '', limit: 50 })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-[#7b7a7d]">Khong tim thay nguoi thue.</p>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[tenant.status] ?? STATUS_CONFIG.ACTIVE
  const contracts = tenant.contractTenants ?? []
  const vehicles = vehiclesData?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <button onClick={() => navigate('/tenants')} className="hover:text-[#323235]">Nguoi thue</button>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Chi tiet</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/tenants')}
          className="rounded-lg p-2 text-[#7b7a7d] hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[#323235]">{tenant.fullName}</h2>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
              {statusCfg.label}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[#7b7a7d]">Thong tin chi tiet nguoi thue</p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Personal info */}
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
          <h3 className="mb-4 text-sm font-semibold uppercase text-[#7b7a7d]">Thong tin ca nhan</h3>
          <div className="flex flex-col gap-3">
            <InfoRow icon={Phone} label="So dien thoai" value={tenant.phoneNumber} />
            <InfoRow icon={Mail} label="Email" value={tenant.email || '—'} />
            <InfoRow icon={FileText} label="CCCD" value={tenant.citizenId || '—'} />
            <InfoRow icon={Calendar} label="Ngay sinh" value={formatDate(tenant.dateOfBirth)} />
            <div className="flex items-start gap-3 text-sm">
              <span className="w-28 flex-shrink-0 text-[#7b7a7d]">Gioi tinh</span>
              <span className="text-[#323235]">{tenant.gender || '—'}</span>
            </div>
          </div>
        </div>

        {/* Contact & other info */}
        <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
          <h3 className="mb-4 text-sm font-semibold uppercase text-[#7b7a7d]">Thong tin khac</h3>
          <div className="flex flex-col gap-3">
            <InfoRow icon={MapPin} label="Dia chi" value={tenant.permanentAddress || '—'} />
            <InfoRow icon={Car} label="Bien so xe" value={tenant.vehicleNumber || '—'} />
            <div className="flex items-start gap-3 text-sm">
              <span className="w-28 flex-shrink-0 text-[#7b7a7d]">Ghi chu</span>
              <span className="text-[#323235]">{tenant.note || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle list */}
      <div className="rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold uppercase text-[#7b7a7d]">Phuong tien</h3>
        </div>
        {vehicles.length === 0 ? (
          <div className="px-5 pb-5">
            <p className="text-sm text-[#7b7a7d]">Chua co phuong tien nao.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
                  <th className="px-5 py-3">Bien so xe</th>
                  <th className="px-5 py-3">Loai xe</th>
                  <th className="px-5 py-3">Nhan hieu</th>
                  <th className="px-5 py-3">Mau sac</th>
                  <th className="px-5 py-3">Phi gui xe/thang</th>
                  <th className="px-5 py-3">Trang thai</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => navigate(`/vehicles/${v.id}/edit`)}
                    className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-[#323235]">{v.licensePlate}</td>
                    <td className="px-5 py-3 text-sm text-[#323235]">
                      <span className="inline-flex items-center gap-1.5">
                        {v.vehicleType === 'CAR' ? (
                          <Car className="h-3.5 w-3.5 text-[#7b7a7d]" />
                        ) : (
                          <Bike className="h-3.5 w-3.5 text-[#7b7a7d]" />
                        )}
                        {VEHICLE_TYPE_LABEL[v.vehicleType] ?? v.vehicleType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#323235]">{v.brand ?? '—'}</td>
                    <td className="px-5 py-3 text-sm text-[#323235]">{v.color ?? '—'}</td>
                    <td className="px-5 py-3 text-sm text-[#323235]">
                      {v.monthlyFee != null
                        ? new Intl.NumberFormat('vi-VN').format(v.monthlyFee) + ' d'
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${v.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {v.status === 'ACTIVE' ? 'Hoat dong' : 'Ngung'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contract history */}
      <div className="rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold uppercase text-[#7b7a7d]">Lich su hop dong</h3>
        </div>
        {contracts.length === 0 ? (
          <div className="px-5 pb-5">
            <p className="text-sm text-[#7b7a7d]">Chua co hop dong nao.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
                  <th className="px-5 py-3">Ma hop dong</th>
                  <th className="px-5 py-3">Phong</th>
                  <th className="px-5 py-3">Ngay bat dau</th>
                  <th className="px-5 py-3">Ngay ket thuc</th>
                  <th className="px-5 py-3">Trang thai</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((ct) => {
                  const c = ct.contract
                  const cStatusCfg = CONTRACT_STATUS_CONFIG[c.status] ?? CONTRACT_STATUS_CONFIG.PENDING
                  return (
                    <tr
                      key={ct.id}
                      onClick={() => navigate(`/contracts/${c.id}`)}
                      className="cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-[#323235]">{c.contractCode}</td>
                      <td className="px-5 py-3 text-sm text-[#323235]">
                        {c.room?.roomCode ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-sm text-[#7b7a7d]">{formatDate(c.startDate)}</td>
                      <td className="px-5 py-3 text-sm text-[#7b7a7d]">{formatDate(c.endDate)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cStatusCfg.bg} ${cStatusCfg.text}`}>
                          {cStatusCfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#7b7a7d]" />
      <span className="w-24 flex-shrink-0 text-[#7b7a7d]">{label}</span>
      <span className="text-[#323235]">{value}</span>
    </div>
  )
}
