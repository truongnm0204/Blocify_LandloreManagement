import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/use-auth'
import { EyeIcon, EyeOffIcon, ArrowRightIcon, MailIcon, LockIcon, PhoneIcon } from 'lucide-react'
import './login-page.css'

export function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => navigate('/dashboard'),
        onError: () => setError('Email hoặc mật khẩu không đúng'),
      },
    )
  }

  const loading = loginMutation.isPending

  return (
    <div className="login-container">
      {/* Left Side: Visual/Editorial Branding */}
      <div className="login-left">
        {/* Decorative blurred circles */}
        <div className="login-left-decoration">
          <div className="login-blur-circle login-blur-circle--top" />
        </div>

        {/* Background pattern overlay */}
        <div className="login-left-overlay" />

        {/* Content */}
        <div className="login-left-content">
          {/* Logo + Brand */}
          <div className="login-brand">
            <div className="login-brand-logo">
              <img src="/logo.png" alt="Blocify" className="login-brand-logo-img" />
            </div>
            <span className="login-brand-name">Blocify</span>
          </div>

          {/* Headline */}
          <div className="login-left-headline">
            <h1 className="login-left-title">
              Cổng quản lý<br />
              bất động sản<br />
              hiện đại.
            </h1>
            <p className="login-left-subtitle">
              Tối ưu hóa quy trình vận hành nhà trọ và căn
              hộ dịch vụ chỉ trong một nền tảng duy nhất.
            </p>
          </div>
        </div>

        {/* Social proof */}
        <div className="login-social-proof">
          <div className="login-avatars">
            <div className="login-avatar login-avatar--1" />
            <div className="login-avatar login-avatar--2" />
            <div className="login-avatar login-avatar--3" />
          </div>
          <p className="login-social-proof-text">
            Hơn 2,000 chủ hộ đã tin dùng Blocify.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          {/* Header */}
          <div className="login-form-header">
            <h2 className="login-form-title">Chào mừng trở lại</h2>
            <p className="login-form-subtitle">
              Vui lòng nhập thông tin để truy cập hệ thống.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email field */}
            <div className="login-field">
              <label className="login-label">
                <MailIcon className="login-label-icon" />
                <span>Email</span>
              </label>
              <div className="login-input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ten@congty.com"
                  className="login-input"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="login-field">
              <div className="login-label-row">
                <label className="login-label">
                  <LockIcon className="login-label-icon" />
                  <span>Mật khẩu</span>
                </label>
                <button type="button" className="login-forgot-link">
                  Quên mật khẩu?
                </button>
              </div>
              <div className="login-input-wrapper login-input-wrapper--password">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon className="login-password-toggle-icon" />
                  ) : (
                    <EyeIcon className="login-password-toggle-icon" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-remember-checkbox"
              />
              <span className="login-remember-text">Ghi nhớ đăng nhập</span>
            </label>

            {/* Error message */}
            {error && (
              <div className="login-error">
                <p>{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit"
            >
              <span>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
              {!loading && <ArrowRightIcon className="login-submit-icon" />}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <span className="login-footer-text">Bạn cần tài khoản mới?</span>
            <a href="tel:+84" className="login-footer-link">
              <PhoneIcon className="login-footer-link-icon" />
              <span>Liên hệ hỗ trợ</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
