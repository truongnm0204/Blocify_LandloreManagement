import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useLogout } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  UserCog,
  FileText,
  Gauge,
  Receipt,
  CreditCard,
  MessageSquareText,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Car,
  Calculator,
  Wallet,
  HandCoins,
  PiggyBank,
  BarChart3,
  ScanSearch,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  children?: NavItem[]
  /** Visual section divider label before this item */
  sectionLabel?: string
}

const mainNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Bang dieu khien', icon: LayoutDashboard },
  {
    to: '/motels',
    label: 'Quan ly toa nha',
    icon: Building2,
    children: [
      { to: '/rooms', label: 'Quan ly phong', icon: DoorOpen },
      { to: '/tenants', label: 'Quan ly nguoi thue', icon: Users },
      { to: '/vehicles', label: 'Quan ly phuong tien', icon: Car },
    ],
  },
  {
    to: '/accounting',
    label: 'Ke toan toa nha',
    icon: Calculator,
    children: [
      // -- Tai chinh --
      { to: '/invoices', label: 'Hoa don thu', icon: Receipt, sectionLabel: 'Tai chinh' },
      { to: '/expenses', label: 'Chi phi', icon: Wallet },
      // -- Quan ly --
      { to: '/contracts', label: 'Hop dong & Cong no', icon: FileText, sectionLabel: 'Quan ly' },
      { to: '/meter-readings', label: 'Dien nuoc', icon: Gauge },
      { to: '/payments', label: 'Thu tien & Doi soat', icon: CreditCard },
      { to: '/reconciliation', label: 'Doi soat AI', icon: ScanSearch },
      { to: '/operating-costs', label: 'Chi phi van hanh', icon: HandCoins },
      { to: '/deposits', label: 'Ky quy & So sach', icon: PiggyBank },
      // -- Bao cao --
      { to: '/financial', label: 'Bao cao tai chinh', icon: BarChart3, sectionLabel: 'Bao cao' },
    ],
  },
  { to: '/feedbacks', label: 'Y kien cu dan', icon: MessageSquareText },
  { to: '/users', label: 'Nguoi dung', icon: UserCog },
  { to: '/settings', label: 'Cai dat', icon: Settings },
]

const bottomNavItems = [
  { to: '/help', label: 'Tro giup', icon: HelpCircle },
]

const headerTabs = [
  { to: '/motels', label: 'Danh muc' },
  { to: '/tenants', label: 'Khach thue' },
  { to: '/reports', label: 'Phan tich' },
  { to: '/financial', label: 'Bao cao' },
]

export function MainLayout() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const logoutMutation = useLogout()

  // Auto-expand groups whose children match current path
  const getInitialOpenGroups = () => {
    const open: string[] = []
    for (const item of mainNavItems) {
      if (item.children) {
        const isChildActive = item.children.some((child) => location.pathname.startsWith(child.to))
        const isParentActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
        if (isChildActive || isParentActive) open.push(item.to)
      }
    }
    return open
  }
  const [openGroups, setOpenGroups] = useState<string[]>(getInitialOpenGroups)

  const toggleGroup = (groupTo: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupTo) ? prev.filter((g) => g !== groupTo) : [...prev, groupTo]
    )
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate('/login'),
    })
  }

  return (
    <div className="flex h-screen bg-[#f5f6fa]">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <img src="/logo.png" alt="Blocify" className="h-20 w-auto object-contain" />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon

            // Item with children -> collapsible group
            if (item.children) {
              const isOpen = openGroups.includes(item.to)
              const isChildActive = item.children.some((child) =>
                location.pathname.startsWith(child.to)
              )
              const isParentActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
              const isGroupActive = isParentActive || isChildActive

              return (
                <div key={item.to} className="mb-0.5">
                  {/* Group header - click to toggle */}
                  <button
                    onClick={() => toggleGroup(item.to)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isGroupActive && !isOpen
                        ? 'bg-[#1d5fa8] text-white font-medium'
                        : 'text-[#5a5a5d] hover:bg-gray-50 hover:text-[#323235]'
                    }`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] ${
                        isGroupActive && !isOpen ? 'text-white' : 'text-[#7b7a7d]'
                      }`}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Children */}
                  {isOpen && (
                    <div className="ml-3 mt-0.5 border-l border-gray-200 pl-2">
                      {/* Parent link - only show for groups with actual parent page */}
                      {item.to === '/motels' && (
                        <NavLink
                          to={item.to}
                          end
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors mb-0.5 ${
                              isActive
                                ? 'bg-[#1d5fa8] text-white font-medium'
                                : 'text-[#5a5a5d] hover:bg-gray-50 hover:text-[#323235]'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Building2
                                className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#7b7a7d]'}`}
                              />
                              <span>Danh sach toa nha</span>
                            </>
                          )}
                        </NavLink>
                      )}

                      {/* Child links with optional section labels */}
                      {item.children.map((child) => {
                        const ChildIcon = child.icon
                        return (
                          <div key={child.to}>
                            {/* Section divider label */}
                            {child.sectionLabel && (
                              <p className="mt-2 mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                                {child.sectionLabel}
                              </p>
                            )}
                            <NavLink
                              to={child.to}
                              className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors mb-0.5 ${
                                  isActive
                                    ? 'bg-[#1d5fa8] text-white font-medium'
                                    : 'text-[#5a5a5d] hover:bg-gray-50 hover:text-[#323235]'
                                }`
                              }
                            >
                              {({ isActive }) => (
                                <>
                                  <ChildIcon
                                    className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#7b7a7d]'}`}
                                  />
                                  <span>{child.label}</span>
                                </>
                              )}
                            </NavLink>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // Regular nav item (no children)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors mb-0.5 ${
                    isActive
                      ? 'bg-[#1d5fa8] text-white font-medium'
                      : 'text-[#5a5a5d] hover:bg-gray-50 hover:text-[#323235]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-white' : 'text-[#7b7a7d]'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-gray-100 px-3 py-3">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors mb-0.5 ${
                    isActive
                      ? 'bg-[#1d5fa8] text-white font-medium'
                      : 'text-[#5a5a5d] hover:bg-gray-50 hover:text-[#323235]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-white' : 'text-[#7b7a7d]'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#5a5a5d] transition-colors hover:bg-gray-50 hover:text-red-600"
          >
            <LogOut className="h-[18px] w-[18px] text-[#7b7a7d]" />
            <span>Dang xuat</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-[68px] items-center justify-between border-b border-gray-200 bg-white px-8">
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7a7d]" />
            <input
              type="text"
              placeholder="Tim kiem tai san, khach thue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-[#f5f6fa] py-2 pl-10 pr-4 text-sm text-[#323235] placeholder:text-[#7b7a7d] focus:border-[#1d5fa8] focus:outline-none"
            />
          </div>

          {/* Header tabs + User */}
          <div className="flex items-center gap-6">
            {/* Tabs */}
            <nav className="flex items-center gap-1">
              {headerTabs.map((tab) => {
                const isActive = location.pathname.startsWith(tab.to)
                return (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-[#1d5fa8] text-white font-medium'
                        : 'text-[#5a5a5d] hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </NavLink>
                )
              })}
            </nav>

            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-[#7b7a7d] transition-colors hover:bg-gray-50">
              <Bell className="h-5 w-5" />
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d5fa8] text-sm font-medium text-white">
                {user?.fullName?.[0] || 'A'}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-[#323235]">{user?.fullName || 'Admin User'}</p>
                <p className="text-xs text-[#7b7a7d]">{user?.role === 'OWNER' ? 'Quan tri vien' : 'Nhan vien'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-[#7b7a7d]" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
