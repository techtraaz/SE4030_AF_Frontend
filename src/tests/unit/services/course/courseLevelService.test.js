/**
 * Unit Tests - Course Level Service
 * Tests course level CRUD operations
 */

import courseLevelService from '@/services/course/courseLevelService'

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

describe('Course Level Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── GET ALL LEVELS ─────────────────────────────────────────────────────

  describe('getAllLevels', () => {
    it('should fetch all course levels', async () => {
      const mockLevels = [
        { _id: '1', name: 'Beginner', description: 'For beginners' },
        { _id: '2', name: 'Intermediate', description: 'For intermediates' },
        { _id: '3', name: 'Advanced', description: 'For advanced users' },
      ]

      api.get.mockResolvedValue({ data: { content: mockLevels } })

      const result = await courseLevelService.getAllLevels()

      expect(api.get).toHaveBeenCalledWith('/course-level')
      expect(result).toEqual(mockLevels)
      expect(result).toHaveLength(3)
    })

    it('should return empty array if no content', async () => {
      api.get.mockResolvedValue({ data: {} })

      const result = await courseLevelService.getAllLevels()

      expect(result).toEqual([])
    })
  })

  // ─── GET LEVEL BY ID ────────────────────────────────────────────────────

  describe('getLevelById', () => {
    it('should fetch level by ID', async () => {
      const mockLevel = {
        _id: 'level123',
        name: 'Beginner',
        description: 'Entry level',
      }

      api.get.mockResolvedValue({ data: { content: mockLevel } })

      const result = await courseLevelService.getLevelById('level123')

      expect(api.get).toHaveBeenCalledWith('/course-level/level123')
      expect(result).toEqual(mockLevel)
    })
  })

  // ─── CREATE LEVEL ───────────────────────────────────────────────────────

  describe('createLevel', () => {
    it('should create a new course level', async () => {
      const levelData = {
        name: 'Expert',
        description: 'For expert programmers',
      }

      const mockCreatedLevel = { _id: 'level123', ...levelData }

      api.post.mockResolvedValue({ data: { content: mockCreatedLevel } })

      const result = await courseLevelService.createLevel(levelData)

      expect(api.post).toHaveBeenCalledWith('/course-level', levelData)
      expect(result).toEqual(mockCreatedLevel)
    })
  })

  // ─── UPDATE LEVEL ───────────────────────────────────────────────────────

  describe('updateLevel', () => {
    it('should update a course level', async () => {
      const levelId = 'level123'
      const updateData = { description: 'Updated description' }
      const mockUpdatedLevel = {
        _id: levelId,
        name: 'Beginner',
        description: 'Updated description',
      }

      api.put.mockResolvedValue({ data: { content: mockUpdatedLevel } })

      const result = await courseLevelService.updateLevel(levelId, updateData)

      expect(api.put).toHaveBeenCalledWith(
        `/course-level/${levelId}`,
        updateData
      )
      expect(result).toEqual(mockUpdatedLevel)
    })
  })

  // ─── DELETE LEVEL ───────────────────────────────────────────────────────

  describe('deleteLevel', () => {
    it('should delete a course level', async () => {
      const levelId = 'level123'
      const mockResponse = { status: 204 }

      api.delete.mockResolvedValue(mockResponse)

      const result = await courseLevelService.deleteLevel(levelId)

      expect(api.delete).toHaveBeenCalledWith(`/course-level/${levelId}`)
      expect(result).toEqual(mockResponse)
    })
  })
})
