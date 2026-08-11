import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, Users, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { registerUser, registerContributor, selectAuthStatus } from '@/features/auth/authSlice'
import { useAuthModal } from '@/context/AuthModalContext'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(50, 'Too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Too long'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z
      .boolean()
      .refine((val) => val === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function RegisterForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authStatus = useSelector(selectAuthStatus)
  const { switchView, closeModal } = useAuthModal()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState('refugee') // 'refugee' or 'contributor'
  const [showPendingMessage, setShowPendingMessage] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  })

  const agreeTerms = watch('agreeTerms')

  const onSubmit = async (data) => {
    try {
      let result
      
      if (role === 'refugee') {
        result = await dispatch(registerUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password
        })).unwrap()

        // Reset form and close modal on success
        reset()
        closeModal()
        navigate('/dashboard')
      } else {
        // Content contributor registration
        result = await dispatch(registerContributor({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password
        })).unwrap()

        // Show pending approval message
        reset()
        setShowPendingMessage(true)
      }
    } catch (error) {
      // Backend errors handled by axios interceptor (shows toast)
      // Frontend validation handled by Zod (shown inline)
      console.log('Register error caught but handled by interceptor:', error)
    }
  }

  const isLoading = authStatus === 'loading' || isSubmitting

  // Handle pending message state
  if (showPendingMessage) {
    return (
      <div className="w-full text-center py-8">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-brand-blue" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-brand-navy mb-3">Registration Submitted!</h2>
        <p className="text-sm text-brand-gray mb-6 max-w-md mx-auto">
          Your content contributor account is pending admin approval. Your account will be activated momentarily.
        </p>
        <Button
          onClick={() => {
            setShowPendingMessage(false)
            switchView('login')
          }}
          className="bg-brand-blue hover:bg-brand-blue-deep text-white px-8"
        >
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-brand-navy mb-2">Create Account</h2>
        <p className="text-xs text-brand-gray mb-4">
          Join thousands of learners. It's free to get started.
        </p>
        
        {/* Role Selection Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setRole('refugee')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-xs font-medium transition-all ${
              role === 'refugee'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-brand-gray hover:text-brand-navy'
            }`}
          >
            <Users className="w-4 h-4" />
            Join as Refugee
          </button>
          <button
            type="button"
            onClick={() => setRole('contributor')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-xs font-medium transition-all ${
              role === 'contributor'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-brand-gray hover:text-brand-navy'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Join as Contributor
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-firstName" className="block text-xs font-medium text-brand-navy mb-1">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
              <Input
                id="reg-firstName"
                placeholder="John"
                className={`pl-9 h-9 text-xs ${errors.firstName ? 'border-red-500' : ''}`}
                disabled={isLoading}
                {...register('firstName')}
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="reg-lastName" className="block text-xs font-medium text-brand-navy mb-1">
              Last Name
            </label>
            <Input
              id="reg-lastName"
              placeholder="Doe"
              className={`h-9 text-xs ${errors.lastName ? 'border-red-500' : ''}`}
              disabled={isLoading}
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-xs font-medium text-brand-navy mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
            <Input
              id="reg-email"
              type="email"
              placeholder="name@example.com"
              className={`pl-9 h-9 text-xs ${errors.email ? 'border-red-500' : ''}`}
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
          <label htmlFor="reg-password" className="block text-xs font-medium text-brand-navy mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              className={`pl-9 pr-9 h-9 text-xs ${errors.password ? 'border-red-500' : ''}`}
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

        {/* Confirm Password */}
        <div>
          <label htmlFor="reg-confirmPassword" className="block text-xs font-medium text-brand-navy mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
            <Input
              id="reg-confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              className={`pl-9 pr-9 h-9 text-xs ${errors.confirmPassword ? 'border-red-500' : ''}`}
              disabled={isLoading}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-navy transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Agree Terms */}
        <div className="flex items-start space-x-2 pt-0.5">
          <Checkbox
            id="reg-agreeTerms"
            checked={agreeTerms}
            onCheckedChange={(checked) => setValue('agreeTerms', checked)}
            disabled={isLoading}
            className="mt-0.5"
          />
          <label htmlFor="reg-agreeTerms" className="text-xs text-brand-gray cursor-pointer select-none leading-relaxed">
            I agree to the{' '}
            <Link to="/terms" onClick={closeModal} className="text-brand-blue hover:underline font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" onClick={closeModal} className="text-brand-blue hover:underline font-medium">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agreeTerms && (
          <p className="text-xs text-red-600 flex items-center gap-1 -mt-1">
            <AlertCircle className="w-3 h-3" />
            {errors.agreeTerms.message}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-brand-blue text-white hover:bg-brand-blue-deep font-semibold text-xs rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {role === 'refugee' ? 'Start Learning' : 'Submit Registration'} <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>

      {/* Role-specific Info */}
      {role === 'contributor' && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs text-brand-navy flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
            <span>
              Content contributor accounts require admin approval. Your account will be activated momentarily.
            </span>
          </p>
        </div>
      )}

      {/* Switch to Login */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-brand-gray">Already have an account?</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => switchView('login')}
        className="w-full h-11 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-semibold text-xs rounded-xl transition-all"
      >
        Sign In instead
      </Button>

      {/* Terms */}
      <p className="mt-4 text-center text-xs text-brand-gray">
        By creating an account, you agree to our{' '}
        <Link to="/terms" onClick={closeModal} className="text-brand-blue hover:underline font-medium">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" onClick={closeModal} className="text-brand-blue hover:underline font-medium">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}