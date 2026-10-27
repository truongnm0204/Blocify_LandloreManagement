import { HandCoins } from 'lucide-react'

export function OperatingCostsPage() {
  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Chi phi van hanh</span>
      </nav>

      <div>
        <h2 className="text-xl font-semibold text-[#323235]">Chi phi van hanh</h2>
        <p className="mt-1 text-sm text-[#7b7a7d]">Quan ly chi phi van hanh hang thang cua toa nha</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f7ff]">
          <HandCoins className="h-8 w-8 text-[#1d5fa8]" />
        </div>
        <h3 className="text-lg font-semibold text-[#323235]">Sap ra mat</h3>
        <p className="mt-2 max-w-sm text-center text-sm text-[#7b7a7d]">
          Tinh nang theo doi chi phi dien, nuoc, ve sinh, bao ve, internet va cac dich vu van hanh khac dang duoc phat trien.
        </p>
      </div>
    </div>
  )
}
