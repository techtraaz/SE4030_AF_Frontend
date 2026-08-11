import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import lessonService from '@/services/lesson/lessonService'
import readingService from '@/services/lesson/readingService'
import listeningService from '@/services/lesson/listeningService'
import vocabularyService from '@/services/lesson/vocabularyService'
import videoService from '@/services/lesson/videoService'

// Async thunks for lesson operations
export const fetchLessons = createAsyncThunk(
  'lessons/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await lessonService.getAllLessons(filters)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lessons')
    }
  }
)

export const fetchLessonById = createAsyncThunk(
  'lessons/fetchById',
  async (lessonId, { rejectWithValue }) => {
    try {
      return await lessonService.getLessonById(lessonId)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lesson')
    }
  }
)

export const createLesson = createAsyncThunk(
  'lessons/create',
  async (lessonData, { rejectWithValue }) => {
    try {
      return await lessonService.createLesson(lessonData)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create lesson')
    }
  }
)

export const updateLesson = createAsyncThunk(
  'lessons/update',
  async ({ id, lessonData }, { rejectWithValue }) => {
    try {
      return await lessonService.updateLesson(id, lessonData)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lesson')
    }
  }
)

export const deleteLesson = createAsyncThunk(
  'lessons/delete',
  async (lessonId, { rejectWithValue }) => {
    try {
      await lessonService.deleteLesson(lessonId)
      return lessonId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lesson')
    }
  }
)

export const publishLesson = createAsyncThunk(
  'lessons/publish',
  async (lessonId, { rejectWithValue }) => {
    try {
      return await lessonService.publishLesson(lessonId)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to publish lesson')
    }
  }
)

// Async thunks for section operations
export const createReadingSection = createAsyncThunk(
  'lessons/createReading',
  async ({ lessonId, data }, { rejectWithValue }) => {
    try {
      return await readingService.createReading(lessonId, data)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create reading section')
    }
  }
)

export const createListeningSection = createAsyncThunk(
  'lessons/createListening',
  async ({ lessonId, data }, { rejectWithValue }) => {
    try {
      return await listeningService.createListening(lessonId, data)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create listening section')
    }
  }
)

export const createVocabularySection = createAsyncThunk(
  'lessons/createVocabulary',
  async ({ lessonId, data }, { rejectWithValue }) => {
    try {
      return await vocabularyService.createVocabulary(lessonId, data)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create vocabulary section')
    }
  }
)

export const createVideoSection = createAsyncThunk(
  'lessons/createVideo',
  async ({ lessonId, data }, { rejectWithValue }) => {
    try {
      return await videoService.createVideo(lessonId, data)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create video section')
    }
  }
)

const initialState = {
  lessons: [],
  currentLesson: null,
  loading: false,
  error: null,
}

const lessonSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    clearCurrentLesson: (state) => {
      state.currentLesson = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all lessons
      .addCase(fetchLessons.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.loading = false
        state.lessons = action.payload
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch lesson by ID
      .addCase(fetchLessonById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.loading = false
        state.currentLesson = action.payload
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create lesson
      .addCase(createLesson.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createLesson.fulfilled, (state, action) => {
        state.loading = false
        state.lessons.push(action.payload)
        state.currentLesson = action.payload
      })
      .addCase(createLesson.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update lesson
      .addCase(updateLesson.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateLesson.fulfilled, (state, action) => {
        state.loading = false
        const index = state.lessons.findIndex(lesson => lesson._id === action.payload._id)
        if (index !== -1) {
          state.lessons[index] = action.payload
        }
        if (state.currentLesson?._id === action.payload._id) {
          state.currentLesson = action.payload
        }
      })
      .addCase(updateLesson.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete lesson
      .addCase(deleteLesson.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.loading = false
        state.lessons = state.lessons.filter(lesson => lesson._id !== action.payload)
        if (state.currentLesson?._id === action.payload) {
          state.currentLesson = null
        }
      })
      .addCase(deleteLesson.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Publish lesson
      .addCase(publishLesson.fulfilled, (state, action) => {
        const index = state.lessons.findIndex(lesson => lesson._id === action.payload._id)
        if (index !== -1) {
          state.lessons[index] = action.payload
        }
        if (state.currentLesson?._id === action.payload._id) {
          state.currentLesson = action.payload
        }
      })
  },
})

export const { clearCurrentLesson, clearError } = lessonSlice.actions
export default lessonSlice.reducer
