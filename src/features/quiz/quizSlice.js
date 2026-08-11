import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import quizService from '@/services/quiz/quizService'
import questionService from '@/services/quiz/questionService'
import quizAttemptService from '@/services/quiz/quizAttemptService'

// Async thunks for quiz operations
export const fetchQuizzes = createAsyncThunk(
  'quizzes/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await quizService.getAllQuizzes(filters)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes')
    }
  }
)

export const fetchQuizById = createAsyncThunk(
  'quizzes/fetchById',
  async (quizId, { rejectWithValue }) => {
    try {
      return await quizService.getQuizById(quizId)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz')
    }
  }
)

export const fetchQuizQuestions = createAsyncThunk(
  'quizzes/fetchQuestions',
  async (quizId, { rejectWithValue }) => {
    try {
      return await questionService.getAllQuestionsByQuiz(quizId)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch questions')
    }
  }
)

export const createQuiz = createAsyncThunk(
  'quizzes/create',
  async (quizData, { rejectWithValue }) => {
    try {
      return await quizService.createQuiz(quizData)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create quiz')
    }
  }
)

export const updateQuiz = createAsyncThunk(
  'quizzes/update',
  async ({ id, quizData }, { rejectWithValue }) => {
    try {
      return await quizService.updateQuiz(id, quizData)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quiz')
    }
  }
)

export const deleteQuiz = createAsyncThunk(
  'quizzes/delete',
  async (quizId, { rejectWithValue }) => {
    try {
      await quizService.deleteQuiz(quizId)
      return quizId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quiz')
    }
  }
)

export const publishQuiz = createAsyncThunk(
  'quizzes/publish',
  async (quizId, { rejectWithValue }) => {
    try {
      return await quizService.publishQuiz(quizId)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to publish quiz')
    }
  }
)

export const unpublishQuiz = createAsyncThunk(
  'quizzes/unpublish',
  async (quizId, { rejectWithValue }) => {
    try {
      return await quizService.unpublishQuiz(quizId)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unpublish quiz')
    }
  }
)

export const submitQuizAttempt = createAsyncThunk(
  'quizzes/submitAttempt',
  async (attemptData, { rejectWithValue }) => {
    try {
      return await quizAttemptService.submitQuizAttempt(attemptData)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit quiz')
    }
  }
)

export const fetchUserAttempts = createAsyncThunk(
  'quizzes/fetchUserAttempts',
  async ({ refugeeId, quizId }, { rejectWithValue }) => {
    try {
      return await quizAttemptService.getUserQuizAttempts(refugeeId, quizId)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attempts')
    }
  }
)

export const fetchQuizStatistics = createAsyncThunk(
  'quizzes/fetchStatistics',
  async (quizId, { rejectWithValue }) => {
    try {
      return await quizAttemptService.getQuizStatistics(quizId)
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics')
    }
  }
)

const initialState = {
  quizzes: [],
  currentQuiz: null,
  currentQuestions: [],
  currentAttempt: null,
  userAttempts: [],
  statistics: null,
  loading: false,
  error: null,
}

const quizSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null
      state.currentQuestions = []
    },
    clearCurrentAttempt: (state) => {
      state.currentAttempt = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false
        state.quizzes = action.payload
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch quiz by ID
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false
        state.currentQuiz = action.payload
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch quiz questions
      .addCase(fetchQuizQuestions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchQuizQuestions.fulfilled, (state, action) => {
        state.loading = false
        state.currentQuestions = action.payload
      })
      .addCase(fetchQuizQuestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create quiz
      .addCase(createQuiz.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.loading = false
        state.quizzes.push(action.payload)
        state.currentQuiz = action.payload
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update quiz
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const index = state.quizzes.findIndex(quiz => quiz._id === action.payload._id)
        if (index !== -1) {
          state.quizzes[index] = action.payload
        }
        if (state.currentQuiz?._id === action.payload._id) {
          state.currentQuiz = action.payload
        }
      })
      
      // Delete quiz
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter(quiz => quiz._id !== action.payload)
        if (state.currentQuiz?._id === action.payload) {
          state.currentQuiz = null
        }
      })
      
      // Publish quiz
      .addCase(publishQuiz.fulfilled, (state, action) => {
        const index = state.quizzes.findIndex(quiz => quiz._id === action.payload._id)
        if (index !== -1) {
          state.quizzes[index] = action.payload
        }
        if (state.currentQuiz?._id === action.payload._id) {
          state.currentQuiz = action.payload
        }
      })
      
      // Submit quiz attempt
      .addCase(submitQuizAttempt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitQuizAttempt.fulfilled, (state, action) => {
        state.loading = false
        state.currentAttempt = action.payload
      })
      .addCase(submitQuizAttempt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch user attempts
      .addCase(fetchUserAttempts.fulfilled, (state, action) => {
        state.userAttempts = action.payload
      })
      
      // Fetch quiz statistics
      .addCase(fetchQuizStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload
      })
  },
})

export const { clearCurrentQuiz, clearCurrentAttempt, clearError } = quizSlice.actions
export default quizSlice.reducer
