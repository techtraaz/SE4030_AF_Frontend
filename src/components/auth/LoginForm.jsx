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
      // SECURITY: Only store a boolean preference, never the raw email.
      // Email pre-fill is not worth the PII exposure risk on shared devices.
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
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