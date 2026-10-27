import { useState, useCallback } from 'react'
import { FileSpreadsheet, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useInvoices } from '@/hooks/use-invoices'
import { useReconcileBatch } from '@/hooks/use-reconciliation'
import { useToastStore } from '@/stores/toast.store'
import { parsePaymentBatch } from '@/lib/ai-reconciliation'
import { ReconciliationUpload, type BankRow } from './components/reconciliation-upload'
import { ReconciliationResultsTable, type ReconciliationResult } from './components/reconciliation-results-table'
import type { Invoice } from '@/types'

// Extract only digits from room code for fuzzy matching (e.g. "H104" -> "104")
function normalizeRoomCode(code: string): string {
  return code.replace(/[^0-9]/g, '')
}

/** Convert date string (dd/MM/yyyy, dd-MM-yyyy, or ISO) to ISO 8601 (yyyy-MM-dd) */
function toIsoDate(date?: string): string {
  if (!date) return new Date().toISOString().slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10)
  const match = date.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (match) {
    const d = match[1].padStart(2, '0')
    const m = match[2].padStart(2, '0')
    const y = match[3].length === 2 ? `20${match[3]}` : match[3]
    return `${y}-${m}-${d}`
  }
  return new Date().toISOString().slice(0, 10)
}

// Compare room codes: exact match first, then digits-only fallback
function roomCodesMatch(parsed: string, dbRoom: string): boolean {
  if (parsed.toUpperCase() === dbRoom.toUpperCase()) return true
  return normalizeRoomCode(parsed) === normalizeRoomCode(dbRoom)
}

function matchToInvoice(
  invoiceCode: string | null,
  roomCode: string | null,
  month: number | null,
  year: number | null,
  invoices: Invoice[],
): Invoice | null {
  if (invoiceCode) {
    const byCode = invoices.find(
      (inv) => inv.invoiceCode.toLowerCase() === invoiceCode.toLowerCase(),
    )
    if (byCode) return byCode
  }
  if (roomCode && month && year) {
    const byRoom = invoices.find(
      (inv) =>
        roomCodesMatch(roomCode, inv.room?.roomCode ?? '') &&
        inv.invoiceMonth === month &&
        inv.invoiceYear === year,
    )
    if (byRoom) return byRoom
  }
  // Fallback: room + month only (no year)
  if (roomCode && month) {
    const byRoomMonth = invoices.find(
      (inv) =>
        roomCodesMatch(roomCode, inv.room?.roomCode ?? '') &&
        inv.invoiceMonth === month,
    )
    if (byRoomMonth) return byRoomMonth
  }
  // Fallback: room only
  if (roomCode) {
    const unpaid = invoices.filter(
      (inv) =>
        roomCodesMatch(roomCode, inv.room?.roomCode ?? '') &&
        inv.totalAmount - inv.paidAmount > 0,
    )
    if (unpaid.length === 1) return unpaid[0]
  }
  return null
}

