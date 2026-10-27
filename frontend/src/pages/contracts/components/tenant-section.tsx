import { useState } from 'react'
import { User } from 'lucide-react'
import { useTenants } from '@/hooks/use-tenants'
import type { ContractFormData } from './contract-form-types'
import type { Tenant } from '@/types'

interface Props {
  data: ContractFormData
  onChange: (field: keyof ContractFormData, value: string) => void
}

export function TenantSection({ data, onChange }: Props) {
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const { data: tenantsData } = useTenants(
    search.trim().length >= 1 ? { search: search.trim(), limit: 10 } : { limit: 0 }
  )
  const results = tenantsData?.data ?? []

  const { data: allTenantsData } = useTenants({ limit: 200 })
  const allTenants = allTenantsData?.data ?? []
  const selectedTenant: Tenant | undefined = allTenants.find((t) => t.id === data.tenantId)

  function handleSelect(tenant: Tenant) {
    onChange('tenantId', tenant.id)
    setSearch(tenant.fullName)
    setShowDropdown(false)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setShowDropdown(value.trim().length >= 1)
    if (!value) onChange('tenantId', '')
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8e6ff]">
          <User className="h-4 w-4 text-[#1d5fa8]" />
        </div>
        <h3 className="text-base font-semibold text-[#323235]">Khach thue</h3>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-[#323235]">
          Chon khach thue <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => search.trim().length >= 1 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Tim kiem khach thue..."
            className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-[#323235] placeholder-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
          />

          {showDropdown && results.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-md">
              {results.map((t) => (
                <li
                  key={t.id}
                  onMouseDown={() => handleSelect(t)}
                  className="cursor-pointer px-3 py-2.5 text-sm text-[#323235] hover:bg-[#f0f9ff]"
                >
                  <p className="font-medium">{t.fullName}</p>
                  <p className="text-xs text-[#7b7a7d]">{t.phoneNumber}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedTenant && (
          <div className="rounded-lg border border-blue-100 bg-[#f0f9ff] p-4">
            <p className="text-sm font-semibold text-[#323235]">{selectedTenant.fullName}</p>
            <p className="mt-1 text-xs text-[#7b7a7d]">{selectedTenant.phoneNumber}</p>
            {selectedTenant.email && (
              <p className="mt-0.5 text-xs text-[#7b7a7d]">{selectedTenant.email}</p>
            )}
            {selectedTenant.citizenId && (
              <p className="mt-0.5 text-xs text-[#7b7a7d]">CCCD: {selectedTenant.citizenId}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
