import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreateTenant } from '@/hooks/use-tenants'
import type { CreateTenantPayload } from '@/api/tenants.api'

interface TenantFormModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TenantFormModal({ isOpen, onClose }: TenantFormModalProps) {
  const [form, setForm] = useState<CreateTenantPayload>({
    fullName: '',
    phoneNumber: '',
    email: '',
    citizenId: '',
    dateOfBirth: '',
    gender: '',
    permanentAddress: '',
    vehicleNumber: '',
    note: '',
  })
  const [error, setError] = useState('')

  const createTenant = useCreateTenant()

  const resetForm = () => {
    setForm({
      fullName: '', phoneNumber: '', email: '', citizenId: '',
      dateOfBirth: '', gender: '', permanentAddress: '', vehicleNumber: '', note: '',
    })
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleChange = (field: keyof CreateTenantPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.fullName.trim()) {
      setError('Vui long nhap ho ten')
      return
    }
    if (!form.phoneNumber.trim()) {
      setError('Vui long nhap so dien thoai')
      return
    }

    try {
      // Strip empty optional fields
      const payload: CreateTenantPayload = {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        ...(form.email ? { email: form.email.trim() } : {}),
        ...(form.citizenId ? { citizenId: form.citizenId.trim() } : {}),
        ...(form.dateOfBirth ? { dateOfBirth: form.dateOfBirth } : {}),
        ...(form.gender ? { gender: form.gender } : {}),
        ...(form.permanentAddress ? { permanentAddress: form.permanentAddress.trim() } : {}),
        ...(form.vehicleNumber ? { vehicleNumber: form.vehicleNumber.trim() } : {}),
        ...(form.note ? { note: form.note.trim() } : {}),
      }

      await createTenant.mutateAsync(payload)
      handleClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Them nguoi thue that bai')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#323235]">Them nguoi thue moi</h3>
          <button onClick={handleClose} className="rounded-lg p-1 text-[#7b7a7d] hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full name - required */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Ho ten *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Nguyen Van A"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Phone - required */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">So dien thoai *</label>
            <input
              type="text"
              value={form.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="0901234567"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Citizen ID */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">CCCD</label>
            <input
              type="text"
              value={form.citizenId}
              onChange={(e) => handleChange('citizenId', e.target.value)}
              placeholder="012345678901"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date of birth */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#323235]">Ngay sinh</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#323235]">Gioi tinh</label>
              <select
                value={form.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              >
                <option value="">-- Chon --</option>
                <option value="Nam">Nam</option>
                <option value="Nu">Nu</option>
                <option value="Khac">Khac</option>
              </select>
            </div>
          </div>

          {/* Permanent address */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Dia chi thuong tru</label>
            <input
              type="text"
              value={form.permanentAddress}
              onChange={(e) => handleChange('permanentAddress', e.target.value)}
              placeholder="123 Nguyen Trai, Q1, HCM"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Vehicle number */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Bien so xe</label>
            <input
              type="text"
              value={form.vehicleNumber}
              onChange={(e) => handleChange('vehicleNumber', e.target.value)}
              placeholder="59A1-12345"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Ghi chu</label>
            <textarea
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
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
              disabled={createTenant.isPending}
              className="rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white hover:bg-[#174d8a] disabled:opacity-50"
            >
              {createTenant.isPending ? 'Dang xu ly...' : 'Them nguoi thue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
