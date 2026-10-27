import type { MotelDetail } from '@/types'

interface MotelDetailInfoSectionProps {
  motel: MotelDetail
  onToggleAutoInvoice?: (value: boolean) => void
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' d'
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-[#7b7a7d]">{label}</span>
      <span className="text-sm font-medium text-[#323235]">{value}</span>
    </div>
  )
}

export function MotelDetailInfoSection({ motel, onToggleAutoInvoice }: MotelDetailInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Left: Thong tin chung */}
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#7b7a7d]">
          Thong tin chung
        </h3>
        <InfoRow label="Dia chi" value={motel.address || '—'} />
        <InfoRow label="Trang thai" value={motel.status === 'ACTIVE' ? 'Dang hoat dong' : 'Ngung hoat dong'} />
        <InfoRow label="Ngay tao" value={motel.createdAt ? new Date(motel.createdAt).toLocaleDateString('vi-VN') : '—'} />
        {motel.paymentDueDay != null && (
          <InfoRow label="Ngay thanh toan" value={`Ngay ${motel.paymentDueDay} hang thang`} />
        )}
        <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
          <div>
            <span className="text-sm text-[#7b7a7d]">Tu dong phat hanh hoa don</span>
            <p className="text-xs text-gray-400 mt-0.5">Tu dong tao va phat hanh hoa don hang thang</p>
          </div>
          <button
            onClick={() => onToggleAutoInvoice?.(!motel.autoInvoice)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              motel.autoInvoice ? 'bg-[#1d5fa8]' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
              motel.autoInvoice ? 'translate-x-[18px]' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
        {motel.description && (
          <div className="mt-3 rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-[#7b7a7d]">{motel.description}</p>
          </div>
        )}
      </div>

      {/* Right: Chi phi & Dich vu */}
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#7b7a7d]">
          Chi phi &amp; Dich vu
        </h3>
        <InfoRow
          label="Gia dien (kWh)"
          value={formatVnd(motel.defaultElectricityPrice)}
        />
        <InfoRow
          label="Gia nuoc (m3)"
          value={formatVnd(motel.defaultWaterPrice)}
        />
        <InfoRow
          label="Phi dich vu (thang)"
          value={motel.defaultServiceFee > 0 ? formatVnd(motel.defaultServiceFee) : 'Mien phi'}
        />
      </div>
    </div>
  )
}
