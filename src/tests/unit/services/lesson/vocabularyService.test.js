import vocabularyService from '@/services/lesson/vocabularyService'

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

describe('Vocabulary Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createVocabulary', () => {
    it('should create vocabulary section successfully', async () => {
      const mockVocabulary = { 
        _id: '1', 
        lessonId: 'lesson1',
        words: [{ word: 'hello', meaning: 'greeting' }]
      }
      const vocabularyData = { 
        words: [
          { 
            word: 'hello', 
            meaning: 'greeting',
            exampleSentence: 'Hello world',
            audioUrl: 'https://audio.com/hello.mp3',
            imageUrl: 'https://img.com/hello.jpg'
          }
        ]
      }
      api.post.mockResolvedValue({ data: { content: mockVocabulary } })

      const result = await vocabularyService.createVocabulary('lesson1', vocabularyData)

      expect(api.post).toHaveBeenCalledWith('/lessons/lesson1/vocabulary', vocabularyData)
      expect(result).toEqual(mockVocabulary)
    })
  })

  describe('getVocabulary', () => {
    it('should fetch vocabulary section successfully', async () => {
      const mockVocabulary = { 
        _id: '1', 
        lessonId: 'lesson1',
        words: [{ word: 'hello', meaning: 'greeting' }]
      }
      api.get.mockResolvedValue({ data: { content: mockVocabulary } })

      const result = await vocabularyService.getVocabulary('lesson1')

      expect(api.get).toHaveBeenCalledWith('/lessons/lesson1/vocabulary')
      expect(result).toEqual(mockVocabulary)
    })
  })

  describe('updateVocabulary', () => {
    it('should update vocabulary section successfully', async () => {
      const mockVocabulary = { 
        _id: '1', 
        lessonId: 'lesson1',
        words: [{ word: 'updated', meaning: 'changed' }]
      }
      const vocabularyData = { 
        words: [{ word: 'updated', meaning: 'changed' }]
      }
      api.put.mockResolvedValue({ data: { content: mockVocabulary } })

      const result = await vocabularyService.updateVocabulary('lesson1', vocabularyData)

      expect(api.put).toHaveBeenCalledWith('/lessons/lesson1/vocabulary', vocabularyData)
      expect(result).toEqual(mockVocabulary)
    })
  })

  describe('deleteVocabulary', () => {
    it('should delete vocabulary section successfully', async () => {
      const mockVocabulary = { _id: '1', lessonId: 'lesson1' }
      api.delete.mockResolvedValue({ data: { content: mockVocabulary } })

      const result = await vocabularyService.deleteVocabulary('lesson1')

      expect(api.delete).toHaveBeenCalledWith('/lessons/lesson1/vocabulary')
      expect(result).toEqual(mockVocabulary)
    })
  })
})
