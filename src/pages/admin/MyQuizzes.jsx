import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileQuestion, TrendingUp, Users, Award, BarChart3, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { toastService } from '@/services/toastService'
import quizService from '@/services/quiz/quizService'
import quizAttemptService from '@/services/quiz/quizAttemptService'
import courseService from '@/services/course/courseService'
import lessonService from '@/services/lesson/lessonService'
import useAuth from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import ManageQuizModal from '@/components/admin/quiz/ManageQuizModal'
import QuizFilters from '@/components/shared/quiz/QuizFilters'
import ConfirmationModal from '@/components/shared/ConfirmationModal'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'

/**
 * QuizStatistics Component - Shows quiz performance statistics
 */
const QuizStatistics = ({ quizId }) => {
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    if (showStats && !statistics) {
      loadStatistics()
    }
  }, [showStats])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const stats = await quizAttemptService.getQuizStatistics(quizId)
      setStatistics(stats)
    } catch (error) {
      toastService.error('Failed to load quiz statistics')
    } finally {
      setLoading(false)
    }
  }

  if (!showStats) {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="w-full text-brand-blue hover:text-brand-blue-deep"
        onClick={() => setShowStats(true)}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Show Statistics
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
    )
  }

  return (
    <div className="space-y-2 border-t pt-3">
      <Button
        size="sm"
        variant="ghost"
        className="w-full text-brand-blue hover:text-brand-blue-deep"
        onClick={() => setShowStats(false)}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Hide Statistics
        <ChevronUp className="h-4 w-4 ml-2" />
      </Button>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue"></div>
        </div>
      ) : statistics ? (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
            <Users className="h-4 w-4 text-brand-blue" />
            <div>
              <div className="font-semibold text-brand-navy">{statistics.totalAttempts}</div>
              <div className="text-brand-gray">Attempts</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
            <TrendingUp className="h-4 w-4 text-brand-blue" />
            <div>
              <div className="font-semibold text-brand-navy">{statistics.averageScore}%</div>
              <div className="text-brand-gray">Avg Score</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
            <Award className="h-4 w-4 text-brand-blue" />
            <div>
              <div className="font-semibold text-brand-navy">{statistics.passRate}%</div>
              <div className="text-brand-gray">Pass Rate</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
            <BarChart3 className="h-4 w-4 text-brand-blue" />
            <div>
              <div className="font-semibold text-brand-navy">
                {statistics.highestScore}% / {statistics.lowestScore}%
              </div>
              <div className="text-brand-gray">High / Low</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-brand-gray py-2">
          No statistics available
        </div>
      )}
    </div>
  )
}

/**
 * QuizCard Component - Renders a single quiz card with actions and statistics
 */
