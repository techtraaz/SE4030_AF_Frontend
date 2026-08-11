import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Users, Calendar, Globe, BarChart3, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import courseService from '@/services/course/courseService'
import lessonService from '@/services/lesson/lessonService'
import quizService from '@/services/quiz/quizService'
import { toastService } from '@/services/toastService'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import useAuth from '@/hooks/useAuth'

/**
 * ViewCourse Page - Content Contributor's course detail view
 * Shows comprehensive course information, lessons, quizzes, and statistics
 */
export default function ViewCourse() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [statistics, setStatistics] = useState(null)
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
      fetchCourseData()
    }
  }, [id, user])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      
      // Fetch course details
      const courseData = await courseService.getCourseById(id)
      setCourse(courseData)
      
      // Fetch lessons for this course
      const lessonsData = await lessonService.getAllLessons({ courseId: id })
      setLessons(lessonsData)
      
      // Fetch course quizzes
      const quizzesData = await quizService.getAllQuizzes({ courseId: id })
      setQuizzes(quizzesData)
      
      // Fetch course statistics
      try {
        const stats = await courseService.getCourseStatistics(id)
        setStatistics(stats)
      } catch (error) {
        // Statistics might not be available
        console.log('Statistics not available')
      }
    } catch (error) {
      toastService.error('Failed to load course details')
      navigate('/admin/my-courses')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton text="Loading course details..." />
  }

  if (!course) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-brand-gray mb-4" />
            <p className="text-brand-gray text-center">Course not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getLevelName = () => {
    const level = course.levelId || course.level
    if (typeof level === 'object' && level?.name) return level.name
    if (typeof level === 'string') return level
    return 'Unknown'
  }

  const getLanguageName = () => {
    const language = course.languageId || course.language
    if (typeof language === 'object' && language?.name) return language.name
    if (typeof language === 'string') return language
    return 'English'
  }

  const getCategoryName = () => {
    const category = course.categoryId
    if (typeof category === 'object' && category?.name) return category.name
    return 'Uncategorized'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/my-courses')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                {course.isPublished ? (
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
              <Badge variant="outline">{getLevelName()}</Badge>
              <Badge variant="outline">{getLanguageName()}</Badge>
              <Badge variant="outline">{getCategoryName()}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/my-courses`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Course
          </Button>
        </div>
      </div>

      {/* Course Description */}
      <Card>
        <CardHeader>
          <CardTitle>About This Course</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-brand-gray">{course.description}</p>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalLessons || lessons.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalEnrollments || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Quizzes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizzes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{new Date(course.createdAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Lessons ({lessons.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/my-lessons')}
            >
              Manage Lessons
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-8 text-brand-gray">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No lessons added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/lessons/${lesson._id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-brand-navy">{lesson.title}</h3>
                      <p className="text-sm text-brand-gray line-clamp-1">{lesson.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={lesson.isPublished ? 'default' : 'outline'}>
                      {lesson.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {lesson.difficulty || 'beginner'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Quizzes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Quizzes ({quizzes.length})</CardTitle>
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
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No course quizzes added yet</p>
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
