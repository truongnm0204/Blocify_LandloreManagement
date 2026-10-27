import { Wallet } from 'lucide-react'
import type { ContractFormData } from './contract-form-types'

interface Props {
  data: ContractFormData
  onChange: (field: keyof ContractFormData, value: string) => void
}

function formatCurrency(raw: string): string {
  const num = parseInt(raw.replace(/\D/g, ''), 10)
  if (isNaN(num)) return '0 d'
  return new Intl.NumberFormat('vi-VN').format(num) + ' d'
}

function parseCurrencyInput(value: string): string {
  return value.replace(/\D/g, '')
}

const PAYMENT_DAYS = Array.from({ length: 28 }, (_, i) => i + 1)

export function PaymentInfoSection({ data, onChange }: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8e6ff]">
          <Wallet className="h-4 w-4 text-[#1d5fa8]" />
        </div>
        <h3 className="text-base font-semibold text-[#323235]">Thong tin thanh toan</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Tien thue hang thang */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#323235]">
            Tien thue hang thang <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.rentAmount ? formatCurrency(data.rentAmount) : ''}
              onChange={(e) => onChange('rentAmount', parseCurrencyInput(e.target.value))}
              placeholder="0 d"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>
        </div>

        {/* Tien dat coc */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#323235]">
            Tien dat coc <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.depositAmount ? formatCurrency(data.depositAmount) : ''}
            onChange={(e) => onChange('depositAmount', parseCurrencyInput(e.target.value))}
            placeholder="0 d"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
          />
        </div>

        {/* Ngay thanh toan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#323235]">
            Ngay thanh toan <span className="text-red-500">*</span>
          </label>
          <select
            value={data.paymentDay}
            onChange={(e) => onChange('paymentDay', e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          >
            <option value="">Chon ngay</option>
            {PAYMENT_DAYS.map((d) => (
              <option key={d} value={String(d)}>
                Ngay {String(d).padStart(2, '0')} hang thang
              </option>
            ))}
          </select>
        </div>

        {/* Chu ky thanh toan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#323235]">Chu ky thanh toan</label>
          <select
            value={data.paymentCycle}
            onChange={(e) => onChange('paymentCycle', e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
          >
            <option value="monthly">Hang thang</option>
            <option value="quarterly">Hang quy</option>
            <option value="yearly">Hang nam</option>
          </select>
        </div>
      </div>
    </div>
  )
}
