import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { loginUser, selectAuthStatus } from '@/features/auth/authSlice'
import { useAuthModal } from '@/context/AuthModalContext'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
})

export default function LoginForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authStatus = useSelector(selectAuthStatus)
  const { switchView, closeModal } = useAuthModal()

  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data)
    try {
      const result = await dispatch(loginUser({ email: data.email, password: data.password })).unwrap()

      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('lastEmail', data.email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('lastEmail')
      }

      // Reset form and close modal
      reset()
      closeModal()
      
      // Role-based redirect
      const userRole = result?.user?.role
      if (userRole === 'REFUGEE') {
        navigate('/dashboard')
      } else {
        navigate('/admin')
      }
    } catch (error) {
      // Backend errors handled by axios interceptor (shows toast)
      // Frontend validation handled by Zod (shown inline)
      console.log('Login error caught but handled by interceptor:', error)
    }
  }

  const isLoading = authStatus === 'loading' || isSubmitting

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-xl font-bold text-brand-navy mb-1.5">Welcome Back</h2>
        <p className="text-xs text-brand-gray">
          Please enter your details to access your dashboard.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-brand-navy mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
            <Input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              className={`pl-9 h-9 text-sm ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              disabled={isLoading}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-sm font-medium text-brand-navy">
              Password
            </label>
            <button
              type="button"
              onClick={closeModal}
              className="text-xs text-brand-blue hover:text-brand-blue-deep font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`pl-9 pr-9 h-9 text-sm ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              disabled={isLoading}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-navy transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="login-rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setValue('rememberMe', checked)}
            disabled={isLoading}
          />
          <label
            htmlFor="login-rememberMe"
            className="text-sm text-brand-gray cursor-pointer select-none"
          >
            Remember me for 30 days
          </label>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-brand-blue text-white hover:bg-brand-blue-deep font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-brand-gray">Or continue with</span>
        </div>
      </div>

      {/* OAuth - Google / GitHub / Facebook (same backend Auth0 flow) */}
      <div className="space-y-3">
      {/* OAuth - Continue with Google */}
      <a
        href={`${import.meta.env.VITE_API_URL}/auth/google`}
        className="flex w-full h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-brand-navy shadow-sm transition-all hover:bg-gray-50"
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
        className="flex w-full h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-brand-navy shadow-sm transition-all hover:bg-gray-50"
      >
        <svg className="h-5 w-5 text-gray-800" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.52 11.52 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
        Continue with GitHub
      </a>

      {/* OAuth - Continue with Facebook */}
      <a
        href={`${import.meta.env.VITE_API_URL}/auth/facebook`}
        className="flex w-full h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-brand-navy shadow-sm transition-all hover:bg-gray-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
        Continue with Facebook
      </a>
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-brand-gray">Don't have an account?</span>
        </div>
      </div>

      {/* Switch to Register */}
      <Button
        type="button"
        variant="outline"
        onClick={() => switchView('register')}
        className="w-full h-11 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-semibold text-sm rounded-xl transition-all"
      >
        Create a free account
      </Button>

      {/* Terms */}
      <p className="mt-5 text-center text-xs text-brand-gray">
        By signing in, you agree to our{' '}
        <Link to="/terms" onClick={closeModal} className="text-brand-blue hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" onClick={closeModal} className="text-brand-blue hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}