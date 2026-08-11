import { configureStore } from '@reduxjs/toolkit'
import lessonReducer, {
  fetchLessons,
  fetchLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  publishLesson,
  clearCurrentLesson,
  clearError
} from '@/features/lesson/lessonSlice'
import lessonService from '@/services/lesson/lessonService'

jest.mock('@/services/lesson/lessonService')

describe('Lesson Slice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        lessons: lessonReducer
      }
    })
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().lessons
      expect(state).toEqual({
        lessons: [],
        currentLesson: null,
        loading: false,
        error: null
      })
    })
  })

  describe('Reducers', () => {
    it('should clear current lesson', () => {
      store.dispatch(clearCurrentLesson())
      const state = store.getState().lessons
      expect(state.currentLesson).toBeNull()
    })

    it('should clear error', () => {
      store.dispatch(clearError())
      const state = store.getState().lessons
      expect(state.error).toBeNull()
    })
  })

  describe('fetchLessons', () => {
    it('should handle pending state', () => {
      lessonService.getAllLessons.mockResolvedValue([])
      store.dispatch(fetchLessons())
      
      const state = store.getState().lessons
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle fulfilled state', async () => {
      const mockLessons = [
        { _id: '1', title: 'Lesson 1' },
        { _id: '2', title: 'Lesson 2' }
      ]
      lessonService.getAllLessons.mockResolvedValue(mockLessons)
      
      await store.dispatch(fetchLessons())
      
      const state = store.getState().lessons
      expect(state.loading).toBe(false)
      expect(state.lessons).toEqual(mockLessons)
      expect(state.error).toBeNull()
    })

    it('should handle rejected state', async () => {
      const errorMessage = 'Failed to fetch lessons'
      lessonService.getAllLessons.mockRejectedValue({
        response: { data: { message: errorMessage } }
      })
      
      await store.dispatch(fetchLessons())
      
      const state = store.getState().lessons
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('fetchLessonById', () => {
    it('should handle fulfilled state', async () => {
      const mockLesson = { _id: '1', title: 'Lesson 1' }
      lessonService.getLessonById.mockResolvedValue(mockLesson)
      
      await store.dispatch(fetchLessonById('1'))
      
      const state = store.getState().lessons
      expect(state.loading).toBe(false)
      expect(state.currentLesson).toEqual(mockLesson)
    })

    it('should handle rejected state', async () => {
      const errorMessage = 'Lesson not found'
      lessonService.getLessonById.mockRejectedValue({
        response: { data: { message: errorMessage } }
      })
      
      await store.dispatch(fetchLessonById('999'))
      
      const state = store.getState().lessons
      expect(state.loading).toBe(false)
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('createLesson', () => {
    it('should add new lesson to state', async () => {
      const newLesson = { _id: '3', title: 'New Lesson' }
      lessonService.createLesson.mockResolvedValue(newLesson)
      
      await store.dispatch(createLesson({ title: 'New Lesson' }))
      
      const state = store.getState().lessons
      expect(state.loading).toBe(false)
      expect(state.lessons).toContainEqual(newLesson)
      expect(state.currentLesson).toEqual(newLesson)
    })

    it('should handle creation error', async () => {
      const errorMessage = 'Creation failed'
      lessonService.createLesson.mockRejectedValue({
        response: { data: { message: errorMessage } }
      })
      
      await store.dispatch(createLesson({ title: 'Invalid' }))
      
      const state = store.getState().lessons
      expect(state.error).toBe(errorMessage)
    })
  })

  describe('updateLesson', () => {
    it('should update lesson in state', async () => {
      const initialLesson = { _id: '1', title: 'Original' }
      const updatedLesson = { _id: '1', title: 'Updated' }
      
      lessonService.getAllLessons.mockResolvedValue([initialLesson])
      await store.dispatch(fetchLessons())
      
      lessonService.updateLesson.mockResolvedValue(updatedLesson)
      await store.dispatch(updateLesson({ id: '1', lessonData: { title: 'Updated' } }))
      
      const state = store.getState().lessons
      expect(state.lessons[0]).toEqual(updatedLesson)
    })

    it('should update current lesson if it matches', async () => {
      const lesson = { _id: '1', title: 'Original' }
      const updated = { _id: '1', title: 'Updated' }
      
      lessonService.getLessonById.mockResolvedValue(lesson)
      await store.dispatch(fetchLessonById('1'))
      
      lessonService.updateLesson.mockResolvedValue(updated)
      await store.dispatch(updateLesson({ id: '1', lessonData: { title: 'Updated' } }))
      
      const state = store.getState().lessons
      expect(state.currentLesson).toEqual(updated)
    })
  })

  describe('deleteLesson', () => {
    it('should remove lesson from state', async () => {
      const lessons = [
        { _id: '1', title: 'Lesson 1' },
        { _id: '2', title: 'Lesson 2' }
      ]
      
      lessonService.getAllLessons.mockResolvedValue(lessons)
      await store.dispatch(fetchLessons())
      
      lessonService.deleteLesson.mockResolvedValue()
      await store.dispatch(deleteLesson('1'))
      
      const state = store.getState().lessons
      expect(state.lessons).toHaveLength(1)
      expect(state.lessons[0]._id).toBe('2')
    })

    it('should clear current lesson if deleted', async () => {
      const lesson = { _id: '1', title: 'Lesson 1' }
      
      lessonService.getLessonById.mockResolvedValue(lesson)
      await store.dispatch(fetchLessonById('1'))
      
      lessonService.deleteLesson.mockResolvedValue()
      await store.dispatch(deleteLesson('1'))
      
      const state = store.getState().lessons
      expect(state.currentLesson).toBeNull()
    })
  })

  describe('publishLesson', () => {
    it('should update lesson publish status in list', async () => {
      const lesson = { _id: '1', title: 'Lesson 1', isPublished: false }
      const published = { _id: '1', title: 'Lesson 1', isPublished: true }
      
      lessonService.getAllLessons.mockResolvedValue([lesson])
      await store.dispatch(fetchLessons())
      
      lessonService.publishLesson.mockResolvedValue(published)
      await store.dispatch(publishLesson('1'))
      
      const state = store.getState().lessons
      expect(state.lessons[0].isPublished).toBe(true)
    })

    it('should update current lesson if published', async () => {
      const lesson = { _id: '1', title: 'Lesson 1', isPublished: false }
      const published = { _id: '1', title: 'Lesson 1', isPublished: true }
      
      lessonService.getLessonById.mockResolvedValue(lesson)
      await store.dispatch(fetchLessonById('1'))
      
      lessonService.publishLesson.mockResolvedValue(published)
      await store.dispatch(publishLesson('1'))
      
      const state = store.getState().lessons
      expect(state.currentLesson.isPublished).toBe(true)
    })
  })
})
