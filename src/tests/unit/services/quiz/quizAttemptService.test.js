/**
 * Unit Tests - Quiz Attempt Service
 * Tests quiz attempt submission and statistics
 */

import quizAttemptService from '@/services/quiz/quizAttemptService'

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

describe('Quiz Attempt Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── SUBMIT QUIZ ATTEMPT ────────────────────────────────────────────────

  describe('submitQuizAttempt', () => {
    it('should submit a quiz attempt successfully', async () => {
      const attemptData = {
        quizId: 'quiz123',
        responses: [
          { questionId: 'q1', selectedOptionId: 'opt1' },
          { questionId: 'q2', selectedOptionId: 'opt3' },
        ],
        timeTakenSeconds: 300,
      }

      const mockResult = {
        _id: 'attempt123',
        score: 80,
        passed: true,
        correctCount: 8,
        totalQuestions: 10,
      }

      api.post.mockResolvedValue({ data: { content: mockResult } })

      const result = await quizAttemptService.submitQuizAttempt(attemptData)

      expect(api.post).toHaveBeenCalledWith('/quiz/attempts', attemptData)
      expect(result).toEqual(mockResult)
      expect(result.passed).toBe(true)
    })
  })

  // ─── GET ATTEMPT BY ID ──────────────────────────────────────────────────

  describe('getAttemptById', () => {
    it('should fetch attempt details by ID', async () => {
      const attemptId = 'attempt123'
      const mockAttempt = {
        _id: attemptId,
        score: 75,
        responses: [{ questionId: 'q1', isCorrect: true }],
      }

      api.get.mockResolvedValue({ data: { content: mockAttempt } })

      const result = await quizAttemptService.getAttemptById(attemptId)

      expect(api.get).toHaveBeenCalledWith(`/quiz/attempts/${attemptId}`)
      expect(result).toEqual(mockAttempt)
    })
  })

  // ─── GET USER QUIZ ATTEMPTS ─────────────────────────────────────────────

  describe('getUserQuizAttempts', () => {
    it('should fetch all attempts for a user', async () => {
      const refugeeId = 'user123'
      const mockAttempts = [
        { _id: 'attempt1', score: 80, quizId: 'quiz1' },
        { _id: 'attempt2', score: 90, quizId: 'quiz2' },
      ]

      api.get.mockResolvedValue({ data: { content: mockAttempts } })

      const result = await quizAttemptService.getUserQuizAttempts(refugeeId)

      expect(api.get).toHaveBeenCalledWith(`/quiz/attempts/user/${refugeeId}`)
      expect(result).toEqual(mockAttempts)
    })

    it('should fetch attempts filtered by quiz', async () => {
      const refugeeId = 'user123'
      const quizId = 'quiz123'
      const mockAttempts = [{ _id: 'attempt1', score: 85 }]

      api.get.mockResolvedValue({ data: { content: mockAttempts } })

      const result = await quizAttemptService.getUserQuizAttempts(
        refugeeId,
        quizId
      )

      expect(api.get).toHaveBeenCalledWith(
        `/quiz/attempts/user/${refugeeId}?quizId=${quizId}`
      )
      expect(result).toEqual(mockAttempts)
    })

    it('should return empty array if no content', async () => {
      api.get.mockResolvedValue({ data: {} })

      const result = await quizAttemptService.getUserQuizAttempts('user123')

      expect(result).toEqual([])
    })
  })

  // ─── GET QUIZ STATISTICS ────────────────────────────────────────────────

  describe('getQuizStatistics', () => {
    it('should fetch quiz statistics', async () => {
      const quizId = 'quiz123'
      const mockStats = {
        totalAttempts: 50,
        averageScore: 78.5,
        passRate: 82,
        highestScore: 100,
        lowestScore: 45,
      }

      api.get.mockResolvedValue({ data: { content: mockStats } })

      const result = await quizAttemptService.getQuizStatistics(quizId)

      expect(api.get).toHaveBeenCalledWith(
        `/quiz/attempts/quiz/${quizId}/statistics`
      )
      expect(result).toEqual(mockStats)
      expect(result.averageScore).toBeGreaterThan(0)
    })
  })
})
