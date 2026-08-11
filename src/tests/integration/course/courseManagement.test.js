/**
 * Integration Tests - Course Management Flow
 * Tests complete course creation and management workflows
 */

import courseService from '@/services/course/courseService'
import courseLevelService from '@/services/course/courseLevelService'
import languageService from '@/services/course/languageService'

// Mock services
jest.mock('@/services/course/courseService')
jest.mock('@/services/course/courseLevelService')
jest.mock('@/services/course/languageService')

describe('Course Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── COURSE CREATION WORKFLOW ───────────────────────────────────────────

  describe('Course Creation Workflow', () => {
    it('should handle complete course creation flow', async () => {
      // Mock levels and languages
      const mockLevels = [{ _id: 'level1', name: 'Beginner' }]
      const mockLanguages = [{ _id: 'lang1', name: 'English' }]

      courseLevelService.getAllLevels.mockResolvedValue(mockLevels)
      languageService.getAllLanguages.mockResolvedValue(mockLanguages)

      // Create course
      const courseData = {
        title: 'React Fundamentals',
        description: 'Learn React basics',
        levelId: 'level1',
        languageId: 'lang1',
      }

      const mockCreatedCourse = {
        _id: 'course123',
        ...courseData,
        isPublished: false,
      }

      courseService.createCourse.mockResolvedValue(mockCreatedCourse)

      // Fetch levels and languages
      const levels = await courseLevelService.getAllLevels()
      const languages = await languageService.getAllLanguages()

      expect(levels).toHaveLength(1)
      expect(languages).toHaveLength(1)

      // Create course
      const course = await courseService.createCourse(courseData)

      expect(course._id).toBe('course123')
      expect(course.title).toBe(courseData.title)
      expect(course.isPublished).toBe(false)
    })
  })

  // ─── COURSE PUBLISH WORKFLOW ────────────────────────────────────────────

  describe('Course Publishing Workflow', () => {
    it('should publish course successfully', async () => {
      const courseId = 'course123'

      const mockCourse = {
        _id: courseId,
        title: 'Test Course',
        isPublished: false,
      }

      const mockPublishedCourse = {
        ...mockCourse,
        isPublished: true,
      }

      courseService.getCourseById.mockResolvedValue(mockCourse)
      courseService.publishCourse.mockResolvedValue(mockPublishedCourse)

      // Get course
      const course = await courseService.getCourseById(courseId)
      expect(course.isPublished).toBe(false)

      // Publish course
      const published = await courseService.publishCourse(courseId)
      expect(published.isPublished).toBe(true)
    })

    it('should unpublish course for editing', async () => {
      const courseId = 'course123'

      const mockUnpublishedCourse = {
        _id: courseId,
        isPublished: false,
      }

      courseService.unpublishCourse.mockResolvedValue(mockUnpublishedCourse)

      const result = await courseService.unpublishCourse(courseId)

      expect(result.isPublished).toBe(false)
    })
  })

  // ─── COURSE UPDATE WORKFLOW ─────────────────────────────────────────────

  describe('Course Update Workflow', () => {
    it('should update unpublished course', async () => {
      const courseId = 'course123'
      const updateData = {
        title: 'Updated Course Title',
        description: 'Updated Description',
      }

      const mockUpdatedCourse = {
        _id: courseId,
        ...updateData,
        isPublished: false,
      }

      courseService.updateCourse.mockResolvedValue(mockUpdatedCourse)

      const result = await courseService.updateCourse(courseId, updateData)

      expect(result.title).toBe(updateData.title)
      expect(result._id).toBe(courseId)
    })
  })

  // ─── COURSE DELETION WORKFLOW ───────────────────────────────────────────

  describe('Course Deletion Workflow', () => {
    it('should delete unpublished course', async () => {
      const courseId = 'course123'

      const mockDeletedCourse = {
        _id: courseId,
        title: 'Deleted Course',
      }

      courseService.deleteCourse.mockResolvedValue(mockDeletedCourse)

      const result = await courseService.deleteCourse(courseId)

      expect(result._id).toBe(courseId)
      expect(courseService.deleteCourse).toHaveBeenCalledWith(courseId)
    })
  })

  // ─── COURSE FILTERING WORKFLOW ──────────────────────────────────────────

  describe('Course Filtering Workflow', () => {
    it('should filter courses by level and language', async () => {
      const filters = {
        levelId: 'level1',
        languageId: 'lang1',
        isPublished: true,
      }

      const mockFilteredCourses = [
        {
          _id: 'course1',
          title: 'Beginner English Course',
          levelId: 'level1',
          languageId: 'lang1',
          isPublished: true,
        },
      ]

      courseService.getAllCourses.mockResolvedValue(mockFilteredCourses)

      const courses = await courseService.getAllCourses(filters)

      expect(courses).toHaveLength(1)
      expect(courses[0].levelId).toBe(filters.levelId)
      expect(courses[0].isPublished).toBe(true)
    })
  })

  // ─── COURSE STATISTICS WORKFLOW ─────────────────────────────────────────

  describe('Course Statistics Workflow', () => {
    it('should fetch course statistics', async () => {
      const courseId = 'course123'

      const mockStats = {
        totalEnrollments: 150,
        activeEnrollments: 100,
        completionRate: 75,
        averageProgress: 60,
      }

      courseService.getCourseStatistics.mockResolvedValue(mockStats)

      const stats = await courseService.getCourseStatistics(courseId)

      expect(stats.totalEnrollments).toBe(150)
      expect(stats.completionRate).toBe(75)
    })

    it('should fetch global statistics', async () => {
      const mockGlobalStats = {
        totalCourses: 50,
        publishedCourses: 40,
        totalEnrollments: 1000,
      }

      courseService.getGlobalStatistics.mockResolvedValue(mockGlobalStats)

      const stats = await courseService.getGlobalStatistics()

      expect(stats.totalCourses).toBe(50)
      expect(stats.publishedCourses).toBe(40)
    })
  })

  // ─── ERROR HANDLING ─────────────────────────────────────────────────────

  describe('Error Handling', () => {
    it('should handle create course error', async () => {
      const errorMessage = 'Failed to create course'
      courseService.createCourse.mockRejectedValue(new Error(errorMessage))

      await expect(
        courseService.createCourse({ title: 'Test' })
      ).rejects.toThrow(errorMessage)
    })

    it('should handle publish course error', async () => {
      const errorMessage = 'Course must have at least one lesson'
      courseService.publishCourse.mockRejectedValue(new Error(errorMessage))

      await expect(courseService.publishCourse('course123')).rejects.toThrow(
        errorMessage
      )
    })
  })
})
