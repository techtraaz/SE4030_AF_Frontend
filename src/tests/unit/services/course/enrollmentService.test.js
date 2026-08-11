/**
 * Unit Tests - Enrollment Service
 * Tests enrollment operations for refugees
 */

import enrollmentService from '@/services/course/enrollmentService'

// Mock axios module
jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

// Get the mocked api
import api from '@/services/axios'

describe('Enrollment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── ENROLL IN COURSE ───────────────────────────────────────────────────

  describe('enrollInCourse', () => {
    it('should enroll user in a course', async () => {
      const courseId = 'course123'
      const mockEnrollment = {
        _id: 'enrollment123',
        courseId,
        status: 'ACTIVE',
        progress: 0,
      }

      api.post.mockResolvedValue({ data: { content: mockEnrollment } })

      const result = await enrollmentService.enrollInCourse(courseId)

      expect(api.post).toHaveBeenCalledWith('/enrollments', { courseId })
      expect(result).toEqual(mockEnrollment)
      expect(result.status).toBe('ACTIVE')
    })
  })

  // ─── UNENROLL FROM COURSE ───────────────────────────────────────────────

  describe('unenrollFromCourse', () => {
    it('should unenroll user from a course', async () => {
      const courseId = 'course123'
      const mockResponse = { success: true }

      api.delete.mockResolvedValue({ data: { content: mockResponse } })

      const result = await enrollmentService.unenrollFromCourse(courseId)

      expect(api.delete).toHaveBeenCalledWith(`/enrollments/${courseId}`)
      expect(result).toEqual(mockResponse)
    })
  })

  // ─── GET MY ENROLLMENTS ─────────────────────────────────────────────────

  describe('getMyEnrollments', () => {
    it('should fetch all enrollments without filter', async () => {
      const mockEnrollments = [
        { _id: 'e1', courseId: 'c1', status: 'ACTIVE' },
        { _id: 'e2', courseId: 'c2', status: 'COMPLETED' },
      ]

      api.get.mockResolvedValue({ data: { content: mockEnrollments } })

      const result = await enrollmentService.getMyEnrollments()

      expect(api.get).toHaveBeenCalledWith('/enrollments')
      expect(result).toEqual(mockEnrollments)
    })

    it('should fetch enrollments with status filter', async () => {
      const mockActiveEnrollments = [
        { _id: 'e1', status: 'ACTIVE' },
      ]

      api.get.mockResolvedValue({ data: { content: mockActiveEnrollments } })

      const result = await enrollmentService.getMyEnrollments('ACTIVE')

      expect(api.get).toHaveBeenCalledWith('/enrollments?status=ACTIVE')
      expect(result).toEqual(mockActiveEnrollments)
    })

    it('should return empty array if no content', async () => {
      api.get.mockResolvedValue({ data: {} })

      const result = await enrollmentService.getMyEnrollments()

      expect(result).toEqual([])
    })
  })

  // ─── GET ENROLLMENT DETAILS ─────────────────────────────────────────────

  describe('getEnrollmentDetails', () => {
    it('should fetch enrollment details for a course', async () => {
      const courseId = 'course123'
      const mockDetails = {
        _id: 'enrollment123',
        courseId,
        progress: 50,
        completedLessons: ['lesson1', 'lesson2'],
      }

      api.get.mockResolvedValue({ data: { content: mockDetails } })

      const result = await enrollmentService.getEnrollmentDetails(courseId)

      expect(api.get).toHaveBeenCalledWith(`/enrollments/${courseId}`)
      expect(result).toEqual(mockDetails)
    })
  })

  // ─── UPDATE PROGRESS ────────────────────────────────────────────────────

  describe('updateProgress', () => {
    it('should update enrollment progress', async () => {
      const courseId = 'course123'
      const progressData = {
        progress: 75,
        completedLessonId: 'lesson3',
      }

      const mockUpdatedEnrollment = {
        _id: 'enrollment123',
        courseId,
        progress: 75,
      }

      api.patch.mockResolvedValue({ data: { content: mockUpdatedEnrollment } })

      const result = await enrollmentService.updateProgress(
        courseId,
        progressData
      )

      expect(api.patch).toHaveBeenCalledWith(
        `/enrollments/${courseId}/progress`,
        progressData
      )
      expect(result.progress).toBe(75)
    })
  })

  // ─── CHECK ENROLLMENT STATUS ────────────────────────────────────────────

  describe('checkEnrollmentStatus', () => {
    it('should return true if user is enrolled', async () => {
      const courseId = 'course123'
      const mockStatus = { isEnrolled: true }

      api.get.mockResolvedValue({ data: { content: mockStatus } })

      const result = await enrollmentService.checkEnrollmentStatus(courseId)

      expect(api.get).toHaveBeenCalledWith(`/enrollments/${courseId}/status`)
      expect(result).toBe(true)
    })

    it('should return false if user is not enrolled', async () => {
      const courseId = 'course123'
      const mockStatus = { isEnrolled: false }

      api.get.mockResolvedValue({ data: { content: mockStatus } })

      const result = await enrollmentService.checkEnrollmentStatus(courseId)

      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      const courseId = 'course123'

      api.get.mockRejectedValue(new Error('Not found'))

      const result = await enrollmentService.checkEnrollmentStatus(courseId)

      expect(result).toBe(false)
    })
  })

  // ─── GET MY ENROLLMENT STATS ────────────────────────────────────────────

  describe('getMyEnrollmentStats', () => {
    it('should fetch enrollment statistics', async () => {
      const mockStats = {
        totalEnrollments: 10,
        activeEnrollments: 5,
        completedEnrollments: 4,
        droppedEnrollments: 1,
        averageProgress: 65,
      }

      api.get.mockResolvedValue({ data: { content: mockStats } })

      const result = await enrollmentService.getMyEnrollmentStats()

      expect(api.get).toHaveBeenCalledWith('/enrollments/statistics')
      expect(result.totalEnrollments).toBe(10)
      expect(result.averageProgress).toBe(65)
    })
  })
})
