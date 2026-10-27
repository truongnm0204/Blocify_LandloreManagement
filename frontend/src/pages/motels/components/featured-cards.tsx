import { Sparkles } from 'lucide-react'

export function FeaturedCards() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left: Image card with overlay */}
      <div className="relative overflow-hidden rounded-xl bg-gray-800 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="h-52 bg-gradient-to-br from-gray-700 to-gray-900" />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-5">
          <span className="mb-2 w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            Noi bat
          </span>
          <h3 className="text-lg font-semibold text-white">Khu tro moi nhat</h3>
          <p className="mt-1 text-sm text-gray-300">
            Xem cac khu tro duoc them gan day va trang thai hoat dong
          </p>
        </div>
      </div>

      {/* Right: AI suggestion card */}
      <div className="flex flex-col justify-between rounded-xl bg-[#1d5fa8] p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Goi y thong minh</h3>
          <p className="mt-2 text-sm text-blue-200">
            He thong phat hien 3 phong trong chua duoc dang tin. Ban co muon tao tin dang tu dong?
          </p>
        </div>
        <button className="mt-4 w-fit rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#1d5fa8] transition-colors hover:bg-blue-50">
          Xem goi y
        </button>
      </div>
    </div>
  )
}
