import listeningService from  '@/services/lesson/listeningService'

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

describe('Listening Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createListening', () => {
    it('should create listening section successfully', async () => {
      const mockListening = { 
        _id: '1', 
        lessonId: 'lesson1',
        audioUrl: 'https://audio.com/1.mp3' 
      }
      const listeningData = { 
        audioUrl: 'https://audio.com/1.mp3',
        slowAudioUrl: 'https://audio.com/1-slow.mp3',
        transcript: 'Audio transcript'
      }
      api.post.mockResolvedValue({ data: { content: mockListening } })

      const result = await listeningService.createListening('lesson1', listeningData)

      expect(api.post).toHaveBeenCalledWith('/lessons/lesson1/listening', listeningData)
      expect(result).toEqual(mockListening)
    })
  })

  describe('getListening', () => {
    it('should fetch listening section successfully', async () => {
      const mockListening = { 
        _id: '1', 
        lessonId: 'lesson1',
        audioUrl: 'https://audio.com/1.mp3' 
      }
      api.get.mockResolvedValue({ data: { content: mockListening } })

      const result = await listeningService.getListening('lesson1')

      expect(api.get).toHaveBeenCalledWith('/lessons/lesson1/listening')
      expect(result).toEqual(mockListening)
    })
  })

  describe('updateListening', () => {
    it('should update listening section successfully', async () => {
      const mockListening = { 
        _id: '1', 
        lessonId: 'lesson1',
        audioUrl: 'https://audio.com/updated.mp3' 
      }
      const listeningData = { audioUrl: 'https://audio.com/updated.mp3' }
      api.put.mockResolvedValue({ data: { content: mockListening } })

      const result = await listeningService.updateListening('lesson1', listeningData)

      expect(api.put).toHaveBeenCalledWith('/lessons/lesson1/listening', listeningData)
      expect(result).toEqual(mockListening)
    })
  })

  describe('deleteListening', () => {
    it('should delete listening section successfully', async () => {
      const mockListening = { _id: '1', lessonId: 'lesson1' }
      api.delete.mockResolvedValue({ data: { content: mockListening } })

      const result = await listeningService.deleteListening('lesson1')

      expect(api.delete).toHaveBeenCalledWith('/lessons/lesson1/listening')
      expect(result).toEqual(mockListening)
    })
  })
})
