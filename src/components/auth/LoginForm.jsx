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
        <svg
          className="w-5 h-5 text-gray-800"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.303 7.5 11.258.086.115.086.25 0 .365-7.793 2.14-11.25-7.5-11.25-7.5C5.226 17.533 4 13.314 4 10 4 5.373 10.373 0 12 0zM12 2C6.48 2 2 6.482 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 6c-4.411 0-8 3.589-8 8 0 .794.213 1.534.588 2.13 2.177-1.534 3.5-3.13 4.375-5.125-.498.608-.997 1.25-.997 2.068 0 1.505.503 2.92.588 4.04-.063-.066-.086-.12-.086-.18 0-.132.025-.259.063-.385-2.136 1.087-3.227 1.863-3.227 3.135 0 1.424.617 2.56 1.237 3.475.6.912.6 1.865.6 2.875t.6 1.958c0 .806-.213 1.533-.588 2.13-2.118.6-3.5 2.13-4.375 3.135-1.03 1.808-1.535 3.137-1.535 5.125 0 8-3.589 8-8 0-.785-.21-1.533-.588-2.13A11.92 11.92 0 0 1 12 18c-4.41 0-8-3.589-8-8 0-.794.213-1.534.588-2.13 2.177 1.534 3.5 3.13 4.375 5.125.5 1.365.995 2.68.995 4.25 0 2.756-.018 5.333-.03 7.93.03.33.055.67.055 1.015 0 2.768-.027 5.273-.05 7.83-.2 1.07-.405 2.017-.96 2.83-.577.83-1.228 1.535-2.093 2.025-.866.494-1.828.755-2.83.875-.173.023-.356.03-.53.03-.156 0-.31-.01-.46-.03.176 1.182.6 2.093 1.237 2.875-.09.375-.198.685-.23 1.015.067.668.067 1.41 0 2.068-.066.25-1.237.6-2.83 1.03-3.475 1.237-1.637.6-3.4.995-4.375 1.155-1.025.98-2.232 1.7-3.025 1.8-1.05 3.533-4.608 6.025-4.608 8.055 0 3.533.6 6.7 1.237 9.48-.6 2.83-1.237 5.133-2.475 6.65-.6.6-1.2 1.125-1.8 1.35.3.075.6.1 .825.075.6 0 1.2-.075 1.8-.225.9.225 1.965.52 3.09.87.36.075.735.075 1.1 0 1.875-.3 3.675-1.012 5.25-1.11.6-.6 1.05-1.35.825-1.95t-.6-1.2.9-2.325zM12 4.5c2.485 0 4.5 2.015 4.5 4.5s-2.015 4.5-4.5 4.5-4.5-2.015-4.5-4.5S9.515 4.5 9.5 4.5 5 6.485 5 4.5 7.515 4.5 9.5 4.5z"
          />
        </svg>
        Continue with GitHub
      </a>

      {/* OAuth - Continue with Facebook */}
      <a
        href={`${import.meta.env.VITE_API_URL}/auth/facebook`}
        className="mt-3 flex w-full h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-brand-navy shadow-sm transition-all hover:bg-gray-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
        Continue with Facebook
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