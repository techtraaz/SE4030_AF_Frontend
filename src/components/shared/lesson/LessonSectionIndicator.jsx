import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Headphones, BookMarked, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * LessonSectionIndicator - Display status of lesson sections
 * Shows which sections are complete vs incomplete
 */
const LessonSectionIndicator = ({ lesson, size = 'default' }) => {
  const sections = [
    { name: 'Reading', icon: BookOpen, exists: !!lesson?.reading },
    { name: 'Listening', icon: Headphones, exists: !!lesson?.listening },
    { name: 'Vocabulary', icon: BookMarked, exists: !!lesson?.vocabulary },
    { name: 'Video', icon: Video, exists: !!lesson?.video },
  ]

  const sizeClasses = {
    sm: 'h-6 w-6',
    default: 'h-8 w-8',
    lg: 'h-10 w-10',
  }

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <div className="flex items-center gap-2">
      {sections.map((section) => {
        const Icon = section.icon
        return (
          <div
            key={section.name}
            className={cn(
              'flex items-center justify-center rounded-full border-2 transition-all',
              sizeClasses[size],
              section.exists 
                ? 'bg-brand-blue/10 border-brand-blue text-brand-blue-deep' 
                : 'bg-gray-100 border-gray-300 text-gray-400'
            )}
            title={`${section.name} ${section.exists ? '✓' : '✗'}`}
          >
            <Icon className={iconSizeClasses[size]} />
          </div>
        )
      })}
    </div>
  )
}

export default LessonSectionIndicator
