import { AlertTriangle } from 'lucide-react'

interface EditableCellProps {
  previous: number
  current: string
  locked: boolean
  hasError: boolean
  diff: number
  onChange: (value: string) => void
}

export function EditableReadingCell({
  previous,
  current,
  locked,
  hasError,
  diff,
  onChange,
}: EditableCellProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-[#7b7a7d]">{previous}</span>
      <span className="text-xs text-[#7b7a7d]">/</span>
      {locked ? (
        <span className="text-sm font-medium text-[#323235]">{current}</span>
      ) : (
        <div>
          <input
            type="number"
            value={current}
            onChange={(e) => onChange(e.target.value)}
            className={`w-20 rounded-lg border-2 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 ${
              hasError ? 'border-red-500' : 'border-blue-300'
            }`}
          />
          {hasError && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-red-500">
              <AlertTriangle className="h-3 w-3" />
              Thap hon so cu
            </p>
          )}
        </div>
      )}
      {!locked && diff >= 0 && (
        <span className="text-xs text-[#7b7a7d]">(+{diff})</span>
      )}
    </div>
  )
}
