# Phase 2: Invoice Print Template + Button

**Priority:** High | **Status:** Pending

## Overview

Create HTML template for invoice printing and add print button to invoice detail page.

## Files

- **Create:** `src/pages/invoices/components/invoice-print-template.ts`
- **Modify:** `src/pages/invoices/invoice-detail-page.tsx`

## Implementation Steps

### 1. Create `invoice-print-template.ts`

Function `buildInvoicePrintHtml(invoice: Invoice): string` that returns HTML string with:
- Header: "HOA DON TIEN PHONG" + invoice code + period
- Info grid: Room, Tenant, Billing date, Due date
- Line items table: Item type, Description, Quantity, Unit price, Amount
- Total row
- Payment summary: Total, Paid, Remaining
- Footer: Print date

Use `formatVndPrint()` and `formatDatePrint()` from `print-utils.ts`.

Item type labels map:
```
ROOM_RENT → Tien phong
ELECTRICITY → Tien dien
WATER → Tien nuoc
SERVICE_FEE → Phi dich vu
SURCHARGE → Phu thu
DISCOUNT → Giam gia
OTHER → Khac
```

### 2. Modify `invoice-detail-page.tsx`

Add print button next to "Ghi nhan thanh toan" button:
```tsx
import { Printer } from 'lucide-react'
import { openPrintWindow } from '@/lib/print-utils'
import { buildInvoicePrintHtml } from './components/invoice-print-template'

// In header actions area:
<button
  onClick={() => openPrintWindow({
    title: `Hoa don ${invoice.invoiceCode}`,
    content: buildInvoicePrintHtml(invoice),
  })}
  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#323235] hover:bg-gray-50"
>
  <Printer className="h-4 w-4" />
  In hoa don
</button>
```

## Success Criteria

- [ ] Print button visible on invoice detail page
- [ ] Clicking opens print window with formatted invoice
- [ ] All line items display correctly
- [ ] Vietnamese currency formatting correct
- [ ] A4 layout prints cleanly
