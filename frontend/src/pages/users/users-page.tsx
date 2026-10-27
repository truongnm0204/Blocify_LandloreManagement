import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useUsers, useCreateUser, useUpdateUser, useToggleUserStatus } from '@/hooks/use-users'
import { UserTable } from './components/user-table'
import { UserFormModal } from './components/user-form-modal'
import type { UserFormData } from './components/user-form-modal'
import type { User, UserRole, UserStatus } from '@/types'

export function UsersPage() {
  const currentUser = useAuthStore((s) => s.user)
  const [page, setPage] = useState(1)
  const [filterRole, setFilterRole] = useState<UserRole | ''>('')
  const [filterStatus, setFilterStatus] = useState<UserStatus | ''>('')
  const [showFilters, setShowFilters] = useState(false)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Queries & mutations
  const queryParams = {
    page,
    limit: 20,
    ...(filterRole ? { role: filterRole } : {}),
    ...(filterStatus ? { status: filterStatus } : {}),
  }
  const { data, isLoading, error } = useUsers(queryParams)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const toggleStatus = useToggleUserStatus()

  const users = data?.data ?? []
  const totalPages = data ? Math.ceil(data.total / 20) : 0

  // Handlers
  const handleOpenCreate = () => {
    setEditingUser(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    setModalOpen(true)
  }

  const handleToggleStatus = (user: User) => {
    if (confirm(`Ban co chac chan muon ${user.status === 'ACTIVE' ? 'khoa' : 'mo khoa'} tai khoan "${user.fullName}"?`)) {
      toggleStatus.mutate(user.id)
    }
  }

  const handleSubmit = (formData: UserFormData) => {
    if (editingUser) {
      updateUser.mutate(
        {
          id: editingUser.id,
          data: {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber || undefined,
            role: formData.role,
          },
        },
        { onSuccess: () => setModalOpen(false) },
      )
    } else {
      createUser.mutate(
        {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber || undefined,
          role: formData.role,
        },
        { onSuccess: () => setModalOpen(false) },
      )
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-red-500">Khong the tai du lieu. Vui long thu lai.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#323235]">Quan ly nguoi dung</h2>
          <p className="mt-1 text-sm text-[#7b7a7d]">
            Quan ly tai khoan nhan vien va phan quyen truy cap he thong.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#323235] transition-colors hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Bo loc
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-[#1d5fa8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#174d8a]"
          >
            <Plus className="h-4 w-4" />
            Them nguoi dung
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#7b7a7d]">Vai tro</label>
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value as UserRole | ''); setPage(1) }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
            >
              <option value="">Tat ca</option>
              <option value="OWNER">Quan tri vien</option>
              <option value="STAFF">Nhan vien</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#7b7a7d]">Trang thai</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as UserStatus | ''); setPage(1) }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#323235] focus:border-[#1d5fa8] focus:outline-none"
            >
              <option value="">Tat ca</option>
              <option value="ACTIVE">Hoat dong</option>
              <option value="INACTIVE">Khoa</option>
            </select>
          </div>
          <button
            onClick={() => { setFilterRole(''); setFilterStatus(''); setPage(1) }}
            className="mt-5 text-xs text-[#1d5fa8] hover:underline"
          >
            Xoa bo loc
          </button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
      ) : (
        <UserTable
          users={users}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          currentUserId={currentUser?.id}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#7b7a7d]">
            Trang {page} / {totalPages} ({data?.total ?? 0} nguoi dung)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-[#323235] transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              Truoc
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-[#323235] transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <UserFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        user={editingUser}
        isLoading={createUser.isPending || updateUser.isPending}
      />
    </div>
  )
}
