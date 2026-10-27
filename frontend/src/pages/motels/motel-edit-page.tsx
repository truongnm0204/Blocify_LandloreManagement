import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronRight,
  Save,
  X,
  Building2,
  Phone,
  Zap,
  BarChart3,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { useMotel, useUpdateMotel } from '@/hooks/use-motels'
import { useImageUpload } from '@/hooks/use-image-upload'
import { MotelImageUpload } from './components/motel-image-upload'
import type { MotelStatus } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MotelFormData {
  name: string
  address: string
  electricityPrice: string
  waterPrice: string
  serviceFee: string
  paymentDueDay: string
  description: string
  phone: string
  email: string
  status: MotelStatus
}

type Amenity = {
  key: string
  label: string
}

const AMENITIES: Amenity[] = [
  { key: 'wifi', label: 'Wifi' },
  { key: 'parking', label: 'Bai xe' },
  { key: 'camera', label: 'Camera' },
  { key: 'elevator', label: 'Thang may' },
  { key: 'pool', label: 'Ho boi' },
  { key: 'gym', label: 'Phong gym' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseCurrency(value: string): string {
  return value.replace(/\D/g, '')
}

function formatCurrency(raw: string): string {
  const num = parseInt(raw.replace(/\D/g, ''), 10)
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('vi-VN').format(num)
}

function extractErrorMessage(err: unknown): string {
  const axiosErr = err as { response?: { data?: { message?: string | string[] } } }
  if (axiosErr?.response?.data?.message) {
    const msg = axiosErr.response.data.message
    return Array.isArray(msg) ? msg.join(', ') : msg
  }
  if (err instanceof Error) return err.message
  return 'Co loi xay ra, vui long thu lai'
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8e6ff]">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#323235]">{title}</h3>
    </div>
  )
}

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#323235]">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const INPUT_CLS = 'rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none'
const INPUT_READONLY_CLS = 'rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-[#7b7a7d] cursor-not-allowed'

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function MotelEditPage() {
  const { motelId } = useParams<{ motelId: string }>()
  const navigate = useNavigate()
  const { data: motel, isLoading } = useMotel(motelId ?? '')
  const updateMotel = useUpdateMotel()

  const [form, setForm] = useState<MotelFormData>({
    name: '',
    address: '',
    electricityPrice: '',
    waterPrice: '',
    serviceFee: '',
    paymentDueDay: '',
    description: '',
    phone: '',
    email: '',
    status: 'ACTIVE',
  })
  const [activeAmenities, setActiveAmenities] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Image state
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const { isUploading, progress, uploadImages } = useImageUpload()

  // Populate form when motel data loads
  useEffect(() => {
    if (!motel) return
    setForm({
      name: motel.name,
      address: motel.address ?? '',
      electricityPrice: String(motel.defaultElectricityPrice ?? 0),
      waterPrice: String(motel.defaultWaterPrice ?? 0),
      serviceFee: String(motel.defaultServiceFee ?? 0),
      paymentDueDay: motel.paymentDueDay != null ? String(motel.paymentDueDay) : '',
      description: motel.description ?? '',
      phone: '',
      email: '',
      status: motel.status,
    })
    setImageUrls(motel.images ?? [])
  }, [motel])

  function handleChange(field: keyof MotelFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  function toggleAmenity(key: string) {
    setActiveAmenities((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function handleFilesSelected(files: File[]) {
    try {
      const urls = await uploadImages(files)
      setImageUrls((prev) => [...prev, ...urls])
    } catch {
      setError('Tai anh len that bai, vui long thu lai')
    }
  }

  function handleRemoveImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url))
  }

  async function handleSubmit() {
    if (!motelId) return
    setError(null)

    if (!form.name.trim()) {
      setError('Vui long nhap ten nha tro')
      return
    }

    try {
      await updateMotel.mutateAsync({
        id: motelId,
        data: {
          name: form.name,
          address: form.address || undefined,
          description: form.description || undefined,
          defaultElectricityPrice: Number(parseCurrency(form.electricityPrice)) || 0,
          defaultWaterPrice: Number(parseCurrency(form.waterPrice)) || 0,
          defaultServiceFee: Number(parseCurrency(form.serviceFee)) || 0,
          paymentDueDay: form.paymentDueDay ? Number(form.paymentDueDay) : undefined,
          status: form.status,
          images: imageUrls,
        },
      })
      navigate(`/motels/${motelId}`)
    } catch (err: unknown) {
      setError(extractErrorMessage(err))
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d5fa8] border-t-transparent" />
      </div>
    )
  }

  const isPending = updateMotel.isPending
  const stats = motel?.stats
  const totalRooms = stats?.totalRooms ?? 0
  const occupiedRooms = stats?.occupiedRooms ?? 0
  const vacantRooms = stats?.vacantRooms ?? 0
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-[#7b7a7d]">
        <button onClick={() => navigate('/')} className="hover:text-[#323235]">Trang chu</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate('/motels')} className="hover:text-[#323235]">Nha tro</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate(`/motels/${motelId}`)} className="hover:text-[#323235]">
          {motel?.name ?? '...'}
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#323235]">Chinh sua</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Chinh sua nha tro</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">Cap nhat thong tin nha tro {motel?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/motels/${motelId}`)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Huy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || isUploading}
            className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Dang luu...' : 'Luu thay doi'}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 2-column layout */}
      <div className="flex gap-6 items-start">
        {/* ---- LEFT COLUMN ---- */}
        <div className="flex flex-1 flex-col gap-5">
          {/* Thong tin nha tro */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <CardHeader
              icon={<Building2 className="h-4 w-4 text-[#1d5fa8]" />}
              title="Thong tin nha tro"
            />

            <div className="flex flex-col gap-4">
              <FieldGroup label="Ten nha tro" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nhap ten nha tro..."
                  className={INPUT_CLS}
                />
              </FieldGroup>

              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Ma nha tro">
                  <input
                    type="text"
                    value={motelId ?? ''}
                    readOnly
                    className={INPUT_READONLY_CLS}
                  />
                </FieldGroup>
                <FieldGroup label="Ngay thanh toan (ngay/thang)">
                  <input
                    type="number"
                    value={form.paymentDueDay}
                    onChange={(e) => handleChange('paymentDueDay', e.target.value)}
                    min={1}
                    max={31}
                    placeholder="5"
                    className={INPUT_CLS}
                  />
                </FieldGroup>
              </div>

              <FieldGroup label="Dia chi">
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Nhap dia chi..."
                  className={INPUT_CLS}
                />
              </FieldGroup>

              <FieldGroup label="Mo ta">
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  placeholder="Nhap mo ta..."
                  className={`${INPUT_CLS} resize-none`}
                />
              </FieldGroup>
            </div>
          </div>

          {/* Thong tin lien he */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <CardHeader
              icon={<Phone className="h-4 w-4 text-[#1d5fa8]" />}
              title="Thong tin lien he"
            />

            <div className="flex flex-col gap-4">
              <FieldGroup label="Chu nha tro">
                <input
                  type="text"
                  value="—"
                  readOnly
                  className={INPUT_READONLY_CLS}
                />
              </FieldGroup>

              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="So dien thoai">
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="0912 345 678"
                    className={INPUT_CLS}
                  />
                </FieldGroup>
                <FieldGroup label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="owner@example.com"
                    className={INPUT_CLS}
                  />
                </FieldGroup>
              </div>
            </div>
          </div>

          {/* Cai dat dich vu */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <CardHeader
              icon={<Zap className="h-4 w-4 text-[#1d5fa8]" />}
              title="Cai dat dich vu"
            />

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Gia dien (d/kWh)">
                <div className="relative">
                  <input
                    type="text"
                    value={form.electricityPrice ? formatCurrency(form.electricityPrice) : ''}
                    onChange={(e) => handleChange('electricityPrice', parseCurrency(e.target.value))}
                    placeholder="0"
                    className={`${INPUT_CLS} w-full pr-6`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7b7a7d]">d</span>
                </div>
              </FieldGroup>

              <FieldGroup label="Gia nuoc (d/m3)">
                <div className="relative">
                  <input
                    type="text"
                    value={form.waterPrice ? formatCurrency(form.waterPrice) : ''}
                    onChange={(e) => handleChange('waterPrice', parseCurrency(e.target.value))}
                    placeholder="0"
                    className={`${INPUT_CLS} w-full pr-6`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7b7a7d]">d</span>
                </div>
              </FieldGroup>

              <FieldGroup label="Phi dich vu (d/thang)">
                <div className="relative">
                  <input
                    type="text"
                    value={form.serviceFee ? formatCurrency(form.serviceFee) : ''}
                    onChange={(e) => handleChange('serviceFee', parseCurrency(e.target.value))}
                    placeholder="0"
                    className={`${INPUT_CLS} w-full pr-6`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7b7a7d]">d</span>
                </div>
              </FieldGroup>

              <FieldGroup label="Phi wifi (d/thang)">
                <div className="relative">
                  <input
                    type="text"
                    defaultValue=""
                    placeholder="0"
                    className={`${INPUT_CLS} w-full pr-6`}
                    disabled
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7b7a7d]">d</span>
                </div>
              </FieldGroup>
            </div>
          </div>
        </div>

        {/* ---- RIGHT COLUMN ---- */}
        <div className="flex w-[340px] flex-shrink-0 flex-col gap-5">
          {/* Anh nha tro */}
          <MotelImageUpload
            images={imageUrls}
            isUploading={isUploading}
            progress={progress}
            onFilesSelected={handleFilesSelected}
            onRemove={handleRemoveImage}
          />

          {/* Tien ich nha tro */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <CardHeader
              icon={<Building2 className="h-4 w-4 text-[#1d5fa8]" />}
              title="Tien ich nha tro"
            />

            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => {
                const active = activeAmenities.has(a.key)
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => toggleAmenity(a.key)}
                    className={[
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      active
                        ? 'border-[#1d5fa8] bg-[#1d5fa8] text-white'
                        : 'border-gray-200 bg-[#f8fafc] text-[#7b7a7d] hover:border-[#1d5fa8] hover:text-[#1d5fa8]',
                    ].join(' ')}
                  >
                    {a.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tom tat */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <CardHeader
              icon={<BarChart3 className="h-4 w-4 text-[#1d5fa8]" />}
              title="Tom tat"
            />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#7b7a7d]">Tong so phong</span>
                <span className="text-sm font-semibold text-[#323235]">{totalRooms}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#7b7a7d]">Dang cho thue</span>
                <span className="rounded-full bg-[#1d5fa8] px-2.5 py-0.5 text-xs font-medium text-white">
                  {occupiedRooms}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[#7b7a7d]">Phong trong</span>
                <span className="rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-medium text-white">
                  {vacantRooms}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm text-[#7b7a7d]">Ty le lap day</span>
                  <span className="text-sm font-semibold text-[#323235]">{occupancyRate}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#1d5fa8] transition-all"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trang thai */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <CardHeader
              icon={
                form.status === 'ACTIVE'
                  ? <ToggleRight className="h-4 w-4 text-[#1d5fa8]" />
                  : <ToggleLeft className="h-4 w-4 text-[#7b7a7d]" />
              }
              title="Trang thai"
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#323235]">
                  {form.status === 'ACTIVE' ? 'Dang hoat dong' : 'Ngung hoat dong'}
                </p>
                <p className="mt-0.5 text-xs text-[#7b7a7d]">
                  {form.status === 'ACTIVE'
                    ? 'Nha tro dang nhan phong moi'
                    : 'Nha tro tam ngung hoat dong'}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleChange('status', form.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                }
                className={[
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                  form.status === 'ACTIVE' ? 'bg-[#1d5fa8]' : 'bg-gray-200',
                ].join(' ')}
                role="switch"
                aria-checked={form.status === 'ACTIVE'}
              >
                <span
                  className={[
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                    form.status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
