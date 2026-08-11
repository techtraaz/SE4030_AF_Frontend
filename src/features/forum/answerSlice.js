import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import answerService from '../../services/forum/answerService';

const initialState = {
  answers: [],
  isLoading: false,
  isCreating: false,
  isFetching: false,
  error: null,
};

export const fetchAnswersByPost = createAsyncThunk(
  'answer/fetchAnswersByPost',
  async ({ forumId, postId }, { rejectWithValue }) => {
    try {
      const response = await answerService.getAnswersByPost(forumId, postId);
      // Handle nested API response format
      if (response.content && Array.isArray(response.content)) {
        return response.content;
      }
      // Handle direct array response
      if (Array.isArray(response)) {
        return response;
      }
      // Handle nested response with answers key
      if (response.content && Array.isArray(response.content.answers)) {
        return response.content.answers;
      }
      // Fallback
      return Array.isArray(response) ? response : [];
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : (error?.message || error?.error || 'Failed to fetch answers');
      return rejectWithValue(errorMessage);
    }
  }
);

export const createAnswerAsync = createAsyncThunk(
  'answer/createAnswer',
  async ({ forumId, postId, content }, { rejectWithValue }) => {
    try {
      const response = await answerService.createAnswer(forumId, postId, content);
      // Handle nested API response format
      if (response.content && typeof response.content === 'object') {
        return response.content;
      }
      // Fallback to direct response
      return response;
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : (error?.message || error?.error || 'Failed to create answer');
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateAnswerAsync = createAsyncThunk(
  'answer/updateAnswer',
  async ({ answerId, content }, { rejectWithValue }) => {
    try {
      const response = await answerService.updateAnswer(answerId, content);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAnswerAsync = createAsyncThunk(
  'answer/deleteAnswer',
  async ({ forumId, postId, answerId }, { rejectWithValue }) => {
    try {
      const response = await answerService.deleteAnswer(forumId, postId, answerId);
      return answerId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptAnswerAsync = createAsyncThunk(
  'answer/acceptAnswer',
  async ({ forumId, postId, answerId }, { rejectWithValue }) => {
    try {
      const response = await answerService.acceptAnswer(forumId, postId, answerId);
      // Handle nested API response format
      if (response.content && typeof response.content === 'object') {
        return response.content;
      }
      return response;
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : (error?.message || error?.error || 'Failed to accept answer');
      return rejectWithValue(errorMessage);
    }
  }
);

const answerSlice = createSlice({
  name: 'answer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch answers
      .addCase(fetchAnswersByPost.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchAnswersByPost.fulfilled, (state, action) => {
        state.isFetching = false;
        state.answers = action.payload;
      })
      .addCase(fetchAnswersByPost.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })
      // Create answer
      .addCase(createAnswerAsync.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createAnswerAsync.fulfilled, (state, action) => {
        state.isCreating = false;
        // Only push if payload is a valid answer object with _id
        if (action.payload && typeof action.payload === 'object' && action.payload._id) {
          state.answers.push(action.payload);
        }
      })
      .addCase(createAnswerAsync.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Update answer
      .addCase(updateAnswerAsync.fulfilled, (state, action) => {
        const index = state.answers.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.answers[index] = action.payload;
        }
      })
      // Delete answer
      .addCase(deleteAnswerAsync.fulfilled, (state, action) => {
        state.answers = state.answers.filter((a) => a._id !== action.payload);
      })
      // Accept answer
      .addCase(acceptAnswerAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(acceptAnswerAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // Only update if payload is a valid answer object with _id
        if (action.payload && typeof action.payload === 'object' && action.payload._id) {
          const index = state.answers.findIndex((a) => a._id === action.payload._id);
          if (index !== -1) {
            state.answers[index] = action.payload;
          }
        }
      })
      .addCase(acceptAnswerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = answerSlice.actions;
export default answerSlice.reducer;