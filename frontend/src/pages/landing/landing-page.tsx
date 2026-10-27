import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'motion/react'
import {
  Building2, FileText, Receipt, Gauge, BarChart3, CreditCard,
  CheckCircle, Users, Zap, Shield, ArrowRight, Play,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Building2,
    title: 'Quan ly phong & toa nha',
    desc: 'Quan ly nhieu toa nha, nhieu phong tren mot nen tang duy nhat. Cap nhat trang thai phong theo thoi gian thuc.',
  },
  {
    icon: FileText,
    title: 'Hop dong & nguoi thue',
    desc: 'Tao va quan ly hop dong thue nha, theo doi thong tin nguoi thue, han hop dong mot cach de dang.',
  },
  {
    icon: Receipt,
    title: 'Hoa don tu dong',
    desc: 'Tu dong tao hoa don hang thang cho tung phong, tinh toan chi phi dien nuoc va cac khoan phu thu.',
  },
  {
    icon: Gauge,
    title: 'Ghi chi so dien nuoc',
    desc: 'Ghi nhan chi so dien nuoc hang thang nhanh chong, chinh xac. Ho tro nhieu dong ho tren mot phong.',
  },
  {
    icon: BarChart3,
    title: 'Bao cao tai chinh',
    desc: 'Xem bao cao thu chi, doanh thu theo thang/quy/nam. Truc quan hoa du lieu bang bieu do sinh dong.',
  },
  {
    icon: CreditCard,
    title: 'Thanh toan & cong no',
    desc: 'Theo doi trang thai thanh toan, nhac no tu dong, quan ly cong no va tien dat coc minh bach.',
  },
]

const STATS = [
  { value: '1,000+', label: 'Phong dang quan ly' },
  { value: '500+', label: 'Chu tro tin dung' },
  { value: '99.9%', label: 'Do on dinh he thong' },
  { value: '24/7', label: 'Ho tro khach hang' },
]

const STEPS = [
  { step: '01', icon: Users, title: 'Dang ky tai khoan', desc: 'Tao tai khoan mien phi trong vong 2 phut. Khong can the tin dung.' },
  { step: '02', icon: Building2, title: 'Thiet lap toa nha', desc: 'Nhap thong tin toa nha, so luong phong va cau hinh gia thue, dien nuoc.' },
  { step: '03', icon: BarChart3, title: 'Quan ly & theo doi', desc: 'Quan ly nguoi thue, tao hoa don, theo doi thanh toan va xem bao cao tai chinh.' },
]

// ─── Animated section wrapper ────────────────────────────────────────────────

function FadeInSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#323235]">
      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <img src="/logo.png" alt="Blocify" className="h-9 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#323235]">
            <a href="#features" className="hover:text-[#1d5fa8] transition-colors">Tinh nang</a>
            <a href="#how-it-works" className="hover:text-[#1d5fa8] transition-colors">Huong dan</a>
            <a href="#contact" className="hover:text-[#1d5fa8] transition-colors">Lien he</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[#1d5fa8] border border-[#1d5fa8] rounded-lg hover:bg-blue-50 transition-colors">
              Dang nhap
            </Link>
            <Link to="/login" className="inline-flex px-4 py-2 text-sm font-medium text-white bg-[#1d5fa8] rounded-lg hover:bg-[#174d8a] transition-colors">
              Dung thu mien phi
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10" />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 right-0 w-[500px] h-[500px] bg-[#1d5fa8]/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"
        />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-[#1d5fa8]"
            >
              <Zap size={12} />
              Giai phap quan ly nha tro so 1 Viet Nam
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-[#323235] leading-tight mb-6"
            >
              Quan ly nha tro{' '}
              <span className="text-[#1d5fa8] relative">
                thong minh
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="absolute bottom-1 left-0 h-2 bg-[#1d5fa8]/10 rounded-full -z-10"
                />
              </span>
              ,{' '}don gian, hieu qua
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-[#7b7a7d] max-w-xl mb-8 leading-relaxed"
            >
              Tu dong hoa viec quan ly phong tro, hoa don, hop dong va bao cao tai chinh.
              Tiet kiem thoi gian, tang doanh thu cho chu tro.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link
                to="/login"
                className="group flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-[#1d5fa8] rounded-xl hover:bg-[#174d8a] transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-200"
              >
                Bat dau mien phi
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-[#1d5fa8] bg-white border border-[#1d5fa8]/20 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <Play size={16} />
                Xem gioi thieu
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-4 text-sm text-[#7b7a7d]"
            >
              Khong can the tin dung. Mien phi trong 30 ngay.
            </motion.p>
          </div>

          {/* Right: Dashboard mockup image */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="hidden lg:block relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-200/50 border border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&q=80"
                alt="Blocify Dashboard"
                className="w-full h-auto object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d5fa8]/10 to-transparent pointer-events-none" />
            </div>
            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#323235]">+12 phong moi</div>
                  <div className="text-xs text-[#7b7a7d]">Thang nay</div>
                </div>
              </div>
            </motion.div>
            {/* Floating stats card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100"
            >
              <div className="text-xs text-[#7b7a7d] mb-1">Doanh thu</div>
              <div className="text-lg font-bold text-[#1d5fa8]">245 tr</div>
              <div className="text-xs text-green-600 font-medium">+18% so voi thang truoc</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="py-14 bg-[#1d5fa8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-sm text-blue-200">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <FadeInSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#323235] mb-4">
              Tat ca tinh nang ban can
            </h2>
            <p className="text-[#7b7a7d] text-lg max-w-2xl mx-auto">
              Giai phap toan dien giup chu tro quan ly toa nha chuyen nghiep, hieu qua tu A den Z.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <FadeInSection key={f.title} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(29,95,168,0.12)' }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 h-full group cursor-default"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-[#1d5fa8] transition-colors duration-300">
                      <Icon size={22} className="text-[#1d5fa8] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="font-semibold text-[#323235] mb-2">{f.title}</h3>
                    <p className="text-sm text-[#7b7a7d] leading-relaxed">{f.desc}</p>
                  </motion.div>
                </FadeInSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Product screenshot ────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#323235] mb-4">
              Giao dien truc quan, de su dung
            </h2>
            <p className="text-[#7b7a7d] text-lg max-w-2xl mx-auto">
              Thiet ke toi gian, hien dai - giup ban thao tac nhanh chong tren moi thiet bi.
            </p>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/50 border border-gray-200 mx-auto max-w-5xl"
            >
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=650&fit=crop&q=80"
                alt="Blocify - Giao dien quan ly"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
            </motion.div>
          </FadeInSection>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#323235] mb-4">
              Chi 3 buoc de bat dau
            </h2>
            <p className="text-[#7b7a7d] text-lg">
              Don gian, nhanh chong, khong can ky thuat.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <FadeInSection key={s.step} delay={i * 0.15}>
                  <div className="relative text-center">
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-blue-100" />
                    )}
                    <motion.div
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                      className="relative inline-flex w-20 h-20 rounded-2xl bg-blue-50 items-center justify-center mb-5"
                    >
                      <Icon size={28} className="text-[#1d5fa8]" />
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#1d5fa8] text-white text-xs font-bold flex items-center justify-center shadow-md">
                        {s.step}
                      </span>
                    </motion.div>
                    <h3 className="font-semibold text-[#323235] text-lg mb-2">{s.title}</h3>
                    <p className="text-sm text-[#7b7a7d] leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                  </div>
                </FadeInSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Trust badges ──────────────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Shield, title: 'Bao mat du lieu', desc: 'Du lieu ma hoa SSL, sao luu tu dong moi ngay.' },
              { icon: Zap, title: 'Hieu suat cao', desc: 'He thong phan hoi nhanh, tai len den hang nghin phong.' },
              { icon: CheckCircle, title: 'De su dung', desc: 'Giao dien truc quan, khong can dao tao ky thuat.' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <FadeInSection key={item.title} delay={i * 0.1}>
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"
                    >
                      <Icon size={18} className="text-[#1d5fa8]" />
                    </motion.div>
                    <div>
                      <div className="font-semibold text-[#323235] mb-1">{item.title}</div>
                      <div className="text-sm text-[#7b7a7d]">{item.desc}</div>
                    </div>
                  </div>
                </FadeInSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-gray-50">
        <FadeInSection className="max-w-3xl mx-auto text-center">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-[#1d5fa8] to-[#0e3d73] rounded-3xl p-10 sm:p-14 text-white relative overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative">
              San sang quan ly nha tro hieu qua hon?
            </h2>
            <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto relative">
              Tham gia cung hon 500 chu tro dang su dung Blocify de tiet kiem thoi gian va tang thu nhap.
            </p>
            <Link
              to="/login"
              className="group relative inline-flex items-center gap-2 px-10 py-4 text-base font-semibold text-[#1d5fa8] bg-white rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Dang ky mien phi ngay
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-4 text-sm text-blue-300 relative">
              Mien phi 30 ngay. Khong can the tin dung.
            </p>
          </motion.div>
        </FadeInSection>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer id="contact" className="bg-[#1a1a2e] text-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <img src="/logo.png" alt="Blocify" className="h-8 w-auto brightness-0 invert" />
              <p className="text-sm text-gray-400 mt-1">
                Giai phap quan ly nha tro thong minh
              </p>
            </div>
            <nav className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Dieu khoan</a>
              <a href="#" className="hover:text-white transition-colors">Bao mat</a>
              <a href="#" className="hover:text-white transition-colors">Lien he</a>
            </nav>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Blocify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
