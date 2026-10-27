import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { Upload } from 'lucide-react'

export interface BankRow {
  raw_text: string
  amount?: number
  date?: string
  month?: number
  year?: number
}

interface UploadProps {
  onUpload: (rows: BankRow[], fileName: string) => void
  isLoading: boolean
}

function parseExcelFile(file: File): Promise<BankRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

        // Detect column layout from header row
        let descCol = -1
        let amountCol = -1
        let creditCol = -1  // "Ghi co" column for bank statements
        let dateCol = -1
        let headerRow = 0

        for (let r = 0; r < Math.min(rows.length, 5); r++) {
          const row = (rows[r] ?? []).map((c) => String(c ?? '').toUpperCase().trim())
          for (let c = 0; c < row.length; c++) {
            const val = row[c]
            if (/NOI\s*DUNG|MO\s*TA|DIEN\s*GIAI/.test(val)) descCol = c
            if (/SO\s*TIEN|THANH\s*TIEN/.test(val) && amountCol === -1) amountCol = c
            if (/GHI\s*CO/.test(val)) creditCol = c
            if (/NGAY|DATE/.test(val) && dateCol === -1) dateCol = c
          }
          if (descCol >= 0) { headerRow = r; break }
        }

        const bankRows: BankRow[] = []
        for (let i = headerRow + 1; i < rows.length; i++) {
          const row = rows[i]
          if (!row || row.length === 0) continue

          let rawText = ''
          let amount: number | undefined
          let date: string | undefined

          // If we detected columns, use them directly
          if (descCol >= 0) {
            rawText = String(row[descCol] ?? '').trim()

            // Amount: prefer "Ghi co" (credit/income) column for bank statements
            const amtIdx = creditCol >= 0 ? creditCol : amountCol
            if (amtIdx >= 0) {
              const num = Number(String(row[amtIdx] ?? '').replace(/[,.]/g, ''))
              if (!isNaN(num) && num > 0) amount = num
            }

            if (dateCol >= 0) {
              date = String(row[dateCol] ?? '').trim()
            }
          } else {
            // Fallback: auto-detect from cell values
            for (const cell of row) {
              const val = String(cell ?? '').trim()
              if (!val) continue

              const num = Number(String(cell).replace(/[,.]/g, ''))
              if (!isNaN(num) && num > 1000 && amount === undefined) {
                amount = num
                continue
              }

              if (!date && /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(val)) {
                date = val
                continue
              }

              if (val.length > rawText.length) rawText = val
            }
          }

          if (!rawText || rawText.length < 3) continue

          // Skip expense rows (no credit amount in bank statement format)
          if (creditCol >= 0 && !amount) continue

          // Extract month/year from date string
          let month: number | undefined
          let year: number | undefined
          if (date) {
            const match = date.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
            if (match) {
              month = parseInt(match[2], 10) || undefined
              const y = parseInt(match[3], 10)
              year = y > 100 ? y : y > 0 ? 2000 + y : undefined
            }
          }
          bankRows.push({ raw_text: rawText, amount, date, month, year })
        }
        resolve(bankRows)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsBinaryString(file)
  })
}

export function ReconciliationUpload({ onUpload, isLoading }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    setError('')
    try {
      const rows = await parseExcelFile(file)
      if (rows.length === 0) {
        setError('Khong tim thay du lieu trong file. Vui long kiem tra dinh dang.')
        return
      }
      onUpload(rows, file.name)
    } catch {
      setError('Khong the doc file. Vui long chon file Excel (.xlsx, .xls) hoac CSV (.csv) hop le.')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 transition-colors ${
          isDragging
            ? 'border-[#1d5fa8] bg-blue-50'
            : 'border-gray-200 bg-white hover:border-[#1d5fa8] hover:bg-blue-50/30'
        } ${isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef3fb]">
          <Upload className="h-6 w-6 text-[#1d5fa8]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#323235]">
            Keo tha file Excel vao day hoac nhan de chon
          </p>
          <p className="mt-1 text-xs text-[#7b7a7d]">Ho tro: .xlsx, .xls, .csv</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
