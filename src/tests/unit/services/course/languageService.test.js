/**
 * Unit Tests - Language Service
 * Tests language CRUD operations
 */

import languageService from '@/services/course/languageService'

// Mock axios module
jest.mock('@/services/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

// Get the mocked api
import api from '@/services/axios'

describe('Language Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── GET ALL LANGUAGES ──────────────────────────────────────────────────

  describe('getAllLanguages', () => {
    it('should fetch all languages', async () => {
      const mockLanguages = [
        { _id: '1', name: 'English', code: 'en' },
        { _id: '2', name: 'Spanish', code: 'es' },
        { _id: '3', name: 'French', code: 'fr' },
      ]

      api.get.mockResolvedValue({ data: { content: mockLanguages } })

      const result = await languageService.getAllLanguages()

      expect(api.get).toHaveBeenCalledWith('/language')
      expect(result).toEqual(mockLanguages)
      expect(result).toHaveLength(3)
    })

    it('should return empty array if no content', async () => {
      api.get.mockResolvedValue({ data: {} })

      const result = await languageService.getAllLanguages()

      expect(result).toEqual([])
    })
  })

  // ─── GET LANGUAGE BY ID ─────────────────────────────────────────────────

  describe('getLanguageById', () => {
    it('should fetch language by ID', async () => {
      const mockLanguage = {
        _id: 'lang123',
        name: 'English',
        code: 'en',
      }

      api.get.mockResolvedValue({ data: { content: mockLanguage } })

      const result = await languageService.getLanguageById('lang123')

      expect(api.get).toHaveBeenCalledWith('/language/lang123')
      expect(result).toEqual(mockLanguage)
    })
  })

  // ─── CREATE LANGUAGE ────────────────────────────────────────────────────

  describe('createLanguage', () => {
    it('should create a new language', async () => {
      const languageData = {
        name: 'German',
        code: 'de',
      }

      const mockCreatedLanguage = { _id: 'lang123', ...languageData }

      api.post.mockResolvedValue({ data: { content: mockCreatedLanguage } })

      const result = await languageService.createLanguage(languageData)

      expect(api.post).toHaveBeenCalledWith('/language', languageData)
      expect(result).toEqual(mockCreatedLanguage)
    })
  })

  // ─── UPDATE LANGUAGE ────────────────────────────────────────────────────

  describe('updateLanguage', () => {
    it('should update a language', async () => {
      const languageId = 'lang123'
      const updateData = { name: 'British English' }
      const mockUpdatedLanguage = {
        _id: languageId,
        name: 'British English',
        code: 'en-GB',
      }

      api.put.mockResolvedValue({ data: { content: mockUpdatedLanguage } })

      const result = await languageService.updateLanguage(
        languageId,
        updateData
      )

      expect(api.put).toHaveBeenCalledWith(
        `/language/${languageId}`,
        updateData
      )
      expect(result).toEqual(mockUpdatedLanguage)
    })
  })

  // ─── DELETE LANGUAGE ────────────────────────────────────────────────────

  describe('deleteLanguage', () => {
    it('should delete a language', async () => {
      const languageId = 'lang123'
      const mockResponse = { status: 204 }

      api.delete.mockResolvedValue(mockResponse)

      const result = await languageService.deleteLanguage(languageId)

      expect(api.delete).toHaveBeenCalledWith(`/language/${languageId}`)
      expect(result).toEqual(mockResponse)
    })
  })
})
