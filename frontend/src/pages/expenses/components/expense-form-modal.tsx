import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useCreateExpense, useUpdateExpense } from '@/hooks/use-expenses'
import { useMotels } from '@/hooks/use-motels'
import type { Expense, ExpenseCategory } from '@/types'
import type { CreateExpensePayload } from '@/api/expenses.api'

interface ExpenseFormModalProps {
  isOpen: boolean
  onClose: () => void
  expense?: Expense
}

const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'MAINTENANCE', label: 'Bao tri' },
  { value: 'UTILITIES', label: 'Dien nuoc' },
  { value: 'SUPPLIES', label: 'Vat tu' },
  { value: 'CLEANING', label: 'Ve sinh' },
  { value: 'SECURITY', label: 'Bao ve' },
  { value: 'OTHER', label: 'Khac' },
]

const EMPTY_FORM: CreateExpensePayload = {
  motelId: '',
  category: 'MAINTENANCE',
  amount: 0,
  description: '',
  note: '',
  date: new Date().toISOString().split('T')[0],
}

export function ExpenseFormModal({ isOpen, onClose, expense }: ExpenseFormModalProps) {
  const [form, setForm] = useState<CreateExpensePayload>(EMPTY_FORM)
  const [error, setError] = useState('')

  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const { data: motelsData } = useMotels(1, 100)
  const motels = motelsData?.data ?? []

  const isEdit = !!expense

  useEffect(() => {
    if (expense) {
      setForm({
        motelId: expense.motelId,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        note: expense.note ?? '',
        date: expense.date?.split('T')[0] ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError('')
  }, [expense, isOpen])

  const handleClose = () => {
    setForm(EMPTY_FORM)
    setError('')
    onClose()
  }

  const handleChange = <K extends keyof CreateExpensePayload>(field: K, value: CreateExpensePayload[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.motelId) { setError('Vui long chon toa nha'); return }
    if (!form.description.trim()) { setError('Vui long nhap mo ta'); return }
    if (!form.amount || form.amount <= 0) { setError('Vui long nhap so tien hop le'); return }
    if (!form.date) { setError('Vui long chon ngay'); return }

    try {
      const payload: CreateExpensePayload = {
        motelId: form.motelId,
        category: form.category,
        amount: Number(form.amount),
        description: form.description.trim(),
        date: form.date,
        ...(form.note ? { note: form.note.trim() } : {}),
      }

      if (isEdit && expense) {
        await updateExpense.mutateAsync({ id: expense.id, data: payload })
      } else {
        await createExpense.mutateAsync(payload)
      }
      handleClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || (isEdit ? 'Cap nhat that bai' : 'Them chi phi that bai'))
    }
  }

  if (!isOpen) return null

  const isPending = createExpense.isPending || updateExpense.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#323235]">
            {isEdit ? 'Chinh sua chi phi' : 'Them chi phi moi'}
          </h3>
          <button onClick={handleClose} className="rounded-lg p-1 text-[#7b7a7d] hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Motel select */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Toa nha *</label>
            <select
              value={form.motelId}
              onChange={(e) => handleChange('motelId', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
            >
              <option value="">-- Chon toa nha --</option>
              {motels.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#323235]">Loai chi phi *</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value as ExpenseCategory)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#323235]">Ngay *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">So tien (VND) *</label>
            <input
              type="number"
              min={0}
              value={form.amount || ''}
              onChange={(e) => handleChange('amount', e.target.value ? Number(e.target.value) : 0)}
              placeholder="0"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Mo ta *</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Mo ta chi phi..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#323235]">Ghi chu</label>
            <textarea
              value={form.note ?? ''}
              onChange={(e) => handleChange('note', e.target.value)}
              rows={2}
              placeholder="Ghi chu them..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-600">{error}</p>}

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
              disabled={isPending}
              className="rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white hover:bg-[#174d8a] disabled:opacity-50"
            >
              {isPending ? 'Dang xu ly...' : isEdit ? 'Luu thay doi' : 'Them chi phi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
