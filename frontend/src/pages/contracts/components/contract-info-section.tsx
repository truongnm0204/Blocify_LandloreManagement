import { Clipboard } from 'lucide-react'
import type { ContractFormData } from './contract-form-types'

interface Props {
  isEdit: boolean
  data: ContractFormData
  onChange: (field: keyof ContractFormData, value: string) => void
}

export function ContractInfoSection({ isEdit, data, onChange }: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8e6ff]">
          <Clipboard className="h-4 w-4 text-[#1d5fa8]" />
        </div>
        <h3 className="text-base font-semibold text-[#323235]">Thong tin hop dong</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Ngay bat dau */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#323235]">
            Ngay bat dau <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>

        {/* Ngay ket thuc */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#323235]">
            Ngay ket thuc
          </label>
          <input
            type="date"
            value={data.endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>

        {/* Ngay ky */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#323235]">Ngay ky hop dong</label>
          <input
            type="date"
            value={data.signedDate}
            onChange={(e) => onChange('signedDate', e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>

        {/* So nguoi o */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#323235]">So nguoi o</label>
          <input
            type="number"
            value={data.occupantCount}
            onChange={(e) => onChange('occupantCount', e.target.value)}
            min={1}
            placeholder="1"
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>

        {/* Trang thai - only in edit mode */}
        {isEdit && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#323235]">Trang thai</label>
            <select
              value={data.status}
              onChange={(e) => onChange('status', e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
            >
              <option value="DRAFT">Nhap</option>
              <option value="ACTIVE">Dang hieu luc</option>
              <option value="ENDED">Da ket thuc</option>
              <option value="CANCELLED">Da huy</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
