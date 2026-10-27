import { useState, useMemo } from 'react'
import { Building2 } from 'lucide-react'
import { ContractTable } from './contract-table'
import { ContractPagination } from './contract-pagination'

const SECTION_PAGE_SIZE = 5

interface ContractRow {
  id: string
  contractCode: string
  room: string
  motelName: string
  motelId: string
  tenantName: string
  tenantPhone: string
  startDate: string
  endDate: string
  rentAmount: number
  depositAmount: number
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRING' | 'ENDED' | 'CANCELLED'
}

interface ContractMotelSectionProps {
  motelName: string
  rows: ContractRow[]
  /** Hide motel header when there's only one section */
  hideHeader?: boolean
}

export function ContractMotelSection({ motelName, rows, hideHeader }: ContractMotelSectionProps) {
  const [page, setPage] = useState(1)

  const totalItems = rows.length
  const totalPages = Math.ceil(totalItems / SECTION_PAGE_SIZE)

  // Paginate rows for this section
  const pagedRows = useMemo(() => {
    const start = (page - 1) * SECTION_PAGE_SIZE
    return rows.slice(start, start + SECTION_PAGE_SIZE)
  }, [rows, page])

  // Reset to page 1 if rows change and current page is out of bounds
  if (page > totalPages && totalPages > 0) {
    setPage(1)
  }

  return (
    <div>
      {!hideHeader && (
        <div className="mb-2 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#1d5fa8]" />
          <h4 className="text-sm font-semibold text-[#323235]">{motelName}</h4>
          <span className="rounded-full bg-[#e8f0fe] px-2 py-0.5 text-xs font-medium text-[#1d5fa8]">
            {totalItems} hop dong
          </span>
        </div>
      )}

      <ContractTable contracts={pagedRows} />

      {totalPages > 1 && (
        <ContractPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={SECTION_PAGE_SIZE}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
