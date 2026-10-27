# Explore Report: Add New Room Feature

**Date:** 2026-03-24
**Scope:** Frontend + Backend room module

---

## 1. Files Explored

### Frontend

| File | Purpose |
|------|---------|
| `src/pages/rooms/rooms-page.tsx` | List page — has "Them phong moi" button (no navigate wired) |
| `src/pages/rooms/room-detail-page.tsx` | Dual-mode form: create (no roomId) + edit (with roomId) |
| `src/api/rooms.api.ts` | API client with all CRUD methods |
| `src/hooks/use-rooms.ts` | React Query hooks incl. useCreateRoom() |
| `src/types/index.ts` | Room, RoomStatus, RoomWithTenant types |
| `src/router/index.tsx` | Route definitions |
| `src/lib/axios.ts` | Axios instance (baseURL: /api, JWT interceptor) |
| `src/lib/error-utils.ts` | getErrorMessage() helper |
| `src/hooks/use-motels.ts` | useMotels() — needed for motel selector in create form |
| `src/pages/rooms/components/room-table.tsx` | RoomWithMotel extended type, table layout |
| `src/pages/vehicles/vehicle-add-page.tsx` | Pattern reference for two-column form layout |

### Backend

| File | Purpose |
|------|---------|
| `backend/src/modules/room/flat-room.controller.ts` | `POST /rooms` (motelId in body) — used by frontend |
| `backend/src/modules/room/room.controller.ts` | `POST /motels/:motelId/rooms` (nested route) |
| `backend/src/modules/room/room.service.ts` | create(), createFlat() methods |
| `backend/src/modules/room/dto/create-room.dto.ts` | CreateRoomDto |
| `backend/src/modules/room/dto/update-room.dto.ts` | UpdateRoomDto |
| `backend/schema.prisma` | Room model (lines 175-199) |

---

## 2. Key Findings

### Router Gap

`/rooms/new` route does NOT exist in `src/router/index.tsx`. Current room routes:
```
/rooms             -> RoomsPage
/rooms/:roomId     -> RoomDetailPage (edit)
/rooms/:roomId/edit -> RoomDetailPage (edit)
```
The "Them phong moi" button in `rooms-page.tsx` is a static `<button>` with no `onClick` handler.

### RoomDetailPage is Already Dual-Mode

`room-detail-page.tsx` already supports create mode — it detects `isEdit = !!roomId`.
When no `roomId` param, it renders a create form using `useCreateRoom()` mutation.
All validation and submit logic is implemented. This page just needs to be routed to.

### API Flow for Create

Frontend: `roomsApi.createRoom(data)` -> `POST /api/rooms` with body `{ motelId, roomCode, name, baseRent, area?, maxOccupants?, notes? }`

Backend: `FlatRoomController.create()` -> `RoomService.createFlat()` -> `RoomService.create()`
- Verifies user owns the motel
- Checks `motelId_roomCode` uniqueness constraint
- Maps frontend field names to Prisma DB columns (name->roomName, baseRent->baseRentPrice, notes->description)

### CreateRoomPayload vs CreateRoomDto

| Field | Frontend Payload | Backend DTO | DB Column |
|-------|-----------------|-------------|-----------|
| motelId | required | optional* | motel_id |
| roomCode | required | required | room_code |
| name | required | required | room_name |
| baseRent | required | required | base_rent_price |
| area | optional | optional | area |
| maxOccupants | optional | optional | max_occupants |
| notes | optional | optional | description |
| floor | **MISSING** | optional | floor |
| depositSuggested | **MISSING** | optional | deposit_suggested |

*motelId optional in DTO but validated as required in createFlat()

### Room Type (frontend, src/types/index.ts)
```ts
interface Room {
  id: string
  motelId: string
  roomCode: string
  name: string
  baseRent: number
  area?: number
  floor?: number
  maxOccupants?: number
  status: RoomStatus   // VACANT | RESERVED | OCCUPIED | MAINTENANCE
  notes?: string
  contracts?: { id, contractCode?, status, tenants? }[]
}
```

### Prisma Schema (Room model)
```
id               String     @id @default(cuid())
motelId          String
roomCode         String
roomName         String?
floor            Int?
area             Decimal?
baseRentPrice    Decimal
depositSuggested Decimal?
maxOccupants     Int?
status           RoomStatus @default(VACANT)
description      String?
@@unique([motelId, roomCode])
```

### RoomDetailPage Form Fields

Section 1 — Basic Info:
- motelId (select, only shown in create mode)
- roomCode (text, required)
- name (text, required)
- area (number, optional)
- notes/description (textarea, optional)

Section 2 — Amenities (UI only, not persisted in DB or API)

Right sidebar:
- baseRent (currency input, required)
- maxOccupants (counter +/-, optional)
- status (radio, optional — only shown in create for setting initial status)

### Hook: useCreateRoom()
```ts
// src/hooks/use-rooms.ts
export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRoomPayload) => roomsApi.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      queryClient.invalidateQueries({ queryKey: ['motel-rooms'] })
      useToastStore.getState().add({ type: 'success', title: 'Tao phong thanh cong' })
    },
    onError: (err) => {
      useToastStore.getState().add({ type: 'error', title: 'Tao phong that bai', message: getErrorMessage(err) })
    },
  })
}
```

---

## 3. What Needs to Be Done

### Minimal (wire up existing page)

1. **Add route** in `src/router/index.tsx`:
   ```ts
   { path: 'rooms/new', element: <RoomDetailPage /> }
   ```
   Must be placed BEFORE `rooms/:roomId` to avoid path conflict.

2. **Wire button** in `src/pages/rooms/rooms-page.tsx`:
   ```ts
   // Change:
   <button className="...">Them phong moi</button>
   // To:
   <button onClick={() => navigate('/rooms/new')} className="...">Them phong moi</button>
   ```

### Optional Enhancements

3. **Add `floor` field** to `CreateRoomPayload` in `rooms.api.ts` and expose in `RoomDetailPage` form (backend already supports it)
4. **Add `depositSuggested` field** similarly (backend already supports it)
5. **Motel pre-selection** — if navigating from `/motels/:motelId/rooms`, pre-fill motelId via URL query param `?motelId=xxx`

---

## 4. Pattern References

- **Form layout pattern**: `src/pages/vehicles/vehicle-add-page.tsx` — two-column, left=form cards, right=info/image cards, `FieldWrapper` helper
- **Dual create/edit page**: `src/pages/rooms/room-detail-page.tsx` — already handles both, detect by `!!roomId` param
- **Toast feedback**: `useToastStore.getState().add({ type, title, message })` via `src/stores/toast.store.ts`
- **Error handling**: `getErrorMessage(err)` from `src/lib/error-utils.ts`
- **Navigation after save**: `navigate('/rooms')` on success

---

## 5. Unresolved Questions

- Should the "Them phong moi" button on `/motels/:motelId/rooms` pre-fill the motelId? (Currently `RoomsPage` already receives `motelId` from `useParams` — could pass it as query param)
- Should `floor` and `depositSuggested` be exposed in the create form?
- Should status default to VACANT always on create (backend default) or let user choose? (Currently the form shows status radio in create mode — backend ignores it; new rooms always start VACANT)
