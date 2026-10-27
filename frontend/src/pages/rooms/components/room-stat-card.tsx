interface RoomStatCardProps {
  label: string
  value: string | number
  subtitle?: string
}

export function RoomStatCard({ label, value, subtitle }: RoomStatCardProps) {
  return (
    <div className="rounded-xl border border-[#1d5fa8] bg-white p-5">
      <p className="text-sm text-[#7b7a7d]">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#1d5fa8]">{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-[#7b7a7d]">{subtitle}</p>
      )}
    </div>
  )
}
