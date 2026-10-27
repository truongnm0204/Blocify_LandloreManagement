# Phase 3: Contract Print Template + Wire Buttons

**Priority:** High | **Status:** Pending

## Overview

Create HTML template for contract printing and wire existing placeholder buttons on contract detail page.

## Files

- **Create:** `src/pages/contracts/components/contract-print-template.ts`
- **Modify:** `src/pages/contracts/contract-detail-page.tsx`

## Implementation Steps

### 1. Create `contract-print-template.ts`

Function `buildContractPrintHtml(contract: Contract): string` that returns HTML with:
- Header: "HOP DONG THUE PHONG" + contract code
- Contract info: Status, Signed date, Start date, End date
- Property info: Motel name, Address, Room code
- Financial terms: Rent amount, Deposit, Service fee, Occupant count
- Tenant list: Full name, Phone, Citizen ID, Representative badge
- Notes section (if any)
- Signature area: "Ben cho thue" (left) + "Ben thue" (right)

### 2. Modify `contract-detail-page.tsx`

Wire the 2 existing buttons (lines 323-330):

**"In hop dong" button** - triggers print:
```tsx
<button
  onClick={() => openPrintWindow({
    title: `Hop dong ${contract.contractCode ?? contract.id.slice(0, 8)}`,
    content: buildContractPrintHtml(contract),
  })}
  className="..."
>
  <Printer className="h-4 w-4" />
  In hop dong
</button>
```

**"Xuat PDF" button** - same as print (browser "Save as PDF"):
```tsx
<button
  onClick={() => openPrintWindow({
    title: `Hop dong ${contract.contractCode ?? contract.id.slice(0, 8)}`,
    content: buildContractPrintHtml(contract),
  })}
  className="..."
>
  <FileDown className="h-4 w-4" />
  Xuat PDF
</button>
```

Add imports:
```tsx
import { openPrintWindow } from '@/lib/print-utils'
import { buildContractPrintHtml } from './components/contract-print-template'
```

## Success Criteria

- [ ] Both buttons functional on contract detail page
- [ ] Print window shows professional contract layout
- [ ] Tenant list with representative badge
- [ ] Signature area at bottom
- [ ] A4 layout prints cleanly
