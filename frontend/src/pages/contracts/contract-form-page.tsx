import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronRight, Save, X } from 'lucide-react'
import { ContractInfoSection } from './components/contract-info-section'
import { PaymentInfoSection } from './components/payment-info-section'
import { RoomSection } from './components/room-section'
import { TenantSection } from './components/tenant-section'
import { NotesSection } from './components/notes-section'
import { EMPTY_FORM } from './components/contract-form-types'
import type { ContractFormData } from './components/contract-form-types'
import { useContract, useCreateContract, useUpdateContract } from '@/hooks/use-contracts'
import type { AxiosError } from 'axios'

interface ApiErrorResponse {
  message: string | string[]
  statusCode?: number
}

function extractErrorMessage(err: unknown): string {
  // Axios error with response body
  const axiosErr = err as AxiosError<ApiErrorResponse>
  if (axiosErr?.response?.data?.message) {
    const msg = axiosErr.response.data.message
    return Array.isArray(msg) ? msg.join(', ') : msg
  }
  if (err instanceof Error) return err.message
  return 'Co loi xay ra, vui long thu lai'
}

function validateForm(form: ContractFormData): string | null {
  if (!form.roomId) return 'Vui long chon phong thue'
  if (!form.tenantId) return 'Vui long chon khach thue'
  if (!form.startDate) return 'Vui long nhap ngay bat dau'
  if (!form.rentAmount || Number(form.rentAmount) <= 0) return 'Vui long nhap tien thue hop le'
  if (!form.depositAmount && form.depositAmount !== '0') return 'Vui long nhap tien dat coc'
  return null
}

export function ContractFormPage() {
  const navigate = useNavigate()
  const { contractId } = useParams<{ contractId: string }>()
  const [searchParams] = useSearchParams()
  const isEdit = !!contractId

  const { data: existingContract, isLoading } = useContract(contractId ?? '')
  const createContract = useCreateContract()
  const updateContract = useUpdateContract()

  // Pre-fill from query params (e.g. /contracts/new?roomId=xxx&motelId=yyy)
  const prefillRoomId = searchParams.get('roomId') ?? ''
  const prefillMotelId = searchParams.get('motelId') ?? ''

  const [form, setForm] = useState<ContractFormData>({
    ...EMPTY_FORM,
    roomId: prefillRoomId,
    motelId: prefillMotelId,
  })
  const [error, setError] = useState<string | null>(null)

  // Populate form when editing an existing contract
  useEffect(() => {
    if (!isEdit || !existingContract) return
    const rep = existingContract.tenants?.find((t) => t.isRepresentative)
    setForm({
      contractCode: existingContract.contractCode ?? '',
      contractType: '',
      startDate: existingContract.startDate?.slice(0, 10) ?? '',
      endDate: existingContract.endDate?.slice(0, 10) ?? '',
      signedDate: '',
      status: existingContract.status ?? 'DRAFT',
      occupantCount: existingContract.numberOfOccupants ? String(existingContract.numberOfOccupants) : '',
      rentAmount: String(existingContract.rentAmount ?? ''),
      depositAmount: String(existingContract.depositAmount ?? ''),
      serviceFee: '',
      paymentDay: existingContract.paymentDay ? String(existingContract.paymentDay) : '',
      paymentCycle: existingContract.paymentCycle ? existingContract.paymentCycle.toLowerCase() : 'monthly',
      motelId: existingContract.room?.motelId ?? '',
      roomId: existingContract.roomId ?? '',
      tenantId: rep?.tenantId ?? '',
      note: existingContract.notes ?? '',
    })
  }, [isEdit, existingContract])

  function handleChange(field: keyof ContractFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear error when user makes changes
    if (error) setError(null)
  }

  async function handleSubmit() {
    setError(null)

    // Client-side validation
    const validationError = validateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      const payload = {
        roomId: form.roomId,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        signedDate: form.signedDate || undefined,
        rentAmount: Number(form.rentAmount),
        depositAmount: Number(form.depositAmount),
        serviceFee: form.serviceFee ? Number(form.serviceFee) : undefined,
        occupantCount: form.occupantCount ? Number(form.occupantCount) : undefined,
        paymentDay: form.paymentDay ? Number(form.paymentDay) : undefined,
        paymentCycle: form.paymentCycle ? form.paymentCycle.toUpperCase() : undefined,
        note: form.note || undefined,
        tenants: form.tenantId
          ? [{ tenantId: form.tenantId, isRepresentative: true }]
          : [],
      }

      if (isEdit && contractId) {
        await updateContract.mutateAsync({
          id: contractId,
          data: { ...payload, status: form.status as 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED' | undefined },
        })
      } else {
        await createContract.mutateAsync(payload)
      }
      navigate('/contracts')
    } catch (err: unknown) {
      setError(extractErrorMessage(err))
    }
  }

  const isPending = createContract.isPending || updateContract.isPending
  const pageTitle = isEdit ? 'Chinh sua hop dong' : 'Tao hop dong moi'
  const submitLabel = isEdit ? 'Cap nhat hop dong' : 'Luu hop dong'
  const breadcrumbLabel = isEdit ? 'Chinh sua hop dong' : 'Tao hop dong moi'

  // Show loading skeleton when editing and data is being fetched
  if (isEdit && isLoading) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-[#7b7a7d]">Dang tai thong tin hop dong...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-[#7b7a7d]">
        <button onClick={() => navigate('/contracts')} className="hover:text-[#323235]">
          Hop dong
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#323235]">{breadcrumbLabel}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">{pageTitle}</h2>
          {isEdit && form.contractCode && (
            <p className="mt-1 text-sm text-[#7b7a7d]">
              Cap nhat thong tin hop dong thue {form.contractCode}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/contracts')}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Huy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Dang luu...' : submitLabel}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Body: 2-column bento grid */}
      <div className="flex gap-6">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-5">
          <ContractInfoSection isEdit={isEdit} data={form} onChange={handleChange} />
          <PaymentInfoSection data={form} onChange={handleChange} />
        </div>

        {/* Right column */}
        <div className="flex w-[340px] flex-shrink-0 flex-col gap-5">
          <RoomSection data={form} onChange={handleChange} />
          <TenantSection data={form} onChange={handleChange} />
          <NotesSection data={form} onChange={handleChange} />
        </div>
      </div>
    </div>
  )
}
