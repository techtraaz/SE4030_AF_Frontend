import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  TrendingUp, 
  Award,
  Clock,
  CheckCircle2,
  Play,
  ArrowRight,
  Target,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import useAuth from '@/hooks/useAuth'
import api from '@/services/axios'
import enrollmentService from '@/services/course/enrollmentService'
import quizAttemptService from '@/services/quiz/quizAttemptService'

/**
 * RefugeeDashboard - Learning overview page for refugees
 * Shows personalized learning progress, recommendations, and quick actions
 */
export default function RefugeeDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profileFullName, setProfileFullName] = useState('')
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    completedLessons: 0,
    totalLessons: 0,
    quizzesTaken: 0,
    overallProgress: 0
  })
  const [continueLesson, setContinueLesson] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    const fetchProfileName = async () => {
      if (!user || user.role !== 'REFUGEE') {
        setProfileFullName('')
        return
      }

      try {
        const res = await api.get('/profile/get')
        setProfileFullName(res?.data?.content?.fullName?.trim() || '')
      } catch {
        setProfileFullName('')
      }
    }

    fetchProfileName()
  }, [user?._id, user?.id, user?.role])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch enrollment statistics and enrollments
      const [enrollmentStats, activeEnrollments, quizAttempts] = await Promise.all([
        enrollmentService.getMyEnrollmentStats(),
        enrollmentService.getMyEnrollments('ACTIVE'),
        quizAttemptService.getUserQuizAttempts(user._id || user.id)
      ])

      // Calculate total and completed lessons from enrollments
      let totalLessons = 0
      let completedLessons = 0
      let mostRecentEnrollment = null
      let mostRecentDate = null

      activeEnrollments.forEach(enrollment => {
        const course = enrollment.courseId
        if (course) {
          // Assuming lessons array exists in course or we count from completedLessons
          const courseLessons = course.lessons?.length || 0
          totalLessons += courseLessons
          completedLessons += enrollment.completedLessons?.length || 0

          // Find most recently accessed enrollment
          if (!mostRecentDate || new Date(enrollment.lastAccessedAt) > new Date(mostRecentDate)) {
            mostRecentDate = enrollment.lastAccessedAt
            mostRecentEnrollment = enrollment
          }
        }
      })

      // Prepare "continue learning" data from most recent enrollment
      if (mostRecentEnrollment && mostRecentEnrollment.courseId) {
        const course = mostRecentEnrollment.courseId
        const completedLessonIds = mostRecentEnrollment.completedLessons || []
        
        // Find the next lesson to continue (first incomplete lesson)
        const nextLesson = course.lessons?.find(
          lesson => !completedLessonIds.some(id => id.toString() === lesson._id.toString())
        )

        if (nextLesson) {
          setContinueLesson({
            courseTitle: course.title,
            lessonTitle: nextLesson.title || 'Next Lesson',
            progress: Math.round(mostRecentEnrollment.progress || 0),
            courseId: course._id,
            lessonId: nextLesson._id
          })
        }
      }

      setStats({
        enrolledCourses: enrollmentStats.totalActive || 0,
        completedCourses: enrollmentStats.totalCompleted || 0,
        completedLessons,
        totalLessons,
        quizzesTaken: quizAttempts.length,
        overallProgress: Math.round(enrollmentStats.averageProgress || 0)
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Keep default stats on error
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton text="Loading your dashboard..." />
  }

  const progressPercentage = stats.totalLessons > 0 
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
    : 0

  const getDisplayName = (userData) => {
    if (!userData) return 'Learner'

    const fullName = userData.fullName?.trim()
    if (fullName) return fullName

    const firstName = userData.firstName?.trim()
    const lastName = userData.lastName?.trim()
    if (firstName || lastName) return `${firstName || ''} ${lastName || ''}`.trim()

    const name = userData.name?.trim()
    if (name) return name

    if (userData.email) {
      const emailName = userData.email.split('@')[0]
      return emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._-]/g, ' ')
    }

    return 'Learner'
  }

  const userDisplayName = profileFullName || getDisplayName(user)

  // Empty state if user has no enrollments
  if (stats.enrolledCourses === 0 && stats.completedCourses === 0) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue-deep rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userDisplayName}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Start exploring courses to begin learning
          </p>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <BookOpen className="h-20 w-20 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-brand-navy mb-2">
              No Courses Yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              You haven't enrolled in any courses yet. Browse our course catalog to find learning materials that interest you.
            </p>
            <Button 
              onClick={() => navigate('/dashboard/my-courses')}
              className="bg-brand-blue hover:bg-brand-blue-deep"
            >
              Browse Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-brand-blue to-brand-blue-deep rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {userDisplayName}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Continue your learning journey
            </p>
          </div>
          {stats.completedCourses > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <div>
                <p className="text-xs text-blue-100">Completed Courses</p>
                <p className="text-xl font-bold">{stats.completedCourses}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Continue Learning Section */}
      {continueLesson && (
        <Card className="border-2 border-brand-blue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="h-5 w-5 text-brand-blue" />
                  <span className="text-sm font-semibold text-brand-blue uppercase tracking-wide">
                    Continue Learning
                  </span>
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-1">
                  {continueLesson.lessonTitle}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {continueLesson.courseTitle}
                </p>
                <div className="flex items-center gap-3">
                  <Progress value={continueLesson.progress} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {continueLesson.progress}%
                  </span>
                </div>
              </div>
              <Button 
                onClick={() => navigate(`/lesson/${continueLesson.lessonId}`)}
                className="ml-6 bg-brand-blue hover:bg-brand-blue-deep"
              >
                Resume
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-brand-blue" />
          Your Learning Progress
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/my-courses')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Courses
              </CardTitle>
              <BookOpen className="h-5 w-5 text-brand-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-navy">{stats.enrolledCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedCourses > 0 ? `${stats.completedCourses} completed` : 'Courses in progress'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lessons Completed
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-navy">
                {stats.completedLessons}/{stats.totalLessons}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={progressPercentage} className="flex-1 h-1.5" />
                <span className="text-xs font-medium text-muted-foreground">
                  {progressPercentage}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quizzes Taken
              </CardTitle>
              <Award className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-navy">{stats.quizzesTaken}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Assessments completed
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/progress')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Progress
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-navy">{stats.overallProgress}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Keep up the great work!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-brand-blue"
            onClick={() => navigate('/dashboard/my-courses')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-navy">Browse Courses</h3>
                <p className="text-sm text-muted-foreground">Discover new learning paths</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-brand-blue"
            onClick={() => navigate('/dashboard/progress')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-navy">View Progress</h3>
                <p className="text-sm text-muted-foreground">Track your achievements</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-brand-blue"
            onClick={() => navigate('/dashboard/support')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-navy">Get Support</h3>
                <p className="text-sm text-muted-foreground">We're here to help</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Motivational Footer */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-none">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-medium text-brand-navy mb-2">
            "Every lesson completed is a step closer to your goals"
          </p>
          <p className="text-sm text-muted-foreground">
            You're doing amazing! Keep learning and growing.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
