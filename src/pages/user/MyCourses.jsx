import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, RefreshCw, BookOpen, Trophy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import courseService from '@/services/course/courseService'
import enrollmentService from '@/services/course/enrollmentService'
import categoryService from '@/services/lesson/categoryService'
import courseLevelService from '@/services/course/courseLevelService'
import languageService from '@/services/course/languageService'
import CourseCard from '@/components/shared/course/CourseCard'
import CourseListItem from '@/components/shared/course/CourseListItem'
import CourseFilters from '@/components/shared/course/CourseFilters'
import CourseStats from '@/components/shared/course/CourseStats'
import CourseDetail from './CourseDetail'
import LessonPlayer from './LessonPlayer'
import QuizPlayer from './QuizPlayer'
import useAuth from '@/hooks/useAuth'

export default function RefugeeMyCourses() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('enrolled')
  const [viewingCourse, setViewingCourse] = useState(null) // Track course being viewed inline
  const [viewingLesson, setViewingLesson] = useState(null) // Track lesson being viewed inline
  const [viewingQuiz, setViewingQuiz] = useState(null) // Track quiz being viewed inline
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [enrollmentMap, setEnrollmentMap] = useState({}) // courseId -> enrollment data
  const [categories, setCategories] = useState([])
  const [levels, setLevels] = useState([])
  const [languages, setLanguages] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  
  // Filters for enrolled tab
  const [enrolledSearchTerm, setEnrolledSearchTerm] = useState('')
  const [enrolledLevelFilter, setEnrolledLevelFilter] = useState('all')
  const [enrolledLanguageFilter, setEnrolledLanguageFilter] = useState('all')
  const [enrolledCategoryFilter, setEnrolledCategoryFilter] = useState('all')
  const [enrolledDebouncedSearch, setEnrolledDebouncedSearch] = useState('')
  
  // Filters for available tab
  const [availableSearchTerm, setAvailableSearchTerm] = useState('')
  const [availableLevelFilter, setAvailableLevelFilter] = useState('all')
  const [availableLanguageFilter, setAvailableLanguageFilter] = useState('all')
  const [availableCategoryFilter, setAvailableCategoryFilter] = useState('all')
  const [availableDebouncedSearch, setAvailableDebouncedSearch] = useState('')

  // Debounce search terms
  useEffect(() => {
    const timer = setTimeout(() => {
      setEnrolledDebouncedSearch(enrolledSearchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [enrolledSearchTerm])

  useEffect(() => {
    const timer = setTimeout(() => {
      setAvailableDebouncedSearch(availableSearchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [availableSearchTerm])

  // Fetch initial data on mount
  useEffect(() => {
    if (user?._id || user?.id) {
      fetchInitialData()
    }
  }, [user])

  // Fetch courses when filters change
  useEffect(() => {
    if (user?._id || user?.id) {
      fetchEnrolledCourses()
    }
  }, [enrolledLevelFilter, enrolledLanguageFilter, enrolledCategoryFilter, user])

  useEffect(() => {
    if (user?._id || user?.id) {
      fetchAvailableCourses()
    }
  }, [availableLevelFilter, availableLanguageFilter, availableCategoryFilter, user, enrollmentMap])

  const fetchInitialData = async () => {
    try {
      const [categoriesData, levelsData, languagesData, statsData] = await Promise.all([
        categoryService.getAllCategories().catch(() => []),
        courseLevelService.getAllLevels().catch(() => []),
        languageService.getAllLanguages().catch(() => []),
        enrollmentService.getMyEnrollmentStats().catch(() => null)
      ])
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setLevels(Array.isArray(levelsData) ? levelsData : [])
      setLanguages(Array.isArray(languagesData) ? languagesData : [])
      setStatistics(statsData)
      
      // Fetch courses after initial data is loaded using the same enrollment snapshot.
      const { map } = await fetchEnrolledCourses()
      await fetchAvailableCourses(map)
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
      toast.error('Failed to load initial data')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrolledCourses = async () => {
    try {
      const filters = {}
      if (enrolledLevelFilter !== 'all') filters.levelId = enrolledLevelFilter
      if (enrolledLanguageFilter !== 'all') filters.languageId = enrolledLanguageFilter
      if (enrolledCategoryFilter !== 'all') filters.categoryId = enrolledCategoryFilter

      // Fetch both ACTIVE and COMPLETED enrollments so refugees can see their completed courses
      const [activeEnrollments, completedEnrollments] = await Promise.all([
        enrollmentService.getMyEnrollments('ACTIVE'),
        enrollmentService.getMyEnrollments('COMPLETED')
      ])
      
      const enrollments = [...activeEnrollments, ...completedEnrollments]
      
      // Create enrollment map for quick lookup
      const map = {}
      const courses = enrollments.map(enrollment => {
        map[enrollment.courseId._id] = {
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          lastAccessedAt: enrollment.lastAccessedAt,
          status: enrollment.status,
          completedAt: enrollment.completedAt
        }
        return enrollment.courseId
      }).filter(course => {
        // Apply filters
        if (filters.levelId && course.levelId?._id !== filters.levelId) return false
        if (filters.languageId && course.languageId?._id !== filters.languageId) return false
        if (filters.categoryId && course.categoryId?._id !== filters.categoryId) return false
        return true
      })
      
      setEnrollmentMap(map)
      setEnrolledCourses(courses)

      return { map, courses }
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error)
      toast.error('Failed to load enrolled courses')
      setEnrolledCourses([])

      return { map: {}, courses: [] }
    }
  }

  const fetchAvailableCourses = async (mapOverride = enrollmentMap) => {
    try {
      const filters = {
        isPublished: true
      }
      
      if (availableLevelFilter !== 'all') filters.levelId = availableLevelFilter
      if (availableLanguageFilter !== 'all') filters.languageId = availableLanguageFilter
      if (availableCategoryFilter !== 'all') filters.categoryId = availableCategoryFilter

      const response = await courseService.getAllCourses(filters)
      const allPublishedCourses = Array.isArray(response) ? response : []
      
      // Filter out courses user is already enrolled in
      const notEnrolledCourses = allPublishedCourses.filter(
        course => !mapOverride[course._id]
      )
      
      setAvailableCourses(notEnrolledCourses)
    } catch (error) {
      console.error('Failed to fetch available courses:', error)
      toast.error('Failed to load available courses')
      setAvailableCourses([])
    }
  }

  // Handle enroll
  const handleEnroll = async (course) => {
    try {
      await enrollmentService.enrollInCourse(course._id)
      toast.success('Successfully enrolled in course')
      
      // Refresh both lists using the same fresh enrollment map to avoid count drift.
      const { map } = await fetchEnrolledCourses()
      await fetchAvailableCourses(map)
      
      // Refresh statistics
      const statsData = await enrollmentService.getMyEnrollmentStats()
      setStatistics(statsData)
    } catch (error) {
      console.error('Failed to enroll:', error)
    }
  }

  // Handle unenroll
  const handleUnenroll = async (course) => {
    try {
      await enrollmentService.unenrollFromCourse(course._id)
      toast.success('Successfully unenrolled from course')
      
      // Refresh both lists using the same fresh enrollment map to avoid count drift.
      const { map } = await fetchEnrolledCourses()
      await fetchAvailableCourses(map)
      
      // Refresh statistics
      const statsData = await enrollmentService.getMyEnrollmentStats()
      setStatistics(statsData)
    } catch (error) {
      console.error('Failed to unenroll:', error)
    }
  }

  // Filter enrolled courses by search term
  const filteredEnrolledCourses = useMemo(() => {
    if (!enrolledDebouncedSearch) return enrolledCourses

    return enrolledCourses.filter((course) =>
      course.title.toLowerCase().includes(enrolledDebouncedSearch.toLowerCase()) ||
      course.description.toLowerCase().includes(enrolledDebouncedSearch.toLowerCase())
    )
  }, [enrolledCourses, enrolledDebouncedSearch])

  // Filter available courses by search term
  const filteredAvailableCourses = useMemo(() => {
    if (!availableDebouncedSearch) return availableCourses

    return availableCourses.filter((course) =>
      course.title.toLowerCase().includes(availableDebouncedSearch.toLowerCase()) ||
      course.description.toLowerCase().includes(availableDebouncedSearch.toLowerCase())
    )
  }, [availableCourses, availableDebouncedSearch])

  // Reset filters
  const resetEnrolledFilters = () => {
    setEnrolledSearchTerm('')
    setEnrolledLevelFilter('all')
    setEnrolledLanguageFilter('all')
    setEnrolledCategoryFilter('all')
  }

  const resetAvailableFilters = () => {
    setAvailableSearchTerm('')
    setAvailableLevelFilter('all')
    setAvailableLanguageFilter('all')
    setAvailableCategoryFilter('all')
  }

  const hasActiveEnrolledFilters = 
    enrolledSearchTerm || 
    enrolledLevelFilter !== 'all' || 
    enrolledLanguageFilter !== 'all' || 
    enrolledCategoryFilter !== 'all'

  const hasActiveAvailableFilters = 
    availableSearchTerm || 
    availableLevelFilter !== 'all' || 
    availableLanguageFilter !== 'all' || 
    availableCategoryFilter !== 'all'

  // Handle view course (inline view instead of navigation)
  const handleViewCourse = (course) => {
    setViewingCourse(course._id)
  }

  // Handle back from course detail
  const handleBackFromCourseDetail = () => {
    setViewingCourse(null)
    // Refresh data to get updated progress/enrollment status
    fetchEnrolledCourses()
    fetchAvailableCourses()
    // Refresh statistics
    enrollmentService.getMyEnrollmentStats().then(setStatistics).catch(() => {})
  }

  // Handle viewing quiz inline (from CourseDetail)
  const handleViewQuiz = (quizId) => {
    setViewingQuiz(quizId)
  }

  // Handle back from quiz player
  const handleBackFromQuiz = () => {
    setViewingQuiz(null)
  }

  // Handle viewing lesson inline (from CourseDetail)
  const handleViewLesson = (lessonId) => {
    setViewingLesson(lessonId)
  }

  // Handle back from lesson player
  const handleBackFromLessonPlayer = () => {
    setViewingLesson(null)
    // Refresh data to get updated progress
    fetchEnrolledCourses()
    // Refresh statistics
    enrollmentService.getMyEnrollmentStats().then(setStatistics).catch(() => {})
  }

  // If viewing a quiz, show inline quiz player
  if (viewingQuiz) {
    return (
      <QuizPlayer 
        quizId={viewingQuiz}
        inline={true}
        onBack={handleBackFromQuiz}
      />
    )
  }

  // If viewing a lesson, show inline lesson player
  if (viewingLesson) {
    return (
      <LessonPlayer 
        lessonId={viewingLesson}
        inline={true}
        onBack={handleBackFromLessonPlayer}
      />
    )
  }

  // If viewing a course, show inline course detail
  if (viewingCourse) {
    return (
      <CourseDetail 
        courseId={viewingCourse}
        inline={true}
        onBack={handleBackFromCourseDetail}
        onViewLesson={handleViewLesson}
        onViewQuiz={handleViewQuiz}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning progress and discover new courses
        </p>
      </div>

      {/* Statistics */}
      <CourseStats statistics={statistics} variant="refugee" />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="enrolled" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>My Enrolled Courses</span>
            <span className="ml-1 text-xs text-muted-foreground">
              ({filteredEnrolledCourses.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Discover New Courses</span>
            <span className="ml-1 text-xs text-muted-foreground">
              ({filteredAvailableCourses.length})
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Enrolled Courses Tab */}
        <TabsContent value="enrolled" className="space-y-6 mt-6">
          {/* Filters */}
          <CourseFilters
            searchTerm={enrolledSearchTerm}
            onSearchChange={setEnrolledSearchTerm}
            levelFilter={enrolledLevelFilter}
            onLevelChange={setEnrolledLevelFilter}
            languageFilter={enrolledLanguageFilter}
            onLanguageChange={setEnrolledLanguageFilter}
            categoryFilter={enrolledCategoryFilter}
            onCategoryChange={setEnrolledCategoryFilter}
            levels={levels}
            languages={languages}
            categories={categories}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onReset={resetEnrolledFilters}
            hasActiveFilters={hasActiveEnrolledFilters}
            showStatusFilter={false}
            showCategoryFilter={true}
          />

          {/* Courses List/Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredEnrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No enrolled courses</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveEnrolledFilters
                    ? 'Try adjusting your filters or search terms'
                    : 'Start your learning journey by enrolling in a course'}
                </p>
                {hasActiveEnrolledFilters ? (
                  <Button variant="outline" onClick={resetEnrolledFilters}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                ) : (
                  <Button onClick={() => setActiveTab('available')}>
                    Browse Courses
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEnrolledCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onView={() => handleViewCourse(course)}
                  onUnenroll={handleUnenroll}
                  isEnrolled={true}
                  progress={enrollmentMap[course._id]?.progress || 0}
                  enrollmentStatus={enrollmentMap[course._id]?.status || 'ACTIVE'}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEnrolledCourses.map((course) => (
                <CourseListItem
                  key={course._id}
                  course={course}
                  onView={() => handleViewCourse(course)}
                  onUnenroll={handleUnenroll}
                  isEnrolled={true}
                  progress={enrollmentMap[course._id]?.progress || 0}
                  enrollmentStatus={enrollmentMap[course._id]?.status || 'ACTIVE'}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Available Courses Tab */}
        <TabsContent value="available" className="space-y-6 mt-6">
          {/* Filters */}
          <CourseFilters
            searchTerm={availableSearchTerm}
            onSearchChange={setAvailableSearchTerm}
            levelFilter={availableLevelFilter}
            onLevelChange={setAvailableLevelFilter}
            languageFilter={availableLanguageFilter}
            onLanguageChange={setAvailableLanguageFilter}
            categoryFilter={availableCategoryFilter}
            onCategoryChange={setAvailableCategoryFilter}
            levels={levels}
            languages={languages}
            categories={categories}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onReset={resetAvailableFilters}
            hasActiveFilters={hasActiveAvailableFilters}
            showStatusFilter={false}
            showCategoryFilter={true}
          />

          {/* Courses List/Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredAvailableCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses available</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveAvailableFilters
                    ? 'Try adjusting your filters or search terms'
                    : 'Check back later for new courses'}
                </p>
                {hasActiveAvailableFilters && (
                  <Button variant="outline" onClick={resetAvailableFilters}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAvailableCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onView={() => handleViewCourse(course)}
                  onEnroll={handleEnroll}
                  isEnrolled={false}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAvailableCourses.map((course) => (
                <CourseListItem
                  key={course._id}
                  course={course}
                  onView={() => handleViewCourse(course)}
                  onEnroll={handleEnroll}
                  isEnrolled={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
