import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import useAuth from '@/hooks/useAuth'
import { useDispatch } from 'react-redux'
import { clearUser } from '@/features/auth/authSlice'
import { cn } from '@/lib/utils'
import logo from '@/assets/images/logo.png'
import { useAuthModal } from '@/context/AuthModalContext'

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { openLogin, openRegister } = useAuthModal()

  const handleLogout = () => {
    dispatch(clearUser())
    navigate('/')
    setIsOpen(false)
  }

  const navLinks = [
    { label: 'Our Impact', href: '/impact' },
    { label: 'Curriculum', href: '/curriculum' },
    { label: 'Get Involved', href: '/get-involved' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between relative">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            aria-label="Wordigo Home"
          >
            <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0">
              <img src={logo} alt="Wordigo Logo" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-[22px] font-bold text-brand-navy tracking-tight">Wordigo</span>
          </Link>

          {/* Desktop Nav - Centered */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'text-[15px] font-medium transition-colors hover:text-brand-blue whitespace-nowrap',
                    isActive(link.href) ? 'text-brand-blue' : 'text-brand-navy'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-5 md:flex">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-brand-navy hover:text-brand-blue font-medium text-[15px] h-auto py-2 px-4 hover:bg-transparent">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-semibold text-[15px] h-11 px-6 rounded-full transition-all"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                {/* ✅ Opens modal instead of navigating */}
                <Button
                  variant="ghost"
                  onClick={openLogin}
                  className="text-brand-navy hover:text-brand-blue font-medium text-[15px] h-auto py-2 px-4 hover:bg-transparent"
                >
                  Sign In
                </Button>
                <Button
                  onClick={openRegister}
                  className="bg-brand-blue text-white hover:bg-brand-blue-deep font-semibold text-[15px] h-11 px-7 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Start Learning
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle menu" className="h-10 w-10">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white">
              <div className="flex flex-col gap-8 mt-8">
                <Link to="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                  <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center">
                    <img src={logo} alt="Wordigo Logo" className="w-5 h-5 object-contain" />
                  </div>
                  <span className="text-[22px] font-bold text-brand-navy tracking-tight">Wordigo</span>
                </Link>

                <div className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'text-base font-medium transition-colors hover:text-brand-blue',
                        isActive(link.href) ? 'text-brand-blue' : 'text-brand-navy'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-gray-100">
                  {user ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full h-11 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-semibold rounded-full">
                          Dashboard
                        </Button>
                      </Link>
                      <Button onClick={handleLogout} variant="outline" className="w-full h-11 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-semibold rounded-full">
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* ✅ Mobile: opens modal + closes sheet */}
                      <Button
                        variant="outline"
                        onClick={() => { setIsOpen(false); openLogin() }}
                        className="w-full h-11 border-gray-200 text-brand-navy hover:border-brand-blue hover:text-brand-blue font-semibold rounded-full"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => { setIsOpen(false); openRegister() }}
                        className="w-full h-11 bg-brand-blue text-white hover:bg-brand-blue-deep font-semibold rounded-full shadow-md"
                      >
                        Start Learning
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}