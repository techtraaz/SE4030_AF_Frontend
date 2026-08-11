import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  BookMarked,
  ListChecks,
  Clock,
  Globe,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import courseService from '@/services/course/courseService'
import adminService from '@/services/adminService'
import lessonService from '@/services/lesson/lessonService'
import quizService from '@/services/quiz/quizService'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import useAuth from '@/hooks/useAuth'

/**
 * AdminDashboard - Role-aware overview page
 * - ADMIN: Shows global platform metrics and user management
 * - CONTENT_CONTRIBUTOR: Shows personal content statistics
 * - REFUGEE: Redirected to learning dashboard
 */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    courses: 0,
    lessons: 0,
    quizzes: 0,
    enrollments: 0,
    pending: 0
  })
  const [courseStats, setCourseStats] = useState(null)

  useEffect(() => {
    // Redirect refugees to their dashboard
    if (user?.role === 'REFUGEE') {
      navigate('/dashboard/my-courses', { replace: true })
      return
    }
    
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'ADMIN') {
        // Admin: Fetch global statistics
        const [globalStats, pendingUsers, allLessons, allQuizzes] = await Promise.all([
          courseService.getGlobalStatistics(),
          adminService.getPendingContributors(),
          lessonService.getAllLessons({ isPublished: true }),
          quizService.getAllQuizzes({ isPublished: true })
        ])

        setCourseStats(globalStats)
        setStats({
          courses: globalStats?.totalCourses || 0,
          lessons: allLessons.length,
          quizzes: allQuizzes.length,
          enrollments: globalStats?.totalEnrollments || 0,
          pending: pendingUsers.length
        })
      } else {
        // Content Contributor: Fetch only their own content
        const userId = user._id || user.id
        
        const [myCourses, myLessons, myQuizzes] = await Promise.all([
          courseService.getAllCourses({ createdById: userId }),
          lessonService.getAllLessons({ createdById: userId }),
          quizService.getAllQuizzes({ createdById: userId })
        ])

        setStats({
          courses: myCourses.length,
          lessons: myLessons.length,
          quizzes: myQuizzes.length,
          enrollments: 0,
          pending: 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton text="Loading dashboard..." />
  }

  const isAdmin = user?.role === 'ADMIN'

  const StatCard = ({ icon: Icon, title, value, description, color = 'brand-blue', onClick }) => (
    <Card 
      className={`hover:shadow-lg transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isAdmin ? 'Dashboard Overview' : 'My Content Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin 
            ? 'Monitor platform performance and manage content'
            : 'Track your content creation and performance'
          }
        </p>
      </div>

      {/* Pending Actions Alert - Admin Only */}
      {isAdmin && stats.pending > 0 && (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">
                  {stats.pending} Pending Contributor {stats.pending === 1 ? 'Request' : 'Requests'}
                </p>
                <p className="text-sm text-blue-700">
                  Review and approve new content contributor applications
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Review Now
            </button>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {isAdmin ? 'Platform Statistics' : 'Your Content Statistics'}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BookOpen}
            title={isAdmin ? 'Total Courses' : 'My Courses'}
            value={stats.courses}
            description={isAdmin 
              ? `${courseStats?.publishedCourses || 0} published, ${courseStats?.unpublishedCourses || 0} draft`
              : 'Courses you created'
            }
            onClick={() => navigate(isAdmin ? '/admin/courses' : '/admin/my-courses')}
          />
          <StatCard
            icon={BookMarked}
            title={isAdmin ? 'Published Lessons' : 'My Lessons'}
            value={stats.lessons}
            description={isAdmin ? 'Active learning materials' : 'Lessons you created'}
            onClick={() => navigate('/admin/my-lessons')}
          />
          <StatCard
            icon={ListChecks}
            title={isAdmin ? 'Published Quizzes' : 'My Quizzes'}
            value={stats.quizzes}
            description={isAdmin ? 'Assessment resources' : 'Quizzes you created'}
            onClick={() => navigate('/admin/my-quizzes')}
          />
          {isAdmin && (
            <StatCard
              icon={Users}
              title="Total Enrollments"
              value={stats.enrollments}
              description="Across all courses"
              color="green-600"
            />
          )}
        </div>
      </div>

      {/* Course Distribution - Admin Only */}
      {isAdmin && courseStats?.byLevel && courseStats.byLevel.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Courses by Level</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {courseStats.byLevel.map((levelStat) => (
              <Card key={levelStat._id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {levelStat._id || 'Unknown Level'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{levelStat.count}</span>
                    <span className="text-sm text-muted-foreground">courses</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Course Distribution by Language */}
      {courseStats?.byLanguage && courseStats.byLanguage.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Courses by Language</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {courseStats.byLanguage.map((langStat) => (
              <Card key={langStat._id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {langStat._id || 'Unknown'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{langStat.count}</span>
                    <span className="text-sm text-muted-foreground">courses</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(isAdmin ? '/admin/courses' : '/admin/my-courses')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">{isAdmin ? 'Manage Courses' : 'My Courses'}</h3>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? 'View and edit all courses' : 'Create and edit your courses'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(isAdmin ? '/admin/users' : '/admin/my-lessons')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`p-3 ${isAdmin ? 'bg-green-100' : 'bg-purple-100'} rounded-lg`}>
                {isAdmin ? (
                  <Users className="h-6 w-6 text-green-600" />
                ) : (
                  <BookMarked className="h-6 w-6 text-purple-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{isAdmin ? 'User Management' : 'My Lessons'}</h3>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? 'Approve contributors' : 'Create and edit lessons'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(isAdmin ? '/admin/categories' : '/admin/my-quizzes')}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`p-3 ${isAdmin ? 'bg-purple-100' : 'bg-orange-100'} rounded-lg`}>
                {isAdmin ? (
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                ) : (
                  <ListChecks className="h-6 w-6 text-orange-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{isAdmin ? 'Manage Categories' : 'My Quizzes'}</h3>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? 'Organize content types' : 'Create and edit quizzes'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
