# Phase 1 Implementation Report

**Date:** 2026-03-21
**Status:** Complete - 0 TypeScript errors

---

## Files Created

### Common Infrastructure
- `src/common/guards/jwt-auth.guard.ts` - extends AuthGuard('jwt')
- `src/common/guards/roles.guard.ts` - checks @Roles() against req.user.role via Reflector
- `src/common/decorators/current-user.decorator.ts` - extracts req.user from ExecutionContext
- `src/common/decorators/roles.decorator.ts` - SetMetadata wrapper for UserRole[]
- `src/common/filters/http-exception.filter.ts` - global filter returning { statusCode, message, timestamp }

### Auth Module (src/modules/auth/)
- `auth.module.ts` - registers JwtModule (secret from env, 7d expiry), PassportModule, JwtStrategy
- `auth.controller.ts` - POST /auth/login (public), POST /auth/logout (JWT), GET /auth/me (JWT)
- `auth.service.ts` - bcrypt comparison, 401 on bad creds, 403 on INACTIVE user
- `strategies/jwt.strategy.ts` - validates JWT payload, returns { id, email, role }
- `dto/login.dto.ts` - IsEmail + IsString + MinLength(6)

### User Module (src/modules/user/)
- `user.module.ts`
- `user.controller.ts` - all routes @Roles(OWNER), @UseGuards(JwtAuthGuard, RolesGuard)
- `user.service.ts` - paginated findAll, create with bcrypt hash, update with self-role-change guard, updateStatus toggle with self-lock guard
- `dto/create-user.dto.ts`, `dto/update-user.dto.ts`, `dto/query-user.dto.ts`

### Motel Module (src/modules/motel/)
- `motel.module.ts`
- `motel.controller.ts` - GET/findAll+findOne authenticated; POST/PATCH/DELETE OWNER only
- `motel.service.ts` - owner-scoped queries, name uniqueness per owner, block deactivate if OCCUPIED rooms, Decimal serialized via parseFloat
- `dto/create-motel.dto.ts`, `dto/update-motel.dto.ts`

### Room Module (src/modules/room/)
- `room.module.ts`
- `room.controller.ts` - nested under /motels/:motelId/rooms; GET authenticated; POST/PATCH OWNER+STAFF; DELETE OWNER only
- `room.service.ts` - motel ownership verification on every operation, roomCode unique per motel, status transition guards (no VACANT with active contract, no manual OCCUPIED), contract history check before hard delete
- `dto/create-room.dto.ts`, `dto/update-room.dto.ts`, `dto/query-room.dto.ts`

### Updated Files
- `src/app.module.ts` - added AuthModule, UserModule, MotelModule, RoomModule imports
- `src/main.ts` - added useGlobalFilters(new HttpExceptionFilter())

---

## Key Design Decisions

- **No @nestjs/config** - not installed; JWT secret read directly from `process.env.JWT_SECRET` with fallback
- **Decimal serialization** - all Prisma Decimal fields converted with parseFloat() before returning
- **Motel ownership for STAFF** - room endpoints verify motel ownership via ownerId (req.user.id); STAFF accessing rooms must belong to owner's motel. Note: current design ties all motel access to ownerId. If STAFF needs independent motel access, a motel-staff join table would be needed in a future phase.
- **Room hard delete** - only allowed when no contracts exist at all (not just active ones); soft delete alternative blocked by plan spec (no status field removal)
- **RolesGuard usage** - applied per-route with @UseGuards(RolesGuard) rather than globally to allow mixed-auth controllers

---

## Unresolved Questions

1. **STAFF motel access**: Room endpoints verify motelId belongs to `req.user.id` (ownerId). STAFF users have no ownerId relationship in schema - they cannot currently list/create rooms unless their user.id matches ownerId. A STAFF-to-Motel assignment table may be needed in Phase 2.
2. **Password reset**: No endpoint defined in Phase 1 plan; OWNER can update staff but not change passwords.
3. **Pagination on motels**: Not implemented (no total count returned) - plan did not specify pagination for motel list.
