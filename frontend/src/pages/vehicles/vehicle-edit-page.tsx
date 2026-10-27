import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useVehicle, useUpdateVehicle } from '@/hooks/use-vehicles'
import { useTenants } from '@/hooks/use-tenants'
import { useMotels } from '@/hooks/use-motels'
import { useImageUpload } from '@/hooks/use-image-upload'
import { VehicleImageUpload } from './components/vehicle-image-upload'
import type { VehicleType } from '@/types'
import type { UpdateVehiclePayload } from '@/api/vehicles.api'

const VEHICLE_TYPE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'MOTORCYCLE', label: 'Xe may' },
  { value: 'CAR', label: 'O to' },
  { value: 'BICYCLE', label: 'Xe dap' },
  { value: 'ELECTRIC_BIKE', label: 'Xe dap dien' },
  { value: 'OTHER', label: 'Khac' },
]

const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  MOTORCYCLE: 'Xe may',
  CAR: 'O to',
  BICYCLE: 'Xe dap',
  ELECTRIC_BIKE: 'Xe dap dien',
  OTHER: 'Khac',
}

const PARKING_RULES = [
  'Moi phong toi da 2 phuong tien',
  'Phi gui xe may: 100,000 d/thang',
  'Phi gui o to: 500,000 d/thang',
  'Luon khoa xe va giu ve gui xe',
]

