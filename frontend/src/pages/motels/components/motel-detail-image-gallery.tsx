import { useState } from 'react'
import { ImageIcon, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface MotelDetailImageGalleryProps {
  images?: string[]
}

/** Local uploads return /upload/file.jpg, need /api prefix for Vite proxy */
function toImageSrc(url: string): string {
  if (url.startsWith('/upload/')) return `/api${url}`
  return url
}

/** Placeholder images from picsum when motel has no uploaded photos */
const PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/motel1/800/500',
  'https://picsum.photos/seed/motel2/800/500',
  'https://picsum.photos/seed/motel3/800/500',
  'https://picsum.photos/seed/motel4/800/500',
  'https://picsum.photos/seed/motel5/800/500',
]

export function MotelDetailImageGallery({ images }: MotelDetailImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  const rawImages = images && images.length > 0 ? images : PLACEHOLDER_IMAGES
  const isPlaceholder = !images || images.length === 0
  const allImages = rawImages.map(toImageSrc)
  const visibleImages = showAll ? allImages : allImages.slice(0, 4)
  const remainingCount = allImages.length - 4

  function openLightbox(idx: number) {
    setLightboxIndex(idx)
  }

  function closeLightbox() {
    setLightboxIndex(null)
  }

  function prevImage() {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : allImages.length - 1)
  }

  function nextImage() {
    if (lightboxIndex === null) return
    setLightboxIndex(lightboxIndex < allImages.length - 1 ? lightboxIndex + 1 : 0)
  }

  return (
    <>
      <div className="rounded-xl bg-white p-5 shadow-[0_1px_3.5px_rgba(0,0,0,0.05)]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#323235]">Hinh anh nha tro</h3>
            {isPlaceholder && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                Anh mau
              </span>
            )}
          </div>
          {allImages.length > 4 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-medium text-[#1d5fa8] transition-colors hover:text-[#174d8a]"
            >
              {showAll ? 'Thu gon' : `Xem tat ca (${allImages.length})`}
            </button>
          )}
        </div>

        {/* Bento Grid Layout */}
        <GalleryGrid
          images={visibleImages}
          allImages={allImages}
          remainingCount={remainingCount}
          showAll={showAll}
          onImageClick={openLightbox}
          onShowAll={() => setShowAll(true)}
        />
      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <Lightbox
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
          onGoTo={setLightboxIndex}
        />
      )}
    </>
  )
}

/** Bento-style image grid: 1 large + 3 small (or grid when expanded) */
function GalleryGrid({
  images,
  allImages,
  remainingCount,
  showAll,
  onImageClick,
  onShowAll,
}: {
  images: string[]
  allImages: string[]
  remainingCount: number
  showAll: boolean
  onImageClick: (idx: number) => void
  onShowAll: () => void
}) {
  if (images.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-gray-50">
        <div className="text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-2 text-xs text-[#7b7a7d]">Chua co hinh anh</p>
        </div>
      </div>
    )
  }

  // Expanded view: uniform grid
  if (showAll) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {images.map((url, idx) => (
          <ImageTile key={idx} url={url} idx={idx} onClick={onImageClick} />
        ))}
      </div>
    )
  }

  // Bento layout: first image large, rest small
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2" style={{ height: 280 }}>
      {/* Hero image - spans 2 cols, 2 rows */}
      <div
        className="group relative col-span-2 row-span-2 cursor-pointer overflow-hidden rounded-xl"
        onClick={() => onImageClick(0)}
      >
        <img
          src={images[0]}
          alt="Hinh anh 1"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          <ZoomIn className="h-3 w-3" />
          Phong to
        </div>
      </div>

      {/* Secondary images */}
      {images.slice(1, 4).map((url, idx) => {
        const realIdx = idx + 1
        const isLast = realIdx === 3 && remainingCount > 0 && !showAll

        return (
          <div
            key={realIdx}
            className="group relative cursor-pointer overflow-hidden rounded-xl"
            onClick={() => (isLast ? onShowAll() : onImageClick(realIdx))}
          >
            <img
              src={url}
              alt={`Hinh anh ${realIdx + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

            {/* Remaining count overlay on last tile */}
            {isLast && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition-colors group-hover:bg-black/60">
                <span className="text-lg font-bold text-white">+{remainingCount}</span>
              </div>
            )}
          </div>
        )
      })}

      {/* Fill empty slots if less than 4 images */}
      {images.length < 4 &&
        Array.from({ length: 4 - images.length }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="flex items-center justify-center rounded-xl bg-gray-50"
          >
            <ImageIcon className="h-6 w-6 text-gray-300" />
          </div>
        ))}
    </div>
  )
}

/** Single image tile with hover effect */
function ImageTile({
  url,
  idx,
  onClick,
}: {
  url: string
  idx: number
  onClick: (idx: number) => void
}) {
  return (
    <div
      className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg"
      onClick={() => onClick(idx)}
    >
      <img
        src={url}
        alt={`Hinh anh ${idx + 1}`}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
      <div className="absolute bottom-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <ZoomIn className="h-4 w-4 text-white drop-shadow" />
      </div>
    </div>
  )
}

/** Fullscreen lightbox with keyboard navigation */
function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onGoTo,
}: {
  images: string[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onGoTo: (idx: number) => void
}) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') onPrev()
    if (e.key === 'ArrowRight') onNext()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <img
        src={images[currentIndex]}
        alt={`Hinh anh ${currentIndex + 1}`}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((url, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation()
                onGoTo(idx)
              }}
              className={`h-12 w-16 overflow-hidden rounded-md border-2 transition-all ${
                idx === currentIndex
                  ? 'border-white shadow-lg'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
