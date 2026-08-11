import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { quizBasicInfoSchema } from '@/validations/quizValidations'
import { toastService } from '@/services/toastService'
import quizService from '@/services/quiz/quizService'
import courseService from '@/services/course/courseService'
import lessonService from '@/services/lesson/lessonService'

/**
 * Custom hook for managing quiz form state and operations
 */
export const useQuizForm = (user, quiz, courseId, lessonId) => {
  const isEditMode = !!quiz
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [lessons, setLessons] = useState([])
  const [quizType, setQuizType] = useState('course')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState('')

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(quizBasicInfoSchema),
    defaultValues: {
      title: '',
      description: '',
      passingScore: 60,
      timeLimit: '',
      maxAttempts: '',
      instructions: '',
      isRandomOrder: false,
    }
  })

  // Load courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.getAllCourses({ createdById: user._id })
        setCourses(coursesData)
      } catch (error) {
        toastService.error('Failed to load courses')
      }
    }
    if (user?._id) {
      fetchCourses()
    }
  }, [user])

  // Load lessons when course changes
  useEffect(() => {
    const fetchLessons = async () => {
      if (selectedCourseId) {
        try {
          const lessonsData = await lessonService.getAllLessons({ courseId: selectedCourseId })
          setLessons(lessonsData)
        } catch (error) {
          toastService.error('Failed to load lessons')
        }
      } else {
        setLessons([])
      }
    }
    fetchLessons()
  }, [selectedCourseId])

  // Initialize form with quiz data
  useEffect(() => {
    if (quiz) {
      if (quiz.lessonId) {
        setQuizType('lesson')
        setSelectedLessonId(quiz.lessonId._id || quiz.lessonId)
        setSelectedCourseId('')
      } else if (quiz.courseId) {
        setQuizType('course')
        setSelectedCourseId(quiz.courseId._id || quiz.courseId)
        setSelectedLessonId('')
      }
      
      reset({
        title: quiz.title || '',
        description: quiz.description || '',
        passingScore: quiz.passingScore || 60,
        timeLimit: quiz.timeLimit || '',
        maxAttempts: quiz.maxAttempts || '',
        instructions: quiz.instructions || '',
        isRandomOrder: quiz.isRandomOrder || false,
      })
    } else {
      setQuizType(lessonId ? 'lesson' : 'course')
      setSelectedCourseId(courseId || '')
      setSelectedLessonId(lessonId || '')
      reset({
        title: '',
        description: '',
        passingScore: 60,
        timeLimit: '',
        maxAttempts: '',
        instructions: '',
        isRandomOrder: false,
      })
    }
  }, [quiz, courseId, lessonId, reset])

  const saveQuiz = async (data) => {
    let payload = { ...data }
    
    if (quizType === 'course') {
      if (!selectedCourseId) {
        toastService.error('Please select a course')
        return null
      }
      payload.courseId = selectedCourseId
      payload.lessonId = null
    } else if (quizType === 'lesson') {
      if (!selectedLessonId) {
        toastService.error('Please select a lesson')
        return null
      }
      payload.lessonId = selectedLessonId
      payload.courseId = null
    }

    try {
      setLoading(true)
      
      let savedQuiz
      if (isEditMode) {
        savedQuiz = await quizService.updateQuiz(quiz._id, payload)
        toastService.success('Quiz updated successfully')
      } else {
        savedQuiz = await quizService.createQuiz(payload)
        toastService.success('Quiz created successfully')
      }
      
      return savedQuiz
    } catch (error) {
      console.error('Quiz creation/update error:', error)
      toastService.error(error.response?.data?.message || 'Failed to save quiz')
      return null
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    reset({
      title: '',
      description: '',
      passingScore: 60,
      timeLimit: '',
      maxAttempts: '',
      instructions: '',
      isRandomOrder: false,
    })
    setQuizType(lessonId ? 'lesson' : 'course')
    setSelectedCourseId(courseId || '')
    setSelectedLessonId(lessonId || '')
  }

  return {
    // Form
    register,
    handleSubmit,
    errors,
    watch,
    setValue,
    // State
    loading,
    courses,
    lessons,
    quizType,
    selectedCourseId,
    selectedLessonId,
    isEditMode,
    // Actions
    setQuizType,
    setSelectedCourseId,
    setSelectedLessonId,
    saveQuiz,
    resetForm,
  }
}
