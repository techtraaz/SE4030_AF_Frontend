/**
 * Integration Tests - Enrollment Flow
 * Tests complete enrollment and progress tracking workflows
 */

import enrollmentService from '@/services/course/enrollmentService'
import courseService from '@/services/course/courseService'

// Mock services
jest.mock('@/services/course/enrollmentService')
jest.mock('@/services/course/courseService')

describe('Enrollment Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── ENROLLMENT WORKFLOW ────────────────────────────────────────────────

  describe('Course Enrollment Workflow', () => {
    it('should handle complete enrollment flow', async () => {
      const courseId = 'course123'

      // Mock published course
      const mockCourse = {
        _id: courseId,
        title: 'React Basics',
        isPublished: true,
      }

      // Mock enrollment status check (not enrolled)
      enrollmentService.checkEnrollmentStatus.mockResolvedValue(false)

      // Mock course fetch
      courseService.getCourseById.mockResolvedValue(mockCourse)

      // Mock enrollment
      const mockEnrollment = {
        _id: 'enrollment123',
        courseId,
        status: 'ACTIVE',
        progress: 0,
      }

      enrollmentService.enrollInCourse.mockResolvedValue(mockEnrollment)

      // 1. Check enrollment status
      const isEnrolled = await enrollmentService.checkEnrollmentStatus(courseId)
      expect(isEnrolled).toBe(false)

      // 2. Fetch course details
      const course = await courseService.getCourseById(courseId)
      expect(course.isPublished).toBe(true)

      // 3. Enroll in course
      const enrollment = await enrollmentService.enrollInCourse(courseId)

      expect(enrollment.status).toBe('ACTIVE')
      expect(enrollment.progress).toBe(0)
    })

    it('should prevent enrollment if already enrolled', async () => {
      const courseId = 'course123'

      enrollmentService.checkEnrollmentStatus.mockResolvedValue(true)

      const isEnrolled = await enrollmentService.checkEnrollmentStatus(courseId)

      expect(isEnrolled).toBe(true)
      expect(enrollmentService.enrollInCourse).not.toHaveBeenCalled()
    })
  })

  // ─── PROGRESS TRACKING WORKFLOW ─────────────────────────────────────────

  describe('Progress Tracking Workflow', () => {
    it('should update progress after lesson completion', async () => {
      const courseId = 'course123'

      const progressData = {
        progress: 25,
        completedLessonId: 'lesson1',
      }

      const mockUpdatedEnrollment = {
        _id: 'enrollment123',
        courseId,
        progress: 25,
        completedLessons: ['lesson1'],
      }

      enrollmentService.updateProgress.mockResolvedValue(
        mockUpdatedEnrollment
      )

      const result = await enrollmentService.updateProgress(
        courseId,
        progressData
      )

      expect(result.progress).toBe(25)
      expect(result.completedLessons).toContain('lesson1')
    })

    it('should track multiple lesson completions', async () => {
      const courseId = 'course123'

      // First lesson
      enrollmentService.updateProgress.mockResolvedValueOnce({
        progress: 25,
        completedLessons: ['lesson1'],
      })

      // Second lesson
      enrollmentService.updateProgress.mockResolvedValueOnce({
        progress: 50,
        completedLessons: ['lesson1', 'lesson2'],
      })

      // Complete first lesson
      const result1 = await enrollmentService.updateProgress(courseId, {
        progress: 25,
        completedLessonId: 'lesson1',
      })
      expect(result1.progress).toBe(25)

      // Complete second lesson
      const result2 = await enrollmentService.updateProgress(courseId, {
        progress: 50,
        completedLessonId: 'lesson2',
      })
      expect(result2.progress).toBe(50)
    })
  })

  // ─── ENROLLMENT HISTORY ─────────────────────────────────────────────────

  describe('Enrollment History', () => {
    it('should fetch all enrollments', async () => {
      const mockEnrollments = [
        { _id: 'e1', courseId: 'c1', status: 'ACTIVE', progress: 30 },
        { _id: 'e2', courseId: 'c2', status: 'COMPLETED', progress: 100 },
        { _id: 'e3', courseId: 'c3', status: 'ACTIVE', progress: 60 },
      ]

      enrollmentService.getMyEnrollments.mockResolvedValue(mockEnrollments)

      const enrollments = await enrollmentService.getMyEnrollments()

      expect(enrollments).toHaveLength(3)
      expect(enrollments[1].status).toBe('COMPLETED')
    })

    it('should filter enrollments by status', async () => {
      const mockActiveEnrollments = [
        { _id: 'e1', status: 'ACTIVE', progress: 30 },
        { _id: 'e3', status: 'ACTIVE', progress: 60 },
      ]

      enrollmentService.getMyEnrollments.mockResolvedValue(
        mockActiveEnrollments
      )

      const active = await enrollmentService.getMyEnrollments('ACTIVE')

      expect(active).toHaveLength(2)
      expect(active.every((e) => e.status === 'ACTIVE')).toBe(true)
    })
  })

  // ─── ENROLLMENT DETAILS ─────────────────────────────────────────────────

  describe('Enrollment Details', () => {
    it('should fetch detailed enrollment information', async () => {
      const courseId = 'course123'

      const mockDetails = {
        _id: 'enrollment123',
        courseId,
        status: 'ACTIVE',
        progress: 75,
        completedLessons: ['lesson1', 'lesson2', 'lesson3'],
        lastAccessedAt: new Date(),
      }

      enrollmentService.getEnrollmentDetails.mockResolvedValue(mockDetails)

      const details = await enrollmentService.getEnrollmentDetails(courseId)

      expect(details.progress).toBe(75)
      expect(details.completedLessons).toHaveLength(3)
    })
  })

  // ─── UNENROLLMENT WORKFLOW ──────────────────────────────────────────────

  describe('Unenrollment Workflow', () => {
    it('should unenroll from course', async () => {
      const courseId = 'course123'

      const mockResponse = { success: true }

      enrollmentService.unenrollFromCourse.mockResolvedValue(mockResponse)

      const result = await enrollmentService.unenrollFromCourse(courseId)

      expect(result.success).toBe(true)
      expect(enrollmentService.unenrollFromCourse).toHaveBeenCalledWith(
        courseId
      )
    })
  })

  // ─── ENROLLMENT STATISTICS ──────────────────────────────────────────────

  describe('Enrollment Statistics', () => {
    it('should fetch user enrollment statistics', async () => {
      const mockStats = {
        totalEnrollments: 10,
        activeEnrollments: 5,
        completedEnrollments: 4,
        droppedEnrollments: 1,
        averageProgress: 65,
      }

      enrollmentService.getMyEnrollmentStats.mockResolvedValue(mockStats)

      const stats = await enrollmentService.getMyEnrollmentStats()

      expect(stats.totalEnrollments).toBe(10)
      expect(stats.completedEnrollments).toBe(4)
      expect(stats.averageProgress).toBe(65)
    })
  })

  // ─── COURSE COMPLETION ──────────────────────────────────────────────────

  describe('Course Completion', () => {
    it('should complete course when progress reaches 100%', async () => {
      const courseId = 'course123'

      const mockCompletedEnrollment = {
        _id: 'enrollment123',
        courseId,
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      }

      enrollmentService.updateProgress.mockResolvedValue(
        mockCompletedEnrollment
      )

      const result = await enrollmentService.updateProgress(courseId, {
        progress: 100,
        completedLessonId: 'final-lesson',
      })

      expect(result.status).toBe('COMPLETED')
      expect(result.progress).toBe(100)
    })
  })
})
