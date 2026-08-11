import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, TrendingUp, FileQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * LessonCard - Display lesson information in a card format
 * Used in lesson lists throughout the application
 */
const LessonCard = ({ 
  lesson, 
  onEdit, 
  onDelete, 
  onView,
  onPublish,
  onUnpublish,
  showActions = true,
  variant = 'default', // 'default' | 'compact' | 'detailed'
  quizCount = 0 // Number of quizzes for this lesson
}) => {
  const { 
    title, 
    description, 
    difficulty, 
    estimatedMinutes, 
    isPublished, 
    thumbnail,
    reading,
    listening,
    vocabulary,
    video,
    categoryId,
    order
  } = lesson || {}

  // Check if all sections exist
  const allSectionsComplete = reading && listening && vocabulary && video
  const completionPercentage = [reading, listening, vocabulary, video].filter(Boolean).length * 25

  const difficultyColors = {
    beginner: 'bg-blue-100 text-blue-800 border-blue-200',
    intermediate: 'bg-blue-100 text-blue-800 border-blue-200',
    advanced: 'bg-gray-300 text-gray-800 border-gray-400',
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {order && (
                <span className="text-xs font-semibold text-brand-gray">
                  #{order}
                </span>
              )}
              <h3 className="font-semibold text-lg text-brand-navy line-clamp-1">
                {title || 'Untitled Lesson'}
              </h3>
            </div>
            {description && variant !== 'compact' && (
              <p className="text-sm text-brand-gray line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>
          
          {isPublished ? (
            <Badge className="bg-blue-200 text-gray-800 border-gray-200">
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="border-blue-400 text-blue-700">
              Draft
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Lesson Metadata */}
        <div className="flex items-center gap-2 text-sm text-brand-gray flex-wrap">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{estimatedMinutes || 10} min</span>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs',
              difficultyColors[difficulty] || difficultyColors.beginner
            )}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            {difficulty || 'beginner'}
          </Badge>

          {categoryId?.name && (
            <Badge variant="outline" className="text-xs">
              {categoryId.name}
            </Badge>
          )}

          {quizCount > 0 && (
            <Badge 
              variant="outline" 
              className="text-xs bg-brand-blue/10 text-brand-blue border-brand-blue/30"
            >
              <FileQuestion className="h-3 w-3 mr-1" />
              {quizCount} {quizCount === 1 ? 'Quiz' : 'Quizzes'}
            </Badge>
          )}
        </div>

        {/* Section Completion Progress */}
        {variant !== 'compact' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-gray">Sections Complete</span>
              <span className={cn(
                'font-semibold',
                allSectionsComplete ? 'text-blue-600' : 'text-gray-600'
              )}>
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  'h-2 rounded-full transition-all',
                  allSectionsComplete ? 'bg-blue-600' : 'bg-gray-500'
                )}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className={cn('flex items-center gap-1', reading ? 'text-blue-600' : 'text-gray-400')}>
                <div className={cn('w-2 h-2 rounded-full', reading ? 'bg-blue-600' : 'bg-gray-300')} />
                <span>Reading</span>
              </div>
              <div className={cn('flex items-center gap-1', listening ? 'text-blue-600' : 'text-gray-400')}>
                <div className={cn('w-2 h-2 rounded-full', listening ? 'bg-blue-600' : 'bg-gray-300')} />
                <span>Listening</span>
              </div>
              <div className={cn('flex items-center gap-1', vocabulary ? 'text-blue-600' : 'text-gray-400')}>
                <div className={cn('w-2 h-2 rounded-full', vocabulary ? 'bg-blue-600' : 'bg-gray-300')} />
                <span>Vocab</span>
              </div>
              <div className={cn('flex items-center gap-1', video ? 'text-blue-600' : 'text-gray-400')}>
                <div className={cn('w-2 h-2 rounded-full', video ? 'bg-blue-600' : 'bg-gray-300')} />
                <span>Video</span>
              </div>
            </div>
          </div>
        )}

        {/* Publish Warning */}
        {isPublished && allSectionsComplete && variant !== 'compact' && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            ALL Sessions Completed and Published
          </div>
        )}
        {!isPublished && !allSectionsComplete && variant !== 'compact' && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            Complete all 4 sections to publish this lesson
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2 pt-3 border-t">
          {onView && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onView(lesson)}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          
          {onEdit && !isPublished && (
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(lesson)}
            >
              Edit
            </Button>
          )}
          
          {onPublish && !isPublished && allSectionsComplete && (
            <Button 
              size="sm" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => onPublish(lesson)}
            >
              Publish
            </Button>
          )}
          
          {onUnpublish && isPublished && (
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={() => onUnpublish(lesson)}
            >
              Unpublish
            </Button>
          )}
          
          {/* Only allow deleting draft lessons, not published ones */}
          {onDelete && !isPublished && (
            <Button 
              size="sm" 
              className="flex-1 text-white bg-gray-400 hover:text-red-500 hover:bg-gray-800"
              onClick={() => onDelete(lesson)}
            >
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

export default LessonCard
