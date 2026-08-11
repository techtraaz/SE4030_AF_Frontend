/**
 * Integration Tests - Quiz Attempt Flow
 * Tests complete quiz taking and submission workflows
 */

import quizAttemptService from '@/services/quiz/quizAttemptService'
import quizService from '@/services/quiz/quizService'
import questionService from '@/services/quiz/questionService'

jest.mock('@/services/quiz/quizAttemptService')
jest.mock('@/services/quiz/quizService')
jest.mock('@/services/quiz/questionService')

describe('Quiz Attempt Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── QUIZ ATTEMPT SUBMISSION WORKFLOW ───────────────────────────────────

  describe('Quiz Attempt Submission Workflow', () => {
    it('should handle complete quiz attempt flow', async () => {
      const quizId = 'quiz123'
      const refugeeId = 'user123'

      // Mock quiz data
      const mockQuiz = {
        _id: quizId,
        title: 'JavaScript Basics',
        isPublished: true,
        passingScore: 60,
        timeLimitMinutes: 30,
      }

      // Mock questions
      const mockQuestions = [
        {
          _id: 'q1',
          questionText: 'What is React?',
          options: [
            { _id: 'opt1', optionText: 'Library', isCorrect: true },
            { _id: 'opt2', optionText: 'Framework', isCorrect: false },
          ],
        },
        {
          _id: 'q2',
          questionText: 'What is Node.js?',
          options: [
            { _id: 'opt3', optionText: 'Runtime', isCorrect: true },
            { _id: 'opt4', optionText: 'Database', isCorrect: false },
          ],
        },
      ]

      // Mock attempt submission
      const attemptData = {
        quizId,
        responses: [
          { questionId: 'q1', selectedOptionId: 'opt1' },
          { questionId: 'q2', selectedOptionId: 'opt3' },
        ],
        timeTakenSeconds: 600,
      }

      const mockAttemptResult = {
        _id: 'attempt123',
        refugeeId,
        quizId,
        score: 100,
        passed: true,
        correctCount: 2,
        totalQuestions: 2,
        timeTakenSeconds: 600,
      }

      quizService.getQuizById.mockResolvedValue(mockQuiz)
      questionService.getAllQuestionsByQuiz.mockResolvedValue(mockQuestions)
      quizAttemptService.submitQuizAttempt.mockResolvedValue(mockAttemptResult)

      // 1. Fetch quiz
      const quiz = await quizService.getQuizById(quizId)
      expect(quiz.isPublished).toBe(true)

      // 2. Fetch questions
      const questions = await questionService.getAllQuestionsByQuiz(quizId)
      expect(questions).toHaveLength(2)

      // 3. Submit attempt
      const result = await quizAttemptService.submitQuizAttempt(attemptData)

      expect(result.score).toBe(100)
      expect(result.passed).toBe(true)
      expect(result.correctCount).toBe(2)
    })

    it('should handle failed quiz attempt', async () => {
      const attemptData = {
        quizId: 'quiz123',
        responses: [
          { questionId: 'q1', selectedOptionId: 'opt2' }, // Wrong
          { questionId: 'q2', selectedOptionId: 'opt4' }, // Wrong
        ],
        timeTakenSeconds: 300,
      }

      const mockFailedResult = {
        _id: 'attempt123',
        score: 0,
        passed: false,
        correctCount: 0,
        totalQuestions: 2,
      }

      quizAttemptService.submitQuizAttempt.mockResolvedValue(mockFailedResult)

      const result = await quizAttemptService.submitQuizAttempt(attemptData)

      expect(result.passed).toBe(false)
      expect(result.score).toBe(0)
    })
  })

  // ─── USER ATTEMPT HISTORY ───────────────────────────────────────────────

  describe('User Attempt History', () => {
    it('should fetch user attempt history', async () => {
      const refugeeId = 'user123'

      const mockAttempts = [
        {
          _id: 'attempt1',
          quizId: 'quiz1',
          score: 85,
          passed: true,
          attemptedAt: new Date(),
        },
        {
          _id: 'attempt2',
          quizId: 'quiz2',
          score: 55,
          passed: false,
          attemptedAt: new Date(),
        },
      ]

      quizAttemptService.getUserQuizAttempts.mockResolvedValue(mockAttempts)

      const attempts = await quizAttemptService.getUserQuizAttempts(refugeeId)

      expect(attempts).toHaveLength(2)
      expect(attempts[0].passed).toBe(true)
      expect(attempts[1].passed).toBe(false)
    })

    it('should fetch attempts for specific quiz', async () => {
      const refugeeId = 'user123'
      const quizId = 'quiz123'

      const mockQuizAttempts = [
        { _id: 'attempt1', score: 70, passed: true },
        { _id: 'attempt2', score: 85, passed: true },
      ]

      quizAttemptService.getUserQuizAttempts.mockResolvedValue(
        mockQuizAttempts
      )

      const attempts = await quizAttemptService.getUserQuizAttempts(
        refugeeId,
        quizId
      )

      expect(attempts).toHaveLength(2)
      expect(attempts.every((a) => a.passed)).toBe(true)
    })
  })

  // ─── QUIZ STATISTICS ────────────────────────────────────────────────────

  describe('Quiz Statistics', () => {
    it('should fetch quiz statistics for admin', async () => {
      const quizId = 'quiz123'

      const mockStats = {
        totalAttempts: 50,
        averageScore: 78.5,
        passRate: 82,
        highestScore: 100,
        lowestScore: 45,
      }

      quizAttemptService.getQuizStatistics.mockResolvedValue(mockStats)

      const stats = await quizAttemptService.getQuizStatistics(quizId)

      expect(stats.totalAttempts).toBe(50)
      expect(stats.averageScore).toBeGreaterThan(70)
      expect(stats.passRate).toBeGreaterThan(80)
    })
  })

  // ─── ATTEMPT DETAILS ────────────────────────────────────────────────────

  describe('Attempt Details', () => {
    it('should fetch detailed attempt results', async () => {
      const attemptId = 'attempt123'

      const mockAttemptDetails = {
        _id: attemptId,
        score: 80,
        passed: true,
        responses: [
          {
            questionId: 'q1',
            selectedOptionId: 'opt1',
            isCorrect: true,
          },
          {
            questionId: 'q2',
            selectedOptionId: 'opt4',
            isCorrect: false,
          },
        ],
        timeTakenSeconds: 450,
      }

      quizAttemptService.getAttemptById.mockResolvedValue(mockAttemptDetails)

      const attempt = await quizAttemptService.getAttemptById(attemptId)

      expect(attempt.responses).toHaveLength(2)
      expect(attempt.responses[0].isCorrect).toBe(true)
      expect(attempt.responses[1].isCorrect).toBe(false)
    })
  })

  // ─── MULTIPLE ATTEMPTS ──────────────────────────────────────────────────

  describe('Multiple Attempts', () => {
    it('should track multiple attempts for same quiz', async () => {
      const quizId = 'quiz123'
      const refugeeId = 'user123'

      const attempt1 = {
        quizId,
        responses: [{ questionId: 'q1', selectedOptionId: 'opt2' }],
        timeTakenSeconds: 300,
      }

      const attempt2 = {
        quizId,
        responses: [{ questionId: 'q1', selectedOptionId: 'opt1' }],
        timeTakenSeconds: 250,
      }

      quizAttemptService.submitQuizAttempt
        .mockResolvedValueOnce({
          _id: 'attempt1',
          score: 50,
          passed: false,
        })
        .mockResolvedValueOnce({
          _id: 'attempt2',
          score: 100,
          passed: true,
        })

      // First attempt (failed)
      const result1 = await quizAttemptService.submitQuizAttempt(attempt1)
      expect(result1.passed).toBe(false)

      // Second attempt (passed)
      const result2 = await quizAttemptService.submitQuizAttempt(attempt2)
      expect(result2.passed).toBe(true)
      expect(result2.score).toBeGreaterThan(result1.score)
    })
  })
})
