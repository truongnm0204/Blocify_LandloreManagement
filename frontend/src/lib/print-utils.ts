// ─────────────────────────────────────────────────────────────────────────────
// Print utilities – browser-native print via window.open() + window.print()
// Zero external dependencies. Uses browser "Save as PDF" for PDF export.
// ─────────────────────────────────────────────────────────────────────────────

interface PrintOptions {
  title: string
  /** Raw HTML string to render inside <body> */
  content: string
}

/**
 * Opens a new browser window with formatted HTML and triggers the print dialog.
 * Users can print directly or choose "Save as PDF" from the browser dialog.
 */
export function openPrintWindow({ title, content }: PrintOptions): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) {
    alert('Vui long cho phep popup de in tai lieu.')
    return
  }

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
      font-size: 13px;
      color: #333;
      padding: 20mm;
      line-height: 1.5;
    }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { font-weight: 600; font-size: 11px; text-transform: uppercase; color: #666; background: #f9fafb; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { font-size: 20px; margin-bottom: 4px; color: #1d5fa8; }
    .header p { font-size: 12px; color: #666; }
    .section { margin-bottom: 16px; }
    .section-title {
      font-size: 13px; font-weight: 600; text-transform: uppercase;
      color: #1d5fa8; margin-bottom: 8px;
      border-bottom: 2px solid #1d5fa8; padding-bottom: 4px;
    }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
    .info-row { display: flex; justify-content: space-between; }
    .info-label { color: #666; }
    .info-value { font-weight: 500; }
    .total-row { background: #f5f6fa; font-weight: 700; }
    .badge {
      display: inline-block; padding: 2px 8px; border-radius: 9999px;
      font-size: 11px; font-weight: 600;
    }
    .badge-blue { background: #e8f0fe; color: #1d5fa8; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-red { background: #fee2e2; color: #dc2626; }
    .badge-gray { background: #f3f4f6; color: #6b7280; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #999; }
    .signature-area { display: flex; justify-content: space-between; margin-top: 48px; }
    .signature-box { text-align: center; width: 200px; }
    .signature-box .sig-title { font-weight: 600; margin-bottom: 4px; }
    .signature-box .sig-line { margin-top: 60px; border-top: 1px solid #ccc; padding-top: 4px; font-size: 12px; color: #666; }
    @media print {
      body { padding: 10mm; }
      @page { margin: 10mm; size: A4; }
    }
  </style>
</head>
<body>
  ${content}
  <div class="footer">
    In ngay: ${new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
  </div>
</body>
</html>`

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared formatting helpers for print templates
// ─────────────────────────────────────────────────────────────────────────────

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
