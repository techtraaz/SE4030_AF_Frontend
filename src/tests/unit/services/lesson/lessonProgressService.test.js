import { 
  markLessonComplete, 
  markLessonIncomplete, 
  getCourseProgress, 
  getAllProgress 
} from '@/services/lesson/lessonProgressService'

// Mock axios module
jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

import api from '@/services/axios'

describe('Lesson Progress Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('markLessonComplete', () => {
    it('should mark lesson as complete successfully', async () => {
      const mockEnrollment = { 
        _id: '1', 
        completedLessons: ['lesson1'],
        progressPercentage: 25 
      }
      api.post.mockResolvedValue({ data: { content: mockEnrollment } })

      const result = await markLessonComplete('course1', 'lesson1')

      expect(api.post).toHaveBeenCalledWith('/lesson-progress/complete', {
        courseId: 'course1',
        lessonId: 'lesson1'
      })
      expect(result).toEqual(mockEnrollment)
    })
  })

  describe('markLessonIncomplete', () => {
    it('should mark lesson as incomplete successfully', async () => {
      const mockEnrollment = { 
        _id: '1', 
        completedLessons: [],
        progressPercentage: 0 
      }
      api.post.mockResolvedValue({ data: { content: mockEnrollment } })

      const result = await markLessonIncomplete('course1', 'lesson1')

      expect(api.post).toHaveBeenCalledWith('/lesson-progress/incomplete', {
        courseId: 'course1',
        lessonId: 'lesson1'
      })
      expect(result).toEqual(mockEnrollment)
    })
  })

  describe('getCourseProgress', () => {
    it('should fetch course progress successfully', async () => {
      const mockProgress = { 
        courseId: 'course1',
        completedLessons: ['lesson1', 'lesson2'],
        progressPercentage: 50 
      }
      api.get.mockResolvedValue({ data: { content: mockProgress } })

      const result = await getCourseProgress('course1')

      expect(api.get).toHaveBeenCalledWith('/lesson-progress/course/course1')
      expect(result).toEqual(mockProgress)
    })
  })

  describe('getAllProgress', () => {
    it('should fetch all progress successfully', async () => {
      const mockProgress = [
        { courseId: 'course1', progressPercentage: 50 },
        { courseId: 'course2', progressPercentage: 75 }
      ]
      api.get.mockResolvedValue({ data: { content: mockProgress } })

      const result = await getAllProgress()

      expect(api.get).toHaveBeenCalledWith('/lesson-progress')
      expect(result).toEqual(mockProgress)
    })
  })
})
