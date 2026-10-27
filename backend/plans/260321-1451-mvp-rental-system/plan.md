# MVP Rental House Management System - Implementation Plan

- Business: `docs/business-requirements.md` (root EXE project)
- Schema: `schema.prisma`
- Stack: NestJS + Prisma + PostgreSQL

## Status

| Phase | Modules | Status |
|-------|---------|--------|
| Phase 1 | Auth, Motel, Room | Done |
| Phase 2 | Tenant, Contract | Done |
| Phase 3 | Meter Reading, Invoice | Pending |
| Phase 4 | Payment, Dashboard | Pending |

## Phase Files

- [Phase 1 - Auth, Motel, Room](./phase-01-auth-motel-room.md)
- [Phase 2 - Tenant, Contract](./phase-02-tenant-contract.md)
- [Phase 3 - Meter Reading, Invoice](./phase-03-meter-reading-invoice.md)
- [Phase 4 - Payment, Dashboard](./phase-04-payment-dashboard.md)

## Architecture

```
src/
  modules/
    auth/           # JWT auth, login, logout, profile
    user/           # User CRUD, role management
    motel/          # Motel CRUD, default pricing config
    room/           # Room CRUD, status management
    tenant/         # Tenant CRUD
    contract/       # Contract lifecycle
    meter-reading/  # Monthly utility readings
    invoice/        # Invoice generation & management
    payment/        # Payment recording
    dashboard/      # Aggregated stats
  common/
    guards/         # JwtAuthGuard, RolesGuard
    decorators/     # @CurrentUser, @Roles
    filters/        # Global exception filter
    interceptors/   # Response transform
  prisma/           # Already exists at root prisma/
```

## Code Rules

- Each module: `module.ts`, `controller.ts`, `service.ts`, `dto/`
- DTOs: `create-*.dto.ts`, `update-*.dto.ts`, `query-*.dto.ts`
- Use `class-validator` on all DTOs
- All routes require `JwtAuthGuard` except `POST /auth/login`
- Role guard: `@Roles(UserRole.OWNER)` for owner-only endpoints
- Services throw `HttpException` / NestJS built-in exceptions
- No hard delete on business data (use status or `deletedAt`)
- Soft delete pattern: set `status = INACTIVE` or add `deletedAt` field
- Decimal fields: always return as `number` in response (use `parseFloat`)
- Snapshot fields (invoices): store JSON string, parse on response
- `createdById` / `updatedById`: always set from `req.user.id`

## Shared Patterns

### Controller pattern
```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('motels')
export class MotelController {
  constructor(private readonly motelService: MotelService) {}
}
```

### Service error pattern
```ts
if (!entity) throw new NotFoundException('Motel not found');
if (conflict) throw new ConflictException('...');
```

### DTO pattern
```ts
export class CreateMotelDto {
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() @IsOptional() electricityPrice?: number;
}
```

## Key Business Constraints (enforce in service layer)

- Room: unique code per motel; no delete if has contracts
- Contract: one active per room at a time; activating sets room = OCCUPIED
- Meter Reading: unique per room+month+year; lock after invoice created
- Invoice: unique per contract+month+year; total = sum of line items
- Payment: sum cannot exceed invoice total; auto-update invoice status
