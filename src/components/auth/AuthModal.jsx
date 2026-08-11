import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { useAuthModal } from '@/context/AuthModalContext'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import logo from '@/assets/images/logo.png'

export default function AuthModal() {
  const { isOpen, view, closeModal, switchView } = useAuthModal()

  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') closeModal() },
    [closeModal]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-2 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label={view === 'login' ? 'Sign In' : 'Create Account'}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-5xl h-[90vh] flex rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500 ease-out">

        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-6/12 relative bg-brand-blue overflow-hidden flex-shrink-0">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1000&fit=crop&q=80"
              alt="Students learning together"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-brand-blue opacity-85" />
          </div>

          <div className="relative z-10 flex flex-col justify-between p-10 text-white w-full">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <img src={logo} alt="Wordigo Logo" className="w-5 h-5 object-contain brightness-0 invert" />
              </div>
              <span className="text-xl font-bold">Wordigo</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-3xl font-bold mb-4 leading-snug">
                Your journey to a new language starts here.
              </h1>
              <p className="text-sm text-blue-100 leading-relaxed mb-10">
                Connecting communities through the power of communication. Learn, grow, and build your future.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-bold mb-1">50k+</div>
                  <div className="text-xs text-blue-200">Active Students</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">120+</div>
                  <div className="text-xs text-blue-200">Languages Supported</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-blue-300">
              Photo by Brooke Cagle on{' '}
              <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">
                Unsplash
              </a>
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white flex flex-col overflow-y-auto">
          {/* Close button */}
          <div className="flex justify-end p-4 flex-shrink-0">
            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form area */}
          <div className="flex-1 flex items-start justify-center px-8 pb-8">
            <div className="w-full max-w-sm">

              {/* Tab switcher */}
              <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                    view === 'login'
                      ? 'bg-white text-brand-navy shadow-sm'
                      : 'text-brand-gray hover:text-brand-navy'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                    view === 'register'
                      ? 'bg-white text-brand-navy shadow-sm'
                      : 'text-brand-gray hover:text-brand-navy'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Active form */}
              {view === 'login' ? <LoginForm /> : <RegisterForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}