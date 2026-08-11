import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileQuestion, Clock, Award, Edit, CheckCircle2, XCircle, Users, TrendingUp, BarChart3, Plus, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import quizService from '@/services/quiz/quizService'
import questionService from '@/services/quiz/questionService'
import optionService from '@/services/quiz/optionService'
import quizAttemptService from '@/services/quiz/quizAttemptService'
import { toastService } from '@/services/toastService'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import ManageQuizModal from '@/components/admin/quiz/ManageQuizModal'
import useAuth from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

/**
 * ViewQuiz Page - Content Contributor's quiz detail view
 * Shows comprehensive quiz information, questions, and statistics
 */
export default function ViewQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [questionsWithOptions, setQuestionsWithOptions] = useState([])
  const [expandedQuestions, setExpandedQuestions] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingStats, setLoadingStats] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Validate user role on mount
  useEffect(() => {
    if (!user) {
      toastService.error('Please log in to access this page')
      navigate('/')
      return
    }
    
    if (user.role === 'REFUGEE') {
      toastService.error('This page is only accessible to admins and content contributors')
      navigate('/dashboard')
      return
    }
  }, [user, navigate])

  useEffect(() => {
    if (user && user.role !== 'REFUGEE') {
      fetchQuizData()
    }
  }, [id, user])

  const fetchQuizData = async () => {
    try {
      setLoading(true)
      
      // Fetch quiz details
      const quizData = await quizService.getQuizById(id)
      setQuiz(quizData)
      
      // Fetch questions for this quiz
      const questionsData = await questionService.getAllQuestionsByQuiz(id)
      setQuestions(questionsData)
      
      // Fetch options for each question
      const questionsWithOpts = await Promise.all(
        questionsData.map(async (question) => {
          try {
            const options = await optionService.getOptionsByQuestion(question._id)
            return { ...question, options }
          } catch (error) {
            return { ...question, options: [] }
          }
        })
      )
      setQuestionsWithOptions(questionsWithOpts)
      
      // Fetch statistics if quiz is published
      if (quizData.isPublished) {
        fetchStatistics()
      }
    } catch (error) {
      toastService.error('Failed to load quiz details')
      navigate('/admin/my-quizzes')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      setLoadingStats(true)
      const stats = await quizAttemptService.getQuizStatistics(id)
      setStatistics(stats)
    } catch (error) {
      console.log('Statistics not available yet')
    } finally {
      setLoadingStats(false)
    }
  }

  const toggleQuestionExpansion = (questionId) => {
    setExpandedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleEditQuiz = () => {
    if (quiz.isPublished) {
      toastService.warning('Please unpublish the quiz before editing')
      return
    }
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false)
    fetchQuizData()
  }

  if (loading) {
    return <LoadingSkeleton text="Loading quiz details..." />
  }

  if (!quiz) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-brand-gray mb-4" />
            <p className="text-brand-gray text-center">Quiz not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getParentName = () => {
    if (quiz.lessonId) {
      const lesson = quiz.lessonId
      if (typeof lesson === 'object' && lesson?.title) return `Lesson: ${lesson.title}`
      return 'Lesson Quiz'
    }
    if (quiz.courseId) {
      const course = quiz.courseId
      if (typeof course === 'object' && course?.title) return `Course: ${course.title}`
      return 'Course Quiz'
    }
    return 'Standalone Quiz'
  }

  const getQuestionTypeLabel = (type) => {
    const types = {
      'multiple-choice': 'Multiple Choice',
      'true-false': 'True/False',
      'fill-in-blank': 'Fill in the Blank'
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/my-quizzes')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={quiz.isPublished ? 'default' : 'secondary'}>
                {quiz.isPublished ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Published
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Draft
                  </>
                )}
              </Badge>
              <Badge variant="outline">{getParentName()}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {quiz.isPublished && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unpublish to edit
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleEditQuiz}
            disabled={quiz.isPublished}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Quiz
          </Button>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Limit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes}m` : 'None'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passing Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quiz.passingScore ? `${quiz.passingScore}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quiz.maxAttempts || 'Unlimited'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-brand-gray">{quiz.description}</p>
        </CardContent>
      </Card>

      {/* Statistics - Only for published quizzes */}
      {quiz.isPublished && statistics && (
        <Card>
          <CardHeader>
            <CardTitle>Quiz Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 text-brand-blue" />
                  <div>
                    <div className="text-2xl font-bold text-brand-navy">{statistics.totalAttempts}</div>
                    <div className="text-sm text-brand-gray">Total Attempts</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-brand-blue" />
                  <div>
                    <div className="text-2xl font-bold text-brand-navy">{statistics.averageScore}%</div>
                    <div className="text-sm text-brand-gray">Average Score</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Award className="h-8 w-8 text-brand-blue" />
                  <div>
                    <div className="text-2xl font-bold text-brand-navy">{statistics.passRate}%</div>
                    <div className="text-sm text-brand-gray">Pass Rate</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-brand-blue" />
                  <div>
                    <div className="text-lg font-bold text-brand-navy">
                      {statistics.highestScore}% / {statistics.lowestScore}%
                    </div>
                    <div className="text-sm text-brand-gray">High / Low</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Questions ({questions.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/my-quizzes`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {questionsWithOptions.length === 0 ? (
            <div className="text-center py-8 text-brand-gray">
              <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No questions added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questionsWithOptions.map((question, index) => {
                const isExpanded = expandedQuestions.includes(question._id)
                const hasOptions = question.options && question.options.length > 0
                const correctCount = question.options?.filter(opt => opt.isCorrect).length || 0
                
                return (
                  <div
                    key={question._id}
                    className="border rounded-lg overflow-hidden"
                  >
                    {/* Question Header */}
                    <div className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue font-semibold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-brand-navy">{question.questionText}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {question.type?.replace('_', ' ') || 'Multiple Choice'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-brand-gray">
                            <span>Points: {question.points || 1}</span>
                            <span>•</span>
                            <span>{question.options?.length || 0} options</span>
                            {correctCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 font-medium">
                                  {correctCount} correct
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleQuestionExpansion(question._id)}
                          className="shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Options Section */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4">
                        {hasOptions ? (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-brand-gray mb-3">Answer Options:</h4>
                            {question.options.map((option, optIdx) => (
                              <div
                                key={option._id}
                                className={cn(
                                  'flex items-start gap-3 p-3 rounded-lg border-2 bg-white',
                                  option.isCorrect 
                                    ? 'border-green-500 bg-green-50' 
                                    : 'border-gray-200'
                                )}
                              >
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="font-medium text-sm text-brand-gray">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  {option.isCorrect && (
                                    <Check className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={cn(
                                    'text-sm',
                                    option.isCorrect ? 'font-medium text-green-900' : 'text-brand-navy'
                                  )}>
                                    {option.optionText}
                                  </p>
                                </div>
                                {option.isCorrect && (
                                  <Badge className="bg-green-100 text-green-700 border-green-300">
                                    Correct Answer
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-brand-gray">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No options added yet</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3"
                              onClick={handleEditQuiz}
                              disabled={quiz.isPublished}
                            >
                              Add Options
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Quiz Modal */}
      <ManageQuizModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        quiz={quiz}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
