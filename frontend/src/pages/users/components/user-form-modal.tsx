import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { User, UserRole } from '@/types'

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UserFormData) => void
  user?: User | null
  isLoading?: boolean
}

export interface UserFormData {
  email: string
  password: string
  fullName: string
  phoneNumber: string
  role: UserRole
}

export function UserFormModal({ isOpen, onClose, onSubmit, user, isLoading }: UserFormModalProps) {
  const isEdit = !!user

  const [form, setForm] = useState<UserFormData>({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: 'STAFF',
  })
  const [error, setError] = useState('')

  // Reset form when modal opens/changes
  useEffect(() => {
    if (isOpen && user) {
      setForm({
        email: user.email,
        password: '',
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || '',
        role: user.role,
      })
    } else if (isOpen) {
      setForm({ email: '', password: '', fullName: '', phoneNumber: '', role: 'STAFF' })
    }
    setError('')
  }, [isOpen, user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.fullName.trim()) {
      setError('Vui long nhap ho ten')
      return
    }
    if (!isEdit && !form.email.trim()) {
      setError('Vui long nhap email')
      return
    }
    if (!isEdit && form.password.length < 6) {
      setError('Mat khau phai co it nhat 6 ky tu')
      return
    }

    onSubmit(form)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#323235]">
            {isEdit ? 'Chinh sua nguoi dung' : 'Them nguoi dung moi'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-[#7b7a7d] hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#323235]">Ho ten</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Nguyen Van A"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] placeholder:text-[#b0b0b3] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Email — read-only in edit mode */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#323235]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ten@congty.com"
              disabled={isEdit}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] placeholder:text-[#b0b0b3] focus:border-[#1d5fa8] focus:outline-none disabled:bg-gray-50 disabled:text-[#7b7a7d]"
            />
          </div>

          {/* Password — only for create */}
          {!isEdit && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#323235]">Mat khau</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="It nhat 6 ky tu"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] placeholder:text-[#b0b0b3] focus:border-[#1d5fa8] focus:outline-none"
              />
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#323235]">So dien thoai</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="0901234567"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] placeholder:text-[#b0b0b3] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#323235]">Vai tro</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
            >
              <option value="STAFF">Nhan vien</option>
              <option value="OWNER">Quan tri vien</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          )}

          {/* Actions */}
          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
            >
              Huy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-[#1d5fa8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#174d8a] disabled:opacity-60"
            >
              {isLoading ? 'Dang xu ly...' : isEdit ? 'Cap nhat' : 'Tao moi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
