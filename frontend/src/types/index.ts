// Core domain types matching backend Prisma schema

export type UserRole = 'OWNER' | 'STAFF'
export type UserStatus = 'ACTIVE' | 'INACTIVE'
export type MotelStatus = 'ACTIVE' | 'INACTIVE'
export type RoomStatus = 'VACANT' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE'
export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED'
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED'
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE'
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'OTHER'
export type FeedbackStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type FeedbackCategory = 'MAINTENANCE' | 'NOISE' | 'UTILITIES' | 'SECURITY' | 'CLEANLINESS' | 'OTHER'
export type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface User {
  id: string
  email: string
  fullName: string
  phoneNumber?: string
  role: UserRole
  status: UserStatus
  createdAt: string
}

export interface Motel {
  id: string
  name: string
  address?: string
  description?: string
  defaultElectricityPrice: number
  defaultWaterPrice: number
  defaultServiceFee: number
  paymentDueDay?: number
  images?: string[]
  status: MotelStatus
  autoInvoice?: boolean
  createdAt: string
}

export interface Room {
  id: string
  motelId: string
  roomCode: string
  name: string
  baseRent: number
  area?: number
  floor?: number
  maxOccupants?: number
  status: RoomStatus
  notes?: string
  contracts?: {
    id: string
    contractCode?: string
    status: ContractStatus
    tenants?: { id: string; tenantId: string; isRepresentative: boolean; tenant?: { id: string; fullName: string } }[]
  }[]
}

export interface Tenant {
  id: string
  fullName: string
  phoneNumber: string
  email?: string
  citizenId?: string
  dateOfBirth?: string
  gender?: string
  permanentAddress?: string
  vehicleNumber?: string
  note?: string
  status: TenantStatus
  createdAt?: string
  updatedAt?: string
  // Included in list response: active contract with room & motel info
  contractTenants?: {
    contract: {
      id: string
      contractCode: string
      status: string
      room?: {
        id: string
        roomCode: string
        roomName: string
        motel?: { id: string; name: string }
      }
    }
  }[]
}

// Tenant detail includes contract history
export interface TenantWithContracts extends Tenant {
  contractTenants?: {
    id: string
    tenantId: string
    contract: {
      id: string
      contractCode: string
      status: string
      startDate: string
      endDate?: string
      room?: { id: string; roomCode: string; roomName: string }
    }
  }[]
}

export interface Contract {
  id: string
  contractCode?: string
  roomId: string
  motelId?: string
  startDate: string
  endDate?: string
  signedDate?: string
  rentAmount: number
  depositAmount: number
  serviceFee?: number
  numberOfOccupants?: number
  paymentDay?: number | null
  paymentCycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  status: ContractStatus
  notes?: string
  room?: Room
  motel?: { id: string; name: string; address?: string }
  tenants?: ContractTenant[]
  representativeTenant?: { id: string; fullName: string; phoneNumber?: string }
  contractTenants?: { id: string; tenantId: string; isRepresentative: boolean; tenant?: { id: string; fullName: string; phoneNumber?: string; citizenId?: string } }[]
}

export interface ContractTenant {
  id: string
  tenantId: string
  isRepresentative: boolean
  tenant?: Tenant
}

export interface MeterReading {
  id: string
  roomId: string
  motelId: string
  contractId?: string
  readingMonth: number
  readingYear: number
  electricityPrevious: number
  electricityCurrent: number
  electricityUsage: number
  electricityUnitPrice: number
  waterPrevious: number
  waterCurrent: number
  waterUsage: number
  waterUnitPrice: number
  isLocked: boolean
  recordedDate?: string
  note?: string
  createdAt?: string
  room?: {
    id: string
    roomCode: string
    roomName: string
    /** Active contract with representative tenant — populated by GET /meter-readings list */
    contracts?: { id: string; contractCode: string; representativeTenant?: { id: string; fullName: string } | null }[]
  }
  motel?: { id: string; name: string }
  contract?: {
    id: string
    contractCode: string
    tenants?: { id: string; tenantId: string; isRepresentative: boolean; tenant?: { id: string; fullName: string; phoneNumber: string } }[]
  }
}

export interface MeterReadingStats {
  estimatedRevenue: number
  totalElectricity: number
  totalWater: number
  totalElectricityOld: number
  totalElectricityNew: number
  totalWaterOld: number
  totalWaterNew: number
  progress: {
    totalRooms: number
    recorded: number
    locked: number
    unlocked: number
  }
  growth: {
    month: string
    electricity: number
    water: number
  }[]
}

export type InvoiceItemType = 'ROOM_RENT' | 'ELECTRICITY' | 'WATER' | 'SERVICE_FEE' | 'SURCHARGE' | 'DISCOUNT' | 'OTHER'

export interface InvoiceItem {
  id: string
  invoiceId: string
  itemType: InvoiceItemType
  description: string
  quantity?: number
  unitPrice?: number
  amount: number
  sortOrder: number
}

