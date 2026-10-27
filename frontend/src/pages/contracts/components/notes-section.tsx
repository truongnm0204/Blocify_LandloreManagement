import { StickyNote } from 'lucide-react'
import type { ContractFormData } from './contract-form-types'

interface Props {
  data: ContractFormData
  onChange: (field: keyof ContractFormData, value: string) => void
}

export function NotesSection({ data, onChange }: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8e6ff]">
          <StickyNote className="h-4 w-4 text-[#1d5fa8]" />
        </div>
        <h3 className="text-base font-semibold text-[#323235]">Ghi chu</h3>
      </div>

      <textarea
        value={data.note}
        onChange={(e) => onChange('note', e.target.value)}
        rows={5}
        placeholder="Nhap ghi chu cho hop dong..."
        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
      />
    </div>
  )
}
