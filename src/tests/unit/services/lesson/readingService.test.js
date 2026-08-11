import readingService from '@/services/lesson/readingService'

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

import api from '@/services/axios'

describe('Reading Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createReading', () => {
    it('should create reading section successfully', async () => {
      const mockReading = { 
        _id: '1', 
        lessonId: 'lesson1',
        content: 'Reading content' 
      }
      const readingData = { 
        content: 'Reading content',
        highlightWords: [{ word: 'hello', meaning: 'greeting' }]
      }
      api.post.mockResolvedValue({ data: { content: mockReading } })

      const result = await readingService.createReading('lesson1', readingData)

      expect(api.post).toHaveBeenCalledWith('/lessons/lesson1/reading', readingData)
      expect(result).toEqual(mockReading)
    })
  })

  describe('getReading', () => {
    it('should fetch reading section successfully', async () => {
      const mockReading = { 
        _id: '1', 
        lessonId: 'lesson1',
        content: 'Reading content' 
      }
      api.get.mockResolvedValue({ data: { content: mockReading } })

      const result = await readingService.getReading('lesson1')

      expect(api.get).toHaveBeenCalledWith('/lessons/lesson1/reading')
      expect(result).toEqual(mockReading)
    })
  })

  describe('updateReading', () => {
    it('should update reading section successfully', async () => {
      const mockReading = { 
        _id: '1', 
        lessonId: 'lesson1',
        content: 'Updated reading' 
      }
      const readingData = { content: 'Updated reading' }
      api.put.mockResolvedValue({ data: { content: mockReading } })

      const result = await readingService.updateReading('lesson1', readingData)

      expect(api.put).toHaveBeenCalledWith('/lessons/lesson1/reading', readingData)
      expect(result).toEqual(mockReading)
    })
  })

  describe('deleteReading', () => {
    it('should delete reading section successfully', async () => {
      const mockReading = { _id: '1', lessonId: 'lesson1' }
      api.delete.mockResolvedValue({ data: { content: mockReading } })

      const result = await readingService.deleteReading('lesson1')

      expect(api.delete).toHaveBeenCalledWith('/lessons/lesson1/reading')
      expect(result).toEqual(mockReading)
    })
  })
})
