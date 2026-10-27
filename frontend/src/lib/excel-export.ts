// ─────────────────────────────────────────────────────────────────────────────
// Excel (.xlsx) export using SheetJS (xlsx library)
// Supports: multi-sheet, column widths, merged cells, row heights
// ─────────────────────────────────────────────────────────────────────────────

import * as XLSX from 'xlsx'

type CellValue = string | number | null | undefined

export interface MergeRange {
  /** Start row (0-indexed, row 0 = first data row, header is auto-offset) */
  startRow: number
  startCol: number
  endRow: number
  endCol: number
}

export interface ExcelSheet {
  name: string
  /** If provided, rendered as first row(s) before headers */
  title?: string
  headers: string[]
  rows: CellValue[][]
  /** Column widths in characters (wch) */
  colWidths?: number[]
  /** Merge ranges (0-indexed relative to the full sheet including title) */
  merges?: MergeRange[]
  /** Row heights in points, keyed by 0-indexed row number */
  rowHeights?: Record<number, number>
}

/**
 * Downloads an .xlsx file with one or multiple sheets.
 * Supports Vietnamese text natively.
 */
export function downloadExcel(filename: string, sheets: ExcelSheet[]): void {
  const workbook = XLSX.utils.book_new()

  for (const sheet of sheets) {
    // Build data array: optional title row + header row + data rows
    const data: CellValue[][] = []

    if (sheet.title) {
      data.push([sheet.title])
      data.push([]) // blank separator
    }

    data.push(sheet.headers)
    data.push(...sheet.rows)

    const worksheet = XLSX.utils.aoa_to_sheet(data)

    // Column widths
    if (sheet.colWidths) {
      worksheet['!cols'] = sheet.colWidths.map((w) => ({ wch: w }))
    }

    // Merge cells
    if (sheet.merges && sheet.merges.length > 0) {
      worksheet['!merges'] = sheet.merges.map((m) => ({
        s: { r: m.startRow, c: m.startCol },
        e: { r: m.endRow, c: m.endCol },
      }))
    }

    // Auto-merge title row across all columns
    if (sheet.title && sheet.headers.length > 1) {
      if (!worksheet['!merges']) worksheet['!merges'] = []
      worksheet['!merges'].push({
        s: { r: 0, c: 0 },
        e: { r: 0, c: sheet.headers.length - 1 },
      })
    }

    // Row heights
    if (sheet.rowHeights) {
      worksheet['!rows'] = []
      const maxRow = Math.max(
        ...Object.keys(sheet.rowHeights).map(Number),
        data.length - 1,
      )
      for (let i = 0; i <= maxRow; i++) {
        worksheet['!rows'][i] = { hpt: sheet.rowHeights[i] ?? 18 }
      }
    } else if (sheet.title) {
      // Make title row taller by default
      worksheet['!rows'] = [{ hpt: 28 }]
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
  }

  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : filename.replace(/\.xls$/, '.xlsx'))
}

/**
 * Downloads a simple single-sheet .xlsx file.
 */
export function downloadExcelSimple(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: CellValue[][],
  colWidths?: number[],
): void {
  downloadExcel(filename, [{ name: sheetName, headers, rows, colWidths }])
}
