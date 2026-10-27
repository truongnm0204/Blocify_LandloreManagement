// ─────────────────────────────────────────────────────────────────────────────
// Builds HTML string for contract printing via openPrintWindow()
// ─────────────────────────────────────────────────────────────────────────────

import { formatVndPrint, formatDatePrint } from '@/lib/print-utils'
import type { Contract } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nhap',
  ACTIVE: 'Hieu luc',
  ENDED: 'Da ket thuc',
  CANCELLED: 'Da huy',
}

export function buildContractPrintHtml(contract: Contract): string {
  const contractCode = contract.contractCode ?? contract.id.slice(0, 8)

  // Build tenant rows
  const tenants = contract.contractTenants ?? []
  const tenantRows = tenants.length > 0
    ? tenants
        .map(
          (ct) => `
          <tr>
            <td>${ct.tenant?.fullName ?? '—'}</td>
            <td>${ct.tenant?.phoneNumber ?? '—'}</td>
            <td>${ct.tenant?.citizenId ?? '—'}</td>
            <td>${ct.isRepresentative ? '<span class="badge badge-blue">Dai dien</span>' : 'Thanh vien'}</td>
          </tr>`,
        )
        .join('')
    : `<tr>
        <td>${contract.representativeTenant?.fullName ?? '—'}</td>
        <td>${contract.representativeTenant?.phoneNumber ?? '—'}</td>
        <td>—</td>
        <td><span class="badge badge-blue">Dai dien</span></td>
      </tr>`

  return `
    <div class="header">
      <h1>HOP DONG THUE PHONG</h1>
      <p>Ma hop dong: <strong>${contractCode}</strong></p>
      <span class="badge badge-blue">${STATUS_LABELS[contract.status] ?? contract.status}</span>
    </div>

    <div class="section">
      <div class="section-title">Thong tin hop dong</div>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Ngay ky:</span>
          <span class="info-value">${formatDatePrint(contract.signedDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Trang thai:</span>
          <span class="info-value">${STATUS_LABELS[contract.status] ?? contract.status}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ngay bat dau:</span>
          <span class="info-value">${formatDatePrint(contract.startDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ngay ket thuc:</span>
          <span class="info-value">${formatDatePrint(contract.endDate)}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Thong tin nha tro</div>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Toa nha:</span>
          <span class="info-value">${contract.motel?.name ?? '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Dia chi:</span>
          <span class="info-value">${contract.motel?.address ?? '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phong:</span>
          <span class="info-value">${contract.room?.roomCode ?? '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">So nguoi o:</span>
          <span class="info-value">${contract.numberOfOccupants ?? '—'}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Dieu khoan tai chinh</div>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Tien thue:</span>
          <span class="info-value font-bold">${formatVndPrint(contract.rentAmount)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tien coc:</span>
          <span class="info-value">${formatVndPrint(contract.depositAmount)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phi dich vu:</span>
          <span class="info-value">${contract.serviceFee ? formatVndPrint(contract.serviceFee) : '—'}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Danh sach nguoi thue</div>
      <table>
        <thead>
          <tr>
            <th>Ho ten</th>
            <th>So dien thoai</th>
            <th>CCCD/CMND</th>
            <th>Vai tro</th>
          </tr>
        </thead>
        <tbody>
          ${tenantRows}
        </tbody>
      </table>
    </div>

    ${contract.notes ? `
    <div class="section">
      <div class="section-title">Ghi chu</div>
      <p style="font-size: 13px; color: #555;">${contract.notes}</p>
    </div>
    ` : ''}

    <div class="signature-area">
      <div class="signature-box">
        <div class="sig-title">Ben cho thue</div>
        <div class="sig-line">(Ky va ghi ro ho ten)</div>
      </div>
      <div class="signature-box">
        <div class="sig-title">Ben thue</div>
        <div class="sig-line">(Ky va ghi ro ho ten)</div>
      </div>
    </div>
  `
}
