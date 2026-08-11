/**
 * Unit Tests - Course Service
 * Tests course CRUD operations and API integration
 */

import courseService from '@/services/course/courseService'

// Mock axios module
jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

// Get the mocked api
import api from '@/services/axios'

describe('Course Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── GET ALL COURSES ────────────────────────────────────────────────────

  describe('getAllCourses', () => {
    it('should fetch all courses without filters', async () => {
      const mockCourses = [
        { _id: '1', title: 'React Basics', isPublished: true },
        { _id: '2', title: 'Node.js Intro', isPublished: false },
      ]

      api.get.mockResolvedValue({ data: { content: mockCourses } })

      const result = await courseService.getAllCourses()

      expect(api.get).toHaveBeenCalledWith('/course')
      expect(result).toEqual(mockCourses)
    })

    it('should fetch courses with multiple filters', async () => {
      const mockCourses = [{ _id: '1', title: 'Advanced React' }]
      const filters = {
        levelId: 'level123',
        languageId: 'lang123',
        isPublished: true,
      }

      api.get.mockResolvedValue({ data: { content: mockCourses } })

      const result = await courseService.getAllCourses(filters)

      expect(api.get).toHaveBeenCalledWith(
        '/course?levelId=level123&languageId=lang123&isPublished=true'
      )
      expect(result).toEqual(mockCourses)
    })

    it('should return empty array if no content', async () => {
      api.get.mockResolvedValue({ data: {} })

      const result = await courseService.getAllCourses()

      expect(result).toEqual([])
    })
  })

  // ─── GET COURSE BY ID ───────────────────────────────────────────────────

  describe('getCourseById', () => {
    it('should fetch course by ID', async () => {
      const mockCourse = {
        _id: 'course123',
        title: 'Node.js Course',
        description: 'Learn Node.js',
      }

      api.get.mockResolvedValue({ data: { content: mockCourse } })

      const result = await courseService.getCourseById('course123')

      expect(api.get).toHaveBeenCalledWith('/course/course123')
      expect(result).toEqual(mockCourse)
    })
  })

  // ─── CREATE COURSE ──────────────────────────────────────────────────────

  describe('createCourse', () => {
    it('should create a new course', async () => {
      const courseData = {
        title: 'New Course',
        description: 'Course Description',
        levelId: 'level123',
        languageId: 'lang123',
      }

      const mockCreatedCourse = { _id: 'course123', ...courseData }

      api.post.mockResolvedValue({ data: { content: mockCreatedCourse } })

      const result = await courseService.createCourse(courseData)

      expect(api.post).toHaveBeenCalledWith('/course', courseData)
      expect(result).toEqual(mockCreatedCourse)
    })
  })

  // ─── UPDATE COURSE ──────────────────────────────────────────────────────

  describe('updateCourse', () => {
    it('should update an existing course', async () => {
      const courseId = 'course123'
      const updateData = { title: 'Updated Title' }
      const mockUpdatedCourse = {
        _id: courseId,
        title: 'Updated Title',
      }

      api.put.mockResolvedValue({ data: { content: mockUpdatedCourse } })

      const result = await courseService.updateCourse(courseId, updateData)

      expect(api.put).toHaveBeenCalledWith(`/course/${courseId}`, updateData)
      expect(result).toEqual(mockUpdatedCourse)
    })
  })

  // ─── DELETE COURSE ──────────────────────────────────────────────────────

  describe('deleteCourse', () => {
    it('should delete a course', async () => {
      const courseId = 'course123'
      const mockDeletedCourse = { _id: courseId }

      api.delete.mockResolvedValue({ data: { content: mockDeletedCourse } })

      const result = await courseService.deleteCourse(courseId)

      expect(api.delete).toHaveBeenCalledWith(`/course/${courseId}`)
      expect(result).toEqual(mockDeletedCourse)
    })
  })

  // ─── PUBLISH COURSE ─────────────────────────────────────────────────────

  describe('publishCourse', () => {
    it('should publish a course', async () => {
      const courseId = 'course123'
      const mockPublishedCourse = {
        _id: courseId,
        title: 'Test Course',
        isPublished: true,
      }

      api.patch.mockResolvedValue({ data: { content: mockPublishedCourse } })

      const result = await courseService.publishCourse(courseId)

      expect(api.patch).toHaveBeenCalledWith(`/course/${courseId}/publish`)
      expect(result.isPublished).toBe(true)
    })
  })

  // ─── UNPUBLISH COURSE ───────────────────────────────────────────────────

  describe('unpublishCourse', () => {
    it('should unpublish a course', async () => {
      const courseId = 'course123'
      const mockUnpublishedCourse = {
        _id: courseId,
        isPublished: false,
      }

      api.patch.mockResolvedValue({ data: { content: mockUnpublishedCourse } })

      const result = await courseService.unpublishCourse(courseId)

      expect(api.patch).toHaveBeenCalledWith(`/course/${courseId}/unpublish`)
      expect(result.isPublished).toBe(false)
    })
  })

  // ─── GET COURSES BY CREATOR ─────────────────────────────────────────────

  describe('getCoursesByCreator', () => {
    it('should fetch courses by creator ID', async () => {
      const creatorId = 'creator123'
      const mockCourses = [
        { _id: 'course1', title: 'Course 1', createdById: creatorId },
        { _id: 'course2', title: 'Course 2', createdById: creatorId },
      ]

      api.get.mockResolvedValue({ content: mockCourses })

      const result = await courseService.getCoursesByCreator(creatorId)

      expect(api.get).toHaveBeenCalledWith(`/course/creator/${creatorId}`)
    })
  })

  // ─── GET COURSE STATISTICS ──────────────────────────────────────────────

  describe('getCourseStatistics', () => {
    it('should fetch statistics for a specific course', async () => {
      const courseId = 'course123'
      const mockStats = {
        totalEnrollments: 100,
        activeEnrollments: 75,
        completionRate: 60,
        averageProgress: 45,
      }

      api.get.mockResolvedValue({ data: { content: mockStats } })

      const result = await courseService.getCourseStatistics(courseId)

      expect(api.get).toHaveBeenCalledWith(`/course/${courseId}/statistics`)
      expect(result.totalEnrollments).toBe(100)
    })
  })

  // ─── GET GLOBAL STATISTICS ──────────────────────────────────────────────

  describe('getGlobalStatistics', () => {
    it('should fetch global course statistics', async () => {
      const mockGlobalStats = {
        totalCourses: 50,
        publishedCourses: 40,
        totalEnrollments: 500,
        averageRating: 4.5,
      }

      api.get.mockResolvedValue({ data: { content: mockGlobalStats } })

      const result = await courseService.getGlobalStatistics()

      expect(api.get).toHaveBeenCalledWith('/course/statistics/global')
      expect(result.totalCourses).toBe(50)
    })
  })
})
