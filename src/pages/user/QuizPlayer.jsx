import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, Clock, AlertCircle, CheckCircle2, XCircle, ChevronRight, BookOpen, FileQuestion, ChevronRight as ChevronRightIcon, ArrowLeft } from 'lucide-react'
import { toastService } from '@/services/toastService'
import quizService from '@/services/quiz/quizService'
import questionService from '@/services/quiz/questionService'
import optionService from '@/services/quiz/optionService'
import quizAttemptService from '@/services/quiz/quizAttemptService'
import useAuth from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

/**
 * Format seconds to MM:SS
 */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format responses for backend submission
 */
const formatResponses = (questionsWithOptions, answers) => {
  return questionsWithOptions.map(question => {
    const answer = answers[question._id]
    
    if (question.type === 'multiple_select') {
      return {
        questionId: question._id,
        selectedOptionIds: Array.isArray(answer) ? answer : []
      }
    } else if (question.type === 'fill_blank') {
      const correctOption = question.options.find(opt => 
        opt.optionText?.toLowerCase().trim() === answer?.toLowerCase().trim()
      ) || question.options[0]
      
      return {
        questionId: question._id,
        selectedOptionId: correctOption?._id || ''
      }
    } else {
      return {
        questionId: question._id,
        selectedOptionId: answer || ''
      }
    }
  })
}

/**
 * QuizHeader - Quiz title, question number, and timer display with context
 */
