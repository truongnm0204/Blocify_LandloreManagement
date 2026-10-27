import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { AnimatedList } from '@/components/ui/animated-list'
import { useToastStore, type Toast } from '@/stores/toast.store'

const TOAST_DURATION = 3000

const ICONS: Record<Toast['type'], React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-[#1d5fa8]" />,
}

const BORDER_COLORS: Record<Toast['type'], string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  info: 'border-l-[#1d5fa8]',
}

/** Individual toast card with auto-dismiss after TOAST_DURATION ms */
function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove)

  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast.id, remove])

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-gray-200 border-l-4 ${BORDER_COLORS[toast.type]} bg-white px-4 py-3 shadow-lg w-80`}
    >
      <div className="mt-0.5 shrink-0">{ICONS[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#323235]">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-[#7b7a7d] line-clamp-2">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => remove(toast.id)}
        className="shrink-0 text-[#7b7a7d] hover:text-[#323235] transition-colors mt-0.5"
        aria-label="Dong thong bao"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/** Global toast overlay - mount once at App root, renders bottom-right */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <>
      {children}
      {/* Fixed overlay - bottom-right, above all other content */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatedList>
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} />
            ))}
          </AnimatedList>
        </div>
      </div>
    </>
  )
}
