import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, BookOpen } from 'lucide-react'
import { toastService } from '@/services/toastService'
import lessonService from '@/services/lesson/lessonService'
import categoryService from '@/services/lesson/categoryService'
import courseService from '@/services/course/courseService'
import LessonCard from '@/components/shared/lesson/LessonCard'
import LessonFilters from '@/components/shared/lesson/LessonFilters'
import ManageLessonModal from '@/components/admin/lesson/ManageLessonModal'
import ConfirmationModal from '@/components/shared/ConfirmationModal'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import useAuth from '@/hooks/useAuth'

/**
 * MyLessons Page - Content Contributor's lesson management
 * Shows all lessons they've created across all their courses
 */
const MyLessons = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState([])
  const [categories, setCategories] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    courseId: '',
    difficulty: '',
    isPublished: '',
  })

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

  useEffect(() => {
    if (courses.length > 0) {
      fetchLessons()
    }
  }, [filters, courses])

  const fetchInitialData = async () => {
    try {
      const [categoriesData, coursesData] = await Promise.all([
        categoryService.getAllCategories(),
        courseService.getAllCourses({ createdById: user._id })
      ])
      setCategories(categoriesData)
      setCourses(coursesData)
      if (!coursesData.length) {
        setLoading(false)
      }
    } catch (error) {
      toastService.error('Failed to load initial data')
      setLoading(false)
    }
  }

  const fetchLessons = async () => {
    try {
      setLoading(true)
      
      // Fetch lessons from all user's courses
      const allLessons = []
      for (const course of courses) {
        const courseLessons = await lessonService.getAllLessons({ 
          courseId: course._id,
          ...(filters.categoryId && { categoryId: filters.categoryId })
        })
        allLessons.push(...courseLessons)
      }
      
      // Apply client-side filters
      let filtered = allLessons
      
      if (filters.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(lesson => 
          lesson.title?.toLowerCase().includes(search) || 
          lesson.description?.toLowerCase().includes(search)
        )
      }
      
      if (filters.difficulty && filters.difficulty !== 'all') {
        filtered = filtered.filter(l => l.difficulty === filters.difficulty)
      }
      
      if (filters.isPublished && filters.isPublished !== 'all') {
        const published = filters.isPublished === 'true'
        filtered = filtered.filter(l => l.isPublished === published)
      }
      
      if (filters.courseId && filters.courseId !== 'all') {
        filtered = filtered.filter(l => l.courseId === filters.courseId)
      }
      
      setLessons(filtered)
    } catch (error) {
      toastService.error('Failed to fetch lessons')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = (courseId = null) => {
    setEditingLesson(null)
    setSelectedCourse(courseId)
    setIsModalOpen(true)
  }

  const openEditModal = (lesson) => {
    setEditingLesson(lesson)
    setSelectedCourse(lesson.courseId)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingLesson(null)
    setSelectedCourse(null)
  }

  const handlePublish = async (lesson) => {
    if (!lesson.reading || !lesson.listening || !lesson.vocabulary || !lesson.video) {
      toastService.error('All 4 sections must be completed before publishing')
      return
    }

    try {
      await lessonService.publishLesson(lesson._id)
      toastService.success('Lesson published successfully')
      await fetchLessons()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  const handleUnpublish = async (lesson) => {
    try {
      await lessonService.unpublishLesson(lesson._id)
      toastService.success('Lesson unpublished successfully')
      await fetchLessons()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  const handleDelete = async (lesson) => {
    setLessonToDelete(lesson)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!lessonToDelete) return

    try {
      setDeleting(true)
      await lessonService.deleteLesson(lessonToDelete._id)
      toastService.success('Lesson deleted successfully')
      await fetchLessons()
      setDeleteModalOpen(false)
      setLessonToDelete(null)
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setDeleting(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      courseId: '',
      difficulty: '',
      isPublished: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'all')

  // Group lessons by course
  const lessonsByCourse = lessons.reduce((acc, lesson) => {
    const courseId = lesson.courseId
    if (!acc[courseId]) {
      acc[courseId] = []
    }
    acc[courseId].push(lesson)
    return acc
  }, {})

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">My Lessons</h1>
          <p className="text-brand-gray text-sm pb-3">
            Manage lessons across all your courses
          </p>
        </div>
        {courses.length > 0 && (
          <Button onClick={() => openCreateModal(courses[0]._id)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Lesson
          </Button>
        )}
      </div>

      {/* Filters */}
      <LessonFilters
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        categories={categories}
        courses={courses}
        showCourseFilter={true}
      />

      {/* Content */}
      {loading ? (
        <LoadingSkeleton text="Loading lessons..." />
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Create a course first before adding lessons.
            </p>
            <Button onClick={() => openCreateModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Lesson
            </Button>
          </CardContent>
        </Card>
      ) : lessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-brand-gray mb-4" />
            <p className="text-brand-gray text-center mb-4">
              {hasActiveFilters
                ? 'No lessons match your filters. Try adjusting your search criteria.'
                : 'No lessons yet. Create your first lesson to get started.'}
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => openCreateModal(courses[0]._id)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Lesson
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Group by course if not filtering by specific course */}
          {!filters.courseId || filters.courseId === 'all' ? (
            Object.entries(lessonsByCourse).map(([courseId, courseLessons]) => {
              const course = courses.find(c => c._id === courseId)
              return (
                <div key={courseId} className="space-y-4">
                  <div className="flex items-center justify-between bg-blue-100 px-4 rounded-xl">
                    <div>
                      <h2 className="text-md font-semibold text-blue-700 capitalize py-4">
                        <span className="text-gray-900">Course : </span>{course?.title || 'Unknown Course'}
                          <span className="pl-3 text-sm text-brand-gray">
                            ({courseLessons.length} lesson{courseLessons.length !== 1 ? 's' : ''})
                          </span>
                      </h2>
                      
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courseLessons.map((lesson) => (
                      <LessonCard
                        key={lesson._id}
                        lesson={lesson}
                        onView={(lesson) => navigate(`/admin/lessons/${lesson._id}`)}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        onPublish={handlePublish}
                        onUnpublish={handleUnpublish}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson._id}
                  lesson={lesson}                  onView={(lesson) => navigate(`/admin/lessons/${lesson._id}`)}                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onUnpublish={handleUnpublish}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manage Lesson Modal */}
      <ManageLessonModal
        isOpen={isModalOpen}
        onClose={closeModal}
        lesson={editingLesson}
        courseId={selectedCourse}
        categories={categories}
        onSuccess={fetchLessons}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setLessonToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
        itemName={lessonToDelete?.title}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}

export default MyLessons