function QuizHeader({ quiz, currentIndex, totalQuestions, timeRemaining, navigate }) {
  const handleBack = () => {
    if (quiz.lessonId?._id) {
      // Go back to the lesson player
      navigate(`/dashboard/lesson/${quiz.lessonId._id}`)
    } else if (quiz.courseId?._id) {
      // Go back to the course detail page
      navigate(`/dashboard/courses/${quiz.courseId._id}`)
    } else {
      // Fallback to courses page
      navigate('/dashboard/my-courses')
    }
  }

  return (
    <div className="bg-white border-b top-0 z-10 shadow-sm">
      <div className="container max-w-4xl mx-auto px-4 py-4">
        {/* Breadcrumb Navigation with Back Button */}
        {(quiz.courseId || quiz.lessonId) && (
          <div className="flex items-center gap-3 mb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="hover:bg-brand-blue/10 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2 text-sm text-brand-gray">
              {quiz.courseId && (
                <>
                  <BookOpen className="h-4 w-4" />
                  <span>{quiz.courseId.title}</span>
                </>
              )}
              {quiz.lessonId && (
                <>
                  <ChevronRightIcon className="h-4 w-4" />
                  <span>{quiz.lessonId.title}</span>
                </>
              )}
              <ChevronRightIcon className="h-4 w-4" />
              <FileQuestion className="h-4 w-4" />
              <span className="text-brand-navy font-medium">Quiz</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-brand-navy">{quiz.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-brand-gray">
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
              {quiz.passingScore && <span>•</span>}
              {quiz.passingScore && <span>Pass: {quiz.passingScore}%</span>}
            </div>
          </div>
          {timeRemaining !== null && (
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold',
              timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-brand-gray/10'
            )}>
              <Clock className="h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        
        <QuizProgressBar current={currentIndex + 1} total={totalQuestions} />
      </div>
    </div>
  )
}

/**
 * QuizProgressBar - Visual progress indicator
 */
function QuizProgressBar({ current, total }) {
  const progress = (current / total) * 100
  return (
    <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-brand-blue transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/**
 * QuizResults - Results display after quiz completion
 */
function QuizResults({ results, quiz, inline, onBack }) {
  const passed = results.score >= quiz.passingScore
  const attemptsRemaining = quiz.maxAttempts 
    ? Math.max(0, quiz.maxAttempts - (results.attemptNumber || 1))
    : Infinity
  
  return (
    <div className={cn("container max-w-4xl mx-auto px-4", inline ? "py-4" : "py-8")}>
      <Card className="border-2">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            {passed ? (
              <CheckCircle2 className="h-20 w-20 text-brand-blue mx-auto" />
            ) : (
              <XCircle className="h-20 w-20 text-red-500 mx-auto" />
            )}
            
            <h1 className="text-3xl font-bold text-brand-navy">
              {passed ? 'Congratulations! 🎉' : 'Keep Practicing!'}
            </h1>
            
            <div className="flex justify-center gap-8 py-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-brand-navy">{results.score}%</p>
                <p className="text-brand-gray">Your Score</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-brand-navy">{quiz.passingScore}%</p>
                <p className="text-brand-gray">Passing Score</p>
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <p className="text-lg">
                <span className="font-semibold">Correct Answers:</span> {results.correctAnswers} / {results.totalQuestions}
              </p>
              {results.timeTakenSeconds && (
                <p className="text-brand-gray">
                  Time Taken: {formatTime(results.timeTakenSeconds)}
                </p>
              )}
              {passed ? (
                <Badge className="bg-brand-blue text-white mt-2">Passed ✓</Badge>
              ) : (
                <Badge variant="outline" className="border-red-500 text-red-700 mt-2">Not Passed</Badge>
              )}
            </div>

            <div className="flex gap-4 justify-center pt-6">
              <Button onClick={onBack} className="bg-brand-blue hover:bg-brand-blue-deep">
                Back to Course
              </Button>
              {!passed && attemptsRemaining > 0 && (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again {quiz.maxAttempts ? `(${attemptsRemaining} left)` : ''}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6 text-center">
          <p className="text-brand-gray">
            {passed 
              ? "Great job! You've passed this quiz. Continue to the next lesson."
              : "Review the material and try again. You can do it!"
            }
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * QuestionCard - Displays question text and type information
 */
function QuestionCard({ question, children }) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="capitalize">
                {question.type.replace('_', ' ')}
              </Badge>
              <span className="text-sm text-brand-gray">
                {question.points} point{question.points !== 1 ? 's' : ''}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-brand-navy">
              {question.questionText}
            </h2>
          </div>
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * FillBlankInput - Text input for fill-in-the-blank questions
 */
function FillBlankInput({ value, onChange }) {
  return (
    <Input
      placeholder="Type your answer here..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-lg"
    />
  )
}

/**
 * TrueFalseOptions - True/False button selection
 */
function TrueFalseOptions({ question, selectedAnswer, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {['True', 'False'].map((option) => {
        const matchingOption = question.options.find(opt => 
          opt.optionText.toLowerCase() === option.toLowerCase()
        )
        const isSelected = selectedAnswer === matchingOption?._id
        
        return (
          <button
            key={option}
            onClick={() => onChange(matchingOption._id)}
            className={cn(
              'p-6 border-2 rounded-lg font-semibold text-lg transition-all',
              isSelected 
                ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' 
                : 'border-gray-300 hover:border-brand-blue/50'
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

/**
 * MultipleChoiceOptions - Radio/checkbox options for questions
 */
function MultipleChoiceOptions({ question, selectedAnswer, onChange, isMultiSelect }) {
  return (
    <>
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = isMultiSelect
            ? selectedAnswer?.includes(option._id)
            : selectedAnswer === option._id
          
          return (
            <button
              key={option._id}
              onClick={() => onChange(option._id)}
              className={cn(
                'w-full p-4 border-2 rounded-lg text-left transition-all flex items-center gap-3',
                isSelected 
                  ? 'border-brand-blue bg-brand-blue/10' 
                  : 'border-gray-300 hover:border-brand-blue/50'
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                isSelected ? 'border-brand-blue bg-brand-blue' : 'border-gray-400'
              )}>
                {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
              </div>
              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
              <span className="flex-1">{option.optionText}</span>
            </button>
          )
        })}
      </div>
      {isMultiSelect && (
        <p className="text-sm text-brand-gray italic mt-3">
          💡 Select all correct answers
        </p>
      )}
    </>
  )
}

/**
 * QuizNavigation - Previous/Next buttons and question indicators
 */
function QuizNavigation({ 
  currentIndex, 
  questions, 
  answers, 
  submitting, 
  onPrevious, 
  onNext, 
  onQuestionSelect, 
  onSubmit 
}) {
  return (
    <div className="flex items-center justify-between mt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentIndex === 0}
      >
        Previous
      </Button>

      <div className="flex gap-2">
        {questions.map((question, index) => {
          const hasAnswer = answers[question._id] && (
            question.type === 'multiple_select' 
              ? answers[question._id].length > 0 
              : answers[question._id]
          )
          
          return (
            <button
              key={index}
              onClick={() => onQuestionSelect(index)}
              className={cn(
                'w-8 h-8 rounded-full border-2 transition-all font-medium',
                index === currentIndex
                  ? 'border-brand-blue bg-brand-blue text-white'
                  : hasAnswer
                  ? 'border-brand-blue bg-brand-blue/20 text-brand-blue'
                  : 'border-gray-300 hover:border-brand-blue/50'
              )}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      {currentIndex === questions.length - 1 ? (
        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="bg-brand-blue hover:bg-brand-blue-deep"
        >
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Submit Quiz
        </Button>
      ) : (
        <Button onClick={onNext} className="bg-brand-blue hover:bg-brand-blue-deep">
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  )
}

/**
 * QuizPlayer - Interactive quiz taking interface for refugees
 * Orchestrates quiz flow: loading, taking, and submitting quizzes
 */
const QuizPlayer = ({ quizId: propQuizId, inline = false, onBack }) => {
  const { quizId: paramQuizId } = useParams()
  const quizId = propQuizId || paramQuizId
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // State management
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [questionsWithOptions, setQuestionsWithOptions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [results, setResults] = useState(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [unansweredCount, setUnansweredCount] = useState(0)

  // Validate user role on mount
  useEffect(() => {
    if (!user) {
      toastService.error('Please log in to take quizzes')
      navigate('/')
      return
    }
    
    if (user.role !== 'REFUGEE') {
      toastService.error('Only refugees can take quizzes')
      navigate('/admin/dashboard')
      return
    }
  }, [user, navigate])

  // Load quiz data on mount
  useEffect(() => {
    if (user && user.role === 'REFUGEE') {
      loadQuiz()
    }
  }, [quizId, user])

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !isCompleted) {
      handleSubmit()
    }
  }, [timeRemaining, isCompleted])

  /**
   * Load quiz data, questions, and options
   */
  const loadQuiz = async () => {
    try {
      setLoading(true)
      
      const quizData = await quizService.getQuizById(quizId)
      
      // Validate quiz is published before allowing refugees to take it
      if (!quizData.isPublished) {
        toastService.error('This quiz is not available yet')
        handleBack()
        return
      }
      
      setQuiz(quizData)
      
      if (quizData.timeLimit) {
        setTimeRemaining(quizData.timeLimit * 60)
      }
      
      setStartTime(Date.now())
      
      const questionsData = await questionService.getAllQuestionsByQuiz(quizId)
      
      const orderedQuestions = quizData.isRandomOrder 
        ? [...questionsData].sort(() => Math.random() - 0.5)
        : questionsData
      
      setQuestions(orderedQuestions)
      
      const questionsWithOpts = await Promise.all(
        orderedQuestions.map(async (question) => {
          const options = await optionService.getOptionsByQuestion(question._id)
          return { ...question, options }
        })
      )
      
      setQuestionsWithOptions(questionsWithOpts)
      
      const initialAnswers = {}
      orderedQuestions.forEach(q => {
        initialAnswers[q._id] = q.type === 'multiple_select' ? [] : ''
      })
      setAnswers(initialAnswers)
      
    } catch (error) {
      toastService.error('Failed to load quiz')
      handleBack()
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle answer selection/change
   */
  const handleAnswerChange = (questionId, value, type) => {
    if (type === 'multiple_select') {
      const currentAnswers = answers[questionId] || []
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter(v => v !== value)
        : [...currentAnswers, value]
      setAnswers({ ...answers, [questionId]: newAnswers })
    } else {
      setAnswers({ ...answers, [questionId]: value })
    }
  }

  /**
   * Submit quiz attempt
   */
  const handleSubmit = async () => {
    const unanswered = questions.filter(q => {
      const answer = answers[q._id]
      return q.type === 'multiple_select' 
        ? !answer || answer.length === 0
        : !answer || answer.trim() === ''
    })

    if (unanswered.length > 0 && timeRemaining !== 0) {
      setUnansweredCount(unanswered.length)
      setShowSubmitConfirm(true)
      return
    }

    await submitQuiz()
  }

  /**
   * Actual quiz submission logic
   */
  const submitQuiz = async () => {
    try {
      setSubmitting(true)
      
      const timeTakenSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
      const responses = formatResponses(questionsWithOptions, answers)
      
      const attemptData = {
        refugeeId: user._id,
        quizId,
        responses,
        timeTakenSeconds
      }
      
      const result = await quizAttemptService.submitQuizAttempt(attemptData)
      setResults(result)
      setIsCompleted(true)
      toastService.success('Quiz submitted successfully!')
      
    } catch (error) {
      console.error('Quiz submission error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to submit quiz'
      toastService.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Navigate back to course/previous page
   */
  const handleBack = () => {
    if (inline && onBack) {
      onBack()
    } else {
      // Navigate back to lesson or course
      if (quiz.lessonId?._id) {
        navigate(`/dashboard/lesson/${quiz.lessonId._id}`)
      } else if (quiz.courseId?._id) {
        navigate(`/dashboard/courses/${quiz.courseId._id}`)
      } else {
        navigate('/dashboard/my-courses')
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  // Error state
  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl text-brand-gray">Quiz not found</p>
      </div>
    )
  }

  // Results view
  if (isCompleted && results) {
    return <QuizResults 
      results={results} 
      quiz={quiz} 
      inline={inline} 
      onBack={handleBack} 
    />
  }

  // Quiz taking view
  const currentQuestion = questionsWithOptions[currentQuestionIndex]

  return (
    <div className={cn(inline ? "bg-gray-50" : "min-h-screen bg-brand-gray/10")}>
      <QuizHeader 
        quiz={quiz} 
        currentIndex={currentQuestionIndex} 
        totalQuestions={questions.length} 
        timeRemaining={timeRemaining}
        navigate={navigate}
      />

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {currentQuestion && (
          <QuestionCard question={currentQuestion}>
            <div className="space-y-3">
              {currentQuestion.type === 'fill_blank' ? (
                <FillBlankInput
                  value={answers[currentQuestion._id] || ''}
                  onChange={(value) => handleAnswerChange(currentQuestion._id, value, currentQuestion.type)}
                />
              ) : currentQuestion.type === 'true_false' ? (
                <TrueFalseOptions
                  question={currentQuestion}
                  selectedAnswer={answers[currentQuestion._id]}
                  onChange={(value) => handleAnswerChange(currentQuestion._id, value, currentQuestion.type)}
                />
              ) : (
                <MultipleChoiceOptions
                  question={currentQuestion}
                  selectedAnswer={answers[currentQuestion._id]}
                  onChange={(value) => handleAnswerChange(currentQuestion._id, value, currentQuestion.type)}
                  isMultiSelect={currentQuestion.type === 'multiple_select'}
                />
              )}
            </div>
          </QuestionCard>
        )}

        <QuizNavigation
          currentIndex={currentQuestionIndex}
          questions={questions}
          answers={answers}
          submitting={submitting}
          onPrevious={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
          onNext={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
          onQuestionSelect={setCurrentQuestionIndex}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Submit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={submitQuiz}
        title="Submit Quiz"
        description={`You have ${unansweredCount} unanswered question(s). Are you sure you want to submit anyway? Unanswered questions will be marked as incorrect.`}
        confirmText="Submit Anyway"
        cancelText="Go Back"
        variant="warning"
      />
    </div>
  )
}

export default QuizPlayer
