/**
 * Unit Tests - Quiz Redux Slice
 * Tests Redux state management for quiz operations
 */

import quizReducer, {
  fetchQuizzes,
  fetchQuizById,
  fetchQuizQuestions,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  unpublishQuiz,
  submitQuizAttempt,
  fetchUserAttempts,
  fetchQuizStatistics,
  clearCurrentQuiz,
  clearCurrentAttempt,
  clearError,
} from '@/features/quiz/quizSlice'
import { configureStore } from '@reduxjs/toolkit'
import quizService from '@/services/quiz/quizService'
import questionService from '@/services/quiz/questionService'
import quizAttemptService from '@/services/quiz/quizAttemptService'

// Mock services
jest.mock('@/services/quiz/quizService')
jest.mock('@/services/quiz/questionService')
jest.mock('@/services/quiz/quizAttemptService')

describe('Quiz Redux Slice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        quizzes: quizReducer,
      },
    })
    jest.clearAllMocks()
  })

  // ─── INITIAL STATE ──────────────────────────────────────────────────────

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().quizzes

      expect(state).toEqual({
        quizzes: [],
        currentQuiz: null,
        currentQuestions: [],
        currentAttempt: null,
        userAttempts: [],
        statistics: null,
        loading: false,
        error: null,
      })
    })
  })

  // ─── SYNC ACTIONS ───────────────────────────────────────────────────────

  describe('Synchronous Actions', () => {
    it('should clear current quiz', () => {
      store.dispatch(clearCurrentQuiz())
      const state = store.getState().quizzes

      expect(state.currentQuiz).toBeNull()
      expect(state.currentQuestions).toEqual([])
    })

    it('should clear current attempt', () => {
      store.dispatch(clearCurrentAttempt())
      const state = store.getState().quizzes

      expect(state.currentAttempt).toBeNull()
    })

    it('should clear error', () => {
      store.dispatch(clearError())
      const state = store.getState().quizzes

      expect(state.error).toBeNull()
    })
  })

  // ─── FETCH QUIZZES ──────────────────────────────────────────────────────

  describe('fetchQuizzes', () => {
    it('should fetch quizzes successfully', async () => {
      const mockQuizzes = [
        { _id: '1', title: 'Quiz 1' },
        { _id: '2', title: 'Quiz 2' },
      ]

      quizService.getAllQuizzes.mockResolvedValue(mockQuizzes)

      await store.dispatch(fetchQuizzes({}))
      const state = store.getState().quizzes

      expect(state.loading).toBe(false)
      expect(state.quizzes).toEqual(mockQuizzes)
      expect(state.error).toBeNull()
    })

    it('should handle fetch quizzes error', async () => {
      const errorMessage = 'Failed to fetch quizzes'
      quizService.getAllQuizzes.mockRejectedValue({
        response: { data: { message: errorMessage } },
      })

      await store.dispatch(fetchQuizzes({}))
      const state = store.getState().quizzes

      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  // ─── FETCH QUIZ BY ID ───────────────────────────────────────────────────

  describe('fetchQuizById', () => {
    it('should fetch quiz by ID successfully', async () => {
      const mockQuiz = { _id: 'quiz123', title: 'Test Quiz' }

      quizService.getQuizById.mockResolvedValue(mockQuiz)

      await store.dispatch(fetchQuizById('quiz123'))
      const state = store.getState().quizzes

      expect(state.currentQuiz).toEqual(mockQuiz)
      expect(state.loading).toBe(false)
    })
  })

  // ─── FETCH QUIZ QUESTIONS ───────────────────────────────────────────────

  describe('fetchQuizQuestions', () => {
    it('should fetch quiz questions successfully', async () => {
      const mockQuestions = [
        { _id: 'q1', questionText: 'Question 1' },
        { _id: 'q2', questionText: 'Question 2' },
      ]

      questionService.getAllQuestionsByQuiz.mockResolvedValue(mockQuestions)

      await store.dispatch(fetchQuizQuestions('quiz123'))
      const state = store.getState().quizzes

      expect(state.currentQuestions).toEqual(mockQuestions)
      expect(state.loading).toBe(false)
    })
  })

  // ─── CREATE QUIZ ────────────────────────────────────────────────────────

  describe('createQuiz', () => {
    it('should create quiz successfully', async () => {
      const quizData = { title: 'New Quiz', description: 'Description' }
      const mockCreatedQuiz = { _id: 'quiz123', ...quizData }

      quizService.createQuiz.mockResolvedValue(mockCreatedQuiz)

      await store.dispatch(createQuiz(quizData))
      const state = store.getState().quizzes

      expect(state.loading).toBe(false)
      expect(quizService.createQuiz).toHaveBeenCalledWith(quizData)
    })
  })

  // ─── UPDATE QUIZ ────────────────────────────────────────────────────────

  describe('updateQuiz', () => {
    it('should update quiz successfully', async () => {
      const updateData = { id: 'quiz123', quizData: { title: 'Updated' } }
      const mockUpdatedQuiz = { _id: 'quiz123', title: 'Updated' }

      quizService.updateQuiz.mockResolvedValue(mockUpdatedQuiz)

      await store.dispatch(updateQuiz(updateData))
      const state = store.getState().quizzes

      expect(state.loading).toBe(false)
    })
  })

  // ─── DELETE QUIZ ────────────────────────────────────────────────────────

  describe('deleteQuiz', () => {
    it('should delete quiz successfully', async () => {
      quizService.deleteQuiz.mockResolvedValue()

      await store.dispatch(deleteQuiz('quiz123'))
      const state = store.getState().quizzes

      expect(state.loading).toBe(false)
      expect(quizService.deleteQuiz).toHaveBeenCalledWith('quiz123')
    })
  })

  // ─── PUBLISH/UNPUBLISH QUIZ ─────────────────────────────────────────────

  describe('publishQuiz', () => {
    it('should publish quiz successfully', async () => {
      const mockPublishedQuiz = { _id: 'quiz123', isPublished: true }

      quizService.publishQuiz.mockResolvedValue(mockPublishedQuiz)

      await store.dispatch(publishQuiz('quiz123'))
      const state = store.getState().quizzes

      expect(state.loading).toBe(false)
    })
  })

  describe('unpublishQuiz', () => {
    it('should unpublish quiz successfully', async () => {
      const mockUnpublishedQuiz = { _id: 'quiz123', isPublished: false }

      quizService.unpublishQuiz.mockResolvedValue(mockUnpublishedQuiz)

      await store.dispatch(unpublishQuiz('quiz123'))
      const state = store.getState().quizzes

      expect(state.loading).toBe(false)
    })
  })

  // ─── SUBMIT QUIZ ATTEMPT ────────────────────────────────────────────────

  describe('submitQuizAttempt', () => {
    it('should submit quiz attempt successfully', async () => {
      const attemptData = {
        quizId: 'quiz123',
        responses: [],
        timeTakenSeconds: 300,
      }
      const mockAttemptResult = {
        _id: 'attempt123',
        score: 85,
        passed: true,
      }

      quizAttemptService.submitQuizAttempt.mockResolvedValue(mockAttemptResult)

      await store.dispatch(submitQuizAttempt(attemptData))
      const state = store.getState().quizzes

      expect(state.loading).toBe(false)
    })
  })

  // ─── FETCH USER ATTEMPTS ────────────────────────────────────────────────

  describe('fetchUserAttempts', () => {
    it('should fetch user attempts successfully', async () => {
      const mockAttempts = [
        { _id: 'attempt1', score: 80 },
        { _id: 'attempt2', score: 90 },
      ]

      quizAttemptService.getUserQuizAttempts.mockResolvedValue(mockAttempts)

      await store.dispatch(
        fetchUserAttempts({ refugeeId: 'user123', quizId: null })
      )
      const state = store.getState().quizzes

      expect(state.userAttempts).toEqual(mockAttempts)
      expect(state.loading).toBe(false)
    })
  })

  // ─── FETCH QUIZ STATISTICS ──────────────────────────────────────────────

  describe('fetchQuizStatistics', () => {
    it('should fetch quiz statistics successfully', async () => {
      const mockStats = {
        totalAttempts: 50,
        averageScore: 78.5,
        passRate: 82,
      }

      quizAttemptService.getQuizStatistics.mockResolvedValue(mockStats)

      await store.dispatch(fetchQuizStatistics('quiz123'))
      const state = store.getState().quizzes

      expect(state.statistics).toEqual(mockStats)
      expect(state.loading).toBe(false)
    })
  })
})
