import { useState, useEffect, useMemo } from 'react'
import { GraduationCap, RefreshCw, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import courseService from '@/services/course/courseService'
import enrollmentService from '@/services/course/enrollmentService'
import categoryService from '@/services/lesson/categoryService'
import courseLevelService from '@/services/course/courseLevelService'
import languageService from '@/services/course/languageService'
import CourseCard from '@/components/shared/course/CourseCard'
import CourseListItem from '@/components/shared/course/CourseListItem'
import CourseFilters from '@/components/shared/course/CourseFilters'
import useAuth from '@/hooks/useAuth'

export default function BrowseCourses() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [enrollmentMap, setEnrollmentMap] = useState({}) // courseId -> true if enrolled
  const [categories, setCategories] = useState([])
  const [levels, setLevels] = useState([])
  const [languages, setLanguages] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [languageFilter, setLanguageFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch initial data on mount
  useEffect(() => {
    if (user?._id || user?.id) {
      fetchInitialData()
    }
  }, [user])

  // Fetch courses when filters change
  useEffect(() => {
    if (user?._id || user?.id) {
      fetchCourses()
    }
  }, [levelFilter, languageFilter, categoryFilter, user])

  const fetchInitialData = async () => {
    try {
      const [categoriesData, levelsData, languagesData] = await Promise.all([
        categoryService.getAllCategories().catch(() => []),
        courseLevelService.getAllLevels().catch(() => []),
        languageService.getAllLanguages().catch(() => []),
      ])
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setLevels(Array.isArray(levelsData) ? levelsData : [])
      setLanguages(Array.isArray(languagesData) ? languagesData : [])
      
      // Fetch courses and enrollments
      await Promise.all([fetchCourses(), fetchEnrollments()])
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
      toast.error('Failed to load initial data')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const enrollments = await enrollmentService.getMyEnrollments('ACTIVE')
      
      // Create a map of courseId -> true for quick lookup
      const map = {}
      enrollments.forEach(enrollment => {
        map[enrollment.courseId._id] = true
      })
      
      setEnrollmentMap(map)
    } catch (error) {
      console.error('Failed to fetch enrollments:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const filters = {
        isPublished: true
      }
      
      if (levelFilter !== 'all') filters.levelId = levelFilter
      if (languageFilter !== 'all') filters.languageId = languageFilter
      if (categoryFilter !== 'all') filters.categoryId = categoryFilter

      const response = await courseService.getAllCourses(filters)
      const allPublishedCourses = Array.isArray(response) ? response : []
      
      setCourses(allPublishedCourses)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      toast.error('Failed to load courses')
      setCourses([])
    }
  }

  // Handle enroll
  const handleEnroll = async (course) => {
    try {
      await enrollmentService.enrollInCourse(course._id)
      toast.success(`Successfully enrolled in "${course.title}"`)
      
      // Update enrollment map
      setEnrollmentMap(prev => ({
        ...prev,
        [course._id]: true
      }))
    } catch (error) {
      console.error('Failed to enroll:', error)
    }
  }

  // Handle view course
  const handleViewCourse = (course) => {
    // Navigate to course details page
    navigate(`/dashboard/courses/${course._id}`)
  }

  // Filter courses by search term
  const filteredCourses = useMemo(() => {
    let filtered = courses

    // Apply search filter
    if (debouncedSearch) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        course.description.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    }

    return filtered
  }, [courses, debouncedSearch])

  // Separate enrolled and not enrolled courses
  const { enrolledCourses, notEnrolledCourses } = useMemo(() => {
    const enrolled = []
    const notEnrolled = []

    filteredCourses.forEach(course => {
      if (enrollmentMap[course._id]) {
        enrolled.push(course)
      } else {
        notEnrolled.push(course)
      }
    })

    return { enrolledCourses: enrolled, notEnrolledCourses: notEnrolled }
  }, [filteredCourses, enrollmentMap])

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setLevelFilter('all')
    setLanguageFilter('all')
    setCategoryFilter('all')
  }

  const hasActiveFilters = 
    searchTerm || 
    levelFilter !== 'all' || 
    languageFilter !== 'all' || 
    categoryFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Courses</h1>
        <p className="text-muted-foreground mt-1">
          Discover new courses and expand your knowledge
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{filteredCourses.length}</p>
              </div>
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Already Enrolled</p>
                <p className="text-2xl font-bold">{enrolledCourses.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available to Enroll</p>
                <p className="text-2xl font-bold">{notEnrolledCourses.length}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <CourseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        levelFilter={levelFilter}
        onLevelChange={setLevelFilter}
        languageFilter={languageFilter}
        onLanguageChange={setLanguageFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        levels={levels}
        languages={languages}
        categories={categories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
        showStatusFilter={false}
        showCategoryFilter={true}
      />

      {/* Courses List/Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms'
                : 'Check back later for new courses'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Not Enrolled Courses Section */}
          {notEnrolledCourses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Available Courses</h2>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notEnrolledCourses.map((course) => (
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
                  {notEnrolledCourses.map((course) => (
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
            </div>
          )}

          {/* Enrolled Courses Section */}
          {enrolledCourses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Already Enrolled</h2>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      onView={() => handleViewCourse(course)}
                      isEnrolled={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <CourseListItem
                      key={course._id}
                      course={course}
                      onView={() => handleViewCourse(course)}
                      isEnrolled={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
