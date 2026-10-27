# Business Requirements - Rental House Management System

## 1. Business Summary

### 1.1 System Name

**Rental House Management System** / **He thong quan ly nha tro**

### 1.2 System Objectives

Built to support **landlords / property managers** in managing the entire boarding house operation on a web platform instead of notebooks, paperwork, Excel, or manual memory.

4 core business groups:

- room management
- tenant and contract management
- utility readings, invoices, and payments
- occupancy tracking and revenue monitoring

### 1.3 Current Problems

Traditional boarding house management issues:

- room, tenant, and contract data stored separately
- hard to track which rooms are vacant or occupied
- easy to forget contract deadlines, deposits, outstanding debts
- manual utility recording is error-prone
- monthly billing is time-consuming
- hard to control payment history and receivables
- as room count grows, paper-based management becomes inadequate

### 1.4 System Value

The system helps:

- centralize management data in one place
- reduce operational errors each month
- standardize workflow from tenancy to payment
- quickly retrieve tenant history, contracts, and invoices
- support data-driven decisions instead of relying on memory

### 1.5 MVP Scope

MVP focuses on core business functions:

- login and basic access control
- motel / room management
- tenant management
- contract management
- monthly utility meter reading input
- invoice generation
- payment recording
- basic statistics

---

## 2. Actors

### 2.1 Owner / Admin

Primary actor of the system.

**Role:**
- owns and manages entire motel complex
- configures system settings
- manages rooms, tenants, contracts, invoices, payments
- views reports and statistics

**Permissions:**
- full CRUD on all business data
- activate / terminate contracts
- generate invoices
- confirm payments
- manage users

---

### 2.2 Staff / Manager

Supports daily operations.

**Role:**
- data entry and business updates
- assists with tracking tenants, contracts, utilities, invoices

**Permissions:**
- view rooms, tenants, contracts
- enter utility meter readings
- create or update invoices (within role permissions)
- record payments (within role permissions)

**Restrictions:**
- cannot delete critical data
- cannot change system configuration or users without permission

---

### 2.3 Tenant

Can be activated immediately or deferred to a later phase.

**Role:**
- is the room renter
- monitors own tenancy and payment information

**Permissions:**
- view own contract
- view own invoices
- view own payment history

**Note:** In first MVP, this actor may not need a separate UI; tenant data is still managed by Owner/Staff.

---

## 3. Module List

### 3.1 Auth Module

Handles authentication and authorization.

**Functions:**
- login
- logout
- get current account info
- basic role-based access control

---

### 3.2 User Module

Manages internal user accounts.

**Functions:**
- create staff accounts
- view user list
- update users
- lock / unlock accounts
- assign roles

---

### 3.3 Motel Module

Manages motel complexes / boarding houses.

**Functions:**
- create motel
- update motel information
- view motel list
- configure default pricing: electricity, water, services

---

### 3.4 Room Module

Manages boarding rooms.

**Functions:**
- create room
- update room information
- view room list
- filter by status
- update room status

**Key fields:**
- room code
- room name
- base rent price
- area
- status
- notes

---

### 3.5 Tenant Module

Manages tenants.

**Functions:**
- add tenant
- update tenant information
- view tenant list
- view rental history
- mark tenant status

**Key fields:**
- full name
- national ID (CCCD)
- phone number
- date of birth
- permanent address
- notes

---

### 3.6 Contract Module

Manages rental contracts.

**Functions:**
- create contract
- update contract
- activate contract
- terminate contract
- cancel contract
- view contract list

**Key fields:**
- rented room
- tenant
- start date
- end date
- deposit amount
- contract rent price
- number of occupants
- contract status

---

### 3.7 Meter Reading Module

Manages utility meter readings.

**Functions:**
- enter monthly electricity/water readings
- update readings if not yet locked
- view reading history
- lock billing period data

**Key fields:**
- room
- month / year
- old / new electricity reading
- old / new water reading
- electricity unit price
- water unit price
- lock status

---

### 3.8 Invoice Module

Manages invoices.

**Functions:**
- generate monthly invoice
- view invoice list
- view invoice details
- update draft invoices
- issue invoice
- mark as overdue

**Invoice components:**
- rent
- electricity
- water
- service fee
- surcharge
- discount
- total amount
- due date
- invoice status

---

### 3.9 Payment Module

Manages payments.

**Functions:**
- record payment
- view payment history
- update payment notes
- reconcile total paid against invoice

