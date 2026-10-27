import { useState } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { useCreateFeedback } from '@/hooks/use-feedbacks'
import { useMotels } from '@/hooks/use-motels'
import { useTenants } from '@/hooks/use-tenants'
import { useRoomsByMotel } from '@/hooks/use-rooms'
import { useImageUpload } from '@/hooks/use-image-upload'
import type { FeedbackCategory, FeedbackPriority } from '@/types'

interface FeedbackFormModalProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'MAINTENANCE', label: 'Bao tri' },
  { value: 'NOISE', label: 'Tieng on' },
  { value: 'UTILITIES', label: 'Dien nuoc' },
  { value: 'SECURITY', label: 'An ninh' },
  { value: 'CLEANLINESS', label: 'Ve sinh' },
  { value: 'OTHER', label: 'Khac' },
]

const PRIORITIES: { value: FeedbackPriority; label: string }[] = [
  { value: 'LOW', label: 'Thap' },
  { value: 'MEDIUM', label: 'Trung binh' },
  { value: 'HIGH', label: 'Cao' },
  { value: 'URGENT', label: 'Khan cap' },
]

export function FeedbackFormModal({ isOpen, onClose }: FeedbackFormModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<FeedbackCategory>('MAINTENANCE')
  const [priority, setPriority] = useState<FeedbackPriority>('MEDIUM')
  const [tenantId, setTenantId] = useState('')
  const [motelId, setMotelId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState('')

  const createFeedback = useCreateFeedback()
  const { data: motelsResponse } = useMotels(1, 100)
  const { data: tenantsResponse } = useTenants({ page: 1, limit: 200 })
  const { data: roomsResponse } = useRoomsByMotel(motelId || undefined, 1, 200)
  const { isUploading, uploadImages } = useImageUpload()

  const motels = motelsResponse?.data ?? []
  const tenants = tenantsResponse?.data ?? []
  const rooms = roomsResponse?.data ?? []

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('MAINTENANCE')
    setPriority('MEDIUM')
    setTenantId('')
    setMotelId('')
    setRoomId('')
    setImages([])
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const urls = await uploadImages(Array.from(files))
      setImages((prev) => [...prev, ...urls])
    } catch {
      setError('Upload hinh anh that bai')
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Vui long nhap tieu de')
      return
    }
    if (!description.trim()) {
      setError('Vui long nhap mo ta')
      return
    }
    if (!tenantId) {
      setError('Vui long chon cu dan')
      return
    }
    if (!motelId) {
      setError('Vui long chon nha tro')
      return
    }

    try {
      await createFeedback.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        tenantId,
        motelId,
        ...(roomId ? { roomId } : {}),
        ...(images.length > 0 ? { images } : {}),
      })
      handleClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Tao y kien that bai')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#323235]">Tao y kien moi</h3>
          <button onClick={handleClose} className="rounded-lg p-1 text-[#7b7a7d] hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Tieu de</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Dieu hoa bi hong"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Mo ta chi tiet</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Mo ta van de cu the..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Category + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#323235]">Danh muc</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#323235]">Muc do uu tien</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as FeedbackPriority)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tenant selector */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Cu dan</label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
            >
              <option value="">-- Chon cu dan --</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} - {t.phoneNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Motel selector */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Nha tro</label>
            <select
              value={motelId}
              onChange={(e) => {
                setMotelId(e.target.value)
                setRoomId('')
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
            >
              <option value="">-- Chon nha tro --</option>
              {motels.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Room selector (filtered by motel) */}
          {motelId && (
            <div>
              <label className="mb-1 block text-sm font-medium text-[#323235]">Phong (tuy chon)</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              >
                <option value="">-- Tat ca phong --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roomCode}{r.name ? ` - ${r.name}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Image upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Hinh anh (tuy chon)</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-[#7b7a7d] transition-colors hover:border-[#1d5fa8] hover:text-[#1d5fa8]">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{isUploading ? 'Dang tai len...' : 'Chon hinh anh'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            {images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((url, idx) => (
                  <div key={idx} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
                    <img src={url} alt={`Hinh ${idx + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

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
              disabled={createFeedback.isPending || isUploading}
              className="rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white hover:bg-[#174d8a] disabled:opacity-50"
            >
              {createFeedback.isPending ? 'Dang xu ly...' : 'Tao y kien'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
