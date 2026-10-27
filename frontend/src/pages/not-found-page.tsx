import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-gray-500 mb-4">Trang khong ton tai</p>
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          Ve trang chu
        </Link>
      </div>
    </div>
  )
}