export interface Invoice {
  id: string
  invoiceCode: string
  motelId: string
  roomId: string
  contractId: string
  representativeTenantId: string
  meterReadingId?: string
  invoiceMonth: number
  invoiceYear: number
  billingDate: string
  dueDate?: string
  roomSnapshot: string
  tenantSnapshot: string
  rentAmount: number
  electricityAmount: number
  waterAmount: number
  serviceFeeAmount: number
  surchargeAmount: number
  discountAmount: number
  totalAmount: number
  paidAmount: number
  status: InvoiceStatus
  autoGenerated?: boolean
  note?: string
  createdAt?: string
  room?: { id: string; roomCode: string; roomName: string }
  motel?: { id: string; name: string }
  contract?: { id: string; contractCode: string }
  representativeTenant?: { id: string; fullName: string }
  meterReading?: MeterReading
  invoiceItems?: InvoiceItem[]
  payments?: Payment[]
}

export interface Payment {
  id: string
  invoiceId: string
  paymentCode?: string
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  referenceNumber?: string
  note?: string
}

export interface Feedback {
  id: string
  title: string
  description: string
  category: FeedbackCategory
  priority: FeedbackPriority
  status: FeedbackStatus
  images: string[]
  resolution?: string
  tenantId: string
  motelId: string
  roomId?: string
  createdById: string
  assignedToId?: string
  createdAt: string
  updatedAt: string
  tenant?: { id: string; fullName: string; phoneNumber: string }
  motel?: { id: string; name: string }
  room?: { id: string; roomCode: string; roomName: string }
  createdBy?: { id: string; fullName: string }
  assignedTo?: { id: string; fullName: string }
}

export interface FeedbackStats {
  new: number
  inProgress: number
  resolved: number
  closed: number
  total: number
}

// Extended motel type with aggregated room stats (returned by backend GET /motels list)
export interface MotelWithStats extends Motel {
  totalRooms: number
  occupiedRooms: number
  vacantRooms: number
  maintenanceRooms?: number
  monthlyRevenue?: number
  revenueChange?: number
}

// Motel detail response from GET /motels/:id (nested stats object)
export interface MotelDetail extends Motel {
  stats: {
    totalRooms: number
    occupiedRooms: number
    vacantRooms: number
    maintenanceRooms: number
    monthlyRevenue: number
  }
}

// Room with currentTenant from GET /motels/:motelId/rooms
export interface RoomWithTenant extends Room {
  currentTenant: { id: string; fullName: string } | null
}

// Generic API response wrappers
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// Backend response uses meta wrapper
export interface PaginatedApiResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

// Payment with relations (as returned by backend list/detail endpoints)
export interface PaymentWithRelations extends Payment {
  invoice?: {
    id: string
    invoiceCode: string
    totalAmount: number
    paidAmount: number
    status: InvoiceStatus
    invoiceMonth?: number
    invoiceYear?: number
    room?: { id: string; roomCode: string; roomName: string }
  }
  recordedBy?: {
    id: string
    fullName: string
  }
}

// Dashboard API response shape
export interface DashboardData {
  rooms: {
    total: number
    vacant: number
    occupied: number
    maintenance: number
    occupancyRate: number
  }
  contracts: {
    active: number
    expiringSoon: number
  }
  invoices: {
    unpaid: number
    overdue: number
  }
  finance: {
    monthlyRevenue: number
    totalReceivables: number
    totalExpenses: number
    netProfit: number
  }
}

// Dashboard report types
export interface RevenueTrend {
  month: string
  revenue: number
  expenses: number
}

export interface ExpenseBreakdown {
  category: string
  amount: number
  percentage: number
}

export interface MotelOccupancy {
  motelId: string
  name: string
  occupancyRate: number
  total: number
  occupied: number
}

export interface RecentTransaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: 'income' | 'expense'
}

export interface ApiError {
  statusCode: number
  message: string
  timestamp: string
}

export type VehicleType = 'MOTORCYCLE' | 'CAR' | 'BICYCLE' | 'ELECTRIC_BIKE' | 'OTHER'
export type VehicleStatus = 'ACTIVE' | 'INACTIVE'

export type ExpenseCategory = 'MAINTENANCE' | 'UTILITIES' | 'SUPPLIES' | 'CLEANING' | 'SECURITY' | 'OTHER'
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED'

export interface Expense {
  id: string
  motelId: string
  category: ExpenseCategory
  amount: number
  description: string
  note?: string
  date: string
  status: ExpenseStatus
  images?: string[]
  createdAt: string
  updatedAt: string
  motel?: { id: string; name: string }
}

export interface Vehicle {
  id: string
  tenantId: string
  motelId?: string
  licensePlate: string
  vehicleType: VehicleType
  brand?: string
  color?: string
  monthlyFee?: number
  description?: string
  images?: string[]
  status: VehicleStatus
  createdAt?: string
  updatedAt?: string
  motel?: { id: string; name: string }
  tenant?: {
    id: string
    fullName: string
    phoneNumber: string
    contractTenants?: {
      contract: {
        id: string
        status: string
        room?: { id: string; roomCode: string; roomName: string }
        motel?: { id: string; name: string }
      }
    }[]
  }
}
