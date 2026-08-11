import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, TrendingUp, Edit, CheckCircle2, XCircle, FileText, Headphones, BookMarked, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import lessonService from '@/services/lesson/lessonService'
import quizService from '@/services/quiz/quizService'
import { toastService } from '@/services/toastService'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import useAuth from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

/**
 * ViewLesson Page - Content Contributor's lesson detail view
 * Shows comprehensive lesson information, sections status, and quizzes
 */
export default function ViewLesson() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lesson, setLesson] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

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
      fetchLessonData()
    }
  }, [id, user])

  const fetchLessonData = async () => {
    try {
      setLoading(true)
      
      // Fetch lesson details
      const lessonData = await lessonService.getLessonById(id)
      setLesson(lessonData)
      
      // Fetch quizzes for this lesson
      const quizzesData = await quizService.getAllQuizzes({ lessonId: id })
      setQuizzes(quizzesData)
    } catch (error) {
      toastService.error('Failed to load lesson details')
      navigate('/admin/my-lessons')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton text="Loading lesson details..." />
  }

  if (!lesson) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-brand-gray mb-4" />
            <p className="text-brand-gray text-center">Lesson not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sections = [
    {
      name: 'Reading',
      icon: FileText,
      completed: !!lesson.reading,
      data: lesson.reading
    },
    {
      name: 'Listening',
      icon: Headphones,
      completed: !!lesson.listening,
      data: lesson.listening
    },
    {
      name: 'Vocabulary',
      icon: BookMarked,
      completed: !!lesson.vocabulary,
      data: lesson.vocabulary
    },
    {
      name: 'Video',
      icon: Video,
      completed: !!lesson.video,
      data: lesson.video
    }
  ]

  const completedSections = sections.filter(s => s.completed).length
  const completionPercentage = (completedSections / sections.length) * 100

  const getCategoryName = () => {
    const category = lesson.categoryId
    if (typeof category === 'object' && category?.name) return category.name
    return 'Uncategorized'
  }

  const getCourseName = () => {
    const course = lesson.courseId
    if (typeof course === 'object' && course?.title) return course.title
    return 'Unknown Course'
  }

  const difficultyColors = {
    beginner: 'bg-blue-100 text-blue-800 border-blue-200',
    intermediate: 'bg-blue-100 text-blue-800 border-blue-200',
    advanced: 'bg-gray-300 text-gray-800 border-gray-400',
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/my-lessons')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
                {lesson.isPublished ? (
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
              <Badge variant="outline" className={cn(difficultyColors[lesson.difficulty])}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {lesson.difficulty || 'beginner'}
              </Badge>
              <Badge variant="outline">{getCategoryName()}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/my-lessons`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Lesson
          </Button>
        </div>
      </div>

      {/* Lesson Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{getCourseName()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{lesson.estimatedMinutes || 10} minutes</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{Math.round(completionPercentage)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-brand-gray">{lesson.description}</p>
        </CardContent>
      </Card>

      {/* Sections Status */}
      <Card>
        <CardHeader>
          <CardTitle>Lesson Sections ({completedSections}/{sections.length} Completed)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-gray">Overall Progress</span>
                <span className={cn(
                  'font-semibold',
                  completionPercentage === 100 ? 'text-blue-600' : 'text-gray-600'
                )}>
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={cn(
                    'h-3 rounded-full transition-all',
                    completionPercentage === 100 ? 'bg-blue-600' : 'bg-gray-500'
                  )}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <div
                    key={section.name}
                    className={cn(
                      'p-4 border rounded-lg transition-colors',
                      section.completed 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={cn(
                          'h-5 w-5',
                          section.completed ? 'text-blue-600' : 'text-gray-400'
                        )} />
                        <h3 className={cn(
                          'font-medium',
                          section.completed ? 'text-brand-navy' : 'text-brand-gray'
                        )}>
                          {section.name}
                        </h3>
                      </div>
                      {section.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-brand-gray">
                      {section.completed 
                        ? 'Section content added' 
                        : 'Section not created yet'}
                    </p>
                  </div>
                )
              })}
            </div>

            {completionPercentage < 100 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <p className="font-medium">⚠️ Complete all 4 sections to publish this lesson</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lesson Quizzes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lesson Quizzes ({quizzes.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/my-quizzes')}
            >
              Manage Quizzes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <div className="text-center py-8 text-brand-gray">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No quizzes added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-brand-navy">{quiz.title}</h3>
                    <p className="text-sm text-brand-gray line-clamp-1">{quiz.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={quiz.isPublished ? 'default' : 'outline'}>
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    {quiz.passingScore && (
                      <span className="text-sm text-brand-gray">Pass: {quiz.passingScore}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
