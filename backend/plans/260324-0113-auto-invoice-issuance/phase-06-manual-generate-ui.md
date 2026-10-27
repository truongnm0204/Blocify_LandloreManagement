# Phase 6: Manual Generate Invoice UI

## Overview
- Priority: HIGH
- Status: Pending
- UI form de owner/staff tao hoa don thu cong (truong hop roi tro dot xuat, thanh ly som)

## Key Insights
- Backend API `POST /invoices/generate` da san co
- Chua co frontend UI de goi API nay
- Can form: chon contract (hoac chon motel -> room -> auto-load contract ACTIVE)
- Cascading: Motel -> Room -> Contract (auto-load)
- Cho phep chon thang/nam, billingDate, dueDate, surcharge, discount

## Requirements
- Trang `/invoices/new` hoac modal tao hoa don
- Cascading dropdown: Motel -> Room -> Contract ACTIVE
- Input: invoiceMonth, invoiceYear (default thang hien tai)
- Optional: billingDate, dueDate, surchargeAmount, discountAmount, note
- Goi `POST /invoices/generate` -> redirect ve invoice detail

## Related Code Files
- Create: `frontend/src/pages/invoices/invoice-generate-page.tsx`
- Modify: `frontend/src/App.tsx` (add route `/invoices/new`)
- Modify: `frontend/src/pages/invoices/invoices-page.tsx` (add button "Tao hoa don")
- Reuse: `useMotels`, `useRoomsByMotel`, `useGenerateInvoice` hooks

## Implementation Steps

### 1. Tao InvoiceGeneratePage
```
Layout:
┌─────────────────────────────────────────────┐
│ Breadcrumb: Hoa don > Tao hoa don           │
│                                             │
│ [Thong tin co ban]                          │
│ ┌─ Toa nha: [dropdown]                     │
│ ├─ Phong:   [dropdown] (load khi chon tro) │
│ ├─ Hop dong: [auto-fill tu room ACTIVE]    │
│ ├─ Thang:   [dropdown 1-12]               │
│ └─ Nam:     [dropdown]                     │
│                                             │
│ [Thong tin bo sung]                         │
│ ┌─ Ngay lap:    [date]                     │
│ ├─ Han tra:     [date]                     │
│ ├─ Phu thu:     [currency]                 │
│ ├─ Giam gia:    [currency]                 │
│ └─ Ghi chu:     [textarea]                 │
│                                             │
│ [Huy]  [Tao hoa don]                       │
└─────────────────────────────────────────────┘
```

### 2. Cascading logic
- Chon Motel -> load Rooms (useRoomsByMotel)
- Chon Room -> auto-find ACTIVE contract (GET /contracts?roomId=xxx&status=ACTIVE)
- Hien thi ten khach thue, tien thue tu contract
- Disable submit neu chua co contract ACTIVE

### 3. Add route
```typescript
// App.tsx
<Route path="/invoices/new" element={<InvoiceGeneratePage />} />
```

### 4. Add button to invoices list page
```tsx
// invoices-page.tsx - header
<button onClick={() => navigate('/invoices/new')}>
  <Plus /> Tao hoa don
</button>
```

### 5. Submit logic
```typescript
const payload = {
  contractId: activeContract.id,
  invoiceMonth: Number(form.month),
  invoiceYear: Number(form.year),
  billingDate: form.billingDate || undefined,
  dueDate: form.dueDate || undefined,
  surchargeAmount: form.surcharge ? Number(form.surcharge) : undefined,
  discountAmount: form.discount ? Number(form.discount) : undefined,
  note: form.note || undefined,
}
await generateInvoice.mutateAsync(payload)
navigate(`/invoices`) // or navigate to detail
```

## Todo List
- [ ] Create invoice-generate-page.tsx
- [ ] Add route /invoices/new in App.tsx
- [ ] Add "Tao hoa don" button in invoices-page.tsx
- [ ] Implement cascading Motel -> Room -> Contract
- [ ] Implement form submission with validation
- [ ] Handle error display (duplicate invoice, no active contract)
- [ ] Verify frontend builds ok

## Success Criteria
- User co the tao hoa don manual qua UI
- Cascading dropdown hoat dong dung
- Auto-load contract ACTIVE khi chon room
- Error message ro rang khi invoice da ton tai
- Redirect ve list sau khi tao thanh cong
