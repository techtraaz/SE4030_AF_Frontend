import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, Target, Trophy, FileQuestion, PlayCircle, CheckCircle2, 
  TrendingUp, ChevronDown, ChevronUp, Loader2 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import QuizAttemptHistory from './QuizAttemptHistory'
import quizAttemptService from '@/services/quiz/quizAttemptService'
import useAuth from '@/hooks/useAuth'

/**
 * QuizCardWithProgress - Quiz card with attempt history for refugees
 * Shows quiz info and expandable attempt history
 * 
 * @param {Object} quiz - Quiz object
 * @param {boolean} showHistory - Whether to allow expanding history
 * @param {Function} onTake - Function to call when "Take Quiz" is clicked
 */
const QuizCardWithProgress = ({ quiz, showHistory = true, onTake }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [attemptStats, setAttemptStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  
  const isRefugee = user?.role === 'REFUGEE'
  const refugeeId = user?._id || user?.id

  useEffect(() => {
    if (isRefugee && refugeeId && quiz._id) {
      loadAttemptStats()
    } else {
      setLoadingStats(false)
    }
  }, [quiz._id, refugeeId, isRefugee])

  const loadAttemptStats = async () => {
    try {
      setLoadingStats(true)
      const attempts = await quizAttemptService.getUserQuizAttempts(refugeeId, quiz._id)
      
      if (attempts && attempts.length > 0) {
        const bestScore = Math.max(...attempts.map(a => a.score))
        const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        const hasPassed = attempts.some(a => a.passed)
        
        setAttemptStats({
          totalAttempts: attempts.length,
          bestScore,
          avgScore: avgScore.toFixed(1),
          hasPassed,
          lastAttemptDate: new Date(attempts[0].attemptedAt)
        })
      } else {
        setAttemptStats(null)
      }
    } catch (error) {
      console.error('Failed to load attempt stats:', error)
      setAttemptStats(null)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleTakeQuiz = () => {
    if (onTake) {
      onTake(quiz)
    } else {
      navigate(`/quiz/${quiz._id}`)
    }
  }

  const handleRetake = () => {
    handleTakeQuiz()
  }

  const attemptsRemaining = quiz.maxAttempts && attemptStats 
    ? quiz.maxAttempts - attemptStats.totalAttempts 
    : null
  
  const canRetake = !quiz.maxAttempts || (attemptsRemaining && attemptsRemaining > 0)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-brand-blue flex-shrink-0" />
              <span>{quiz.title}</span>
            </CardTitle>
            {quiz.description && (
              <p className="text-sm text-brand-gray line-clamp-2 mt-2">
                {quiz.description}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 items-end shrink-0">
            {quiz.isPublished ? (
              <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                Published
              </Badge>
            ) : (
              <Badge variant="outline" className="border-brand-gray/40 text-brand-gray">
                Draft
              </Badge>
            )}
            {attemptStats?.hasPassed && (
              <Badge className="bg-brand-blue text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Passed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quiz Details */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          {quiz.passingScore && (
            <div className="flex items-center gap-2 text-brand-gray">
              <Target className="h-4 w-4" />
              <span>{quiz.passingScore}%</span>
            </div>
          )}
          {quiz.timeLimit && (
            <div className="flex items-center gap-2 text-brand-gray">
              <Clock className="h-4 w-4" />
              <span>{quiz.timeLimit}m</span>
            </div>
          )}
          {quiz.maxAttempts && (
            <div className="flex items-center gap-2 text-brand-gray">
              <Trophy className="h-4 w-4" />
              <span>{quiz.maxAttempts} tries</span>
            </div>
          )}
        </div>

        {/* Progress Stats (if available) */}
        {loadingStats ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-brand-blue" />
          </div>
        ) : attemptStats ? (
          <div className="grid grid-cols-3 gap-2 p-3 bg-brand-blue/5 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-brand-gray">Best</p>
              <p className="text-lg font-bold text-brand-blue">{attemptStats.bestScore}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-brand-gray">Avg</p>
              <p className="text-lg font-bold text-brand-navy">{attemptStats.avgScore}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-brand-gray">Attempts</p>
              <p className="text-lg font-bold text-brand-navy">
                {attemptStats.totalAttempts}
                {quiz.maxAttempts && `/${quiz.maxAttempts}`}
              </p>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {quiz.isPublished && (
            <>
              {attemptStats ? (
                <>
                  {attemptStats.hasPassed ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={handleTakeQuiz}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  ) : canRetake ? (
                    <Button 
                      size="sm" 
                      className="flex-1 bg-brand-blue hover:bg-brand-blue-deep"
                      onClick={handleRetake}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Retake{attemptsRemaining !== null && ` (${attemptsRemaining} left)`}
                    </Button>
                  ) : (
                    <div className="flex-1 text-center text-sm text-brand-gray py-2">
                      No attempts remaining
                    </div>
                  )}
                </>
              ) : (
                <Button 
                  size="sm" 
                  className="flex-1 bg-brand-blue hover:bg-brand-blue-deep"
                  onClick={handleTakeQuiz}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Quiz
                </Button>
              )}
              
              {showHistory && attemptStats && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpanded(!expanded)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  History
                  {expanded ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </Button>
              )}
            </>
          )}
        </div>

        {/* Expandable Attempt History */}
        {expanded && attemptStats && isRefugee && (
          <div className="pt-4 border-t">
            <QuizAttemptHistory
              quizId={quiz._id}
              refugeeId={refugeeId}
              passingScore={quiz.passingScore}
              maxAttempts={quiz.maxAttempts}
              onRetake={canRetake ? handleRetake : null}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuizCardWithProgress
