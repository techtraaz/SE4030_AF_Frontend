import videoService from '@/services/lesson/videoService'

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

describe('Video Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createVideo', () => {
    it('should create video section successfully', async () => {
      const mockVideo = { 
        _id: '1', 
        lessonId: 'lesson1',
        videoUrl: 'https://video.com/1.mp4' 
      }
      const videoData = { 
        videoUrl: 'https://video.com/1.mp4',
        subtitlesUrl: 'https://video.com/1.vtt',
        estimatedMb: 50 
      }
      api.post.mockResolvedValue({ data: { content: mockVideo } })

      const result = await videoService.createVideo('lesson1', videoData)

      expect(api.post).toHaveBeenCalledWith('/lessons/lesson1/video', videoData)
      expect(result).toEqual(mockVideo)
    })
  })

  describe('getVideo', () => {
    it('should fetch video section successfully', async () => {
      const mockVideo = { 
        _id: '1', 
        lessonId: 'lesson1',
        videoUrl: 'https://video.com/1.mp4' 
      }
      api.get.mockResolvedValue({ data: { content: mockVideo } })

      const result = await videoService.getVideo('lesson1')

      expect(api.get).toHaveBeenCalledWith('/lessons/lesson1/video')
      expect(result).toEqual(mockVideo)
    })
  })

  describe('updateVideo', () => {
    it('should update video section successfully', async () => {
      const mockVideo = { 
        _id: '1', 
        lessonId: 'lesson1',
        videoUrl: 'https://video.com/updated.mp4' 
      }
      const videoData = { videoUrl: 'https://video.com/updated.mp4' }
      api.put.mockResolvedValue({ data: { content: mockVideo } })

      const result = await videoService.updateVideo('lesson1', videoData)

      expect(api.put).toHaveBeenCalledWith('/lessons/lesson1/video', videoData)
      expect(result).toEqual(mockVideo)
    })
  })

  describe('deleteVideo', () => {
    it('should delete video section successfully', async () => {
      const mockVideo = { _id: '1', lessonId: 'lesson1' }
      api.delete.mockResolvedValue({ data: { content: mockVideo } })

      const result = await videoService.deleteVideo('lesson1')

      expect(api.delete).toHaveBeenCalledWith('/lessons/lesson1/video')
      expect(result).toEqual(mockVideo)
    })
  })
})
