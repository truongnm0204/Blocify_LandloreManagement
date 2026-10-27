import { Outlet } from 'react-router-dom'

// Full-screen wrapper for auth pages (login)
export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff] p-4">
      <Outlet />
    </div>
  )
}
