import { BarChart3 } from 'lucide-react'

export function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Trang chu</span>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Bao cao tai chinh</span>
      </nav>

      <div>
        <h2 className="text-xl font-semibold text-[#323235]">Bao cao tai chinh & Quan tri</h2>
        <p className="mt-1 text-sm text-[#7b7a7d]">Bao cao tong hop doanh thu, chi phi, loi nhuan va tinh hinh hoat dong</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f7ff]">
          <BarChart3 className="h-8 w-8 text-[#1d5fa8]" />
        </div>
        <h3 className="text-lg font-semibold text-[#323235]">Sap ra mat</h3>
        <p className="mt-2 max-w-sm text-center text-sm text-[#7b7a7d]">
          Tinh nang bao cao doanh thu - chi phi, cong no, ty le thu tien va bao cao quan tri dang duoc phat trien.
        </p>
      </div>
    </div>
  )
}
