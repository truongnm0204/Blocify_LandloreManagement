import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const displayedItems = Math.min(currentPage * itemsPerPage, totalItems)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-[#7b7a7d]">
        Hien thi {displayedItems} tren {totalItems} toa nha
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[32px] rounded-lg px-2.5 py-1 text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-[#1d5fa8] text-white'
                : 'text-[#7b7a7d] hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="rounded-lg p-1.5 text-[#7b7a7d] transition-colors hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
