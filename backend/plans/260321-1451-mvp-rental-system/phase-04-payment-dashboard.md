# Phase 4 - Payment, Dashboard

- Plan: [plan.md](./plan.md)
- Depends on: Phase 3 (Invoice must exist)
- Status: Pending

---

## Overview

Ghi nhận thanh toán và cập nhật trạng thái hóa đơn tự động. Dashboard tổng hợp số liệu vận hành.

---

## Modules

### 1. Payment Module

**Endpoints:**
```
GET    /payments                    # list, filter by invoiceId/motelId/method/date
POST   /payments                    # OWNER/STAFF - record payment
GET    /payments/:id                # authenticated
PATCH  /payments/:id                # OWNER only - update note only
GET    /invoices/:invoiceId/payments # payments for an invoice
```

**Files to create:**
```
src/modules/payment/
  payment.module.ts
  payment.controller.ts
  payment.service.ts
  dto/
    create-payment.dto.ts
    update-payment.dto.ts
    query-payment.dto.ts
```

**Implementation steps:**

1. `create`:
   - Fetch invoice; validate `status != PAID`
   - Validate `amount > 0`
   - Validate `existingPaidAmount + amount <= invoice.totalAmount`
   - Create payment record
   - Update `invoice.paidAmount += amount`
   - Auto-update invoice status:
     - `paidAmount == totalAmount` → `PAID`
     - `paidAmount > 0 && paidAmount < totalAmount` → `PARTIALLY_PAID`
   - Auto-generate `paymentCode`: `PAY-{YYYYMMDD}-{sequence}`
   - Wrap in transaction

2. `findAll`: filter by invoiceId, motelId, paymentMethod, date range; paginate
3. `findOne`: return with invoice summary
4. `update`: only `note` field editable after creation (no amount changes)

**Business rules:**
- Payment amount must be > 0
- Total payments cannot exceed invoice `totalAmount`
- Cannot add payment to PAID invoice
- Invoice status auto-updated after each payment (in transaction)
- No delete of confirmed payments; note-only updates allowed
- `paidAmount` on invoice is denormalized sum — always recalculate on payment create

**Key DTO fields:**
```ts
invoiceId: string         // required
amount: number            // required, > 0
paymentDate: string       // ISO date, required
paymentMethod: PaymentMethod  // CASH | BANK_TRANSFER | OTHER
referenceNumber?: string  // bank transfer ref
note?: string
```

---

### 2. Dashboard Module

**Endpoints:**
```
GET /dashboard/summary              # overall stats
GET /dashboard/motels/:motelId      # per-motel stats
```

**Files to create:**
```
src/modules/dashboard/
  dashboard.module.ts
  dashboard.controller.ts
  dashboard.service.ts
```

**Implementation steps:**

1. `getSummary` — aggregate across all owner's motels:
   - `totalRooms`: count all rooms
   - `vacantRooms`: count rooms with status = VACANT
   - `occupiedRooms`: count rooms with status = OCCUPIED
   - `expiringContracts`: contracts with `endDate` within next 30 days and status = ACTIVE
   - `unpaidInvoices`: invoices with status IN [ISSUED, PARTIALLY_PAID, OVERDUE]
   - `currentMonthRevenue`: sum of payments in current calendar month
   - `totalReceivables`: sum of `(totalAmount - paidAmount)` for unpaid invoices

2. `getMotelSummary` — same stats scoped to one motelId

**Business rules:**
- Revenue = sum of `payment.amount` where `paymentDate` in current month
- Receivables = sum of `invoice.totalAmount - invoice.paidAmount` where status != PAID
- All queries scoped to `req.user` owned motels
- Dashboard data is real-time aggregation (no cache in MVP)

**Response shape:**
```ts
{
  totalRooms: number
  vacantRooms: number
  occupiedRooms: number
  maintenanceRooms: number
  expiringContractsCount: number   // within 30 days
  unpaidInvoicesCount: number
  currentMonthRevenue: number
  totalReceivables: number
}
```

---

## Todo

- [ ] Implement `PaymentModule`
- [ ] Use Prisma transaction for payment create + invoice paidAmount + status update
- [ ] Auto-generate `paymentCode`
- [ ] Validate total payments <= invoice total
- [ ] Cannot pay already-PAID invoice
- [ ] Implement `DashboardModule`
- [ ] `getSummary`: aggregate across owner's motels
- [ ] `getMotelSummary`: scoped to one motel
- [ ] Scope all dashboard queries to `req.user` owned motels
- [ ] Test full demo flow end-to-end:
  - create room → create tenant → create contract → activate
  - enter meter reading → create invoice → issue invoice
  - record payment → invoice becomes PAID
  - dashboard shows updated revenue

## Success Criteria

- Payment recorded → invoice status auto-updates (PARTIALLY_PAID / PAID)
- Cannot overpay an invoice
- Cannot pay already-PAID invoice
- Dashboard returns correct room counts by status
- Current month revenue counts only actual payments (not invoice totals)
- Receivables = sum of unpaid invoice balances
- All dashboard data scoped to current user's motels only
