import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { loginUser, selectAuthStatus, selectAuthError } from '@/features/auth/authSlice'
import logo from '@/assets/images/logo.png'

/**
 * Login Form Validation Schema
 * Uses Zod for type-safe validation
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false)
})

/**
 * Login Page Component
 * 
 * Features:
 * - Split-screen design with image and form
 * - Form validation with React Hook Form + Zod
 * - Redux integration for authentication
 * - Password visibility toggle
 * - Remember me functionality
 * - Loading and error states
 * - Responsive design (mobile shows form only)
 */
export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authStatus = useSelector(selectAuthStatus)
  const authError = useSelector(selectAuthError)
  
  const [showPassword, setShowPassword] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('English')

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const rememberMe = watch('rememberMe')

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const result = await dispatch(loginUser({
        email: data.email,
        password: data.password
      })).unwrap()

      // Store remember me preference
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('lastEmail', data.email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('lastEmail')
      }

      // Redirect to admin dashboard
      navigate('/admin/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const isLoading = authStatus === 'loading' || isSubmitting

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image with Blue Overlay (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-blue overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=1600&fit=crop&q=80"
            alt="Students learning together"
            className="w-full h-full object-cover"
          />
          {/* Blue Overlay */}
          <div className="absolute inset-0 bg-brand-blue opacity-85" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <img 
                src={logo} 
                alt="Wordigo Logo" 
                className="w-6 h-6 object-contain brightness-0 invert"
              />
            </div>
            <span className="text-2xl font-bold">Wordigo</span>
          </div>

          {/* Main Content */}
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Your journey to a new language starts here.
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed mb-12">
              Connecting communities through the power of communication. Learn, grow, and build your future in a supportive environment.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">50k+</div>
                <div className="text-sm text-blue-200">Active Students</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">120+</div>
                <div className="text-sm text-blue-200">Languages Supported</div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-xs text-blue-200">
            Photo by Brooke Cagle on{' '}
            <a 
              href="https://unsplash.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              Unsplash
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo (Visible on Mobile Only) */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center">
              <img 
                src={logo} 
                alt="Wordigo Logo" 
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-brand-navy">Wordigo</span>
          </div>

          {/* Language Selector */}
          <div className="flex justify-end mb-6">
            <button className="flex items-center gap-2 text-sm text-brand-gray hover:text-brand-blue transition-colors">
              <Globe className="w-4 h-4" />
              <span>{selectedLanguage}</span>
              <span className="text-xs">▼</span>
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-brand-navy mb-2">
              Welcome Back
            </h2>
            <p className="text-brand-gray">
              Please enter your details to access your dashboard.
            </p>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Login Failed</p>
                <p className="text-sm text-red-600 mt-1">{authError}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-brand-navy mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`pl-10 h-12 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  disabled={isLoading}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-brand-navy"
                >
                  Password
                </label>
                <Link 
                  to="/auth/forgot-password"
                  className="text-sm text-brand-blue hover:text-brand-blue-deep font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 h-12 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  disabled={isLoading}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-navy transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue('rememberMe', checked)}
                disabled={isLoading}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-brand-gray cursor-pointer select-none"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-brand-blue text-white hover:bg-brand-blue-deep font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-brand-gray">Or continue with</span>
            </div>
          </div>

          {/* OAuth - Continue with Google */}
          <a
            href={`${import.meta.env.VITE_API_URL}/auth/google`}
            className="flex w-full h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-base font-semibold text-brand-navy shadow-sm transition-all hover:bg-gray-50"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="h-5 w-5"
            />
            Continue with Google
          </a>

          {/* OAuth - Continue with GitHub */}
          <a
            href={`${import.meta.env.VITE_API_URL}/auth/github`}
            className="flex w-full h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-base font-semibold text-brand-navy shadow-sm transition-all hover:bg-gray-50"
          >
            <svg
              className="w-5 h-5 text-gray-800"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.303 7.5 11.258.086.115.086.25 0 .365-7.793 2.14-11.25-7.5-11.25-7.5C5.226 17.533 4 13.314 4 10 4 5.373 10.373 0 12 0zM12 2C6.48 2 2 6.482 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 6c-4.411 0-8 3.589-8 8 0 .794.213 1.534.588 2.13 2.177-1.534 3.5-3.13 4.375-5.125-.498.608-.997 1.25-.997 2.068 0 1.505.503 2.92.588 4.04-.063-.066-.086-.12-.086-.18 0-.132.025-.259.063-.385-2.136 1.087-3.227 1.863-3.227 3.135 0 1.424.617 2.56 1.237 3.475.6.912.6 1.865.6 2.875t.6 1.958c0 .806-.213 1.533-.588 2.13-2.118.6-3.5 2.13-4.375 3.135-1.03 1.808-1.535 3.137-1.535 5.125 0 8-3.589 8-8 0-.785-.21-1.533-.588-2.13A11.92 11.92 0 0 1 12 18c-4.41 0-8-3.589-8-8 0-.794.213-1.534.588-2.13A11.92 11.92 0 0 1 12 18c-4.41 0-8-3.589-8-8 0-.794.213-1.534.588-2.13"
              />
            </svg>
            Continue with GitHub
          </a>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-brand-gray">
              Don't have an account?{' '}
              <Link 
                to="/auth/register"
                className="text-brand-blue hover:text-brand-blue-deep font-semibold transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Help Link */}
          <div className="mt-8 text-center">
            <button className="inline-flex items-center gap-2 text-sm text-brand-blue hover:text-brand-blue-deep font-medium transition-colors">
              <Globe className="w-4 h-4" />
              Need help in your language?
            </button>
          </div>

          {/* Terms */}
          <div className="mt-8 text-center">
            <p className="text-xs text-brand-gray">
              By logging in, you agree to our{' '}
              <Link to="/terms" className="text-brand-blue hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-brand-blue hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}