import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Loader2,
  Calendar,
  Target,
  Award,
  BarChart3,
  PlayCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import enrollmentService from '@/services/course/enrollmentService'
import { getAllProgress } from '@/services/lesson/lessonProgressService'
import quizAttemptService from '@/services/quiz/quizAttemptService'
import useAuth from '@/hooks/useAuth'
import { format } from 'date-fns'

/**
 * MyProgress - Refugee learning progress dashboard
 * Shows enrollment stats, quiz performance, course progress, and recent activity
 */
export default function MyProgress() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [statistics, setStatistics] = useState(null)
  const [progressData, setProgressData] = useState([])
  const [quizAttempts, setQuizAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?._id || user?.id) {
      fetchProgressData()
    }
  }, [user])

  const fetchProgressData = async () => {
    try {
      const userId = user._id || user.id
      const [statsData, allProgress, attempts] = await Promise.all([
        enrollmentService.getMyEnrollmentStats().catch(() => null),
        getAllProgress().catch(() => []),
        quizAttemptService.getUserQuizAttempts(userId).catch(() => [])
      ])
      
      setStatistics(statsData)
      setProgressData(Array.isArray(allProgress) ? allProgress : [])
      setQuizAttempts(Array.isArray(attempts) ? attempts : [])
    } catch (error) {
      console.error('Failed to fetch progress data:', error)
      toast.error('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  // Calculate quiz statistics from attempts
  const calculateQuizStats = () => {
    if (quizAttempts.length === 0) {
      return { totalAttempts: 0, averageScore: 0, passedCount: 0, uniqueQuizzes: 0 }
    }

    const totalAttempts = quizAttempts.length
    const averageScore = quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts
    const passedCount = quizAttempts.filter(a => a.passed).length
    const uniqueQuizzes = new Set(quizAttempts.map(a => a.quizId?._id || a.quizId)).size

    return {
      totalAttempts,
      averageScore: Math.round(averageScore),
      passedCount,
      uniqueQuizzes
    }
  }

  const quizStats = calculateQuizStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-navy">My Progress</h1>
        <p className="text-brand-gray mt-1">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Active Courses"
          value={statistics?.totalActive || 0}
          color="text-brand-blue"
          bgColor="bg-brand-blue/10"
        />
        
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={statistics?.totalCompleted || 0}
          color="text-brand-blue-deep"
          bgColor="bg-brand-blue-deep/10"
        />
        
        <StatCard
          icon={TrendingUp}
          label="Avg. Progress"
          value={statistics?.averageProgress 
            ? `${Math.round(statistics.averageProgress)}%` 
            : '0%'}
          color="text-brand-navy"
          bgColor="bg-brand-navy/10"
        />

        <StatCard
          icon={Trophy}
          label="Quiz Attempts"
          value={quizStats.totalAttempts}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      {/* Quiz Performance */}
      {quizAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-blue" />
              Quiz Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <QuizStat
                label="Quizzes Taken"
                value={quizStats.uniqueQuizzes}
                icon={Target}
              />
              <QuizStat
                label="Total Attempts"
                value={quizStats.totalAttempts}
                icon={PlayCircle}
              />
              <QuizStat
                label="Passed"
                value={quizStats.passedCount}
                icon={CheckCircle2}
                color="text-brand-blue"
              />
              <QuizStat
                label="Average Score"
                value={`${quizStats.averageScore}%`}
                icon={BarChart3}
                color="text-brand-navy"
              />
            </div>

            {/* Recent Quiz Attempts */}
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-sm text-brand-gray">Recent Quiz Attempts</h4>
              <div className="space-y-2">
                {quizAttempts.slice(0, 5).map((attempt) => (
                  <QuizAttemptCard key={attempt._id} attempt={attempt} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Progress Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-blue" />
            Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progressData.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No enrolled courses yet"
              description="Start learning by enrolling in a course"
              action={
                <Button onClick={() => navigate('/dashboard/browse')} className="bg-brand-blue hover:bg-brand-blue-deep">
                  Browse Courses
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              {progressData.map((progress) => (
                <CourseProgressCard
                  key={progress.courseId}
                  progress={progress}
                  onClick={() => navigate('/dashboard/my-courses')}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * StatCard - Reusable statistics card component
 */
function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-brand-gray">{label}</p>
            <p className="text-2xl font-bold text-brand-navy">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * QuizStat - Quiz statistics display component
 */
function QuizStat({ label, value, icon: Icon, color = 'text-brand-gray' }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon className={`h-8 w-8 mb-2 ${color}`} />
      <p className="text-2xl font-bold text-brand-navy">{value}</p>
      <p className="text-sm text-brand-gray">{label}</p>
    </div>
  )
}

/**
 * QuizAttemptCard - Individual quiz attempt display
 */
function QuizAttemptCard({ attempt }) {
  const quizTitle = attempt.quizId?.title || 'Unknown Quiz'
  const attemptDate = attempt.attemptedAt 
    ? format(new Date(attempt.attemptedAt), 'MMM dd, yyyy')
    : 'Unknown date'

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className={`p-2 rounded-lg ${attempt.passed ? 'bg-brand-blue/10' : 'bg-gray-100'}`}>
          {attempt.passed ? (
            <CheckCircle2 className="h-4 w-4 text-brand-blue" />
          ) : (
            <Clock className="h-4 w-4 text-brand-gray" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{quizTitle}</p>
          <p className="text-xs text-brand-gray">{attemptDate}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-lg font-bold text-brand-navy">{attempt.score}%</p>
          <p className="text-xs text-brand-gray">
            {attempt.correctAnswers}/{attempt.totalQuestions}
          </p>
        </div>
        <Badge 
          variant={attempt.passed ? 'default' : 'outline'}
          className={attempt.passed ? 'bg-brand-blue' : 'border-gray-400'}
        >
          {attempt.passed ? 'Passed' : 'Failed'}
        </Badge>
      </div>
    </div>
  )
}

/**
 * CourseProgressCard - Individual course progress display
 */
function CourseProgressCard({ progress, onClick }) {
  const courseName = progress.courseName || progress.courseTitle || 'Unknown Course'
  const completedLessons = progress.completedLessons || progress.completedCount || 0
  const totalLessons = progress.totalLessons || 0
  const progressPercentage = Math.round(progress.progress || 0)
  const isCompleted = progressPercentage === 100

  return (
    <div 
      className="space-y-3 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-brand-navy">{courseName}</h4>
            {isCompleted && (
              <Badge className="bg-brand-blue">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          <p className="text-sm text-brand-gray mt-1">
            {completedLessons} of {totalLessons} lessons completed
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-navy">{progressPercentage}%</p>
        </div>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      <div className="flex items-center justify-between text-xs text-brand-gray">
        {progress.enrolledAt && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Enrolled {format(new Date(progress.enrolledAt), 'MMM dd, yyyy')}
          </span>
        )}
        {progress.lastAccessedAt && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last accessed {format(new Date(progress.lastAccessedAt), 'MMM dd, yyyy')}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * EmptyState - Display when no data available
 */
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
        <Icon className="h-12 w-12 text-brand-gray" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-brand-navy">{title}</h3>
      <p className="text-brand-gray mb-6">{description}</p>
      {action}
    </div>
  )
}
