# Phase 4: Financial Report CSV Export

**Priority:** Medium | **Status:** Pending

## Overview

Add CSV export for financial dashboard data. Zero dependencies - use Blob + URL.createObjectURL.

## Files

- **Create:** `src/lib/csv-export.ts`
- **Modify:** `src/pages/financial/financial-report-page.tsx`

## Implementation Steps

### 1. Create `csv-export.ts`

```typescript
export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const bom = '\uFEFF' // UTF-8 BOM for Excel Vietnamese support
  const csvContent = bom + [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
```

### 2. Modify `financial-report-page.tsx`

Add export button next to "Tuy chinh bao cao" / period tabs area:

```tsx
import { FileDown } from 'lucide-react'
import { downloadCsv } from '@/lib/csv-export'

// Export handler using dashboard data:
const handleExportReport = () => {
  if (!data) return
  const today = new Date().toLocaleDateString('vi-VN')
  const headers = ['Chi tieu', 'Gia tri']
  const rows = [
    ['Doanh thu thang', String(data.finance.monthlyRevenue)],
    ['Tong cong no', String(data.finance.totalReceivables)],
    ['Tong chi phi', String(data.finance.totalExpenses)],
    ['Loi nhuan rong', String(data.finance.netProfit)],
    ['Tong phong', String(data.rooms.total)],
    ['Phong trong', String(data.rooms.vacant)],
    ['Phong da thue', String(data.rooms.occupied)],
    ['Ty le lan', String(data.rooms.occupancyRate) + '%'],
    ['Hop dong hieu luc', String(data.contracts.active)],
    ['Hop dong sap het han', String(data.contracts.expiringSoon)],
    ['Hoa don chua thanh toan', String(data.invoices.unpaid)],
    ['Hoa don qua han', String(data.invoices.overdue)],
  ]
  downloadCsv(`bao-cao-tai-chinh-${today}.csv`, headers, rows)
}

// Button:
<button
  onClick={handleExportReport}
  disabled={!data}
  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] hover:bg-gray-50 disabled:opacity-50"
>
  <FileDown className="h-4 w-4" />
  Xuat bao cao
</button>
```

## Success Criteria

- [ ] Export button on financial report page
- [ ] CSV downloads with correct Vietnamese encoding (BOM)
- [ ] All dashboard metrics included
- [ ] Excel opens CSV correctly with Vietnamese characters
- [ ] Disabled when data not loaded