export function ReconciliationPage() {
  const [bankRows, setBankRows] = useState<BankRow[]>([])
  const [fileName, setFileName] = useState('')
  const [results, setResults] = useState<ReconciliationResult[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [parseError, setParseError] = useState('')

  const { data: invoicesResponse } = useInvoices({ limit: 500 })
  const invoices = invoicesResponse?.data ?? []
  const reconcileBatch = useReconcileBatch()
  const addToast = useToastStore((s) => s.add)

  const handleUpload = useCallback(
    async (rows: BankRow[], name: string) => {
      setBankRows(rows)
      setFileName(name)
      setResults([])
      setParseError('')
      setIsParsing(true)

      try {
        const parsed = await parsePaymentBatch(rows.map((r) => ({ raw_text: r.raw_text })))

        const mapped: ReconciliationResult[] = parsed.map((p, idx) => {
          const row = rows[idx]
          // Use AI-parsed month/year, fallback to date-extracted month/year from Excel
          const effectiveMonth = p.month ?? row.month ?? null
          const effectiveYear = p.year ?? row.year ?? null
          const matched = matchToInvoice(p.invoice_code, p.room_code, effectiveMonth, effectiveYear, invoices)
          const status: ReconciliationResult['status'] =
            matched
              ? p.confidence >= 0.6
                ? 'matched'
                : 'needs_review'
              : 'unmatched'

          return {
            id: `row-${idx}`,
            raw_text: row.raw_text,
            amount: row.amount,
            date: row.date,
            parsed: {
              tenant_name: p.tenant_name,
              room_code: p.room_code,
              month: effectiveMonth,
              year: effectiveYear,
              invoice_code: p.invoice_code,
              confidence: p.confidence,
            },
            matchedInvoice: matched
              ? {
                  id: matched.id,
                  invoiceCode: matched.invoiceCode,
                  totalAmount: matched.totalAmount,
                  paidAmount: matched.paidAmount,
                  remaining: matched.totalAmount - matched.paidAmount,
                }
              : null,
            status,
          }
        })

        setResults(mapped)
      } catch {
        setParseError('Khong the ket noi den AI API. Vui long kiem tra server tai http://localhost:8100')
      } finally {
        setIsParsing(false)
      }
    },
    [invoices],
  )

  const handleFileUpload = (rows: BankRow[], name: string) => {
    handleUpload(rows, name)
  }

  const handleConfirm = async (ids: string[]) => {
    const toConfirm = results.filter((r) => ids.includes(r.id) && r.matchedInvoice)
    if (toConfirm.length === 0) {
      addToast({ type: 'error', title: 'Khong co giao dich khop de ghi nhan' })
      return
    }

    setIsConfirming(true)
    try {
      const items = toConfirm.map((r) => ({
        invoiceId: r.matchedInvoice!.id,
        amount: r.amount,
        paymentDate: toIsoDate(r.date),
        paymentMethod: 'BANK_TRANSFER' as const,
        rawText: r.raw_text.slice(0, 200),
      }))

      await reconcileBatch.mutateAsync({ items })
    } catch {
      // Error handled by hook
    } finally {
      setIsConfirming(false)
    }
  }

  const handleReset = () => {
    setBankRows([])
    setFileName('')
    setResults([])
    setParseError('')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#7b7a7d]">
        <span>Quan ly</span>
        <span>&rsaquo;</span>
        <span className="text-[#323235]">Doi soat cong no</span>
      </nav>

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#323235]">Doi soat cong no</h2>
        <p className="mt-1 text-sm text-[#7b7a7d]">
          Su dung AI de doi soat thanh toan tu file ngan hang
        </p>
      </div>

      {/* Step 1 – Upload or file info bar */}
      {bankRows.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
          <p className="mb-4 text-sm font-medium text-[#323235]">
            Buoc 1: Tai len file sao ke ngan hang
          </p>
          <ReconciliationUpload
            onUpload={handleFileUpload}
            isLoading={isParsing}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-[#1d5fa8]" />
            <div>
              <p className="text-sm font-medium text-[#323235]">
                {fileName || 'File da tai len'}
              </p>
              <p className="text-xs text-[#7b7a7d]">{bankRows.length} dong du lieu</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="rounded-lg p-1.5 text-[#7b7a7d] hover:bg-gray-100"
            title="Tai file khac"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Step 2 – Parsing indicator */}
      {isParsing && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white py-12 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
          <p className="text-sm text-[#7b7a7d]">
            Dang phan tich {bankRows.length} dong du lieu bang AI...
          </p>
        </div>
      )}

      {/* Parse error */}
      {parseError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm text-red-600">{parseError}</p>
        </div>
      )}

      {/* Step 3 – Results table */}
      {results.length > 0 && !isParsing && (
        <ReconciliationResultsTable
          results={results}
          onConfirm={handleConfirm}
          isConfirming={isConfirming}
        />
      )}
    </div>
  )
}
