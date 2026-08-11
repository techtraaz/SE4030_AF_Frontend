import lessonService from '@/services/lesson/lessonService'

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

describe('Lesson Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllLessons', () => {
    it('should fetch all lessons successfully', async () => {
      const mockLessons = [
        { _id: '1', title: 'Lesson 1' },
        { _id: '2', title: 'Lesson 2' }
      ]
      api.get.mockResolvedValue({ data: { content: mockLessons } })

      const result = await lessonService.getAllLessons()

      expect(api.get).toHaveBeenCalledWith('/lessons')
      expect(result).toEqual(mockLessons)
    })

    it('should fetch lessons with filters', async () => {
      const mockLessons = [{ _id: '1', title: 'Lesson 1' }]
      api.get.mockResolvedValue({ data: { content: mockLessons } })

      const result = await lessonService.getAllLessons({ 
        courseId: 'course1', 
        categoryId: 'cat1' 
      })

      expect(api.get).toHaveBeenCalledWith('/lessons?courseId=course1&categoryId=cat1')
      expect(result).toEqual(mockLessons)
    })
  })

  describe('getLessonById', () => {
    it('should fetch single lesson successfully', async () => {
      const mockLesson = { _id: '1', title: 'Lesson 1' }
      api.get.mockResolvedValue({ data: { content: mockLesson } })

      const result = await lessonService.getLessonById('1')

      expect(api.get).toHaveBeenCalledWith('/lessons/1')
      expect(result).toEqual(mockLesson)
    })
  })

  describe('createLesson', () => {
    it('should create new lesson successfully', async () => {
      const mockLesson = { _id: '1', title: 'New Lesson' }
      const lessonData = { title: 'New Lesson', courseId: 'course1' }
      api.post.mockResolvedValue({ data: { content: mockLesson } })

      const result = await lessonService.createLesson(lessonData)

      expect(api.post).toHaveBeenCalledWith('/lessons', lessonData)
      expect(result).toEqual(mockLesson)
    })
  })

  describe('updateLesson', () => {
    it('should update lesson successfully', async () => {
      const mockLesson = { _id: '1', title: 'Updated Lesson' }
      const lessonData = { title: 'Updated Lesson' }
      api.put.mockResolvedValue({ data: { content: mockLesson } })

      const result = await lessonService.updateLesson('1', lessonData)

      expect(api.put).toHaveBeenCalledWith('/lessons/1', lessonData)
      expect(result).toEqual(mockLesson)
    })
  })

  describe('deleteLesson', () => {
    it('should delete lesson successfully', async () => {
      const mockLesson = { _id: '1', title: 'Deleted Lesson' }
      api.delete.mockResolvedValue({ data: { content: mockLesson } })

      const result = await lessonService.deleteLesson('1')

      expect(api.delete).toHaveBeenCalledWith('/lessons/1')
      expect(result).toEqual(mockLesson)
    })
  })

  describe('publishLesson', () => {
    it('should publish lesson successfully', async () => {
      const mockLesson = { _id: '1', title: 'Lesson', isPublished: true }
      api.patch.mockResolvedValue({ data: { content: mockLesson } })

      const result = await lessonService.publishLesson('1')

      expect(api.patch).toHaveBeenCalledWith('/lessons/1/publish')
      expect(result).toEqual(mockLesson)
    })
  })

  describe('unpublishLesson', () => {
    it('should unpublish lesson successfully', async () => {
      const mockLesson = { _id: '1', title: 'Lesson', isPublished: false }
      api.patch.mockResolvedValue({ data: { content: mockLesson } })

      const result = await lessonService.unpublishLesson('1')

      expect(api.patch).toHaveBeenCalledWith('/lessons/1/unpublish')
      expect(result).toEqual(mockLesson)
    })
  })
})
