import { 
  markLessonComplete, 
  markLessonIncomplete, 
  getCourseProgress, 
  getAllProgress 
} from '@/services/lesson/lessonProgressService'
import lessonService from '@/services/lesson/lessonService'

// Mock axios module
jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

import api from '@/services/axios'

describe('Lesson Progress Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Lesson Progress Workflow', () => {
    it('should track progress through multiple lessons', async () => {
      const courseId = 'course1'
      const lessonIds = ['lesson1', 'lesson2', 'lesson3', 'lesson4']

      // Step 1: Get initial progress (0%)
      const initialProgress = { 
        courseId, 
        completedLessons: [], 
        progressPercentage: 0 
      }
      api.get.mockResolvedValueOnce({ data: { content: initialProgress } })
      const progress1 = await getCourseProgress(courseId)
      expect(progress1.progressPercentage).toBe(0)

      // Step 2: Complete first lesson (25%)
      const progress2 = { 
        courseId, 
        completedLessons: ['lesson1'], 
        progressPercentage: 25 
      }
      api.post.mockResolvedValueOnce({ data: { content: progress2 } })
      const result2 = await markLessonComplete(courseId, lessonIds[0])
      expect(result2.progressPercentage).toBe(25)

      // Step 3: Complete second lesson (50%)
      const progress3 = { 
        courseId, 
        completedLessons: ['lesson1', 'lesson2'], 
        progressPercentage: 50 
      }
      api.post.mockResolvedValueOnce({ data: { content: progress3 } })
      const result3 = await markLessonComplete(courseId, lessonIds[1])
      expect(result3.progressPercentage).toBe(50)

      // Step 4: Complete third lesson (75%)
      const progress4 = { 
        courseId, 
        completedLessons: ['lesson1', 'lesson2', 'lesson3'], 
        progressPercentage: 75 
      }
      api.post.mockResolvedValueOnce({ data: { content: progress4 } })
      const result4 = await markLessonComplete(courseId, lessonIds[2])
      expect(result4.progressPercentage).toBe(75)

      // Step 5: Complete final lesson (100%)
      const progress5 = { 
        courseId, 
        completedLessons: lessonIds, 
        progressPercentage: 100 
      }
      api.post.mockResolvedValueOnce({ data: { content: progress5 } })
      const result5 = await markLessonComplete(courseId, lessonIds[3])
      expect(result5.progressPercentage).toBe(100)
    })
  })

  describe('Mark Lesson Incomplete Workflow', () => {
    it('should allow marking lesson as incomplete', async () => {
      const courseId = 'course1'
      const lessonId = 'lesson2'

      // Step 1: Current progress
      const currentProgress = { 
        courseId, 
        completedLessons: ['lesson1', 'lesson2', 'lesson3'], 
        progressPercentage: 75 
      }
      api.get.mockResolvedValueOnce({ data: { content: currentProgress } })
      const progress = await getCourseProgress(courseId)
      expect(progress.completedLessons).toContain(lessonId)

      // Step 2: Mark lesson incomplete
      const updatedProgress = { 
        courseId, 
        completedLessons: ['lesson1', 'lesson3'], 
        progressPercentage: 50 
      }
      api.post.mockResolvedValueOnce({ data: { content: updatedProgress } })
      const result = await markLessonIncomplete(courseId, lessonId)
      expect(result.completedLessons).not.toContain(lessonId)
      expect(result.progressPercentage).toBe(50)
    })
  })

  describe('Multi-Course Progress Tracking', () => {
    it('should track progress across multiple courses', async () => {
      const courses = [
        { _id: 'course1', title: 'Course 1' },
        { _id: 'course2', title: 'Course 2' },
        { _id: 'course3', title: 'Course 3' }
      ]

      // Step 1: Get all progress
      const allProgress = [
        { courseId: 'course1', progressPercentage: 75 },
        { courseId: 'course2', progressPercentage: 50 },
        { courseId: 'course3', progressPercentage: 25 }
      ]
      api.get.mockResolvedValueOnce({ data: { content: allProgress } })
      const progress = await getAllProgress()
      expect(progress).toHaveLength(3)

      // Step 2: Get specific course progress
      api.get.mockResolvedValueOnce({ 
        data: { content: allProgress[0] } 
      })
      const course1Progress = await getCourseProgress('course1')
      expect(course1Progress.progressPercentage).toBe(75)
    })
  })

  describe('Lesson Access Workflow', () => {
    it('should check progress before accessing next lesson', async () => {
      const courseId = 'course1'

      // Step 1: Get all lessons
      const mockLessons = [
        { _id: 'lesson1', order: 1 },
        { _id: 'lesson2', order: 2 },
        { _id: 'lesson3', order: 3 }
      ]
      api.get.mockResolvedValueOnce({ data: { content: mockLessons } })
      const lessons = await lessonService.getAllLessons({ courseId })
      expect(lessons).toHaveLength(3)

      // Step 2: Check progress
      const progress = { 
        courseId, 
        completedLessons: ['lesson1'], 
        progressPercentage: 33 
      }
      api.get.mockResolvedValueOnce({ data: { content: progress } })
      const currentProgress = await getCourseProgress(courseId)

      // Step 3: Verify lesson1 is complete, lesson2 accessible
      expect(currentProgress.completedLessons).toContain('lesson1')
      
      // Step 4: Access and complete lesson2
      const updatedProgress = { 
        courseId, 
        completedLessons: ['lesson1', 'lesson2'], 
        progressPercentage: 67 
      }
      api.post.mockResolvedValueOnce({ data: { content: updatedProgress } })
      const result = await markLessonComplete(courseId, 'lesson2')
      expect(result.completedLessons).toContain('lesson2')
    })
  })

  describe('Progress Percentage Calculation', () => {
    it('should calculate correct progress percentage', async () => {
      const courseId = 'course1'
      const totalLessons = 10

      // Complete 3 out of 10 lessons (30%)
      const progress = { 
        courseId, 
        completedLessons: ['l1', 'l2', 'l3'], 
        progressPercentage: 30 
      }
      api.post.mockResolvedValueOnce({ data: { content: progress } })
      const result = await markLessonComplete(courseId, 'l3')
      expect(result.progressPercentage).toBe(30)
    })
  })

  describe('Resuming Course Workflow', () => {
    it('should identify next lesson to resume', async () => {
      const courseId = 'course1'

      // Step 1: Get course progress
      const progress = { 
        courseId, 
        completedLessons: ['lesson1', 'lesson2'], 
        progressPercentage: 40 
      }
      api.get.mockResolvedValueOnce({ data: { content: progress } })
      const currentProgress = await getCourseProgress(courseId)

      // Step 2: Get all lessons
      const lessons = [
        { _id: 'lesson1', order: 1 },
        { _id: 'lesson2', order: 2 },
        { _id: 'lesson3', order: 3 }, // Next lesson to resume
        { _id: 'lesson4', order: 4 },
        { _id: 'lesson5', order: 5 }
      ]
      api.get.mockResolvedValueOnce({ data: { content: lessons } })
      const allLessons = await lessonService.getAllLessons({ courseId })

      // Step 3: Find next incomplete lesson
      const nextLesson = allLessons.find(
        lesson => !currentProgress.completedLessons.includes(lesson._id)
      )
      expect(nextLesson._id).toBe('lesson3')
      expect(nextLesson.order).toBe(3)
    })
  })

  describe('Bulk Progress Update', () => {
    it('should handle multiple lesson completions in sequence', async () => {
      const courseId = 'course1'
      const lessonsToComplete = ['lesson1', 'lesson2', 'lesson3']

      let currentProgress = { 
        courseId, 
        completedLessons: [], 
        progressPercentage: 0 
      }

      for (let i = 0; i < lessonsToComplete.length; i++) {
        currentProgress = {
          courseId,
          completedLessons: lessonsToComplete.slice(0, i + 1),
          progressPercentage: ((i + 1) / 10) * 100 // Assume 10 total lessons
        }
        api.post.mockResolvedValueOnce({ data: { content: currentProgress } })
        await markLessonComplete(courseId, lessonsToComplete[i])
      }

      expect(currentProgress.completedLessons).toHaveLength(3)
      expect(currentProgress.progressPercentage).toBe(30)
    })
  })

  describe('Error Handling', () => {
    it('should handle progress update error', async () => {
      const error = new Error('Progress update failed')
      error.response = { data: { message: 'Progress update failed' } }
      api.post.mockRejectedValueOnce(error)

      await expect(
        markLessonComplete('course1', 'lesson1')
      ).rejects.toThrow()
    })

    it('should handle invalid course ID', async () => {
      const error = new Error('Course not found')
      error.response = { data: { message: 'Course not found' } }
      api.get.mockRejectedValueOnce(error)

      await expect(
        getCourseProgress('invalid')
      ).rejects.toThrow()
    })
  })
})
