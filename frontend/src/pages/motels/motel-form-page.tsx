import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Save, X, Building2, MapPin, DollarSign, FileText } from 'lucide-react'
import { useCreateMotel } from '@/hooks/use-motels'
import { useImageUpload } from '@/hooks/use-image-upload'
import { MotelImageUpload } from './components/motel-image-upload'

interface MotelFormData {
  name: string
  floors: string
  totalRooms: string
  motelType: string
  address: string
  district: string
  city: string
  electricityPrice: string
  waterPrice: string
  serviceFee: string
  description: string
}

const EMPTY_FORM: MotelFormData = {
  name: '',
  floors: '',
  totalRooms: '',
  motelType: '',
  address: '',
  district: '',
  city: 'Ho Chi Minh',
  electricityPrice: '',
  waterPrice: '',
  serviceFee: '',
  description: '',
}

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

export function MotelFormPage() {
  const navigate = useNavigate()
  const createMotel = useCreateMotel()
  const [form, setForm] = useState<MotelFormData>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)

  // Image state
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const { isUploading, progress, uploadImages } = useImageUpload()

  function handleChange(field: keyof MotelFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null)
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
    setError(null)

    if (!form.name.trim()) {
      setError('Vui long nhap ten toa nha')
      return
    }
    if (!form.address.trim() && !form.district.trim() && !form.city.trim()) {
      setError('Vui long nhap dia chi toa nha')
      return
    }

    try {
      const fullAddress = [form.address, form.district, form.city].filter(Boolean).join(', ')
      await createMotel.mutateAsync({
        name: form.name,
        address: fullAddress,
        description: form.description || undefined,
        defaultElectricityPrice: Number(form.electricityPrice) || 0,
        defaultWaterPrice: Number(form.waterPrice) || 0,
        defaultServiceFee: Number(form.serviceFee) || 0,
        paymentDueDay: 5,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      })
      navigate('/motels')
    } catch (err: unknown) {
      setError(extractErrorMessage(err))
    }
  }

  const isPending = createMotel.isPending

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-[#7b7a7d]">
        <button onClick={() => navigate('/')} className="hover:text-[#323235]">
          Trang chu
        </button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate('/motels')} className="hover:text-[#323235]">
          Nha tro
        </button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#323235]">Them toa nha moi</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Them toa nha moi</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">Nhap thong tin de tao toa nha cho thue moi</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/motels')}
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
            {isPending ? 'Dang luu...' : 'Luu toa nha'}
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
          {/* Thong tin toa nha */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8e6ff]">
                <Building2 className="h-4 w-4 text-[#1d5fa8]" />
              </div>
              <h3 className="text-base font-semibold text-[#323235]">Thong tin toa nha</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#323235]">
                  Ten toa nha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nhap ten toa nha..."
                  className="rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#323235]">So tang</label>
                <input
                  type="number"
                  value={form.floors}
                  onChange={(e) => handleChange('floors', e.target.value)}
                  min={1}
                  placeholder="0"
                  className="rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#323235]">Tong so phong</label>
                <input
                  type="number"
                  value={form.totalRooms}
                  onChange={(e) => handleChange('totalRooms', e.target.value)}
                  min={0}
                  placeholder="0"
                  className="rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#323235]">Loai toa nha</label>
                <select
                  value={form.motelType}
                  onChange={(e) => handleChange('motelType', e.target.value)}
                  className="rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
                >
                  <option value="">Chon loai toa nha</option>
                  <option value="nha_tro">Nha tro</option>
                  <option value="chung_cu_mini">Chung cu mini</option>
                  <option value="ky_tuc_xa">Ky tuc xa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dia chi */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8e6ff]">
                <MapPin className="h-4 w-4 text-[#1d5fa8]" />
              </div>
              <h3 className="text-base font-semibold text-[#323235]">Dia chi</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#323235]">
                  Dia chi chi tiet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Nhap dia chi toa nha..."
                  className="rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#323235]">Quan / Huyen</label>
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    placeholder="Nhap quan / huyen..."
                    className="rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#323235]">Thanh pho</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Ho Chi Minh"
                    className="rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex w-[340px] flex-shrink-0 flex-col gap-5">
          {/* Hinh anh toa nha - Firebase upload */}
          <MotelImageUpload
            images={imageUrls}
            isUploading={isUploading}
            progress={progress}
            onFilesSelected={handleFilesSelected}
            onRemove={handleRemoveImage}
          />

          {/* Cau hinh gia */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8e6ff]">
                <DollarSign className="h-4 w-4 text-[#1d5fa8]" />
              </div>
              <h3 className="text-base font-semibold text-[#323235]">Cau hinh gia</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#323235]">
                  Gia dien <span className="text-xs font-normal text-[#7b7a7d]">(kWh)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.electricityPrice ? formatCurrency(form.electricityPrice) : ''}
                    onChange={(e) => handleChange('electricityPrice', parseCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 pr-8 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7b7a7d]">d</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#323235]">
                  Gia nuoc <span className="text-xs font-normal text-[#7b7a7d]">(m3)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.waterPrice ? formatCurrency(form.waterPrice) : ''}
                    onChange={(e) => handleChange('waterPrice', parseCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 pr-8 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7b7a7d]">d</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#323235]">
                  Phi dich vu <span className="text-xs font-normal text-[#7b7a7d]">(thang)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.serviceFee ? formatCurrency(form.serviceFee) : ''}
                    onChange={(e) => handleChange('serviceFee', parseCurrency(e.target.value))}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 pr-8 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7b7a7d]">d</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mo ta */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8e6ff]">
                <FileText className="h-4 w-4 text-[#1d5fa8]" />
              </div>
              <h3 className="text-base font-semibold text-[#323235]">Mo ta</h3>
            </div>

            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={5}
              placeholder="Nhap mo ta cho toa nha..."
              className="w-full resize-none rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
