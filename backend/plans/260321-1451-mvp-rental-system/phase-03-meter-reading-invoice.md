# Phase 3 - Meter Reading, Invoice

- Plan: [plan.md](./plan.md)
- Depends on: Phase 2 (Tenant, Contract must be active)
- Status: Pending

---

## Overview

Nhập chỉ số điện nước hàng tháng → tạo hóa đơn. Đây là nghiệp vụ lặp lại hàng tháng quan trọng nhất.

---

## Modules

### 1. Meter Reading Module

**Endpoints:**
```
GET    /meter-readings                    # list, filter by motelId/roomId/month/year
POST   /meter-readings                    # OWNER/STAFF
GET    /meter-readings/:id                # authenticated
PATCH  /meter-readings/:id                # OWNER/STAFF - only if not locked
POST   /meter-readings/:id/lock           # OWNER only
```

**Files to create:**
```
src/modules/meter-reading/
  meter-reading.module.ts
  meter-reading.controller.ts
  meter-reading.service.ts
  dto/
    create-meter-reading.dto.ts
    update-meter-reading.dto.ts
    query-meter-reading.dto.ts
```

**Implementation steps:**

1. `create`:
   - Validate unique per `roomId + readingMonth + readingYear`
   - Validate `electricityCurrent >= electricityPrevious`
   - Validate `waterCurrent >= waterPrevious`
   - Auto-calculate `electricityUsage = current - previous`
   - Auto-calculate `waterUsage = current - previous`
   - If prices not provided: inherit from motel defaults
   - Set `contractId` = current active contract of room
2. `findAll`: filter by motelId, roomId, month, year; paginate
3. `findOne`: return with room name, motel name
4. `update`:
   - Block if `isLocked = true` → 409
   - Block if invoice already generated from this reading → 409
   - Recalculate usage on update
5. `lock`: set `isLocked = true`; cannot unlock in MVP

**Business rules:**
- Unique: one reading per room per month/year
- New value >= old value (no negative usage)
- Prices at time of reading must be snapshot-saved in record
- Lock after invoice is created (auto-lock in invoice creation flow)
- `electricityUsage` and `waterUsage` always computed, not user-input

**Key DTO fields:**
```ts
roomId: string              // required
readingMonth: number        // 1-12, required
readingYear: number         // required
electricityPrevious: number // required
electricityCurrent: number  // required
waterPrevious: number       // required
waterCurrent: number        // required
electricityUnitPrice?: number // if omitted, use motel default
waterUnitPrice?: number       // if omitted, use motel default
recordedDate?: string
note?: string
```

---

### 2. Invoice Module

**Endpoints:**
```
GET    /invoices                    # list, filter by motelId/roomId/status/month/year
POST   /invoices                    # OWNER/STAFF - generate invoice
GET    /invoices/:id                # authenticated
PATCH  /invoices/:id                # OWNER/STAFF - draft only
POST   /invoices/:id/issue          # OWNER only - publish invoice
GET    /invoices/contract/:contractId # invoices for a contract
```

**Files to create:**
```
src/modules/invoice/
  invoice.module.ts
  invoice.controller.ts
  invoice.service.ts
  invoice-calculator.service.ts   # separate calculation logic
  dto/
    create-invoice.dto.ts
    update-invoice.dto.ts
    query-invoice.dto.ts
```

**Implementation steps:**

1. `create`:
   - Validate one invoice per `contractId + invoiceMonth + invoiceYear`
   - Fetch contract → get `rentAmount`
   - Fetch meter reading for that month/room → calculate electricity + water amounts
   - Fetch motel → get `serviceFee`, `dueDay`
   - Build snapshot: `roomSnapshot = JSON.stringify({roomCode, name, motelName})`
   - Build snapshot: `tenantSnapshot = JSON.stringify({fullName, phone})`
   - Create `InvoiceItem` records for each line item
   - Calculate `totalAmount = rent + electricity + water + serviceFee + surcharge - discount`
   - Set `dueDate` based on motel `dueDay`
   - Auto-lock meter reading after invoice created
   - `status = DRAFT`
   - Auto-generate `invoiceCode`: `INV-{YYYY}{MM}-{roomCode}-{sequence}`

2. `findAll`: filter by motelId, roomId, status, month, year; paginate
3. `findOne`: return full detail with `invoiceItems`, `payments`
4. `update` (draft only):
   - Can update `surchargeAmount`, `discountAmount`, `note`, `dueDate`
   - Recalculate `totalAmount` after update
   - Block if `status != DRAFT`
5. `issue`:
   - Set `status = ISSUED`
   - Cannot revert to DRAFT after issuing

**Invoice calculation logic (in `invoice-calculator.service.ts`):**
```
electricityAmount = usage * unitPrice
waterAmount = usage * unitPrice
totalAmount = rentAmount + electricityAmount + waterAmount
            + serviceFeeAmount + surchargeAmount - discountAmount
```

**Business rules:**
- One invoice per contract per month/year
- Snapshot must capture: roomCode, roomName, tenantName, rentAmount, electricityUnitPrice, waterUnitPrice at time of creation
- Only DRAFT invoices editable freely
- `totalAmount` always auto-recalculated
- Invoice status flow: `DRAFT → ISSUED → PARTIALLY_PAID / PAID / OVERDUE`
- OVERDUE: set when `dueDate < today` and `status = ISSUED` (batch job or on-read check)

---

## Todo

- [ ] Implement `MeterReadingModule`
- [ ] Validate unique per room+month+year
- [ ] Auto-calculate usage fields
- [ ] Inherit motel default prices if not provided
- [ ] Implement `InvoiceModule`
- [ ] Create `InvoiceCalculatorService` for calculation logic
- [ ] Generate `invoiceCode` with proper sequence
- [ ] Build `roomSnapshot` + `tenantSnapshot` JSON on create
- [ ] Auto-lock meter reading when invoice created
- [ ] `issue` action: lock invoice from free edits
- [ ] Recalculate `totalAmount` whenever line items change
- [ ] Test full flow: enter meter reading → generate invoice → issue invoice

## Success Criteria

- Cannot enter duplicate meter reading for same room+month+year
- New reading value >= previous value enforced
- Invoice auto-calculates total from all components
- Invoice created with correct snapshots (room, tenant info)
- Meter reading auto-locked after invoice creation
- Cannot edit issued invoice freely
- Invoice list filterable by motelId, roomId, status, month/year