**Key fields:**
- invoice
- payment amount
- payment date
- payment method
- notes

---

### 3.10 Dashboard / Report Module

Provides summary statistics.

**Functions:**
- total room count
- vacant / occupied room count
- contracts expiring soon
- unpaid invoices count
- total monthly revenue
- total outstanding receivables

---

## 4. Business Rules

### 4.1 General Rules

1. All system operations must be performed by authenticated users.
2. Users may only operate within the permissions of their assigned role.
3. Critical business data must not be hard deleted in MVP; prefer soft delete or status-based handling.
4. Each critical record should have: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.

---

### 4.2 Motel Rules

1. Each motel must have a unique identifying name.
2. Default electricity, water, and service fee prices can be configured per motel.
3. A motel can have multiple rooms.
4. Cannot delete a motel if it has active rooms or related business data.

---

### 4.3 Room Rules

1. Each room must have a unique code within a motel.
2. Each room belongs to exactly one motel.
3. Room statuses: `vacant`, `reserved`, `occupied`, `maintenance`.
4. Cannot delete a room that has had any contract.
5. Cannot set room to `vacant` if it has an active contract.
6. Room base rent is only a default; invoices must prioritize the contract price.

---

### 4.4 Tenant Rules

1. Each tenant must have minimum identifying info: full name, phone number.
2. National ID (CCCD) should be unique if provided.
3. A tenant may participate in multiple contracts over time.
4. Cannot delete a tenant who has any contract history.
5. Tenant statuses: `active`, `inactive`, `blacklisted`.

---

### 4.5 Contract Rules

1. A contract must be linked to at least one room and one representative tenant.
2. A room can only have **one active contract** at any time.
3. Cannot create a new active contract if room already has another active contract.
4. Contract must have: `startDate`, `rentAmount`, `depositAmount`.
5. When contract is activated: room status changes to `occupied`.
6. When contract ends: room status reverts to `vacant` if no subsequent contract exists.
7. When contract is cancelled before taking effect: room does not change to `occupied`.
8. Rent, deposit, and occupant count must be stored directly in the contract as a business snapshot.

---

### 4.6 Meter Reading Rules

1. Each room has only one meter reading record per month/year.
2. Readings can only be entered for rooms with active contracts or currently active rooms.
3. New reading cannot be less than the previous reading.
4. After an invoice is generated from that billing period, the meter reading must be locked or only editable with special permission.
5. Electricity and water unit prices for the billing period must be stored in the record to prevent historical changes.

---

### 4.7 Invoice Rules

1. Each active contract may have at most one invoice per month/year.
2. Invoice must store a snapshot of data at time of creation: room name, representative tenant name, rent price, electricity unit price, water unit price.
3. Invoice statuses: `draft`, `issued`, `partially_paid`, `paid`, `overdue`.
4. Only `draft` invoices can be freely edited.
5. Once `issued`, invoice line items must be tightly controlled and not modified arbitrarily.
6. Invoice total must equal the sum of all components: `rent + electricity + water + serviceFee + surcharge - discount`.

---

### 4.8 Payment Rules

1. One invoice can have multiple payments.
2. Total payments cannot exceed the invoice total.
3. If total payments = 0: invoice remains `issued` or `overdue`.
4. If total payments > 0 but < invoice total: invoice changes to `partially_paid`.
5. If total payments = invoice total: invoice changes to `paid`.
6. Each payment must have: `amount`, `paymentDate`, `paymentMethod`.
7. Confirmed payments cannot be deleted without special permission; use controlled adjustment or reversal mechanism instead.

---

### 4.9 Dashboard Rules

1. Dashboard only displays aggregated data from confirmed business records.
2. Revenue is calculated only from valid payments, not from unpaid invoices.
3. Receivables are calculated from invoices not yet fully paid.
4. Room status on dashboard must be in sync with current contract status.

---

## 5. Core Use Cases

### Owner / Staff

- Login
- Manage Motels
- Manage Rooms
- Manage Tenants
- Manage Contracts
- Record Meter Readings
- Generate Monthly Invoices
- Record Payments
- View Dashboard

### Tenant

- View My Contract
- View My Invoices
- View My Payment History

---

## 6. Deployment Priority

| Priority | Modules |
|----------|---------|
| 1 | Auth, Motel, Room |
| 2 | Tenant, Contract |
| 3 | Meter Reading, Invoice |
| 4 | Payment, Dashboard |