export function VehicleEditPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const navigate = useNavigate()

  const { data: vehicle, isLoading: isLoadingVehicle } = useVehicle(vehicleId ?? '')
  const { data: tenantsData } = useTenants({ limit: 200, status: 'ACTIVE' })
  const { data: motelsData } = useMotels(1, 100)
  const updateVehicle = useUpdateVehicle()
  const imageUpload = useImageUpload()

  const tenants = tenantsData?.data ?? []
  const motels = motelsData?.data ?? []

  const [form, setForm] = useState({
    vehicleType: '' as VehicleType,
    brand: '',
    licensePlate: '',
    color: '',
    monthlyFee: '' as string | number,
    description: '',
    tenantId: '',
    motelId: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form when vehicle data loads
  useEffect(() => {
    if (vehicle) {
      // Try to derive motelId from tenant's active contract if not set directly
      const contractMotelId = vehicle.tenant?.contractTenants?.find(
        (ct) => ct.contract.status === 'ACTIVE' && ct.contract.motel,
      )?.contract.motel?.id

      setForm({
        vehicleType: vehicle.vehicleType,
        brand: vehicle.brand ?? '',
        licensePlate: vehicle.licensePlate,
        color: vehicle.color ?? '',
        monthlyFee: vehicle.monthlyFee ?? '',
        description: vehicle.description ?? '',
        tenantId: vehicle.tenantId,
        motelId: vehicle.motelId ?? vehicle.motel?.id ?? contractMotelId ?? '',
      })
      setImages(vehicle.images ?? [])
    }
  }, [vehicle])

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFilesSelected = async (files: File[]) => {
    try {
      const urls = await imageUpload.uploadImages(files)
      setImages((prev) => [...prev, ...urls])
    } catch {
      // error handled by hook
    }
  }

  const handleRemoveImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.tenantId) { setError('Vui long chon chu xe'); return }
    if (!form.licensePlate.trim()) { setError('Vui long nhap bien so xe'); return }
    if (!form.vehicleType) { setError('Vui long chon loai phuong tien'); return }

    try {
      setIsSubmitting(true)
      const payload: UpdateVehiclePayload = {
        tenantId: form.tenantId,
        licensePlate: form.licensePlate.trim(),
        vehicleType: form.vehicleType,
        // Always send motelId: string value to assign, null/empty to clear
        motelId: form.motelId || undefined,
        ...(form.brand ? { brand: form.brand.trim() } : {}),
        ...(form.color ? { color: form.color.trim() } : {}),
        ...(form.monthlyFee !== '' ? { monthlyFee: Number(form.monthlyFee) } : {}),
        ...(form.description ? { description: form.description.trim() } : {}),
        images,
      }
      await updateVehicle.mutateAsync({ id: vehicleId!, data: payload })
      navigate('/vehicles')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Cap nhat phuong tien that bai')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Derive room info from tenant's active contract
  const selectedTenant = tenants.find((t) => t.id === form.tenantId) ?? vehicle?.tenant
  const activeContract = selectedTenant?.contractTenants?.find(
    (ct) => ct.contract.status === 'ACTIVE',
  )
  const roomLabel = activeContract?.contract.room
    ? `${activeContract.contract.room.roomCode}${activeContract.contract.room.roomName ? ' - ' + activeContract.contract.room.roomName : ''}`
    : ''

  if (isLoadingVehicle) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-[#7b7a7d]">Khong tim thay phuong tien.</p>
        <Link to="/vehicles" className="mt-2 inline-block text-sm text-[#1d5fa8] hover:underline">
          Quay lai danh sach
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px]">
        <Link to="/dashboard" className="text-[#94a3b8] hover:text-[#1d5fa8]">Trang chu</Link>
        <ChevronRight className="h-3.5 w-3.5 text-[#94a3b8]" />
        <Link to="/vehicles" className="text-[#1d5fa8] hover:underline">Phuong tien</Link>
        <ChevronRight className="h-3.5 w-3.5 text-[#94a3b8]" />
        <span className="font-semibold text-[#323235]">Chinh sua phuong tien</span>
      </nav>

      {/* Header row */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#323235]">Chinh sua phuong tien</h1>
          <p className="mt-1 text-sm text-[#5f5f61]">Cap nhat thong tin phuong tien da dang ky</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/vehicles"
            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#5f5f61] transition-colors hover:bg-gray-50"
          >
            Huy
          </Link>
          <button
            type="submit"
            form="vehicle-edit-form"
            disabled={isSubmitting}
            className="rounded-lg bg-[#1d5fa8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#174d8a] disabled:opacity-50"
          >
            {isSubmitting ? 'Dang cap nhat...' : 'Cap nhat'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content columns */}
      <form id="vehicle-edit-form" onSubmit={handleSubmit} className="flex gap-6">
        {/* Left column: Form */}
        <div className="flex w-[600px] flex-shrink-0 flex-col gap-5">
          {/* Card 1: Vehicle info */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h2 className="mb-4 text-base font-bold text-[#323235]">Thong tin phuong tien</h2>
            <div className="flex flex-col gap-4">
              {/* Row 1: Type + Brand */}
              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Loai phuong tien *">
                  <select
                    value={form.vehicleType}
                    onChange={(e) => handleChange('vehicleType', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
                  >
                    <option value="">-- Chon loai xe --</option>
                    {VEHICLE_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </FieldWrapper>
                <FieldWrapper label="Nhan hieu *">
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    placeholder="Honda Wave"
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-[#323235] placeholder:text-[#94a3b8] focus:border-[#1d5fa8] focus:outline-none"
                  />
                </FieldWrapper>
              </div>

              {/* Row 2: License plate + Color */}
              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Bien so xe *">
                  <input
                    type="text"
                    value={form.licensePlate}
                    onChange={(e) => handleChange('licensePlate', e.target.value)}
                    placeholder="59F1-12345"
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-[#323235] placeholder:text-[#94a3b8] focus:border-[#1d5fa8] focus:outline-none"
                  />
                </FieldWrapper>
                <FieldWrapper label="Mau sac">
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    placeholder="Do, Den, Trang..."
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-[#323235] placeholder:text-[#94a3b8] focus:border-[#1d5fa8] focus:outline-none"
                  />
                </FieldWrapper>
              </div>
            </div>
          </div>

          {/* Card 2: Owner & room info */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h2 className="mb-4 text-base font-bold text-[#323235]">Thong tin chu xe & phong</h2>
            <div className="flex flex-col gap-4">
              {/* Row: Motel + Room */}
              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Toa nha">
                  <select
                    value={form.motelId}
                    onChange={(e) => handleChange('motelId', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
                  >
                    <option value="">-- Chon toa nha --</option>
                    {motels.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </FieldWrapper>
                <FieldWrapper label="Phong *">
                  <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-[#5f5f61]">
                    {roomLabel || 'Tu dong theo nguoi thue'}
                  </div>
                </FieldWrapper>
              </div>
              {/* Row: Tenant */}
              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Chu xe (Nguoi thue) *">
                  <select
                    value={form.tenantId}
                    onChange={(e) => handleChange('tenantId', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
                  >
                    <option value="">-- Chon nguoi thue --</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} - {t.phoneNumber}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>
              </div>

              {/* Row: Monthly fee */}
              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Phi gui xe / thang">
                  <input
                    type="number"
                    min={0}
                    value={form.monthlyFee}
                    onChange={(e) => handleChange('monthlyFee', e.target.value)}
                    placeholder="100,000"
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-[#323235] placeholder:text-[#94a3b8] focus:border-[#1d5fa8] focus:outline-none"
                  />
                </FieldWrapper>
              </div>
            </div>
          </div>

          {/* Card 3: Notes */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h2 className="mb-3 text-base font-bold text-[#323235]">Ghi chu</h2>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              placeholder="Ghi chu them ve phuong tien..."
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-[#323235] placeholder:text-[#94a3b8] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>
        </div>

        {/* Right column: Photo & Info */}
        <div className="flex w-[340px] flex-col gap-5">
          {/* Photo card */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h2 className="mb-3 text-base font-bold text-[#323235]">Hinh anh phuong tien</h2>
            <VehicleImageUpload
              images={images}
              isUploading={imageUpload.isUploading}
              progress={imageUpload.progress}
              onFilesSelected={handleFilesSelected}
              onRemove={handleRemoveImage}
            />
          </div>

          {/* Parking rules card */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h2 className="mb-3 text-base font-bold text-[#323235]">Quy dinh gui xe</h2>
            <div className="flex flex-col gap-2.5">
              {PARKING_RULES.map((rule, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#1d5fa8]" />
                  <span className="text-[13px] text-[#5f5f61]">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current info summary */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
            <h2 className="mb-3 text-base font-bold text-[#323235]">Thong tin hien tai</h2>
            <div className="flex flex-col gap-2.5 text-sm">
              <InfoRow label="Loai xe" value={VEHICLE_TYPE_LABEL[vehicle.vehicleType] ?? vehicle.vehicleType} />
              <InfoRow label="Bien so" value={vehicle.licensePlate} />
              <InfoRow label="Chu xe" value={vehicle.tenant?.fullName ?? '-'} />
              <InfoRow
                label="Trang thai"
                value={vehicle.status === 'ACTIVE' ? 'Hoat dong' : 'Ngung'}
                valueClass={vehicle.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}
              />
              {vehicle.createdAt && (
                <InfoRow label="Ngay dang ky" value={new Date(vehicle.createdAt).toLocaleDateString('vi-VN')} />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

/* ---------- Helper components ---------- */

function FieldWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-[#323235]">{label}</label>
      {children}
    </div>
  )
}

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#94a3b8]">{label}</span>
      <span className={`font-medium text-[#323235] ${valueClass ?? ''}`}>{value}</span>
    </div>
  )
}
