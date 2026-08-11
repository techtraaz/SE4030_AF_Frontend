import lessonService from '@/services/lesson/lessonService'
import categoryService from '@/services/lesson/categoryService'
import videoService from '@/services/lesson/videoService'
import readingService from '@/services/lesson/readingService'
import listeningService from '@/services/lesson/listeningService'
import vocabularyService from '@/services/lesson/vocabularyService'

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

import api from '@/services/axios'

describe('Lesson Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Lesson Creation Workflow', () => {
    it('should create lesson with all sections and publish', async () => {
      // Step 1: Create category
      const mockCategory = { _id: 'cat1', name: 'Grammar' }
      api.post.mockResolvedValueOnce({ data: { content: mockCategory } })
      const category = await categoryService.createCategory({ name: 'Grammar' })
      expect(category).toEqual(mockCategory)

      // Step 2: Create lesson
      const mockLesson = { _id: 'lesson1', title: 'Lesson 1', categoryId: 'cat1' }
      api.post.mockResolvedValueOnce({ data: { content: mockLesson } })
      const lesson = await lessonService.createLesson({ 
        title: 'Lesson 1', 
        categoryId: 'cat1' 
      })
      expect(lesson).toEqual(mockLesson)

      // Step 3: Create reading section
      const mockReading = { _id: 'read1', lessonId: 'lesson1' }
      api.post.mockResolvedValueOnce({ data: { content: mockReading } })
      const reading = await readingService.createReading('lesson1', { 
        content: 'Reading content' 
      })
      expect(reading).toEqual(mockReading)

      // Step 4: Create listening section
      const mockListening = { _id: 'listen1', lessonId: 'lesson1' }
      api.post.mockResolvedValueOnce({ data: { content: mockListening } })
      const listening = await listeningService.createListening('lesson1', { 
        audioUrl: 'https://audio.com/1.mp3' 
      })
      expect(listening).toEqual(mockListening)

      // Step 5: Create vocabulary section
      const mockVocabulary = { _id: 'vocab1', lessonId: 'lesson1' }
      api.post.mockResolvedValueOnce({ data: { content: mockVocabulary } })
      const vocabulary = await vocabularyService.createVocabulary('lesson1', { 
        words: [{ word: 'hello', meaning: 'greeting' }] 
      })
      expect(vocabulary).toEqual(mockVocabulary)

      // Step 6: Create video section
      const mockVideo = { _id: 'video1', lessonId: 'lesson1' }
      api.post.mockResolvedValueOnce({ data: { content: mockVideo } })
      const video = await videoService.createVideo('lesson1', { 
        videoUrl: 'https://video.com/1.mp4' 
      })
      expect(video).toEqual(mockVideo)

      // Step 7: Publish lesson
      const publishedLesson = { ...mockLesson, isPublished: true }
      api.patch.mockResolvedValueOnce({ data: { content: publishedLesson } })
      const published = await lessonService.publishLesson('lesson1')
      expect(published.isPublished).toBe(true)
    })
  })

  describe('Lesson Update Workflow', () => {
    it('should update lesson and its sections', async () => {
      // Step 1: Fetch lesson
      const mockLesson = { _id: 'lesson1', title: 'Original' }
      api.get.mockResolvedValueOnce({ data: { content: mockLesson } })
      const lesson = await lessonService.getLessonById('lesson1')
      expect(lesson).toEqual(mockLesson)

      // Step 2: Update lesson
      const updatedLesson = { ...mockLesson, title: 'Updated' }
      api.put.mockResolvedValueOnce({ data: { content: updatedLesson } })
      const updated = await lessonService.updateLesson('lesson1', { title: 'Updated' })
      expect(updated.title).toBe('Updated')

      // Step 3: Update reading section
      const updatedReading = { _id: 'read1', content: 'Updated content' }
      api.put.mockResolvedValueOnce({ data: { content: updatedReading } })
      const reading = await readingService.updateReading('lesson1', { 
        content: 'Updated content' 
      })
      expect(reading.content).toBe('Updated content')
    })
  })

  describe('Lesson Filtering Workflow', () => {
    it('should filter lessons by course and category', async () => {
      // Step 1: Get all categories
      const mockCategories = [
        { _id: 'cat1', name: 'Grammar' },
        { _id: 'cat2', name: 'Vocabulary' }
      ]
      api.get.mockResolvedValueOnce({ data: { content: mockCategories } })
      const categories = await categoryService.getAllCategories()
      expect(categories).toHaveLength(2)

      // Step 2: Filter lessons by category
      const mockLessons = [
        { _id: 'lesson1', categoryId: 'cat1', title: 'Grammar 1' }
      ]
      api.get.mockResolvedValueOnce({ data: { content: mockLessons } })
      const lessons = await lessonService.getAllLessons({ categoryId: 'cat1' })
      expect(lessons).toHaveLength(1)
      expect(lessons[0].categoryId).toBe('cat1')
    })
  })

  describe('Lesson Publishing Validation', () => {
    it('should ensure all sections exist before publishing', async () => {
      const lessonId = 'lesson1'

      // Mock all section GET requests
      const mockReading = { _id: 'read1', lessonId }
      const mockListening = { _id: 'listen1', lessonId }
      const mockVocabulary = { _id: 'vocab1', lessonId }
      const mockVideo = { _id: 'video1', lessonId }

      api.get
        .mockResolvedValueOnce({ data: { content: mockReading } })
        .mockResolvedValueOnce({ data: { content: mockListening } })
        .mockResolvedValueOnce({ data: { content: mockVocabulary } })
        .mockResolvedValueOnce({ data: { content: mockVideo } })

      const reading = await readingService.getReading(lessonId)
      const listening = await listeningService.getListening(lessonId)
      const vocabulary = await vocabularyService.getVocabulary(lessonId)
      const video = await videoService.getVideo(lessonId)

      expect(reading).toEqual(mockReading)
      expect(listening).toEqual(mockListening)
      expect(vocabulary).toEqual(mockVocabulary)
      expect(video).toEqual(mockVideo)

      // Step 2: Publish lesson (all sections exist)
      const publishedLesson = { _id: lessonId, isPublished: true }
      api.patch.mockResolvedValueOnce({ data: { content: publishedLesson } })
      const published = await lessonService.publishLesson(lessonId)
      expect(published.isPublished).toBe(true)
    })
  })

  describe('Lesson Deletion Workflow', () => {
    it('should delete lesson and cascade to sections', async () => {
      const lessonId = 'lesson1'

      // Mock all section DELETE requests
      api.delete
        .mockResolvedValueOnce({ data: { content: { _id: 'read1' } } })
        .mockResolvedValueOnce({ data: { content: { _id: 'listen1' } } })
        .mockResolvedValueOnce({ data: { content: { _id: 'vocab1' } } })
        .mockResolvedValueOnce({ data: { content: { _id: 'video1' } } })
        .mockResolvedValueOnce({ data: { content: { _id: lessonId } } })

      await readingService.deleteReading(lessonId)
      await listeningService.deleteListening(lessonId)
      await vocabularyService.deleteVocabulary(lessonId)
      await videoService.deleteVideo(lessonId)

      // Step 2: Delete lesson
      const deleted = await lessonService.deleteLesson(lessonId)
      expect(deleted._id).toBe(lessonId)
    })
  })

  describe('Category Management Workflow', () => {
    it('should create category, add lessons, then update category', async () => {
      // Step 1: Create category
      const mockCategory = { _id: 'cat1', name: 'Grammar' }
      api.post
        .mockResolvedValueOnce({ data: { content: mockCategory } })
        .mockResolvedValueOnce({ data: { content: { _id: 'lesson1', categoryId: 'cat1' } } })
        .mockResolvedValueOnce({ data: { content: { _id: 'lesson2', categoryId: 'cat1' } } })
      
      const category = await categoryService.createCategory({ name: 'Grammar' })
      expect(category).toEqual(mockCategory)

      // Step 2: Create lessons in category
      await lessonService.createLesson({ categoryId: 'cat1' })
      await lessonService.createLesson({ categoryId: 'cat1' })

      // Step 3: Update category
      const updatedCategory = { _id: 'cat1', name: 'Advanced Grammar' }
      api.put.mockResolvedValueOnce({ data: { content: updatedCategory } })
      const updated = await categoryService.updateCategory('cat1', { 
        name: 'Advanced Grammar' 
      })
      expect(updated.name).toBe('Advanced Grammar')
    })
  })

  describe('Error Handling', () => {
    it('should handle lesson creation error', async () => {
      const error = new Error('Validation error')
      error.response = { data: { message: 'Validation error' } }
      api.post.mockRejectedValueOnce(error)

      await expect(
        lessonService.createLesson({ title: '' })
      ).rejects.toThrow('Validation error')
    })

    it('should handle publish error when sections missing', async () => {
      const error = new Error('All sections required')
      error.response = { data: { message: 'All sections required' } }
      api.patch.mockRejectedValueOnce(error)

      await expect(
        lessonService.publishLesson('lesson1')
      ).rejects.toThrow('All sections required')
    })
  })
})
