import type { User } from '@/types'
import { Shield, ShieldCheck } from 'lucide-react'

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onToggleStatus: (user: User) => void
  currentUserId?: string
}

const roleBadge = {
  OWNER: { label: 'Quan tri vien', className: 'bg-blue-50 text-blue-700' },
  STAFF: { label: 'Nhan vien', className: 'bg-gray-50 text-gray-600' },
}

const statusBadge = {
  ACTIVE: { label: 'Hoat dong', className: 'bg-green-50 text-green-700' },
  INACTIVE: { label: 'Khoa', className: 'bg-red-50 text-red-600' },
}

export function UserTable({ users, onEdit, onToggleStatus, currentUserId }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-[#f9fafb]">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#7b7a7d]">
              Nguoi dung
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#7b7a7d]">
              Vai tro
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#7b7a7d]">
              Trang thai
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#7b7a7d]">
              Ngay tao
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#7b7a7d]">
              Thao tac
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => {
            const role = roleBadge[user.role]
            const status = statusBadge[user.status]
            const isSelf = user.id === currentUserId
            const RoleIcon = user.role === 'OWNER' ? ShieldCheck : Shield

            return (
              <tr key={user.id} className="transition-colors hover:bg-gray-50">
                {/* User info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1d5fa8] text-sm font-medium text-white">
                      {user.fullName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#323235]">
                        {user.fullName}
                        {isSelf && <span className="ml-1.5 text-xs text-[#7b7a7d]">(Ban)</span>}
                      </p>
                      <p className="text-xs text-[#7b7a7d]">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${role.className}`}>
                    <RoleIcon className="h-3 w-3" />
                    {role.label}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-400'}`} />
                    {status.label}
                  </span>
                </td>

                {/* Created date */}
                <td className="px-6 py-4 text-sm text-[#7b7a7d]">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#1d5fa8] transition-colors hover:bg-blue-50"
                    >
                      Chinh sua
                    </button>
                    {!isSelf && (
                      <button
                        onClick={() => onToggleStatus(user)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          user.status === 'ACTIVE'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? 'Khoa' : 'Mo khoa'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-[#7b7a7d]">Khong co nguoi dung nao.</p>
        </div>
      )}
    </div>
  )
}
