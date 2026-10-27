// ─────────────────────────────────────────────────────────────────────────────
// Builds HTML string for invoice printing via openPrintWindow()
// ─────────────────────────────────────────────────────────────────────────────

import { formatVndPrint, formatDatePrint } from '@/lib/print-utils'
import type { Invoice, InvoiceItemType } from '@/types'

const ITEM_TYPE_LABELS: Record<InvoiceItemType, string> = {
  ROOM_RENT: 'Tien phong',
  ELECTRICITY: 'Tien dien',
  WATER: 'Tien nuoc',
  SERVICE_FEE: 'Phi dich vu',
  SURCHARGE: 'Phu thu',
  DISCOUNT: 'Giam gia',
  OTHER: 'Khac',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nhap',
  ISSUED: 'Da phat hanh',
  PARTIALLY_PAID: 'Thanh toan mot phan',
  PAID: 'Da thanh toan',
  OVERDUE: 'Qua han',
}

export function buildInvoicePrintHtml(invoice: Invoice): string {
  const remaining = invoice.totalAmount - invoice.paidAmount

  const itemRows = (invoice.invoiceItems ?? [])
    .map(
      (item) => `
      <tr>
        <td>${ITEM_TYPE_LABELS[item.itemType] ?? item.itemType}</td>
        <td>${item.description ?? '—'}</td>
        <td class="text-right">${item.quantity ?? '—'}</td>
        <td class="text-right">${item.unitPrice ? formatVndPrint(item.unitPrice) : '—'}</td>
        <td class="text-right font-bold">${formatVndPrint(item.amount)}</td>
      </tr>`,
    )
    .join('')

  return `
    <div class="header">
      <h1>HOA DON TIEN PHONG</h1>
      <p>Ma hoa don: <strong>${invoice.invoiceCode}</strong></p>
      <p>Ky: ${invoice.invoiceMonth}/${invoice.invoiceYear}</p>
      <span class="badge badge-blue">${STATUS_LABELS[invoice.status] ?? invoice.status}</span>
    </div>

    <div class="section">
      <div class="section-title">Thong tin hoa don</div>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Toa nha:</span>
          <span class="info-value">${invoice.motel?.name ?? '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phong:</span>
          <span class="info-value">${invoice.room?.roomCode ?? '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Nguoi thue:</span>
          <span class="info-value">${invoice.representativeTenant?.fullName ?? '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ngay lap:</span>
          <span class="info-value">${formatDatePrint(invoice.billingDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Han tra:</span>
          <span class="info-value">${invoice.dueDate ? formatDatePrint(invoice.dueDate) : '—'}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Chi tiet hoa don</div>
      <table>
        <thead>
          <tr>
            <th>Muc</th>
            <th>Mo ta</th>
            <th class="text-right">So luong</th>
            <th class="text-right">Don gia</th>
            <th class="text-right">Thanh tien</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          <tr class="total-row">
            <td colspan="4" class="text-right">Tong cong</td>
            <td class="text-right">${formatVndPrint(invoice.totalAmount)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Thanh toan</div>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Tong cong:</span>
          <span class="info-value">${formatVndPrint(invoice.totalAmount)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Da thanh toan:</span>
          <span class="info-value" style="color: #15803d;">${formatVndPrint(invoice.paidAmount)}</span>
        </div>
        <div class="info-row">
          <span class="info-label font-bold">Con lai:</span>
          <span class="info-value font-bold" style="color: ${remaining > 0 ? '#dc2626' : '#15803d'};">
            ${formatVndPrint(remaining)}
          </span>
        </div>
      </div>
    </div>

    <div class="signature-area">
      <div class="signature-box">
        <div class="sig-title">Nguoi lap</div>
        <div class="sig-line">(Ky va ghi ro ho ten)</div>
      </div>
      <div class="signature-box">
        <div class="sig-title">Nguoi thue</div>
        <div class="sig-line">(Ky va ghi ro ho ten)</div>
      </div>
    </div>
  `
}
