import { useRef } from 'react'
import { Image, X, Upload, Loader2 } from 'lucide-react'

interface Props {
  images: string[]
  isUploading: boolean
  progress: number
  onFilesSelected: (files: File[]) => void
  onRemove: (url: string) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

// Local uploads return /upload/file.jpg, need /api prefix for Vite proxy
function toImageSrc(url: string): string {
  if (url.startsWith('/upload/')) return `/api${url}`
  return url
}

export function MotelImageUpload({ images, isUploading, progress, onFilesSelected, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files
    if (!fileList) return

    const validFiles = Array.from(fileList).filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) return false
      if (f.size > MAX_FILE_SIZE) return false
      return true
    })

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8e6ff]">
          <Image className="h-4 w-4 text-[#1d5fa8]" />
        </div>
        <h3 className="text-base font-semibold text-[#323235]">Hinh anh toa nha</h3>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {images.map((url) => (
            <div key={url} className="group relative overflow-hidden rounded-lg">
              <img
                src={toImageSrc(url)}
                alt="Motel"
                className="h-28 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                title="Xoa anh"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-[#1d5fa8]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Dang tai len... {progress}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#1d5fa8] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drop zone / upload button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-[#f8fafc] px-4 py-8 text-center transition-colors hover:border-[#1d5fa8] hover:bg-[#f0f7ff] disabled:opacity-50"
      >
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f4ff]">
          <Upload className="h-5 w-5 text-[#1d5fa8]" />
        </div>
        <p className="text-sm font-medium text-[#323235]">Nhan de chon anh</p>
        <p className="mt-1 text-xs text-[#7b7a7d]">PNG, JPG, WebP - toi da 5MB/anh</p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
