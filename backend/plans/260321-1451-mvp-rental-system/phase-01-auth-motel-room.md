# Phase 1 - Auth, Motel, Room

- Plan: [plan.md](./plan.md)
- Status: Pending
- Priority: Critical - foundation for all other phases

---

## Overview

Thiết lập nền tảng hệ thống: xác thực, phân quyền, quản lý khu trọ, quản lý phòng.

---

## Modules

### 1. Auth Module

**Endpoints:**
```
POST /auth/login         # public
POST /auth/logout        # authenticated
GET  /auth/me            # authenticated
```

**Files to create:**
```
src/modules/auth/
  auth.module.ts
  auth.controller.ts
  auth.service.ts
  dto/
    login.dto.ts
  strategies/
    jwt.strategy.ts
src/common/
  guards/
    jwt-auth.guard.ts
    roles.guard.ts
  decorators/
    current-user.decorator.ts
    roles.decorator.ts
```

**Implementation steps:**

1. Install dependencies (if missing): `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` — already in package.json
2. Create `JwtStrategy` — validate JWT payload, return user from DB
3. Create `JwtAuthGuard` — extends `AuthGuard('jwt')`
4. Create `RolesGuard` — check `UserRole` from `@Roles()` decorator
5. `login`: validate email + bcrypt password → return `access_token` (JWT, 7d expiry)
6. `logout`: stateless JWT → just return success (client clears token)
7. `me`: return current user info from `req.user`
8. Register `JwtModule` with secret from `process.env.JWT_SECRET`

**Business rules:**
- Login fails → 401 with generic message (do not reveal if email exists)
- Inactive user → 403 Forbidden
- JWT payload: `{ sub: userId, email, role }`

---

### 2. User Module

**Endpoints:**
```
GET    /users            # OWNER only
POST   /users            # OWNER only - create staff
GET    /users/:id        # OWNER only
PATCH  /users/:id        # OWNER only
PATCH  /users/:id/status # OWNER only - lock/unlock
```

**Files to create:**
```
src/modules/user/
  user.module.ts
  user.controller.ts
  user.service.ts
  dto/
    create-user.dto.ts
    update-user.dto.ts
    query-user.dto.ts
```

**Implementation steps:**

1. `create`: hash password with bcrypt, default role = STAFF           
2. `findAll`: paginated list, filter by role/status      
3. `findOne`: return user by id, 404 if not found
4. `update`: update name, phone, role
5. `updateStatus`: set ACTIVE / INACTIVE

**Business rules:**
- Email must be unique
- Cannot lock own account
- Owner cannot downgrade own role

---

### 3. Motel Module

**Endpoints:**
```
GET    /motels           # list all motels of current user
POST   /motels           # OWNER only
GET    /motels/:id       # authenticated
PATCH  /motels/:id       # OWNER only
DELETE /motels/:id       # OWNER only - soft delete
```

**Files to create:**
```
src/modules/motel/
  motel.module.ts
  motel.controller.ts
  motel.service.ts
  dto/
    create-motel.dto.ts
    update-motel.dto.ts
```

**Implementation steps:**

1. `create`: set `ownerId = req.user.id`
2. `findAll`: return motels belonging to current owner
3. `findOne`: 404 if not found or not owned by user
4. `update`: update name, address, default prices, dueDay
5. `delete`: soft delete — set `status = INACTIVE`; block if has active rooms

**Business rules:**
- Name must be unique per owner
- Cannot deactivate motel if has `OCCUPIED` rooms
- Default prices stored: `electricityPrice`, `waterPrice`, `serviceFee`, `dueDay`

**Key DTO fields:**
```ts
name: string              // required
address?: string
electricityPrice?: number // default unit price per kWh
waterPrice?: number       // default unit price per m3
serviceFee?: number       // monthly fixed service fee
dueDay?: number           // day of month invoice is due (1-31)
```

---

### 4. Room Module

**Endpoints:**
```
GET    /motels/:motelId/rooms          # list rooms in motel
POST   /motels/:motelId/rooms          # OWNER/STAFF
GET    /motels/:motelId/rooms/:id      # authenticated
PATCH  /motels/:motelId/rooms/:id      # OWNER/STAFF
DELETE /motels/:motelId/rooms/:id      # OWNER only
```

**Files to create:**
```
src/modules/room/
  room.module.ts
  room.controller.ts
  room.service.ts
  dto/
    create-room.dto.ts
    update-room.dto.ts
    query-room.dto.ts
```

**Implementation steps:**

1. `create`: validate `roomCode` unique within motel
2. `findAll`: filter by `status` query param; include active contract tenant name
3. `findOne`: return room detail with current active contract summary
4. `update`: update name, price, area, maxOccupants, notes
5. `delete`: soft delete allowed only if room has NO contract history; else 409

**Business rules:**
- `roomCode` unique within motel scope
- Status transitions enforced in service:
  - Cannot set VACANT if active contract exists
  - Manual status update only for RESERVED / MAINTENANCE
  - OCCUPIED set automatically by contract activation
- No hard delete if room has had any contract

**Key DTO fields:**
```ts
roomCode: string          // required, unique per motel
name: string              // required
baseRent: number          // required
area?: number             // m2
maxOccupants?: number
notes?: string
```

---

## Todo

- [ ] Setup `AppModule` imports: `ConfigModule`, `AuthModule`, `UserModule`, `MotelModule`, `RoomModule`
- [ ] Create `common/guards/jwt-auth.guard.ts`
- [ ] Create `common/guards/roles.guard.ts`
- [ ] Create `common/decorators/current-user.decorator.ts`
- [ ] Create `common/decorators/roles.decorator.ts`
- [ ] Implement `AuthModule` (login, logout, me)
- [ ] Implement `UserModule` (CRUD + status)
- [ ] Implement `MotelModule` (CRUD + soft delete)
- [ ] Implement `RoomModule` (CRUD + status rules)
- [ ] Add `ConfigModule` with `JWT_SECRET`, `DATABASE_URL` validation
- [ ] Test full login → get token → access protected route flow

## Success Criteria

- `POST /auth/login` returns JWT token
- `GET /auth/me` returns current user with role
- OWNER can create motel and rooms
- STAFF cannot create motel
- Room list filters correctly by status
- Room cannot be deleted if has contract history
