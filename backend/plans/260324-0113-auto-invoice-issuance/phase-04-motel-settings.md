# Phase 4: Motel Settings - Auto Invoice Toggle

## Overview
- Priority: MEDIUM
- Status: Pending
- Them field `autoInvoice` vao Motel model de bat/tat tu dong phat hanh per-motel

## Requirements
- Add `autoInvoice: Boolean @default(false)` vao Motel model
- API endpoint de update setting
- Chi motels co `autoInvoice = true` moi duoc auto-generate/issue

## Related Code Files
- Modify: `schema.prisma` (Motel model)
- Modify: `src/modules/motel/dto/update-motel.dto.ts`
- Modify: `src/modules/motel/motel.service.ts` (ensure field included in update)

## Implementation Steps

### 1. Add field to Motel model
```prisma
model Motel {
  // ...existing fields
  autoInvoice    Boolean  @default(false) @map("auto_invoice")
}
```

### 2. Run migration
```bash
npx prisma migrate dev --name add_auto_invoice_to_motel
```

### 3. Update UpdateMotelDto
```typescript
@ApiPropertyOptional({ description: 'Enable auto invoice generation' })
@IsOptional()
@IsBoolean()
autoInvoice?: boolean;
```

### 4. Ensure motel update handles new field
Verify `motel.service.ts` update method passes `autoInvoice` to Prisma.

### 5. Include in motel response
Ensure `autoInvoice` field duoc tra ve trong API response (findAll, findOne).

## Todo List
- [ ] Add autoInvoice field to Motel model
- [ ] Run migration
- [ ] Update UpdateMotelDto
- [ ] Verify motel service update logic
- [ ] Verify motel API response includes autoInvoice
- [ ] Verify tsc --noEmit passes

## Success Criteria
- Motel co field autoInvoice, default false
- PATCH /motels/:id co the update autoInvoice
- GET /motels tra ve autoInvoice field
- Existing motels khong bi anh huong (default false)
