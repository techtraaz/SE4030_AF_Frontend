import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Clock, CheckCircle2, XCircle, TrendingUp, Award, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import quizAttemptService from '@/services/quiz/quizAttemptService'
import { toastService } from '@/services/toastService'
import { cn } from '@/lib/utils'

/**
 * QuizAttemptHistory - Display user's quiz attempt history
 * @param {string} quizId - Quiz ID to show attempts for
 * @param {string} refugeeId - User ID
 * @param {number} passingScore - Passing score percentage
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {function} onRetake - Callback when retake is clicked
 */
const QuizAttemptHistory = ({ 
  quizId, 
  refugeeId, 
  passingScore = 70, 
  maxAttempts = null,
  onRetake 
}) => {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (quizId && refugeeId) {
      loadAttempts()
    }
  }, [quizId, refugeeId])

  const loadAttempts = async () => {
    try {
      setLoading(true)
      const data = await quizAttemptService.getUserQuizAttempts(refugeeId, quizId)
      // Sort by most recent first
      const sorted = (data || []).sort((a, b) => 
        new Date(b.attemptedAt) - new Date(a.attemptedAt)
      )
      setAttempts(sorted)
    } catch (error) {
      console.error('Failed to load quiz attempts:', error)
      toastService.error('Failed to load quiz history')
      setAttempts([])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getBestAttempt = () => {
    if (attempts.length === 0) return null
    return attempts.reduce((best, current) => 
      current.score > best.score ? current : best
    )
  }

  const bestAttempt = getBestAttempt()
  const attemptsRemaining = maxAttempts ? maxAttempts - attempts.length : Infinity
  const canRetake = attemptsRemaining > 0
  const hasPassed = attempts.some(a => a.passed)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
      </div>
    )
  }

  if (attempts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Award className="h-12 w-12 text-brand-gray mx-auto mb-3" />
          <p className="text-brand-gray">No attempts yet. Take the quiz to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-navy">
                {attempts.length}
              </p>
              <p className="text-xs text-brand-gray mt-1">
                {maxAttempts ? `of ${maxAttempts}` : 'Total'} Attempts
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-blue">
                {bestAttempt?.score || 0}%
              </p>
              <p className="text-xs text-brand-gray mt-1">Best Score</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-navy">
                {(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(1)}%
              </p>
              <p className="text-xs text-brand-gray mt-1">Average</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-center">
              {hasPassed ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-brand-blue mx-auto" />
                  <p className="text-xs text-brand-gray mt-1">Passed</p>
                </>
              ) : (
                <>
                  <XCircle className="h-8 w-8 text-brand-gray mx-auto" />
                  <p className="text-xs text-brand-gray mt-1">Not Passed</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retake Button */}
      {!hasPassed && canRetake && onRetake && (
        <div className="flex justify-center">
          <Button 
            onClick={onRetake}
            className="bg-brand-blue hover:bg-brand-blue-deep"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retake Quiz ({attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} left)
          </Button>
        </div>
      )}

      {!canRetake && !hasPassed && (
        <div className="text-center py-3 px-4 bg-brand-gray/10 rounded-lg">
          <p className="text-sm text-brand-gray">
            You've used all {maxAttempts} attempts. Contact support if you need additional attempts.
          </p>
        </div>
      )}

      {/* Attempt History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Attempt History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {attempts.map((attempt, index) => {
            const isBest = attempt._id === bestAttempt._id
            const isPassed = attempt.passed
            
            return (
              <div
                key={attempt._id}
                className={cn(
                  'p-4 rounded-lg border-l-4 transition-colors',
                  isPassed ? 'border-l-brand-blue bg-brand-blue/5' : 'border-l-brand-gray/30 bg-gray-50'
                )}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Attempt #{attempts.length - index}
                      </Badge>
                      {isBest && (
                        <Badge className="bg-brand-blue text-xs">
                          Best
                        </Badge>
                      )}
                      {isPassed && (
                        <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 text-xs">
                          Passed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-brand-gray text-xs">Score</p>
                        <p className={cn(
                          "font-semibold",
                          isPassed ? "text-brand-blue" : "text-brand-navy"
                        )}>
                          {attempt.score}%
                        </p>
                      </div>
                      <div>
                        <p className="text-brand-gray text-xs">Correct</p>
                        <p className="font-semibold text-brand-navy">
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </p>
                      </div>
                      <div>
                        <p className="text-brand-gray text-xs">Time</p>
                        <p className="font-semibold text-brand-navy flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(attempt.timeTakenSeconds || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-brand-gray text-xs">When</p>
                        <p className="font-semibold text-brand-navy">
                          {formatDistanceToNow(new Date(attempt.attemptedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {isPassed ? (
                    <CheckCircle2 className="h-6 w-6 text-brand-blue flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-brand-gray flex-shrink-0" />
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizAttemptHistory
