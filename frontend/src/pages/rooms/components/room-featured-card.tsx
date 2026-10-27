export function RoomFeaturedCard() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Left: Featured room with image */}
      <div className="relative col-span-3 overflow-hidden rounded-xl bg-gray-800 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="h-56 bg-gradient-to-br from-gray-600 to-gray-900" />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-6">
          <span className="mb-2 w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            Phong noi bat
          </span>
          <h3 className="text-lg font-semibold text-white">
            Can ho Sunshine - P.404
          </h3>
          <p className="mt-1 text-sm text-gray-300">
            Phong cao cap moi duoc cap nhat trang mat troi. Day du noi that cao cap, dien tich 45m2 voi ban cong ra cong vien.
          </p>
          <div className="mt-3 flex gap-6">
            <div>
              <p className="text-xs text-gray-400">Gia thue</p>
              <p className="text-sm font-semibold text-white">5.500.000 d</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tien coc</p>
              <p className="text-sm font-semibold text-white">5.500.000 d</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Occupancy suggestion */}
      <div className="col-span-2 flex flex-col justify-between rounded-xl bg-[#1d5fa8] p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-sm text-blue-200">Ty le o day</p>
          <p className="mt-2 text-4xl font-bold text-white">88%</p>
        </div>
        <div className="mt-3">
          <p className="text-sm text-blue-200">
            Ty le dong 5.3% so voi thang truoc. 14 phong trong dang cho khach thue.
          </p>
        </div>
        <button className="mt-4 text-left text-sm font-medium text-white underline decoration-blue-300 underline-offset-2 hover:decoration-white">
          Xem bao cao chi tiet →
        </button>
      </div>
    </div>
  )
}
