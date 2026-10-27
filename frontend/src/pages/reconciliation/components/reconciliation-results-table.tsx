import { useState } from 'react'
import { motion } from 'motion/react'

export interface ReconciliationResult {
  id: string
  raw_text: string
  amount?: number
  date?: string
  parsed: {
    tenant_name: string | null
    room_code: string | null
    month: number | null
    year: number | null
    invoice_code: string | null
    confidence: number
  }
  matchedInvoice?: {
    id: string
    invoiceCode: string
    totalAmount: number
    paidAmount: number
    remaining: number
  } | null
  status: 'matched' | 'unmatched' | 'needs_review'
}

interface ResultsTableProps {
  results: ReconciliationResult[]
  onConfirm: (ids: string[]) => void
  isConfirming: boolean
}

const STATUS_CONFIG = {
  matched: { label: 'Khop', bg: 'bg-green-50', text: 'text-green-700' },
  unmatched: { label: 'Khong khop', bg: 'bg-red-50', text: 'text-red-600' },
  needs_review: { label: 'Can xac nhan', bg: 'bg-yellow-50', text: 'text-yellow-700' },
}

function formatVnd(value: number): string {
  return value.toLocaleString('vi-VN') + ' d'
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = value >= 0.8 ? 'bg-green-500' : value >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[#7b7a7d]">{pct}%</span>
    </div>
  )
}

export function ReconciliationResultsTable({ results, onConfirm, isConfirming }: ResultsTableProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(results.filter((r) => r.status === 'matched').map((r) => r.id))
  )

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(results.map((r) => r.id)))
    }
  }

  const matchedCount = results.filter((r) => r.status === 'matched').length
  const unmatchedCount = results.filter((r) => r.status === 'unmatched').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-4"
    >
      {/* Summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-5 py-3 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#7b7a7d]">Tong: <span className="font-medium text-[#323235]">{results.length}</span></span>
          <span className="text-green-700">Khop: <span className="font-medium">{matchedCount}</span></span>
          <span className="text-red-600">Khong khop: <span className="font-medium">{unmatchedCount}</span></span>
        </div>
        <button
          onClick={() => onConfirm(Array.from(selected))}
          disabled={selected.size === 0 || isConfirming}
          className="rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a] disabled:opacity-50"
        >
          {isConfirming ? 'Dang ghi nhan...' : `Xac nhan ${selected.size} giao dich`}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-[#7b7a7d]">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === results.length && results.length > 0}
                  onChange={toggleAll}
                  className="cursor-pointer accent-[#1d5fa8]"
                />
              </th>
              <th className="px-4 py-3">STT</th>
              <th className="px-4 py-3">Noi dung goc</th>
              <th className="px-4 py-3">Nguoi thue</th>
              <th className="px-4 py-3">Phong</th>
              <th className="px-4 py-3">Ky</th>
              <th className="px-4 py-3">Ma HD</th>
              <th className="px-4 py-3 text-right">So tien</th>
              <th className="px-4 py-3">Do tin cay</th>
              <th className="px-4 py-3">Trang thai</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => {
              const lowConf = r.parsed.confidence < 0.6
              const statusCfg = STATUS_CONFIG[r.status]
              return (
                <tr
                  key={r.id}
                  className={`border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50 ${
                    lowConf ? 'bg-yellow-50/40' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id)}
                      className="cursor-pointer accent-[#1d5fa8]"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-[#7b7a7d]">{idx + 1}</td>
                  <td className="max-w-[200px] px-4 py-3">
                    <p className="truncate text-sm text-[#323235]" title={r.raw_text}>{r.raw_text}</p>
                    {r.date && <p className="text-xs text-[#7b7a7d]">{r.date}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#323235]">{r.parsed.tenant_name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-[#323235]">{r.parsed.room_code ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-[#7b7a7d]">
                    {r.parsed.month && r.parsed.year ? `${r.parsed.month}/${r.parsed.year}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#323235]">
                    {r.matchedInvoice?.invoiceCode ?? r.parsed.invoice_code ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-[#323235]">
                    {r.amount ? formatVnd(r.amount) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <ConfidenceBar value={r.parsed.confidence} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
