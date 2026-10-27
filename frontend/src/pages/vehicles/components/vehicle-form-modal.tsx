import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useCreateVehicle, useUpdateVehicle } from '@/hooks/use-vehicles'
import { useTenants } from '@/hooks/use-tenants'
import type { Vehicle, VehicleType } from '@/types'
import type { CreateVehiclePayload } from '@/api/vehicles.api'

interface VehicleFormModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle?: Vehicle
}

const VEHICLE_TYPE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'MOTORCYCLE', label: 'Xe may' },
  { value: 'CAR', label: 'O to' },
  { value: 'BICYCLE', label: 'Xe dap' },
  { value: 'ELECTRIC_BIKE', label: 'Xe dap dien' },
  { value: 'OTHER', label: 'Khac' },
]

const EMPTY_FORM: CreateVehiclePayload = {
  tenantId: '',
  licensePlate: '',
  vehicleType: 'MOTORCYCLE',
  brand: '',
  color: '',
  monthlyFee: undefined,
  description: '',
}

export function VehicleFormModal({ isOpen, onClose, vehicle }: VehicleFormModalProps) {
  const [form, setForm] = useState<CreateVehiclePayload>(EMPTY_FORM)
  const [error, setError] = useState('')

  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const { data: tenantsData } = useTenants({ limit: 200, status: 'ACTIVE' })
  const tenants = tenantsData?.data ?? []

  const isEdit = !!vehicle

  useEffect(() => {
    if (vehicle) {
      setForm({
        tenantId: vehicle.tenantId,
        licensePlate: vehicle.licensePlate,
        vehicleType: vehicle.vehicleType,
        brand: vehicle.brand ?? '',
        color: vehicle.color ?? '',
        monthlyFee: vehicle.monthlyFee,
        description: vehicle.description ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError('')
  }, [vehicle, isOpen])

  const handleClose = () => {
    setForm(EMPTY_FORM)
    setError('')
    onClose()
  }

  const handleChange = <K extends keyof CreateVehiclePayload>(field: K, value: CreateVehiclePayload[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.tenantId) { setError('Vui long chon nguoi thue'); return }
    if (!form.licensePlate.trim()) { setError('Vui long nhap bien so xe'); return }
    if (!form.vehicleType) { setError('Vui long chon loai xe'); return }

    try {
      const payload: CreateVehiclePayload = {
        tenantId: form.tenantId,
        licensePlate: form.licensePlate.trim(),
        vehicleType: form.vehicleType,
        ...(form.brand ? { brand: form.brand.trim() } : {}),
        ...(form.color ? { color: form.color.trim() } : {}),
        ...(form.monthlyFee != null ? { monthlyFee: Number(form.monthlyFee) } : {}),
        ...(form.description ? { description: form.description.trim() } : {}),
      }

      if (isEdit && vehicle) {
        await updateVehicle.mutateAsync({ id: vehicle.id, data: payload })
      } else {
        await createVehicle.mutateAsync(payload)
      }
      handleClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || (isEdit ? 'Cap nhat that bai' : 'Them phuong tien that bai'))
    }
  }

  if (!isOpen) return null

  const isPending = createVehicle.isPending || updateVehicle.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#323235]">
            {isEdit ? 'Chinh sua phuong tien' : 'Them phuong tien moi'}
          </h3>
          <button onClick={handleClose} className="rounded-lg p-1 text-[#7b7a7d] hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tenant select - required */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Nguoi thue *</label>
            <select
              value={form.tenantId}
              onChange={(e) => handleChange('tenantId', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
            >
              <option value="">-- Chon nguoi thue --</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} - {t.phoneNumber}
                </option>
              ))}
            </select>
          </div>

          {/* License plate - required */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Bien so xe *</label>
            <input
              type="text"
              value={form.licensePlate}
              onChange={(e) => handleChange('licensePlate', e.target.value)}
              placeholder="59A1-12345"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Vehicle type - required */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Loai xe *</label>
            <select
              value={form.vehicleType}
              onChange={(e) => handleChange('vehicleType', e.target.value as VehicleType)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
            >
              {VEHICLE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Brand */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#323235]">Nhan hieu</label>
              <input
                type="text"
                value={form.brand ?? ''}
                onChange={(e) => handleChange('brand', e.target.value)}
                placeholder="Honda, Yamaha..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
              />
            </div>

            {/* Color */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#323235]">Mau sac</label>
              <input
                type="text"
                value={form.color ?? ''}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="Do, Den, Trang..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
              />
            </div>
          </div>

          {/* Monthly fee */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Chi phi/thang</label>
            <input
              type="number"
              min={0}
              value={form.monthlyFee ?? ''}
              onChange={(e) => handleChange('monthlyFee', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="VND"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Ghi chu</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              placeholder="Ghi chu them..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#7b7a7d] hover:bg-gray-100"
            >
              Huy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white hover:bg-[#174d8a] disabled:opacity-50"
            >
              {isPending ? 'Dang xu ly...' : isEdit ? 'Luu thay doi' : 'Them phuong tien'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
