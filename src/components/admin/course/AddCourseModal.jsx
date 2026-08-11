import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import courseService from '@/services/course/courseService'
import categoryService from '@/services/lesson/categoryService'
import courseLevelService from '@/services/course/courseLevelService'
import languageService from '@/services/course/languageService'
import useAuth from '@/hooks/useAuth'

// Form validation schema
const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description is too long'),
  languageId: z.string().min(1, 'Language is required'),
  levelId: z.string().min(1, 'Level is required'),
  categoryId: z.string().min(1, 'Category is required'),
})

export default function AddCourseModal({ open, onOpenChange, onSuccess, course = null }) {
  const isEditMode = !!course
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [levels, setLevels] = useState([])
  const [languages, setLanguages] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingLevels, setLoadingLevels] = useState(false)
  const [loadingLanguages, setLoadingLanguages] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: isEditMode ? course.title : '',
      description: isEditMode ? course.description : '',
      languageId: isEditMode ? (course.languageId?._id || course.languageId) : '',
      levelId: isEditMode ? (course.levelId?._id || course.levelId) : '',
      categoryId: isEditMode ? (course.categoryId?._id || course.categoryId) : '',
    },
  })

  const selectedLevel = watch('levelId')
  const selectedLanguage = watch('languageId')
  const selectedCategory = watch('categoryId')

  // Fetch dropdown data when modal opens, and reset/populate form for edit mode
  useEffect(() => {
    if (open) {
      fetchCategories()
      fetchLevels()
      fetchLanguages()

      // Reset or populate form based on mode
      if (isEditMode && course) {
        // Populate form with existing course data
        reset({
          title: course.title,
          description: course.description,
          languageId: course.languageId?._id || course.languageId,
          levelId: course.levelId?._id || course.levelId,
          categoryId: course.categoryId?._id || course.categoryId,
        })
      } else {
        // Clear form for create mode
        reset({
          title: '',
          description: '',
          languageId: '',
          levelId: '',
          categoryId: '',
        })
      }
    }
  }, [open, course, isEditMode, reset])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await categoryService.getAllCategories()
      setCategories(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchLevels = async () => {
    try {
      setLoadingLevels(true)
      const levels = await courseLevelService.getAllLevels()
      setLevels(Array.isArray(levels) ? levels : [])
    } catch (error) {
      console.error('Failed to fetch levels:', error)
      toast.error('Failed to load levels')
      setLevels([])
    } finally {
      setLoadingLevels(false)
    }
  }

  const fetchLanguages = async () => {
    try {
      setLoadingLanguages(true)
      const languages = await languageService.getAllLanguages()
      setLanguages(Array.isArray(languages) ? languages : [])
    } catch (error) {
      console.error('Failed to fetch languages:', error)
      toast.error('Failed to load languages')
      setLanguages([])
    } finally {
      setLoadingLanguages(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)

      // For create mode, get user ID from auth state
      if (!isEditMode && (!user?._id && !user?.id)) {
        toast.error('User not authenticated')
        return
      }

      const courseData = {
        ...data,
        ...(isEditMode ? {} : { createdById: user._id || user.id }),
      }

      if (isEditMode) {
        // Update existing course
        await courseService.updateCourse(course._id, courseData)
        toast.success('Course updated successfully')
      } else {
        // Create new course
        await courseService.createCourse(courseData)
        toast.success('Course created successfully')
      }

      reset()
      onOpenChange(false)

      // Call onSuccess callback to refresh the course list
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} course:`, error)
      // Error toast is handled by axios interceptor
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Course' : 'Add New Course'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the course information. Note: Category cannot be changed after creation.'
              : 'Create a new course for students to enroll in. Fill in all the required information.'}
          </DialogDescription>
        </DialogHeader>

        {isEditMode && course?.isPublished && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              This course is published. Unpublish it first to make edits.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" disabled={isEditMode && course?.isPublished}>
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., English for Beginners"
              {...register('title')}
              disabled={isEditMode && course?.isPublished}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe what students will learn in this course..."
              {...register('description')}
              disabled={isEditMode && course?.isPublished}
              className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.description ? 'border-destructive' : ''
              }`}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Language and Level - Two Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="languageId">
                Language <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedLanguage}
                onValueChange={(value) => setValue('languageId', value)}
                disabled={loadingLanguages || (isEditMode && course?.isPublished)}
              >
                <SelectTrigger className={errors.languageId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={loadingLanguages ? 'Loading...' : 'Select language'} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language._id} value={language._id}>
                      {language.name} ({language.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.languageId && (
                <p className="text-sm text-destructive">{errors.languageId.message}</p>
              )}
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label htmlFor="levelId">
                Level <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedLevel}
                onValueChange={(value) => setValue('levelId', value)}
                disabled={loadingLevels || (isEditMode && course?.isPublished)}
              >
                <SelectTrigger className={errors.levelId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={loadingLevels ? 'Loading...' : 'Select level'} />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level._id} value={level._id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.levelId && (
                <p className="text-sm text-destructive">{errors.levelId.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="categoryId">
              Category <span className="text-destructive">*</span>
              {isEditMode && <span className="text-xs text-muted-foreground ml-1">(Cannot be changed)</span>}
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue('categoryId', value)}
              disabled={loadingCategories || isEditMode}
            >
              <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                <SelectValue placeholder={loadingCategories ? 'Loading categories...' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || (isEditMode && course?.isPublished)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (isEditMode && course?.isPublished)}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting
                ? isEditMode
                  ? 'Saving...'
                  : 'Creating...'
                : isEditMode
                ? 'Save Changes'
                : 'Create Course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
