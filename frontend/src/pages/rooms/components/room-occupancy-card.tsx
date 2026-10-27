interface RoomOccupancyCardProps {
  percentage: number
  changeText?: string
  subText?: string
}

export function RoomOccupancyCard({ percentage, changeText, subText }: RoomOccupancyCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-[#1d5fa8] p-5 text-white">
      <p className="text-sm text-blue-200">Ty le o day</p>
      <div className="mt-2">
        <p className="text-4xl font-bold">{percentage}%</p>
      </div>
      {changeText && (
        <p className="mt-2 text-sm text-blue-200">{changeText}</p>
      )}
      {subText && (
        <p className="text-xs text-blue-300">{subText}</p>
      )}
      <button className="mt-3 text-left text-sm font-medium text-white underline decoration-blue-300 underline-offset-2 hover:decoration-white">
        Xem bao cao chi tiet →
      </button>
    </div>
  )
}
