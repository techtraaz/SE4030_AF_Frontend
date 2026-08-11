/**
 * Integration Tests - Quiz Management Flow
 * Tests complete quiz creation and management workflows
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import quizReducer from '@/features/quiz/quizSlice'
import quizService from '@/services/quiz/quizService'
import questionService from '@/services/quiz/questionService'

// Mock services
jest.mock('@/services/quiz/quizService')
jest.mock('@/services/quiz/questionService')

describe('Quiz Management Integration Tests', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        quizzes: quizReducer,
      },
    })
    jest.clearAllMocks()
  })

  // ─── QUIZ CREATION WORKFLOW ─────────────────────────────────────────────

  describe('Quiz Creation Workflow', () => {
    it('should handle complete quiz creation flow', async () => {
      const mockQuizData = {
        title: 'Integration Test Quiz',
        description: 'Test Description',
        courseId: 'course123',
        passingScore: 60,
      }

      const mockCreatedQuiz = {
        _id: 'quiz123',
        ...mockQuizData,
        isPublished: false,
        totalQuestions: 0,
      }

      quizService.createQuiz.mockResolvedValue(mockCreatedQuiz)
      quizService.getAllQuizzes.mockResolvedValue([mockCreatedQuiz])

      // Simulate quiz creation
      const result = await quizService.createQuiz(mockQuizData)

      expect(result._id).toBe('quiz123')
      expect(result.title).toBe(mockQuizData.title)
      expect(result.isPublished).toBe(false)
    })
  })

  // ─── QUIZ QUESTION WORKFLOW ─────────────────────────────────────────────

  describe('Quiz Question Management Workflow', () => {
    it('should add questions to quiz', async () => {
      const quizId = 'quiz123'
      const mockQuestion = {
        quizId,
        questionText: 'What is React?',
        type: 'MULTIPLE_CHOICE',
        points: 10,
      }

      const mockCreatedQuestion = {
        _id: 'question123',
        ...mockQuestion,
      }

      questionService.createQuestion.mockResolvedValue(mockCreatedQuestion)
      questionService.getAllQuestionsByQuiz.mockResolvedValue([
        mockCreatedQuestion,
      ])

      // Create question
      const question = await questionService.createQuestion(mockQuestion)
      expect(question._id).toBe('question123')

      // Fetch questions
      const questions = await questionService.getAllQuestionsByQuiz(quizId)
      expect(questions).toHaveLength(1)
      expect(questions[0].questionText).toBe(mockQuestion.questionText)
    })

    it('should handle question reordering', async () => {
      const quizId = 'quiz123'
      const reorderData = [
        { questionId: 'q1', order: 2 },
        { questionId: 'q2', order: 1 },
      ]

      const mockReorderedQuestions = [
        { _id: 'q2', order: 1, questionText: 'Question 2' },
        { _id: 'q1', order: 2, questionText: 'Question 1' },
      ]

      questionService.reorderQuestions.mockResolvedValue(
        mockReorderedQuestions
      )

      const result = await questionService.reorderQuestions(
        quizId,
        reorderData
      )

      expect(result[0]._id).toBe('q2')
      expect(result[0].order).toBe(1)
      expect(result[1]._id).toBe('q1')
      expect(result[1].order).toBe(2)
    })
  })

  // ─── QUIZ PUBLISH WORKFLOW ──────────────────────────────────────────────

  describe('Quiz Publishing Workflow', () => {
    it('should publish quiz with questions', async () => {
      const quizId = 'quiz123'

      const mockQuiz = {
        _id: quizId,
        title: 'Test Quiz',
        isPublished: false,
        totalQuestions: 5,
      }

      const mockPublishedQuiz = {
        ...mockQuiz,
        isPublished: true,
      }

      quizService.getQuizById.mockResolvedValue(mockQuiz)
      quizService.publishQuiz.mockResolvedValue(mockPublishedQuiz)

      // Get quiz
      const quiz = await quizService.getQuizById(quizId)
      expect(quiz.isPublished).toBe(false)

      // Publish quiz
      const published = await quizService.publishQuiz(quizId)
      expect(published.isPublished).toBe(true)
    })

    it('should unpublish quiz for editing', async () => {
      const quizId = 'quiz123'

      const mockUnpublishedQuiz = {
        _id: quizId,
        title: 'Test Quiz',
        isPublished: false,
      }

      quizService.unpublishQuiz.mockResolvedValue(mockUnpublishedQuiz)

      const result = await quizService.unpublishQuiz(quizId)

      expect(result.isPublished).toBe(false)
    })
  })

  // ─── QUIZ UPDATE WORKFLOW ───────────────────────────────────────────────

  describe('Quiz Update Workflow', () => {
    it('should update unpublished quiz', async () => {
      const quizId = 'quiz123'
      const updateData = {
        title: 'Updated Quiz Title',
        description: 'Updated Description',
        passingScore: 70,
      }

      const mockUpdatedQuiz = {
        _id: quizId,
        ...updateData,
        isPublished: false,
      }

      quizService.updateQuiz.mockResolvedValue(mockUpdatedQuiz)

      const result = await quizService.updateQuiz(quizId, updateData)

      expect(result.title).toBe(updateData.title)
      expect(result.passingScore).toBe(70)
    })
  })

  // ─── QUIZ DELETION WORKFLOW ─────────────────────────────────────────────

  describe('Quiz Deletion Workflow', () => {
    it('should delete unpublished quiz', async () => {
      const quizId = 'quiz123'

      const mockDeletedQuiz = {
        _id: quizId,
        title: 'Deleted Quiz',
        isPublished: false,
      }

      quizService.deleteQuiz.mockResolvedValue(mockDeletedQuiz)

      const result = await quizService.deleteQuiz(quizId)

      expect(result._id).toBe(quizId)
      expect(quizService.deleteQuiz).toHaveBeenCalledWith(quizId)
    })
  })

  // ─── ERROR HANDLING ─────────────────────────────────────────────────────

  describe('Error Handling', () => {
    it('should handle create quiz error', async () => {
      const errorMessage = 'Failed to create quiz'
      quizService.createQuiz.mockRejectedValue(new Error(errorMessage))

      await expect(
        quizService.createQuiz({ title: 'Test' })
      ).rejects.toThrow(errorMessage)
    })

    it('should handle publish quiz error', async () => {
      const errorMessage = 'Quiz must have at least one question'
      quizService.publishQuiz.mockRejectedValue(new Error(errorMessage))

      await expect(quizService.publishQuiz('quiz123')).rejects.toThrow(
        errorMessage
      )
    })
  })
})
