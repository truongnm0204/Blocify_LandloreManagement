# Tenant Management Feature Exploration Report

## Executive Summary
The tenant management system has **partial pagination support** and **lacks motel filtering**. While the backend API supports pagination and search, the frontend is not utilizing motel filtering despite the capability to do so.

---

## Frontend Analysis

### 1. Tenant List Page (`tenants-page.tsx`)

**Pagination Support:**
- Hardcoded to page 1, limit 200
- Query parameters: `{ page: 1, limit: 200, status, search }`
- **Issue:** Frontend ignores pagination – loads all 200 results on one page and disables pagination controls

**Motel Filtering:**
- ❌ **NOT IMPLEMENTED**
- Frontend groups tenants by motel using client-side computation (via rooms → contracts → tenants relationship)
- No motel filter query parameter sent to backend
- Tenants are fetched globally, then grouped in-memory

**Search/Filter Features:**
- ✅ Status filter (ACTIVE, INACTIVE, BLACKLISTED)
- ✅ Text search (name, phone, citizenId)
- ✅ Collapsible motel sections (client-side grouping)

**Data Flow:**
```
Frontend requests:
  - GET /tenants?page=1&limit=200&status=X&search=Y
  - GET /motels?page=1&limit=100 (for name mapping)
  - GET /rooms?page=1&limit=200 (to build tenant→motel relationship)

Then groups tenants by motel using contractTenants relationship
```

### 2. Tenant Table Component (`tenant-table.tsx`)

**Pagination UI:**
- ✅ Pagination controls rendered for multi-page results
- ✅ Navigation buttons (prev/next) and page number buttons
- ❌ **Not connected to parent** – `onPageChange` handler does nothing in parent
- Meta data: `{ total, page, limit, totalPages }`

---

## Backend Analysis

### 1. Query DTO (`query-tenant.dto.ts`)

**Supported Query Parameters:**
```typescript
{
  search?: string        // Search by name, phone, citizenId (insensitive)
  status?: TenantStatus  // ACTIVE, INACTIVE, BLACKLISTED
  page?: number          // Default: 1
  limit?: number         // Default: 20
}
```

**Missing:** No `motelId` filter parameter.

### 2. Service Layer (`tenant.service.ts`)

**Find All Query:**
- Pagination: ✅ Implemented (skip/take with limit)
- Status filter: ✅ Implemented
- Search: ✅ Implemented (fullName, phoneNumber, citizenId with case-insensitive matching)
- **Missing:** No motel filtering logic

**Tenant→Motel Relationship:**
- Tenants link to contracts via `contractTenants` (many-to-many)
- Contracts link to rooms via `roomId`
- Rooms link to motels via `motelId`
- **No direct tenant→motel join** in the query

### 3. API Response Format

```typescript
{
  data: Tenant[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

---

## Data Relationship Map

```
Tenant 1-to-many→ ContractTenant many-to-one← Contract 1-to-1← Room 1-to-many← Motel
        ↓
    contractTenants (junction table)
```

**Current limitation:** Tenants don't directly reference motels. Must traverse through:
`Tenant → ContractTenant → Contract → Room → Motel`

---

## Gaps & Issues

| Feature | Frontend | Backend | Comment |
|---------|----------|---------|---------|
| **Pagination** | Hardcoded 200/page | ✅ Supports page+limit | Frontend loads all, pagination UI broken |
| **Motel Filter** | ❌ Missing query param | ❌ Missing DTO/query logic | Must add filter throughout stack |
| **Status Filter** | ✅ Works | ✅ Works | Functional end-to-end |
| **Search** | ✅ Works | ✅ Works | Functional end-to-end |
| **Page Navigation** | UI renders but non-functional | N/A | Frontend doesn't handle page changes |

---

## Implementation Checklist

### To Enable Pagination:
1. Frontend: Add `currentPage` state, implement `onPageChange` handler
2. Frontend: Pass `page` param to `useTenants()`
3. Backend: Already supports – no changes needed

### To Add Motel Filtering:
1. Backend: Extend `QueryTenantDto` with `motelId?: string`
2. Backend: Add join logic in `findAll()` to filter by `room.motelId`
3. Frontend: Add motel dropdown/selector UI
4. Frontend: Pass `motelId` to `useTenants()` when selected

### Code Locations to Modify:
- **Frontend:** `frontend/src/pages/tenants/tenants-page.tsx` (lines 33-42, 115-127)
- **Frontend:** `frontend/src/api/tenants.api.ts` (add motelId to TenantQueryParams)
- **Backend:** `backend/src/modules/tenant/dto/query-tenant.dto.ts` (add motelId property)
- **Backend:** `backend/src/modules/tenant/tenant.service.ts` (update findAll() where clause)

---

## Key Findings

1. **Backend is ready** – Already supports pagination; just missing motel filter
2. **Frontend hardcoded pagination** – Loads 200 items max per request but treats it as single page
3. **Motel grouping is client-side** – Frontend manually fetches rooms/contracts to associate tenants with motels
4. **Pagination UI exists but disconnected** – Component accepts `onPageChange` but parent doesn't implement it

---

## Unresolved Questions
- Should pagination be server-side (recommended) or client-side pagination on filtered results?
- Should motel filter be optional or required for better UX?
- Is the 200-item hardcoded limit intentional or a bug?
