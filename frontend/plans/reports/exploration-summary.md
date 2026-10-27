# Project Structure & Navigation Analysis

## Frontend Project Structure

### Location
`C:/Users/Admin/Desktop/4user/EXE/frontend/`

### Navigation & Sidebar Component
**File:** `src/layouts/main-layout.tsx`

#### Menu Item Pattern (TypeScript Type)
```typescript
type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  children?: NavItem[]
  /** Visual section divider label before this item */
  sectionLabel?: string
}
```

#### Main Menu Items (mainNavItems array, line 41-74)
The menu is organized hierarchically:

1. **Dashboard** (`/dashboard`) - Bang dieu khien
2. **Quan ly toa nha** (Property Management) - `/motels`
   - Quan ly phong (Rooms) - `/rooms`
   - Quan ly nguoi thue (Tenants) - `/tenants`
   - Quan ly phuong tien (Vehicles) - `/vehicles`

3. **Ke toan toa nha** (Accounting) - `/accounting`
   - **Tai chinh** (Finance Section)
     - Hoa don thu (Invoices) - `/invoices`
     - Chi phi (Expenses) - `/expenses`
   - **Quan ly** (Management Section)
     - Hop dong & Cong no (Contracts) - `/contracts`
     - Dien nuoc (Meter readings) - `/meter-readings`
     - **Thu tien & Doi soat (Payments & Reconciliation)** - `/payments`
     - Chi phi van hanh (Operating costs) - `/operating-costs`
     - Ky quy & So sach (Deposits) - `/deposits`
   - **Bao cao** (Reports Section)
     - Bao cao tai chinh (Financial reports) - `/financial`

4. **Y kien cu dan** (Feedbacks) - `/feedbacks`
5. **Nguoi dung** (Users) - `/users`
6. **Cai dat** (Settings) - `/settings`

#### Bottom Menu Items (bottomNavItems)
- **Tro giup** (Help) - `/help`

#### Header Tabs (headerTabs)
- Danh muc (Catalog) - `/motels`
- Khach thue (Tenants) - `/tenants`
- Phan tich (Reports) - `/reports`
- Bao cao (Financial) - `/financial`

#### UI Components in Sidebar
- Collapsible groups with ChevronDown/ChevronRight icons
- Active states: Blue background (#1d5fa8), white text
- Hover states: Light gray background, darker text
- Section dividers with sectionLabel (small caps, gray text)
- Icons from lucide-react library
- Width: 64 (w-64 = 256px)

---

## Frontend Router Configuration

**File:** `src/router/index.tsx`

### Reconciliation Route (Line 90)
```typescript
{ path: 'reconciliation', element: <ReconciliationPage /> }
```

**Status:** Route ALREADY EXISTS ✓

### Page Import (Line 28)
```typescript
import { ReconciliationPage } from '@/pages/reconciliation/reconciliation-page'
```

### Reconciliation Page Location
`src/pages/reconciliation/reconciliation-page.tsx`

**Components used:**
- `ReconciliationUpload` - File upload component
- `ReconciliationResultsTable` - Results display
- Uses AI parsing via `parsePaymentBatch()` utility
- Integrates with `/payments` API to create payments
- Uses hooks: `useInvoices()`, `useCreatePayment()`

---

## Backend Project Structure

### Location
`C:/Users/Admin/Desktop/4user/EXE/backend/`

### Module Structure
Follows NestJS patterns with standard module organization:
```
src/modules/
├── auth/
├── contract/
├── dashboard/
├── expense/
├── feedback/
├── invoice/
├── meter-reading/
├── motel/
├── payment/
├── room/
├── scheduler/
├── tenant/
├── upload/
├── user/
└── vehicle/
```

**NOTE:** NO reconciliation module exists yet

### Module Pattern (src/modules/{feature}/)
Each module contains:
1. `{feature}.module.ts` - NestJS module definition
2. `{feature}.controller.ts` - API endpoints
3. `{feature}.service.ts` - Business logic
4. `dto/` - Data transfer objects directory

### Example: Payment Module (src/modules/payment/)

#### Files Structure
```
payment/
├── dto/
│   ├── create-payment.dto.ts
│   ├── update-payment.dto.ts
│   └── query-payment.dto.ts
├── payment.controller.ts
├── payment.module.ts
└── payment.service.ts
```

#### Controller Pattern (payment.controller.ts)
```typescript
@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get()
  findAll(@Query() query: QueryPaymentDto) { ... }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: { id: string }) { ... }

  @Get(':id')
  findOne(@Param('id') id: string) { ... }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.STAFF)
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) { ... }
}
```

#### Module Pattern (payment.module.ts)
```typescript
@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
```

#### Service Pattern (payment.service.ts)
- Constructor injection of `PrismaService`
- Serialization helpers (e.g., `serializePayment()`)
- CRUD operations with type safety
- Includes related entity includes (invoice, recordedBy user)
- Pagination support in query methods

### App Module (src/app.module.ts)
Module imports all feature modules:
```typescript
imports: [
  PrismaModule,
  ScheduleModule.forRoot(),
  AuthModule, UserModule, MotelModule, RoomModule, TenantModule,
  ContractModule, MeterReadingModule, InvoiceModule,
  PaymentModule, FeedbackModule, DashboardModule,
  UploadModule, VehicleModule, ExpenseModule, SchedulerModule,
]
```

---

## Key Integration Points

### Frontend → Backend Communication

#### Reconciliation Flow (Frontend)
1. User uploads bank statement file (Excel/CSV)
2. File parsed via `parsePaymentBatch()` (AI parsing at localhost:8100)
3. Results matched to invoices using fuzzy matching:
   - Invoice code exact match
   - Room code + month/year
   - Room code + month
   - Unpaid invoices for room
4. User confirms matches
5. For each matched result, calls `createPayment()` hook
6. Payment created via `POST /payments` endpoint

#### Expected Reconciliation Module to Handle
- Batch payment reconciliation
- AI-powered OCR/parsing coordination
- Matching algorithm optimization
- Batch confirmation/rejection
- Audit trail for reconciliations

### Authentication & Authorization Pattern
- JWT-based authentication via `JwtAuthGuard`
- Role-based access control via `RolesGuard`
- Roles: `OWNER`, `STAFF`, `TENANT`
- Current user injection via `@CurrentUser()` decorator

---

## Database Schema References
- `Invoice` - invoiceCode, totalAmount, paidAmount, status, room (relation)
- `Payment` - amount, paymentDate, paymentMethod, note, invoice (relation), recordedBy (relation)
- `Room` - roomCode, roomName
- `Tenant` - fullName, phone, email
- `User` - fullName, email, role

---

## Summary

### Navigation Sidebar Location
- **File:** `src/layouts/main-layout.tsx`
- **Menu Items Array:** mainNavItems (line 41-74)
- **Type Definition:** NavItem interface (line 32-39)
- **Reconciliation Link:** Not visible in main menu yet (feature under "/payments" → "Thu tien & Doi soat")
- **Current Route:** Available at `/reconciliation` in router

### Backend Module Structure
- **Pattern:** Standard NestJS module with Controller/Service separation
- **Module Pattern Location:** `src/modules/payment/` (use as template)
- **App Registration:** `src/app.module.ts` imports all modules
- **Reconciliation Module:** Does NOT exist yet (needs to be created)

### Key Architectural Decisions
1. Modular NestJS backend - each feature is isolated
2. Centralized AppModule for feature registration
3. Frontend uses layout composition - sidebar is in MainLayout
4. Reconciliation is a payment-related feature (should live in payment context or own module)
5. Menu structure mirrors backend module organization
