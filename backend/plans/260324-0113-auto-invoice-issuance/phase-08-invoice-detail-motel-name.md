# Phase 8: Invoice Detail - Hien thi ten tro

## Overview
- Priority: HIGH
- Status: Pending
- Them ten tro (motel name) vao invoice detail page

## Key Insights
- Backend `findOne` da include `motel: { select: { id: true, name: true } }` -> da co
- Frontend Invoice type chua co `motel` relation -> can update (Phase 7 da lam)
- Invoice detail page hien tai chi hien: Phong, Nguoi thue, Ngay lap, Han tra
- Can them row "Toa nha" trong info card

## Related Code Files
- Modify: `frontend/src/pages/invoices/invoice-detail-page.tsx` (them row ten tro)
- Modify: `frontend/src/pages/invoices/components/invoice-print-template.ts` (them ten tro khi in)

## Implementation Steps

### 1. Update invoice detail info card
Them row "Toa nha" vao card "Thong tin hoa don":

```
Truoc:
┌───────────────────────────┐
│ Thong tin hoa don         │
│ Phong:      101           │
│ Nguoi thue: Nguyen Van A  │
│ Ngay lap:   30/03/2024    │
│ Han tra:    31/03/2024    │
└───────────────────────────┘

Sau:
┌───────────────────────────┐
│ Thong tin hoa don         │
│ Toa nha:    Binh Minh     │  <-- ADD
│ Phong:      101           │
│ Nguoi thue: Nguyen Van A  │
│ Ngay lap:   30/03/2024    │
│ Han tra:    31/03/2024    │
└───────────────────────────┘
```

```tsx
// invoice-detail-page.tsx - info card
<div className="info-row">
  <span className="text-sm text-[#7b7a7d]">Toa nha</span>
  <span className="text-sm font-medium text-[#323235]">
    {invoice.motel?.name ?? '-'}
  </span>
</div>
```

### 2. Update print template
Them "Toa nha" vao print template:

```typescript
// invoice-print-template.ts
`<div class="info-row">
  <span class="info-label">Toa nha:</span>
  <span class="info-value">${invoice.motel?.name ?? '-'}</span>
</div>`
```

## Todo List
- [ ] Add "Toa nha" row to invoice detail info card
- [ ] Add "Toa nha" to invoice print template
- [ ] Verify frontend builds ok

## Success Criteria
- Invoice detail hien thi ten tro
- Print template hien thi ten tro
- Fallback '-' neu khong co motel data
