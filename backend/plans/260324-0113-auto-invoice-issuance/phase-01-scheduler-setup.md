# Phase 1: Scheduler Setup

## Overview
- Priority: HIGH
- Status: Pending
- Cai dat `@nestjs/schedule` va tao SchedulerModule

## Requirements
- Install `@nestjs/schedule` package
- Import `ScheduleModule.forRoot()` vao AppModule
- Tao `SchedulerModule` + `SchedulerService` voi cron job placeholder

## Related Code Files
- Modify: `package.json`
- Modify: `src/app.module.ts`
- Create: `src/modules/scheduler/scheduler.module.ts`
- Create: `src/modules/scheduler/scheduler.service.ts`

## Implementation Steps

### 1. Install package
```bash
npm install @nestjs/schedule
```

### 2. Tao SchedulerModule
```typescript
// src/modules/scheduler/scheduler.module.ts
@Module({
  imports: [InvoiceModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
```

### 3. Tao SchedulerService
```typescript
// src/modules/scheduler/scheduler.service.ts
@Injectable()
export class SchedulerService {
  constructor(private invoiceService: InvoiceService) {}

  // Auto-generate invoices: chay ngay 1 hang thang luc 00:05
  @Cron('0 5 0 1 * *')
  async handleAutoGenerate() {
    // Phase 2 implement
  }

  // Auto-issue invoices: chay hang ngay luc 09:00
  @Cron('0 0 9 * * *')
  async handleAutoIssue() {
    // Phase 3 implement
  }
}
```

### 4. Import vao AppModule
```typescript
imports: [
  ScheduleModule.forRoot(),
  SchedulerModule,
  // ...existing modules
]
```

## Todo List
- [ ] Install @nestjs/schedule
- [ ] Create scheduler.module.ts
- [ ] Create scheduler.service.ts with cron placeholders
- [ ] Import ScheduleModule.forRoot() in app.module.ts
- [ ] Import SchedulerModule in app.module.ts
- [ ] Verify tsc --noEmit passes

## Success Criteria
- Backend compile ok
- Cron job registered (visible in NestJS startup logs)
- No runtime errors
