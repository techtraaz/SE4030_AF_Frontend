import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, GraduationCap, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import courseService from '@/services/course/courseService'
import categoryService from '@/services/lesson/categoryService'
import courseLevelService from '@/services/course/courseLevelService'
import languageService from '@/services/course/languageService'
import AddCourseModal from '@/components/admin/course/AddCourseModal'
import CourseCard from '@/components/shared/course/CourseCard'
import CourseListItem from '@/components/shared/course/CourseListItem'
import CourseFilters from '@/components/shared/course/CourseFilters'
import CourseStats from '@/components/shared/course/CourseStats'
import useAuth from '@/hooks/useAuth'

export default function Courses() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [levels, setLevels] = useState([])
  const [languages, setLanguages] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [languageFilter, setLanguageFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingCourseId, setDeletingCourseId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Validate user role on mount (Admin only)
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access this page')
      navigate('/')
      return
    }
    
    if (user.role !== 'ADMIN') {
      toast.error('This page is only accessible to administrators')
      navigate('/admin/dashboard')
      return
    }
  }, [user, navigate])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch initial data on mount
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [categoriesData, levelsData, languagesData, statsData] = await Promise.all([
        categoryService.getAllCategories().catch(err => {
          console.error('Error fetching categories:', err)
          return []
        }),
        courseLevelService.getAllLevels().catch(err => {
          console.error('Error fetching levels:', err)
          return []
        }),
        languageService.getAllLanguages().catch(err => {
          console.error('Error fetching languages:', err)
          return []
        }),
        courseService.getGlobalStatistics().catch(err => {
          console.error('Error fetching statistics:', err)
          return null
        })
      ])
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setLevels(Array.isArray(levelsData) ? levelsData : [])
      setLanguages(Array.isArray(languagesData) ? languagesData : [])
      setStatistics(statsData)
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
      toast.error('Failed to load initial data')
    }
  }

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true)
      const filters = {}
      
      if (levelFilter !== 'all') {
        filters.levelId = levelFilter
      }
      
      if (statusFilter !== 'all') {
        filters.isPublished = statusFilter === 'published'
      }
      
      if (languageFilter !== 'all') {
        filters.languageId = languageFilter
      }
      
      if (categoryFilter !== 'all') {
        filters.categoryId = categoryFilter
      }

      const response = await courseService.getAllCourses(filters)
      setCourses(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      toast.error('Failed to load courses')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
    // Refresh statistics when filters change
    fetchStatistics()
  }, [levelFilter, statusFilter, languageFilter, categoryFilter])

  const fetchStatistics = async () => {
    try {
      const statsData = await courseService.getGlobalStatistics()
      setStatistics(statsData || null)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    }
  }

  // Filter courses by search term
  const filteredCourses = useMemo(() => {
    if (!debouncedSearch) return courses

    return courses.filter((course) =>
      course.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      course.description.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [courses, debouncedSearch])

  // Handle publish
  const handlePublish = async (course) => {
    try {
      await courseService.publishCourse(course._id)
      toast.success('Course published successfully')
      fetchCourses()
      fetchStatistics()
    } catch (error) {
      console.error('Failed to publish course:', error)
    }
  }

  // Handle unpublish
  const handleUnpublish = async (course) => {
    try {
      await courseService.unpublishCourse(course._id)
      toast.success('Course unpublished successfully')
      fetchCourses()
      fetchStatistics()
    } catch (error) {
      console.error('Failed to unpublish course:', error)
    }
  }

  // Handle delete - open confirmation modal
  const handleDelete = (courseId) => {
    setDeletingCourseId(courseId)
    setIsDeleteDialogOpen(true)
  }

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    if (!deletingCourseId) return

    try {
      setIsDeleting(true)
      await courseService.deleteCourse(deletingCourseId)
      toast.success('Course deleted successfully')
      setIsDeleteDialogOpen(false)
      setDeletingCourseId(null)
      fetchCourses()
      fetchStatistics()
    } catch (error) {
      console.error('Failed to delete course:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle edit - open modal with selected course
  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setIsAddModalOpen(true)
  }

  // Handle modal close - reset selected course
  const handleModalClose = (open) => {
    if (!open) {
      setSelectedCourse(null)
    }
    setIsAddModalOpen(open)
  }

  // Get level badge variant based on display order
  const getLevelVariant = (course) => {
    // The backend populates levelId with the full level object
    const level = course.levelId || course.level
    
    // If level is an object with displayOrder
    if (typeof level === 'object' && level?.displayOrder) {
      if (level.displayOrder === 1) return 'success'
      if (level.displayOrder === 2) return 'warning'
      if (level.displayOrder === 3) return 'destructive'
      return 'default'
    }

    return 'default'
  }

  // Get level display name - handles both populated objects and legacy string fields
  const getLevelName = (course) => {
    // The backend populates levelId with the full level object
    const level = course.levelId || course.level
    
    // If level is populated as an object
    if (typeof level === 'object' && level?.name) {
      return level.name
    }

    // If level is a string (legacy field)
    if (typeof level === 'string' && level !== 'all') {
      return level
    }

    return 'Unknown'
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('')
    setLevelFilter('all')
    setStatusFilter('all')
    setLanguageFilter('all')
    setCategoryFilter('all')
  }

  const hasActiveFilters = 
    searchTerm || 
    levelFilter !== 'all' || 
    statusFilter !== 'all' || 
    languageFilter !== 'all' || 
    categoryFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-1">
            Manage all courses across the platform
          </p>
        </div>
        <Button className="sm:w-auto w-full" onClick={() => {
          setSelectedCourse(null)
          setIsAddModalOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Statistics */}
      <CourseStats statistics={statistics} variant="creator" />

      {/* Filters */}
      <CourseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        levelFilter={levelFilter}
        onLevelChange={setLevelFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
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
        showStatusFilter={true}
        showCategoryFilter={true}
      />

      {/* Courses List/Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first course'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onView={() => navigate(`/admin/courses/${course._id}`)}
              onEdit={() => handleEditCourse(course)}
              onPublish={() => handlePublish(course)}
              onUnpublish={() => handleUnpublish(course)}
              onDelete={() => handleDelete(course._id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CourseListItem
              key={course._id}
              course={course}
              onView={() => navigate(`/admin/courses/${course._id}`)}
              onEdit={() => handleEditCourse(course)}
              onPublish={() => handlePublish(course)}
              onUnpublish={() => handleUnpublish(course)}
              onDelete={() => handleDelete(course._id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Course Modal */}
      <AddCourseModal
        open={isAddModalOpen}
        onOpenChange={handleModalClose}
        course={selectedCourse}
        onSuccess={fetchCourses}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
              <DialogTitle>Delete Course</DialogTitle>
            </div>
            <DialogDescription className="mt-2">
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingCourseId(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Course'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
