import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, GraduationCap, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

export default function MyCourses() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [levels, setLevels] = useState([])
  const [languages, setLanguages] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch initial data on mount
  useEffect(() => {
    if (user && user.role !== 'REFUGEE') {
      fetchInitialData()
    }
  }, [user])

  // Fetch courses when filters change
  useEffect(() => {
    if (user?._id || user?.id) {
      fetchCourses()
    }
  }, [levelFilter, statusFilter, languageFilter, categoryFilter, user])

  const fetchInitialData = async () => {
    try {
      const [categoriesData, levelsData, languagesData] = await Promise.all([
        categoryService.getAllCategories().catch(() => []),
        courseLevelService.getAllLevels().catch(() => []),
        languageService.getAllLanguages().catch(() => [])
      ])
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setLevels(Array.isArray(levelsData) ? levelsData : [])
      setLanguages(Array.isArray(languagesData) ? languagesData : [])
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
      toast.error('Failed to load initial data')
    }
  }

  const fetchCourses = async () => {
    if (!user?._id && !user?.id) {
      console.warn('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const filters = {
        createdById: user._id || user.id // Filter by current user
      }
      
      if (levelFilter !== 'all') filters.levelId = levelFilter
      if (statusFilter !== 'all') filters.isPublished = statusFilter === 'published'
      if (languageFilter !== 'all') filters.languageId = languageFilter
      if (categoryFilter !== 'all') filters.categoryId = categoryFilter

      const response = await courseService.getAllCourses(filters)
      const coursesData = Array.isArray(response) ? response : []
      setCourses(coursesData)

      // Calculate statistics from fetched courses
      calculateStatistics(coursesData)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      toast.error('Failed to load courses')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStatistics = (coursesData) => {
    const stats = {
      totalCourses: coursesData.length,
      publishedCourses: coursesData.filter(c => c.isPublished).length,
      unpublishedCourses: coursesData.filter(c => !c.isPublished).length,
      totalEnrollments: coursesData.reduce((sum, c) => sum + (c.totalEnrollments || 0), 0)
    }
    setStatistics(stats)
  }

  // Filter courses by search term
  const filteredCourses = useMemo(() => {
    if (!debouncedSearch) return courses

    return courses.filter((course) =>
      course.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      course.description.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [courses, debouncedSearch])

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
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-1">
            Manage your course content
          </p>
        </div>
        <Button className="sm:w-auto w-full" onClick={() => {
          setSelectedCourse(null)
          setIsAddModalOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
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
            {hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            ) : (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
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