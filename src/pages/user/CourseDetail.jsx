import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ArrowLeft, BookOpen, FileQuestion, Users, Clock, BarChart } from 'lucide-react'
import { toastService } from '@/services/toastService'
import courseService from '@/services/course/courseService'
import enrollmentService from '@/services/course/enrollmentService'
import lessonService from '@/services/lesson/lessonService'
import quizService from '@/services/quiz/quizService'
import LessonCard from '@/components/shared/lesson/LessonCard'
import QuizCard from '@/components/shared/quiz/QuizCard'
import QuizCardWithProgress from '@/components/shared/quiz/QuizCardWithProgress'
import useAuth from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

/**
 * CourseDetail - Comprehensive course detail page
 * Shows course info, lessons, and quizzes
 * Available for all user roles
 * @param {string} courseId - Course ID (for inline mode)
 * @param {boolean} inline - Whether displayed inline (no URL routing)
 * @param {function} onBack - Callback when back button is clicked (inline mode)
 * @param {function} onViewLesson - Callback when lesson is clicked (inline mode)
 * @param {function} onViewQuiz - Callback when quiz is clicked (inline mode)
 */
const CourseDetail = ({ courseId: propCourseId, inline = false, onBack, onViewLesson, onViewQuiz }) => {
  const { courseId: paramCourseId } = useParams()
  const courseId = propCourseId || paramCourseId
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [lessonQuizzes, setLessonQuizzes] = useState([])
  const [quizCountByLesson, setQuizCountByLesson] = useState({})
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentData, setEnrollmentData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadCourseData()
    checkEnrollmentStatus()
  }, [courseId])

  const checkEnrollmentStatus = async () => {
    if (user?.role !== 'REFUGEE') return
    
    try {
      const result = await enrollmentService.checkEnrollmentStatus(courseId)
      // Handle both boolean and object responses
      const enrolled = typeof result === 'boolean' ? result : result?.isEnrolled || false
      setIsEnrolled(enrolled)
      
      // If enrolled, fetch full enrollment details
      if (enrolled) {
        try {
          const enrollment = await enrollmentService.getEnrollmentDetails(courseId)
          setEnrollmentData(enrollment)
        } catch (err) {
          console.log('Could not fetch enrollment details:', err)
        }
      }
    } catch (error) {
      console.log('Not enrolled or error checking status:', error)
      setIsEnrolled(false)
    }
  }

  const loadCourseData = async () => {
    try {
      setLoading(true)
      
      // Load course details
      const courseData = await courseService.getCourseById(courseId)
      setCourse(courseData)
      
      // Load lessons for this course
      const lessonsData = await lessonService.getAllLessons({ courseId, isPublished: true })
      setLessons(lessonsData)
      
      // Load course-level quizzes
      const courseQuizzesData = await quizService.getAllQuizzes({ courseId, isPublished: true })
      
      // Load all lesson-level quizzes for this course
      // We'll fetch quizzes for each lesson and aggregate
      const lessonIds = lessonsData.map(lesson => lesson._id)
      const lessonQuizzesPromises = lessonIds.map(lessonId => 
        quizService.getAllQuizzes({ lessonId, isPublished: true }).catch(() => [])
      )
      const lessonQuizzesArrays = await Promise.all(lessonQuizzesPromises)
      const allLessonQuizzes = lessonQuizzesArrays.flat()
      
      // Build quiz count map by lesson
      const quizCounts = {}
      allLessonQuizzes.forEach(quiz => {
        const lessonId = quiz.lessonId?._id || quiz.lessonId
        quizCounts[lessonId] = (quizCounts[lessonId] || 0) + 1
      })
      
      setQuizzes(courseQuizzesData)
      setLessonQuizzes(allLessonQuizzes)
      setQuizCountByLesson(quizCounts)
      
    } catch (error) {
      toastService.error('Failed to load course details')
      if (inline && onBack) {
        onBack()
      } else {
        navigate(-1)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!course?._id) return
    
    // Double check if already enrolled (prevent duplicate calls)
    if (isEnrolled) {
      toastService.info('You are already enrolled in this course')
      return
    }
    
    try {
      setEnrolling(true)
      await enrollmentService.enrollInCourse(course._id)
      toastService.success(`Enrolled in "${course.title}"!`)
      setIsEnrolled(true)
      await checkEnrollmentStatus()
    } catch (error) {
      console.error('Failed to enroll:', error)
      // Only show error if it's not an "already enrolled" error
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to enroll'
      if (!errorMessage.toLowerCase().includes('already enrolled')) {
        toastService.error(errorMessage)
      }
    } finally {
      setEnrolling(false)
    }
  }

  const handleBack = () => {
    if (inline && onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  const handleStartLesson = (lesson) => {
    if (inline && onViewLesson) {
      onViewLesson(lesson._id)
    } else {
      navigate(`/dashboard/lesson/${lesson._id}`)
    }
  }

  const handleTakeQuiz = (quiz) => {
    if (inline && onViewQuiz) {
      onViewQuiz(quiz._id)
    } else {
      navigate(`/dashboard/quiz/${quiz._id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-brand-gray">Course not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-brand-navy/95 to-brand-blue/95 rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Course Info */}
          <div className="flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 -ml-2 mb-2"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className="bg-white/20 text-white text-xs">
                {course.levelId?.name || course.level || 'All Levels'}
              </Badge>
              {course.isPublished && (
                <Badge className="bg-brand-blue-light/30 text-white text-xs">Published</Badge>
              )}
              {isEnrolled && (
                <Badge className="bg-brand-blue text-white text-xs">✓ Enrolled</Badge>
              )}
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1.5 line-clamp-2">
              {course.title}
            </h1>
            <p className="text-white/80 text-sm line-clamp-2 mb-2">
              {course.description}
            </p>
            
            {user?.role === 'REFUGEE' && !isEnrolled && (
              <Button 
                onClick={handleEnroll} 
                disabled={enrolling}
                className="bg-white text-brand-blue hover:bg-white/90"
                size="sm"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  'Enroll Now'
                )}
              </Button>
            )}
          </div>

          {/* Right: Compact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
            <div className="bg-white/10 rounded-lg p-2.5 min-w-[90px]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <BookOpen className="h-3.5 w-3.5 text-white/80" />
                <span className="text-lg font-bold text-white">{lessons.length}</span>
              </div>
              <p className="text-xs text-white/60">Lessons</p>
            </div>

            <div className="bg-white/10 rounded-lg p-2.5 min-w-[90px]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <FileQuestion className="h-3.5 w-3.5 text-white/80" />
                <span className="text-lg font-bold text-white">{quizzes.length}</span>
              </div>
              <p className="text-xs text-white/60">Quizzes</p>
            </div>

            <div className="bg-white/10 rounded-lg p-2.5 min-w-[90px]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Clock className="h-3.5 w-3.5 text-white/80" />
                <span className="text-lg font-bold text-white">
                  {lessons.reduce((sum, l) => sum + (l.estimatedMinutes || 0), 0)}
                </span>
              </div>
              <p className="text-xs text-white/60">Minutes</p>
            </div>

            <div className="bg-white/10 rounded-lg p-2.5 min-w-[90px]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Users className="h-3.5 w-3.5 text-white/80" />
                <span className="text-lg font-bold text-white">{course.enrolledCount || 0}</span>
              </div>
              <p className="text-xs text-white/60">Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs - More Compact */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="lessons" className="text-sm">
            Lessons ({lessons.length})
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="text-sm">
            Quizzes ({quizzes.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">About This Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-muted-foreground">{course.description}</p>
              </div>

              {course.objectives && course.objectives.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-1">Learning Objectives</h3>
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                    {course.objectives.map((obj, index) => (
                      <li key={index}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {course.prerequisites && (
                <div>
                  <h3 className="font-semibold mb-1">Prerequisites</h3>
                  <p className="text-muted-foreground">{course.prerequisites}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-3 border-t text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="font-medium">{course.levelId?.name || course.level || 'All Levels'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Language</p>
                  <p className="font-medium">{course.languageId?.name || course.language || 'English'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="font-medium">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start Section */}
          {lessons.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground mb-3">
                  Begin with the first lesson:
                </p>
                <LessonCard
                  lesson={lessons[0]}
                  variant="detailed"
                  showActions={true}
                  onView={handleStartLesson}
                  quizCount={quizCountByLesson[lessons[0]._id] || 0}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-3 mt-4">
          {lessons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm text-center">
                  No lessons available yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson._id}
                  lesson={lesson}
                  variant="default"
                  showActions={true}
                  onView={handleStartLesson}
                  quizCount={quizCountByLesson[lesson._id] || 0}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes" className="space-y-4 mt-4">
          {quizzes.length === 0 && lessonQuizzes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileQuestion className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm text-center">
                  No quizzes available yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Course-Level Quizzes */}
              {quizzes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-brand-navy">Course Quizzes</h3>
                    <Badge variant="outline" className="text-xs">
                      {quizzes.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quizzes.map((quiz) => (
                      user?.role === 'REFUGEE' ? (
                        <QuizCardWithProgress
                          key={quiz._id}
                          quiz={quiz}
                          showHistory={true}
                          onTake={handleTakeQuiz}
                        />
                      ) : (
                        <QuizCard
                          key={quiz._id}
                          quiz={quiz}
                          variant="detailed"
                          showActions={true}
                          onTake={handleTakeQuiz}
                        />
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson-Level Quizzes Grouped by Lesson */}
              {lessonQuizzes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-brand-navy">Lesson Quizzes</h3>
                    <Badge variant="outline" className="text-xs">
                      {lessonQuizzes.length}
                    </Badge>
                  </div>
                  {lessons.map((lesson) => {
                    const lessonQuizzesForThisLesson = lessonQuizzes.filter(quiz => {
                      const quizLessonId = quiz.lessonId?._id || quiz.lessonId
                      return quizLessonId === lesson._id
                    })
                    
                    if (lessonQuizzesForThisLesson.length === 0) return null
                    
                    return (
                      <div key={lesson._id} className="space-y-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                          <BookOpen className="h-4 w-4 text-brand-blue" />
                          <span className="font-medium text-brand-navy">{lesson.title}</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            {lessonQuizzesForThisLesson.length} {lessonQuizzesForThisLesson.length === 1 ? 'quiz' : 'quizzes'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {lessonQuizzesForThisLesson.map((quiz) => (
                            user?.role === 'REFUGEE' ? (
                              <QuizCardWithProgress
                                key={quiz._id}
                                quiz={quiz}
                                showHistory={true}
                                onTake={handleTakeQuiz}
                              />
                            ) : (
                              <QuizCard
                                key={quiz._id}
                                quiz={quiz}
                                variant="detailed"
                                showActions={true}
                                onTake={handleTakeQuiz}
                              />
                            )
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CourseDetail