const QuizCard = ({ quiz, onView, onEdit, onPublish, onUnpublish, onDelete }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
          {quiz.isPublished ? (
            <Badge className="bg-brand-blue/10 text-gray-800 border-brand-blue/30">
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="border-blue-400 text-blue-700">
              Draft
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-brand-gray line-clamp-2">
          {quiz.description}
        </p>
        
        <div className="flex items-center gap-3 text-xs text-brand-gray">
          {quiz.passingScore && (
            <span>Pass: {quiz.passingScore}%</span>
          )}
          {quiz.timeLimitMinutes && (
            <span>{quiz.timeLimitMinutes} min</span>
          )}
          {quiz.maxAttempts && (
            <span>{quiz.maxAttempts} attempts</span>
          )}
        </div>

        {/* Quiz Statistics - Only show for published quizzes */}
        {quiz.isPublished && <QuizStatistics quizId={quiz._id} />}
      </CardContent>

      <CardFooter className="flex gap-2 pt-3 border-t">
        {onView && (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onView(quiz)}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            View
          </Button>
        )}

        {onEdit && !quiz.isPublished && (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onEdit(quiz)}
          >
            Edit
          </Button>
        )}

        {onPublish && !quiz.isPublished && (
          <Button 
            size="sm" 
            className="flex-1 bg-gray-600 hover:bg-gray-700"
            onClick={() => onPublish(quiz)}
          >
            Publish
          </Button>
        )}

        {onUnpublish && quiz.isPublished && (
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1"
            onClick={() => onUnpublish(quiz)}
          >
            Unpublish
          </Button>
        )}

        {/* Only allow deleting draft quizzes, not published ones */}
        {onDelete && !quiz.isPublished && (
          <Button 
            size="sm" 
            className="flex-1 text-white bg-gray-400 hover:text-red-500 hover:bg-gray-800"
            onClick={() => onDelete(quiz)}
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

/**
 * MyQuizzes Page - Content Contributor's quiz management
 * Shows all quizzes they've created for courses and lessons
 */
const MyQuizzes = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    courseId: '',
    isPublished: '',
  })

  // Check if user can publish/unpublish quizzes (admins and content contributors)
  const isAdmin = user?.role === 'ADMIN' || user?.userType === 'ADMIN' || 
                  user?.role === 'CONTENT_CONTRIBUTOR' || user?.userType === 'CONTENT_CONTRIBUTOR'

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
      fetchInitialData()
    }
  }, [user])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's courses
      const coursesData = await courseService.getAllCourses({ createdById: user._id })
      setCourses(coursesData)
      
      // Fetch quizzes for all courses
      const allQuizzes = []
      for (const course of coursesData) {
        const courseQuizzes = await quizService.getAllQuizzes({ courseId: course._id })
        // Attach course information to course quizzes
        courseQuizzes.forEach(quiz => {
          if (!quiz.courseId || typeof quiz.courseId === 'string') {
            quiz.courseId = { _id: course._id, title: course.title }
          }
        })
        allQuizzes.push(...courseQuizzes)
        
        // Also fetch lesson quizzes for this course
        const lessons = await lessonService.getAllLessons({ courseId: course._id })
        for (const lesson of lessons) {
          const lessonQuizzes = await quizService.getAllQuizzes({ lessonId: lesson._id })
          // Attach lesson and course information to lesson quizzes
          lessonQuizzes.forEach(quiz => {
            if (!quiz.lessonId || typeof quiz.lessonId === 'string') {
              quiz.lessonId = { _id: lesson._id, title: lesson.title, courseId: course._id }
            } else {
              quiz.lessonId.courseId = course._id
            }
            // Store course info for easy access
            quiz._parentCourseId = course._id
            quiz._parentCourseName = course.title
          })
          allQuizzes.push(...lessonQuizzes)
        }
      }
      
      setQuizzes(allQuizzes)
    } catch (error) {
      toastService.error('Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (quiz) => {
    try {
      await quizService.publishQuiz(quiz._id)
      toastService.success('Quiz published successfully')
      await fetchInitialData()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  const handleUnpublish = async (quiz) => {
    try {
      await quizService.unpublishQuiz(quiz._id)
      toastService.success('Quiz unpublished successfully')
      await fetchInitialData()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  const handleDelete = async (quiz) => {
    setQuizToDelete(quiz)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!quizToDelete) return

    try {
      setDeleting(true)
      await quizService.deleteQuiz(quizToDelete._id)
      toastService.success('Quiz deleted successfully')
      await fetchInitialData()
      setDeleteModalOpen(false)
      setQuizToDelete(null)
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setDeleting(false)
    }
  }

  const handleCreateQuiz = () => {
    if (courses.length === 0) {
      toastService.error('Please create a course first')
      return
    }
    setSelectedQuiz(null)
    setSelectedCourse(courses[0]._id) // Default to first course
    setIsModalOpen(true)
  }

  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    setIsModalOpen(false)
    setSelectedQuiz(null)
    setSelectedCourse(null)
    fetchInitialData() // Refresh the list after creating/editing
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      courseId: '',
      isPublished: '',
    })
  }

  // Filter quizzes based on filters
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      // Search filter - search across quiz title, description, course name, and lesson name
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const quizTitle = quiz.title?.toLowerCase() || ''
        const quizDesc = quiz.description?.toLowerCase() || ''
        const courseName = quiz.courseId?.title?.toLowerCase() || ''
        const lessonName = quiz.lessonId?.title?.toLowerCase() || ''
        
        const matchesSearch = 
          quizTitle.includes(searchLower) ||
          quizDesc.includes(searchLower) ||
          courseName.includes(searchLower) ||
          lessonName.includes(searchLower)
          
        if (!matchesSearch) return false
      }

      // Course filter
      if (filters.courseId && filters.courseId !== 'all') {
        // For course quizzes, match courseId directly
        // For lesson quizzes, match the lesson's parent course
        const quizCourseId = quiz.courseId?._id || quiz.courseId || quiz._parentCourseId || quiz.lessonId?.courseId
        if (quizCourseId !== filters.courseId) return false
      }

      // Published status filter
      if (filters.isPublished && filters.isPublished !== 'all') {
        const isPublished = filters.isPublished === 'true'
        if (quiz.isPublished !== isPublished) return false
      }

      return true
    })
  }, [quizzes, filters])

  // Organize quizzes by course and lesson
  const organizedQuizzes = useMemo(() => {
    const organized = {}
    
    filteredQuizzes.forEach(quiz => {
      // Determine the course
      let courseId, courseName
      
      if (quiz.courseId) {
        // Course quiz
        courseId = quiz.courseId._id || quiz.courseId
        courseName = quiz.courseId.title || courses.find(c => c._id === courseId)?.title || 'Unknown Course'
      } else if (quiz.lessonId) {
        // Lesson quiz - use the parent course info we attached during fetch
        courseId = quiz._parentCourseId || quiz.lessonId.courseId
        courseName = quiz._parentCourseName || courses.find(c => c._id === courseId)?.title || 'Unknown Course'
      } else {
        courseId = 'unknown'
        courseName = 'Unknown Course'
      }
      
      if (!organized[courseId]) {
        organized[courseId] = {
          courseName,
          courseQuizzes: [],
          lessonQuizzes: {},
        }
      }
      
      if (quiz.lessonId) {
        // It's a lesson quiz
        const lessonId = quiz.lessonId._id || quiz.lessonId
        const lessonName = quiz.lessonId.title || 'Unknown Lesson'
        
        if (!organized[courseId].lessonQuizzes[lessonId]) {
          organized[courseId].lessonQuizzes[lessonId] = {
            lessonName,
            quizzes: [],
          }
        }
        organized[courseId].lessonQuizzes[lessonId].quizzes.push(quiz)
      } else {
        // It's a course quiz
        organized[courseId].courseQuizzes.push(quiz)
      }
    })
    
    // Sort quizzes by createdAt (most recent first)
    Object.values(organized).forEach(course => {
      course.courseQuizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      Object.values(course.lessonQuizzes).forEach(lesson => {
        lesson.quizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      })
    })
    
    return organized
  }, [filteredQuizzes, courses])

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">My Quizzes</h1>
          <p className="text-brand-gray text-sm pb-3">
            Manage quizzes across all your courses ({filteredQuizzes.length} of {quizzes.length} shown)
          </p>
        </div>
        <Button onClick={handleCreateQuiz}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {/* Filters */}
      <QuizFilters
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        courses={courses}
      />

      {/* Content */}
      {loading ? (
        <LoadingSkeleton text="Loading quizzes..." />
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-brand-gray mb-4" />
            <p className="text-brand-gray text-center mb-4">
              No quizzes yet. Create your first quiz to test learners' knowledge.
            </p>
            <Button onClick={handleCreateQuiz}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </CardContent>
        </Card>
      ) : filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-brand-gray mb-4" />
            <p className="text-brand-gray text-center mb-4">
              No quizzes match your filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(organizedQuizzes).map(([courseId, courseData]) => (
            <div key={courseId} className="space-y-4">
              {/* Course Header */}
              <div className="flex items-center justify-between bg-blue-100 px-4 rounded-xl">
                <div>
                  <h2 className="text-md font-semibold text-blue-700 capitalize py-4">
                    <span className="text-gray-900">Course : </span>{courseData.courseName}
                    <span className="pl-3 text-sm text-brand-gray">
                      ({courseData.courseQuizzes.length + Object.values(courseData.lessonQuizzes).reduce((sum, lesson) => sum + lesson.quizzes.length, 0)} quiz{(courseData.courseQuizzes.length + Object.values(courseData.lessonQuizzes).reduce((sum, lesson) => sum + lesson.quizzes.length, 0)) !== 1 ? 'zes' : ''})
                    </span>
                  </h2>
                </div>
              </div>

              {/* Course Quizzes */}
              {courseData.courseQuizzes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-md font-medium text-brand-gray flex items-center gap-2">
                    <FileQuestion className="h-4 w-4" />
                    Course Quizzes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courseData.courseQuizzes.map((quiz) => (
                      <QuizCard
                        key={quiz._id}
                        quiz={quiz}
                        onView={(quiz) => navigate(`/admin/quizzes/${quiz._id}`)}
                        onEdit={handleEditQuiz}
                        onPublish={handlePublish}
                        onUnpublish={handleUnpublish}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson Quizzes Grouped by Lesson */}
              {Object.keys(courseData.lessonQuizzes).length > 0 && (
                <div className="space-y-4">
                  {Object.entries(courseData.lessonQuizzes).map(([lessonId, lessonData]) => (
                    <div key={lessonId} className="space-y-3 pl-4 border-l-2 border-brand-lightBlue">
                      <h3 className="text-md font-medium text-brand-navy flex items-center gap-2">
                        <FileQuestion className="h-4 w-4" />
                        {lessonData.lessonName} - Quizzes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lessonData.quizzes.map((quiz) => (
                          <QuizCard
                            key={quiz._id}
                            quiz={quiz}
                            onView={(quiz) => navigate(`/admin/quizzes/${quiz._id}`)}
                            onEdit={handleEditQuiz}
                            onPublish={handlePublish}
                            onUnpublish={handleUnpublish}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quiz Management Modal */}
      <ManageQuizModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quiz={selectedQuiz}
        courseId={selectedCourse}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setQuizToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? This action cannot be undone."
        itemName={quizToDelete?.title}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}

export default MyQuizzes
