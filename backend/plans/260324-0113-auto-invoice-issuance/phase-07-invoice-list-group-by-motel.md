# Phase 7: Invoice List - Group by Motel with Pagination

## Overview
- Priority: HIGH
- Status: Pending
- Invoice list group by motel voi pagination per section (pattern giong contracts-page)

## Key Insights
- Contracts page da co pattern group by motel: `ContractMotelSection` component
- Invoice API da tra ve `motelId` va `room.roomCode` nhung chua co `motel.name`
- Backend findAll chua include motel name -> can them
- Frontend fetch all invoices (limit cao) roi group client-side (giong contracts)

## Requirements
- Backend: Include `motel { name }` trong Invoice findAll response
- Frontend: Group invoices by motelId, moi group la 1 section voi ten tro
- Moi section co pagination rieng (5-10 items/page)
- Collapse/expand per section (optional)

## Related Code Files
- Modify: `backend/src/modules/invoice/invoice.service.ts` (findAll - include motel)
- Modify: `frontend/src/pages/invoices/invoices-page.tsx` (group by motel, sections)
- Create: `frontend/src/pages/invoices/components/invoice-motel-section.tsx`
- Modify: `frontend/src/types/index.ts` (Invoice type - add motel relation)

## Implementation Steps

### 1. Backend: Include motel in findAll
```typescript
// invoice.service.ts - findAll
include: {
  room: { select: { id: true, roomCode: true, roomName: true } },
  motel: { select: { id: true, name: true } },  // ADD THIS
  contract: { select: { id: true, contractCode: true } },
  representativeTenant: { select: { id: true, fullName: true, phoneNumber: true } },
},
```

### 2. Frontend: Update Invoice type
```typescript
// types/index.ts
interface Invoice {
  // ...existing
  motel?: { id: string; name: string }  // ADD
}
```

### 3. Create InvoiceMotelSection component
```
Pattern tu ContractMotelSection:
┌──────────────────────────────────────────┐
│ [icon] Nha tro Binh Minh (12 hoa don)   │
│                                          │
│ ┌────────┬──────┬──────┬──────┬────────┐ │
│ │ Ma HD  │Phong │Ky    │Tong  │Trang T.│ │
│ ├────────┼──────┼──────┼──────┼────────┤ │
│ │INV-001 │101   │3/26  │5.0M  │ISSUED  │ │
│ │INV-002 │102   │3/26  │4.5M  │DRAFT   │ │
│ └────────┴──────┴──────┴──────┴────────┘ │
│                                          │
│ [< 1 2 3 >]  (pagination per section)   │
└──────────────────────────────────────────┘
```

Props:
```typescript
interface InvoiceMotelSectionProps {
  motelName: string
  invoices: Invoice[]
  hideHeader?: boolean  // an header neu chi co 1 motel
}
```

### 4. Update InvoicesPage
- Fetch limit cao (500) de group client-side
- Group by motelId
- Render `InvoiceMotelSection` per group
- Stats van tinh tren tat ca invoices
- Filter van hoat dong binh thuong

```typescript
const groupedByMotel = useMemo(() => {
  const groups: Record<string, { motelName: string; invoices: Invoice[] }> = {}
  for (const inv of filteredInvoices) {
    const key = inv.motelId || '_unknown'
    if (!groups[key]) {
      groups[key] = { motelName: inv.motel?.name || 'Khong xac dinh', invoices: [] }
    }
    groups[key].invoices.push(inv)
  }
  return Object.entries(groups).sort(([, a], [, b]) =>
    a.motelName.localeCompare(b.motelName)
  )
}, [filteredInvoices])
```

### 5. InvoiceMotelSection internal pagination
```typescript
const SECTION_PAGE_SIZE = 10
const [sectionPage, setSectionPage] = useState(1)
const paged = invoices.slice((sectionPage - 1) * SECTION_PAGE_SIZE, sectionPage * SECTION_PAGE_SIZE)
const totalPages = Math.ceil(invoices.length / SECTION_PAGE_SIZE)
```

## Todo List
- [ ] Backend: Add motel include to invoice findAll
- [ ] Frontend: Update Invoice type with motel relation
- [ ] Create InvoiceMotelSection component
- [ ] Refactor InvoicesPage to group by motel
- [ ] Add per-section pagination
- [ ] Update stats to use full dataset
- [ ] Verify frontend builds ok

## Success Criteria
- Invoices grouped by motel name sections
- Each section has own pagination (10 items/page)
- Motel name hien thi ro rang tren section header
- Filter van hoat dong dung (status, month, search)
- Single motel: hide section header (hideHeader)
- Stats cards van chinh xac
