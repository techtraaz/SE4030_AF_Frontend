/**
 * Unit Tests - Question Service
 * Tests question CRUD operations and API integration
 */

import questionService from '@/services/quiz/questionService'

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

describe('Question Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── CREATE QUESTION ────────────────────────────────────────────────────

  describe('createQuestion', () => {
    it('should create a new question with options', async () => {
      const questionData = {
        quizId: 'quiz123',
        questionText: 'What is React?',
        type: 'MULTIPLE_CHOICE',
        points: 10,
        options: [
          { optionText: 'A library', isCorrect: true },
          { optionText: 'A framework', isCorrect: false },
        ],
      }

      const mockCreatedQuestion = { _id: 'question123', ...questionData }

      api.post.mockResolvedValue({ data: { content: mockCreatedQuestion } })

      const result = await questionService.createQuestion(questionData)

      expect(api.post).toHaveBeenCalledWith('/quiz/questions', questionData)
      expect(result).toEqual(mockCreatedQuestion)
    })
  })

  // ─── GET ALL QUESTIONS BY QUIZ ──────────────────────────────────────────

  describe('getAllQuestionsByQuiz', () => {
    it('should fetch all questions for a quiz', async () => {
      const quizId = 'quiz123'
      const mockQuestions = [
        { _id: 'q1', questionText: 'Question 1', quizId },
        { _id: 'q2', questionText: 'Question 2', quizId },
      ]

      api.get.mockResolvedValue({ data: { content: mockQuestions } })

      const result = await questionService.getAllQuestionsByQuiz(quizId)

      expect(api.get).toHaveBeenCalledWith(`/quiz/questions/quiz/${quizId}`)
      expect(result).toEqual(mockQuestions)
    })

    it('should return empty array if no content', async () => {
      api.get.mockResolvedValue({ data: {} })

      const result = await questionService.getAllQuestionsByQuiz('quiz123')

      expect(result).toEqual([])
    })
  })

  // ─── GET QUESTION BY ID ─────────────────────────────────────────────────

  describe('getQuestionById', () => {
    it('should fetch a question by ID with options', async () => {
      const mockQuestion = {
        _id: 'question123',
        questionText: 'Test Question',
        options: [{ optionText: 'Option 1' }],
      }

      api.get.mockResolvedValue({ data: { content: mockQuestion } })

      const result = await questionService.getQuestionById('question123')

      expect(api.get).toHaveBeenCalledWith('/quiz/questions/question123')
      expect(result).toEqual(mockQuestion)
    })
  })

  // ─── UPDATE QUESTION ────────────────────────────────────────────────────

  describe('updateQuestion', () => {
    it('should update a question', async () => {
      const questionId = 'question123'
      const updateData = {
        questionText: 'Updated Question',
        points: 15,
      }

      const mockUpdatedQuestion = { _id: questionId, ...updateData }

      api.put.mockResolvedValue({ data: { content: mockUpdatedQuestion } })

      const result = await questionService.updateQuestion(questionId, updateData)

      expect(api.put).toHaveBeenCalledWith(
        `/quiz/questions/${questionId}`,
        updateData
      )
      expect(result).toEqual(mockUpdatedQuestion)
    })
  })

  // ─── DELETE QUESTION ────────────────────────────────────────────────────

  describe('deleteQuestion', () => {
    it('should delete a question', async () => {
      const questionId = 'question123'
      const mockDeletedQuestion = { _id: questionId }

      api.delete.mockResolvedValue({ data: { content: mockDeletedQuestion } })

      const result = await questionService.deleteQuestion(questionId)

      expect(api.delete).toHaveBeenCalledWith(`/quiz/questions/${questionId}`)
      expect(result).toEqual(mockDeletedQuestion)
    })
  })

  // ─── REORDER QUESTIONS ──────────────────────────────────────────────────

  describe('reorderQuestions', () => {
    it('should reorder questions in a quiz', async () => {
      const quizId = 'quiz123'
      const questions = [
        { questionId: 'q1', order: 2 },
        { questionId: 'q2', order: 1 },
      ]

      const mockReorderedQuestions = [
        { _id: 'q2', order: 1 },
        { _id: 'q1', order: 2 },
      ]

      api.patch.mockResolvedValue({ data: { content: mockReorderedQuestions } })

      const result = await questionService.reorderQuestions(quizId, questions)

      expect(api.patch).toHaveBeenCalledWith(
        `/quiz/questions/quiz/${quizId}/reorder`,
        { questions }
      )
      expect(result).toEqual(mockReorderedQuestions)
    })
  })
})
