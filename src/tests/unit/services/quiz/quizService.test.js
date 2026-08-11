/**
 * Unit Tests - Quiz Service
 * Tests quiz CRUD operations and API integration
 */

import quizService from '@/services/quiz/quizService'

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

describe('Quiz Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── GET ALL QUIZZES ────────────────────────────────────────────────────

  describe('getAllQuizzes', () => {
    it('should fetch all quizzes without filters', async () => {
      const mockQuizzes = [
        { _id: '1', title: 'Quiz 1', isPublished: true },
        { _id: '2', title: 'Quiz 2', isPublished: false },
      ]

      api.get.mockResolvedValue({ data: { content: mockQuizzes } })

      const result = await quizService.getAllQuizzes()

      expect(api.get).toHaveBeenCalledWith('/quiz/quizzes')
      expect(result).toEqual(mockQuizzes)
    })

    it('should fetch quizzes with filters', async () => {
      const mockQuizzes = [{ _id: '1', title: 'Course Quiz' }]
      const filters = { courseId: 'course123', isPublished: true }

      api.get.mockResolvedValue({ data: { content: mockQuizzes } })

      const result = await quizService.getAllQuizzes(filters)

      expect(api.get).toHaveBeenCalledWith(
        '/quiz/quizzes?courseId=course123&isPublished=true'
      )
      expect(result).toEqual(mockQuizzes)
    })

    it('should return empty array if no content', async () => {
      api.get.mockResolvedValue({ data: {} })

      const result = await quizService.getAllQuizzes()

      expect(result).toEqual([])
    })
  })

  // ─── GET QUIZ BY ID ─────────────────────────────────────────────────────

  describe('getQuizById', () => {
    it('should fetch quiz by ID', async () => {
      const mockQuiz = {
        _id: 'quiz123',
        title: 'Test Quiz',
        description: 'Test Description',
      }

      api.get.mockResolvedValue({ data: { content: mockQuiz } })

      const result = await quizService.getQuizById('quiz123')

      expect(api.get).toHaveBeenCalledWith('/quiz/quizzes/quiz123')
      expect(result).toEqual(mockQuiz)
    })
  })

  // ─── CREATE QUIZ ────────────────────────────────────────────────────────

  describe('createQuiz', () => {
    it('should create a new quiz', async () => {
      const quizData = {
        title: 'New Quiz',
        description: 'New Description',
        courseId: 'course123',
        passingScore: 60,
      }

      const mockCreatedQuiz = { _id: 'quiz123', ...quizData }

      api.post.mockResolvedValue({ data: { content: mockCreatedQuiz } })

      const result = await quizService.createQuiz(quizData)

      expect(api.post).toHaveBeenCalledWith('/quiz/quizzes', quizData)
      expect(result).toEqual(mockCreatedQuiz)
    })
  })

  // ─── UPDATE QUIZ ────────────────────────────────────────────────────────

  describe('updateQuiz', () => {
    it('should update an existing quiz', async () => {
      const quizId = 'quiz123'
      const updateData = { title: 'Updated Title' }
      const mockUpdatedQuiz = {
        _id: quizId,
        title: 'Updated Title',
        description: 'Original Description',
      }

      api.put.mockResolvedValue({ data: { content: mockUpdatedQuiz } })

      const result = await quizService.updateQuiz(quizId, updateData)

      expect(api.put).toHaveBeenCalledWith(`/quiz/quizzes/${quizId}`, updateData)
      expect(result).toEqual(mockUpdatedQuiz)
    })
  })

  // ─── DELETE QUIZ ────────────────────────────────────────────────────────

  describe('deleteQuiz', () => {
    it('should delete a quiz', async () => {
      const quizId = 'quiz123'
      const mockDeletedQuiz = { _id: quizId, title: 'Deleted Quiz' }

      api.delete.mockResolvedValue({ data: { content: mockDeletedQuiz } })

      const result = await quizService.deleteQuiz(quizId)

      expect(api.delete).toHaveBeenCalledWith(`/quiz/quizzes/${quizId}`)
      expect(result).toEqual(mockDeletedQuiz)
    })
  })

  // ─── PUBLISH QUIZ ───────────────────────────────────────────────────────

  describe('publishQuiz', () => {
    it('should publish a quiz', async () => {
      const quizId = 'quiz123'
      const mockPublishedQuiz = {
        _id: quizId,
        title: 'Test Quiz',
        isPublished: true,
      }

      api.patch.mockResolvedValue({ data: { content: mockPublishedQuiz } })

      const result = await quizService.publishQuiz(quizId)

      expect(api.patch).toHaveBeenCalledWith(`/quiz/quizzes/${quizId}/publish`)
      expect(result.isPublished).toBe(true)
    })
  })

  // ─── UNPUBLISH QUIZ ─────────────────────────────────────────────────────

  describe('unpublishQuiz', () => {
    it('should unpublish a quiz', async () => {
      const quizId = 'quiz123'
      const mockUnpublishedQuiz = {
        _id: quizId,
        title: 'Test Quiz',
        isPublished: false,
      }

      api.patch.mockResolvedValue({ data: { content: mockUnpublishedQuiz } })

      const result = await quizService.unpublishQuiz(quizId)

      expect(api.patch).toHaveBeenCalledWith(`/quiz/quizzes/${quizId}/unpublish`)
      expect(result.isPublished).toBe(false)
    })
  })
})
