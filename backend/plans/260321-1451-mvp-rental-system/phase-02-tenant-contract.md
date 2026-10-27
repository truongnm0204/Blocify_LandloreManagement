# Phase 2 - Tenant, Contract

- Plan: [plan.md](./plan.md)
- Depends on: Phase 1 (Auth, Motel, Room)
- Status: Done

---

## Overview

Quản lý người thuê và vòng đời hợp đồng. Đây là core flow: phòng có người ở → hợp đồng active → phòng chuyển OCCUPIED.

---

## Modules

### 1. Tenant Module

**Endpoints:**
```
GET    /tenants          # list, filter by status/search
POST   /tenants          # OWNER/STAFF
GET    /tenants/:id      # authenticated
PATCH  /tenants/:id      # OWNER/STAFF
```

**Files to create:**
```
src/modules/tenant/
  tenant.module.ts
  tenant.controller.ts
  tenant.service.ts
  dto/
    create-tenant.dto.ts
    update-tenant.dto.ts
    query-tenant.dto.ts
```

**Implementation steps:**

1. `create`: validate CCCD unique if provided
2. `findAll`: search by name/phone/CCCD; filter by status; paginate
3. `findOne`: return tenant detail with contract history summary
4. `update`: update all fields except id
5. No delete endpoint — use status change only

**Business rules:**
- Required: `fullName`, `phoneNumber`
- CCCD unique if provided (check before insert)
- Cannot set status to INACTIVE/BLACKLISTED if has active contract
- Statuses: `ACTIVE`, `INACTIVE`, `BLACKLISTED`

**Key DTO fields:**
```ts
fullName: string          // required
phoneNumber: string       // required
nationalId?: string       // CCCD, unique if provided
dateOfBirth?: string      // ISO date
permanentAddress?: string
vehiclePlate?: string
notes?: string
```

---

### 2. Contract Module

**Endpoints:**
```
GET    /contracts                    # list, filter by motel/room/status
POST   /contracts                    # OWNER/STAFF - create draft
GET    /contracts/:id                # authenticated
PATCH  /contracts/:id                # OWNER/STAFF - update draft only
POST   /contracts/:id/activate       # OWNER only
POST   /contracts/:id/terminate      # OWNER only
POST   /contracts/:id/cancel         # OWNER only
GET    /rooms/:roomId/active-contract # get current active contract of room
```

**Files to create:**
```
src/modules/contract/
  contract.module.ts
  contract.controller.ts
  contract.service.ts
  dto/
    create-contract.dto.ts
    update-contract.dto.ts
    query-contract.dto.ts
    activate-contract.dto.ts
    terminate-contract.dto.ts
```

**Implementation steps:**

1. `create`: create contract in `DRAFT` status; validate room has no other ACTIVE contract; add tenants via `ContractTenant`
2. `findAll`: filter by motelId, roomId, status, date range; paginate; include room name + representative tenant name
3. `findOne`: full detail with tenants list, room info, motel info
4. `update`: only allowed when `status = DRAFT`; can update tenants list
5. `activate`:
   - Check room has no other ACTIVE contract
   - Set contract `status = ACTIVE`
   - Set room `status = OCCUPIED`
   - Set `activatedAt = now()`
6. `terminate`:
   - Set contract `status = ENDED`
   - Set `terminatedAt = now()`, store `terminationReason`
   - Set room `status = VACANT` (if no other contract pending)
7. `cancel`:
   - Only DRAFT contracts can be cancelled
   - Set `status = CANCELLED`
   - Room status unchanged (was never OCCUPIED)

**Business rules:**
- One ACTIVE contract per room at a time
- Contract must have: `startDate`, `rentAmount`, `depositAmount`, at least one tenant
- Representative tenant: exactly one `isRepresentative = true` in `ContractTenant`
- Snapshot stored in contract: `rentAmount`, `depositAmount`, `numberOfOccupants`
- ENDED contracts retain all historical data
- Cannot update contract once ACTIVE (must terminate first)

**Key DTO fields:**
```ts
// CreateContractDto
roomId: string            // required
startDate: string         // ISO date, required
endDate?: string          // ISO date, optional
rentAmount: number        // required - snapshot
depositAmount: number     // required - snapshot
numberOfOccupants?: number
notes?: string
tenants: {
  tenantId: string
  isRepresentative: boolean
}[]

// TerminateContractDto
terminationDate: string   // ISO date
terminationReason?: string
```

---

## Todo

- [ ] Implement `TenantModule` (CRUD)
- [ ] Validate CCCD uniqueness on create/update
- [ ] Implement `ContractModule` (CRUD + lifecycle)
- [ ] `create` contract: validate no active contract for room
- [ ] `activate`: transaction — update contract + room status atomically
- [ ] `terminate`: transaction — update contract + room status atomically
- [ ] `cancel`: draft only
- [ ] Wire `ContractModule` + `RoomModule` dependency for status sync
- [ ] Add `GET /rooms/:roomId/active-contract` endpoint
- [ ] Test full flow: create tenant → create contract → activate → room becomes OCCUPIED

## Success Criteria

- Tenant created with CCCD uniqueness enforced
- Cannot create second ACTIVE contract for same room
- Activating contract changes room status to OCCUPIED
- Terminating contract changes room status to VACANT
- Cancelling draft contract does not affect room status
- Contract list filterable by motelId, roomId, status
