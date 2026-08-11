/**
 * Unit Tests - Distractor Service
 * Tests third-party API integration for quiz enhancement
 */

import distractorService from '@/services/quiz/distractorService'

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

describe('Distractor Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── GENERATE DISTRACTORS ───────────────────────────────────────────────

  describe('generateDistractors', () => {
    it('should generate distractor options', async () => {
      const correctAnswer = 'React'
      const count = 3

      const mockResponse = {
        distractors: ['Angular', 'Vue', 'Svelte'],
        count: 3,
      }

      api.post.mockResolvedValue({ data: { content: mockResponse } })

      const result = await distractorService.generateDistractors(
        correctAnswer,
        count
      )

      expect(api.post).toHaveBeenCalledWith('/quiz/distractors/generate', {
        correctAnswer,
        count,
      })
      expect(result.distractors).toHaveLength(3)
      expect(result.distractors).toContain('Angular')
    })

    it('should use default count of 3 if not specified', async () => {
      const correctAnswer = 'JavaScript'

      const mockResponse = {
        distractors: ['Python', 'Java', 'C++'],
        count: 3,
      }

      api.post.mockResolvedValue({ data: { content: mockResponse } })

      await distractorService.generateDistractors(correctAnswer)

      expect(api.post).toHaveBeenCalledWith('/quiz/distractors/generate', {
        correctAnswer,
        count: 3,
      })
    })
  })

  // ─── GENERATE HINTS ─────────────────────────────────────────────────────

  describe('generateHints', () => {
    it('should generate contextual hints', async () => {
      const correctAnswer = 'React'
      const maxHints = 3

      const mockResponse = {
        hints: [
          'A JavaScript library',
          'Developed by Facebook',
          'Uses virtual DOM',
        ],
        formattedHint: 'Hint: A JavaScript library for building UIs',
      }

      api.post.mockResolvedValue({ data: { content: mockResponse } })

      const result = await distractorService.generateHints(
        correctAnswer,
        maxHints
      )

      expect(api.post).toHaveBeenCalledWith('/quiz/distractors/hints', {
        correctAnswer,
        maxHints,
      })
      expect(result.hints).toHaveLength(3)
      expect(result.formattedHint).toContain('Hint:')
    })

    it('should use default maxHints of 3', async () => {
      const correctAnswer = 'Node.js'

      const mockResponse = {
        hints: ['JavaScript runtime', 'Server-side', 'Built on V8'],
        formattedHint: 'Hint: JavaScript runtime environment',
      }

      api.post.mockResolvedValue({ data: { content: mockResponse } })

      await distractorService.generateHints(correctAnswer)

      expect(api.post).toHaveBeenCalledWith('/quiz/distractors/hints', {
        correctAnswer,
        maxHints: 3,
      })
    })
  })

  // ─── GET EDUCATIONAL CONTEXT ────────────────────────────────────────────

  describe('getEducationalContext', () => {
    it('should get synonyms and related words', async () => {
      const word = 'function'

      const mockResponse = {
        word: 'function',
        synonyms: ['method', 'procedure', 'routine'],
        relatedWords: ['callback', 'closure', 'parameter'],
      }

      api.get.mockResolvedValue({ data: { content: mockResponse } })

      const result = await distractorService.getEducationalContext(word)

      expect(api.get).toHaveBeenCalledWith(
        `/quiz/distractors/context/${encodeURIComponent(word)}`
      )
      expect(result.synonyms).toContain('method')
      expect(result.relatedWords).toContain('callback')
    })

    it('should handle words with special characters', async () => {
      const word = 'event-driven'

      const mockResponse = {
        word: 'event-driven',
        synonyms: ['asynchronous', 'reactive'],
        relatedWords: ['listener', 'handler'],
      }

      api.get.mockResolvedValue({ data: { content: mockResponse } })

      await distractorService.getEducationalContext(word)

      expect(api.get).toHaveBeenCalledWith(
        `/quiz/distractors/context/${encodeURIComponent(word)}`
      )
    })
  })
})
