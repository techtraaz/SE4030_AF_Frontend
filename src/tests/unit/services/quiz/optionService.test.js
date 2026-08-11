/**
 * Unit Tests - Option Service
 * Tests quiz option CRUD operations
 */

import optionService from '@/services/quiz/optionService'

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

describe('Option Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── CREATE OPTION ──────────────────────────────────────────────────────

  describe('createOption', () => {
    it('should create a new option', async () => {
      const optionData = {
        questionId: 'question123',
        optionText: 'Correct Answer',
        isCorrect: true,
      }

      const mockCreatedOption = { _id: 'option123', ...optionData }

      api.post.mockResolvedValue({ data: { content: mockCreatedOption } })

      const result = await optionService.createOption(optionData)

      expect(api.post).toHaveBeenCalledWith('/quiz/options', optionData)
      expect(result).toEqual(mockCreatedOption)
    })
  })

  // ─── GET OPTIONS BY QUESTION ────────────────────────────────────────────

  describe('getOptionsByQuestion', () => {
    it('should fetch all options for a question', async () => {
      const questionId = 'question123'
      const mockOptions = [
        { _id: 'opt1', optionText: 'Option 1', isCorrect: true },
        { _id: 'opt2', optionText: 'Option 2', isCorrect: false },
      ]

      api.get.mockResolvedValue({ data: { content: mockOptions } })

      const result = await optionService.getOptionsByQuestion(questionId)

      expect(api.get).toHaveBeenCalledWith(`/quiz/options/question/${questionId}`)
      expect(result).toEqual(mockOptions)
    })

    it('should return empty array if no content', async () => {
      api.get.mockResolvedValue({ data: {} })

      const result = await optionService.getOptionsByQuestion('question123')

      expect(result).toEqual([])
    })
  })

  // ─── UPDATE OPTION ──────────────────────────────────────────────────────

  describe('updateOption', () => {
    it('should update an option', async () => {
      const optionId = 'option123'
      const updateData = {
        optionText: 'Updated Option',
        isCorrect: false,
      }

      const mockUpdatedOption = { _id: optionId, ...updateData }

      api.put.mockResolvedValue({ data: { content: mockUpdatedOption } })

      const result = await optionService.updateOption(optionId, updateData)

      expect(api.put).toHaveBeenCalledWith(`/quiz/options/${optionId}`, updateData)
      expect(result).toEqual(mockUpdatedOption)
    })
  })

  // ─── DELETE OPTION ──────────────────────────────────────────────────────

  describe('deleteOption', () => {
    it('should delete an option', async () => {
      const optionId = 'option123'
      const mockDeletedOption = { _id: optionId }

      api.delete.mockResolvedValue({ data: { content: mockDeletedOption } })

      const result = await optionService.deleteOption(optionId)

      expect(api.delete).toHaveBeenCalledWith(`/quiz/options/${optionId}`)
      expect(result).toEqual(mockDeletedOption)
    })
  })
})
