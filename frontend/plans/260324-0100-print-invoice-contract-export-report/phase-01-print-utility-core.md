# Phase 1: Print Utility Core

**Priority:** High | **Status:** Pending

## Overview

Create a reusable print utility that opens a new browser window with formatted HTML content and triggers the browser's native print dialog.

## Key Insights

- `window.open()` + `document.write()` + `window.print()` is the simplest zero-dependency approach
- Browser print dialog includes "Save as PDF" option natively
- Vietnamese text renders correctly without font embedding
- Print CSS controls page breaks, margins, headers/footers

## Files to Create

- `src/lib/print-utils.ts` - Core print window utility

## Implementation Steps

### 1. Create `src/lib/print-utils.ts`

```typescript
interface PrintOptions {
  title: string
  content: string // HTML string
}

export function openPrintWindow({ title, content }: PrintOptions): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    alert('Vui long cho phep popup de in tai lieu.')
    return
  }

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        /* Base print styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #333; padding: 20mm; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e5e5e5; }
        th { font-weight: 600; font-size: 11px; text-transform: uppercase; color: #666; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }
        .header { text-align: center; margin-bottom: 24px; }
        .header h1 { font-size: 20px; margin-bottom: 4px; }
        .header p { font-size: 12px; color: #666; }
        .section { margin-bottom: 16px; }
        .section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; color: #666; margin-bottom: 8px; border-bottom: 2px solid #1d5fa8; padding-bottom: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
        .info-row { display: flex; justify-content: space-between; }
        .info-label { color: #666; }
        .info-value { font-weight: 500; }
        .total-row { background: #f5f6fa; font-weight: 700; }
        .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #999; }
        .signature-area { display: flex; justify-content: space-between; margin-top: 48px; }
        .signature-box { text-align: center; width: 200px; }
        .signature-box p { margin-top: 60px; border-top: 1px solid #ccc; padding-top: 4px; }
        @media print {
          body { padding: 10mm; }
          @page { margin: 10mm; size: A4; }
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
  }
}
```

### 2. Add shared formatting helpers

```typescript
export function formatVndPrint(value: number): string {
  return value.toLocaleString('vi-VN') + ' d'
}

export function formatDatePrint(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  } catch {
    return dateStr ?? '—'
  }
}
```

## Success Criteria

- [x] `openPrintWindow()` opens a new window with formatted HTML
- [x] Print dialog appears automatically
- [x] Popup blocker warning shown if blocked
- [x] A4 page layout with proper margins
- [x] Vietnamese text renders correctly
