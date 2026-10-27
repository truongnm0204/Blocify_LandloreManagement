import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/layouts/main-layout'
import { AuthLayout } from '@/layouts/auth-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { LoginPage } from '@/pages/auth/login-page'
import { LandingPage } from '@/pages/landing/landing-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { FinancialReportPage } from '@/pages/financial/financial-report-page'
import { MotelsPage } from '@/pages/motels/motels-page'
import { MotelFormPage } from '@/pages/motels/motel-form-page'
import { MotelDetailPage } from '@/pages/motels/motel-detail-page'
import { MotelEditPage } from '@/pages/motels/motel-edit-page'
import { RoomsPage } from '@/pages/rooms/rooms-page'
import { RoomDetailPage } from '@/pages/rooms/room-detail-page'
import { TenantsPage } from '@/pages/tenants/tenants-page'
import { TenantDetailPage } from '@/pages/tenants/tenant-detail-page'
import { ContractsPage } from '@/pages/contracts/contracts-page'
import { ContractDetailPage } from '@/pages/contracts/contract-detail-page'
import { ContractFormPage } from '@/pages/contracts/contract-form-page'
import { MeterReadingsPage } from '@/pages/meter-readings/meter-readings-page'
import { MeterReadingInputPage } from '@/pages/meter-readings/meter-reading-input-page'
import { MeterReadingDetailPage } from '@/pages/meter-readings/meter-reading-detail-page'
import { MeterReadingEditPage } from '@/pages/meter-readings/meter-reading-edit-page'
import { InvoicesPage } from '@/pages/invoices/invoices-page'
import { InvoiceDetailPage } from '@/pages/invoices/invoice-detail-page'
import { InvoiceGeneratePage } from '@/pages/invoices/invoice-generate-page'
import { PaymentsPage } from '@/pages/payments/payments-page'
import { ReconciliationPage } from '@/pages/reconciliation/reconciliation-page'
import { ExpensesPage } from '@/pages/expenses/expenses-page'
import { OperatingCostsPage } from '@/pages/operating-costs/operating-costs-page'
import { DepositsPage } from '@/pages/deposits/deposits-page'
import { ReportsPage } from '@/pages/reports/reports-page'
import { FeedbacksPage } from '@/pages/feedbacks/feedbacks-page'
import { FeedbackDetailPage } from '@/pages/feedbacks/feedback-detail-page'
import { UsersPage } from '@/pages/users/users-page'
import { VehiclesPage } from '@/pages/vehicles/vehicles-page'
import { VehicleAddPage } from '@/pages/vehicles/vehicle-add-page'
import { VehicleEditPage } from '@/pages/vehicles/vehicle-edit-page'
import { NotFoundPage } from '@/pages/not-found-page'

export const router = createBrowserRouter([
  {
    path: '/landing',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      // Quan ly toa nha
      { path: 'motels', element: <MotelsPage /> },
      { path: 'motels/new', element: <MotelFormPage /> },
      { path: 'motels/:motelId', element: <MotelDetailPage /> },
      { path: 'motels/:motelId/edit', element: <MotelEditPage /> },
      { path: 'motels/:motelId/rooms', element: <RoomsPage /> },
      { path: 'rooms', element: <RoomsPage /> },
      { path: 'rooms/new', element: <RoomDetailPage /> },
      { path: 'rooms/:roomId', element: <RoomDetailPage /> },
      { path: 'rooms/:roomId/edit', element: <RoomDetailPage /> },
      { path: 'tenants', element: <TenantsPage /> },
      { path: 'tenants/:tenantId', element: <TenantDetailPage /> },
      { path: 'vehicles', element: <VehiclesPage /> },
      { path: 'vehicles/new', element: <VehicleAddPage /> },
      { path: 'vehicles/:vehicleId/edit', element: <VehicleEditPage /> },
      // Ke toan toa nha
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'invoices/new', element: <InvoiceGeneratePage /> },
      { path: 'invoices/:invoiceId', element: <InvoiceDetailPage /> },
      { path: 'expenses', element: <ExpensesPage /> },
      { path: 'contracts', element: <ContractsPage /> },
      { path: 'contracts/new', element: <ContractFormPage /> },
      { path: 'contracts/:contractId', element: <ContractDetailPage /> },
      { path: 'contracts/:contractId/edit', element: <ContractFormPage /> },
      { path: 'meter-readings', element: <MeterReadingsPage /> },
      { path: 'meter-readings/input', element: <MeterReadingInputPage /> },
      { path: 'meter-readings/:readingId', element: <MeterReadingDetailPage /> },
      { path: 'meter-readings/:readingId/edit', element: <MeterReadingEditPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'reconciliation', element: <ReconciliationPage /> },
      { path: 'operating-costs', element: <OperatingCostsPage /> },
      { path: 'deposits', element: <DepositsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'financial', element: <FinancialReportPage /> },
      // Other
      { path: 'feedbacks', element: <FeedbacksPage /> },
      { path: 'feedbacks/:feedbackId', element: <FeedbackDetailPage /> },
      { path: 'users', element: <UsersPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
