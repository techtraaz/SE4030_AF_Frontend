import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Target, Trophy, FileQuestion, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

/**
 * QuizCard - Reusable quiz display component
 * Used across different views (course detail, lesson view, my quizzes)
 * 
 * @param {Object} quiz - Quiz object
 * @param {string} variant - 'default', 'compact', 'detailed'
 * @param {boolean} showActions - Whether to show action buttons
 * @param {Function} onTake - Function to call when "Take Quiz" is clicked
 * @param {Function} onEdit - Function to call when editing (admin/contributor)
 * @param {Function} onDelete - Function to call when deleting
 * @param {Function} onPublish - Function to call when publishing
 */
const QuizCard = ({
  quiz,
  variant = 'default',
  showActions = true,
  onTake,
  onEdit,
  onDelete,
  onPublish,
}) => {
  const navigate = useNavigate()

  const handleTakeQuiz = () => {
    if (onTake) {
      onTake(quiz)
    } else {
      navigate(`/quiz/${quiz._id}`)
    }
  }

  const defaultView = (
    <Card className={cn(
      'hover:shadow-lg transition-shadow',
      !quiz.isPublished && 'border-dashed border-brand-gray/40'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-brand-blue" />
            {quiz.title}
          </CardTitle>
          {quiz.isPublished ? (
            <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="border-brand-gray/40 text-brand-gray">
              Draft
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {quiz.description && (
          <p className="text-sm text-brand-gray line-clamp-2">
            {quiz.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          {quiz.passingScore && (
            <div className="flex items-center gap-2 text-sm text-brand-gray">
              <Target className="h-4 w-4" />
              <span>Pass: {quiz.passingScore}%</span>
            </div>
          )}
          {quiz.timeLimit && (
            <div className="flex items-center gap-2 text-sm text-brand-gray">
              <Clock className="h-4 w-4" />
              <span>{quiz.timeLimit} min</span>
            </div>
          )}
          {quiz.maxAttempts && (
            <div className="flex items-center gap-2 text-sm text-brand-gray">
              <Trophy className="h-4 w-4" />
              <span>{quiz.maxAttempts} attempts</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2">
            {quiz.isPublished ? (
              <Button 
                size="sm" 
                className="flex-1 bg-brand-blue hover:bg-brand-navy"
                onClick={handleTakeQuiz}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Take Quiz
              </Button>
            ) : (
              onEdit && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => onEdit(quiz)}
                >
                  Edit
                </Button>
              )
            )}
            {onPublish && !quiz.isPublished && (
              <Button 
                size="sm" 
                className="flex-1 bg-brand-blue hover:bg-brand-blue-deep"
                onClick={() => onPublish(quiz)}
              >
                Publish
              </Button>
            )}
            {onDelete && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onDelete(quiz)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const compactView = (
    <div className={cn(
      'flex items-center justify-between p-4 border rounded-lg hover:bg-brand-gray/5 transition-colors',
      !quiz.isPublished && 'border-dashed border-gray-400'
    )}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <FileQuestion className="h-4 w-4 text-brand-blue" />
          <h3 className="font-semibold">{quiz.title}</h3>
          {quiz.isPublished ? (
            <Badge variant="outline" className="bg-brand-blue/10 border-brand-blue/30 text-brand-blue-deep">
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-400 text-amber-700">
              Draft
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-brand-gray">
          {quiz.passingScore && <span>Pass: {quiz.passingScore}%</span>}
          {quiz.timeLimit && <span>• {quiz.timeLimit} min</span>}
          {quiz.maxAttempts && <span>• {quiz.maxAttempts} attempts</span>}
        </div>
      </div>
      {showActions && quiz.isPublished && (
        <Button size="sm" onClick={handleTakeQuiz}>
          <PlayCircle className="h-4 w-4 mr-2" />
          Take Quiz
        </Button>
      )}
    </div>
  )

  const detailedView = (
    <Card className={cn(
      'hover:shadow-lg transition-shadow',
      !quiz.isPublished && 'border-dashed border-yellow-400'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              <FileQuestion className="h-6 w-6 text-brand-blue" />
              {quiz.title}
            </CardTitle>
            {quiz.description && (
              <p className="text-sm text-brand-gray mt-2">
                {quiz.description}
              </p>
            )}
          </div>
          {quiz.isPublished ? (
            <Badge className="bg-brand-blue/10 text-brand-blue-deep border-brand-blue/30">
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-400 text-amber-700">
              Draft
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {quiz.instructions && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-medium text-blue-900 mb-1">📋 Instructions:</p>
            <p className="text-sm text-blue-800">{quiz.instructions}</p>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-brand-gray/5 rounded-lg">
            <Target className="h-6 w-6 mx-auto text-brand-blue mb-1" />
            <p className="text-xs text-brand-gray">Pass Score</p>
            <p className="font-bold text-brand-navy">{quiz.passingScore || 60}%</p>
          </div>
          <div className="text-center p-3 bg-brand-gray/5 rounded-lg">
            <Clock className="h-6 w-6 mx-auto text-brand-blue mb-1" />
            <p className="text-xs text-brand-gray">Time Limit</p>
            <p className="font-bold text-brand-navy">
              {quiz.timeLimit ? `${quiz.timeLimit} min` : 'Unlimited'}
            </p>
          </div>
          <div className="text-center p-3 bg-brand-gray/5 rounded-lg">
            <Trophy className="h-6 w-6 mx-auto text-brand-blue mb-1" />
            <p className="text-xs text-brand-gray">Max Attempts</p>
            <p className="font-bold text-brand-navy">
              {quiz.maxAttempts || 'Unlimited'}
            </p>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2">
            {quiz.isPublished ? (
              <Button 
                className="flex-1 bg-brand-blue hover:bg-brand-navy"
                onClick={handleTakeQuiz}
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Quiz
              </Button>
            ) : (
              onEdit && (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => onEdit(quiz)}
                >
                  Edit Quiz
                </Button>
              )
            )}
            {onPublish && !quiz.isPublished && (
              <Button 
                className="flex-1 bg-brand-blue hover:bg-brand-blue-deep"
                onClick={() => onPublish(quiz)}
              >
                Publish
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (variant === 'compact') return compactView
  if (variant === 'detailed') return detailedView
  return defaultView
}

export default QuizCard
