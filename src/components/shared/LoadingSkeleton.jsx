import React from 'react'
import logo from '@/assets/images/logo.png'

/**
 * LoadingSkeleton - Reusable loading indicator with logo
 * Provides a consistent loading experience across the application
 */
const LoadingSkeleton = ({ 
  size = 'default', // 'small' | 'default' | 'large'
  text = 'Loading...',
  fullScreen = false,
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
  }

  const spinnerSizeClasses = {
    small: 'w-12 h-12',
    default: 'w-20 h-20',
    large: 'w-28 h-28',
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center'
    : 'flex items-center justify-center py-12'

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {/* Spinner with logo */}
        <div className="relative">
          {/* Spinner ring */}
          <div className={`${spinnerSizeClasses[size]} border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin`}></div>
          
          {/* Logo in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${sizeClasses[size]} rounded-full bg-brand-blue flex items-center justify-center animate-pulse`}>
              <img 
                src={logo} 
                alt="Wordigo Logo" 
                className="w-2/3 h-2/3 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Loading text */}
        {text && (
          <p className="text-brand-gray font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export default LoadingSkeleton
