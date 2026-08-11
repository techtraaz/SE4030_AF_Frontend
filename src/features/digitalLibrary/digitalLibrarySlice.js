import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { digitalLibraryApi } from '../../services/digitalLibraryApi';

// Async Thunks
export const fetchDigitalLibraryContent = createAsyncThunk(
  'digitalLibrary/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const data = await digitalLibraryApi.getAllContent(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch content');
    }
  }
);

export const uploadDigitalLibraryContent = createAsyncThunk(
  'digitalLibrary/upload',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await digitalLibraryApi.uploadContent(formData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload content');
    }
  }
);

export const updateDigitalLibraryContent = createAsyncThunk(
  'digitalLibrary/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await digitalLibraryApi.updateContent(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update content');
    }
  }
);

export const deleteDigitalLibraryContent = createAsyncThunk(
  'digitalLibrary/delete',
  async (id, { rejectWithValue }) => {
    try {
      await digitalLibraryApi.deleteContent(id);
      return id; // Return id of deleted content
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete content');
    }
  }
);

const initialState = {
  content: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const digitalLibrarySlice = createSlice({
  name: 'digitalLibrary',
  initialState,
  reducers: {
    clearLibraryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchDigitalLibraryContent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDigitalLibraryContent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.content = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDigitalLibraryContent.rejected, (state, action) => {        
        state.status = 'failed';
        state.error = action.payload;
      })
      // Upload
      .addCase(uploadDigitalLibraryContent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadDigitalLibraryContent.fulfilled, (state, action) => {      
        state.status = 'succeeded';
        if (Array.isArray(state.content)) {
          state.content.push(action.payload);
        } else {
          state.content = [action.payload];
        }
      })
      .addCase(uploadDigitalLibraryContent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update
      .addCase(updateDigitalLibraryContent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateDigitalLibraryContent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.content.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.content[index] = action.payload;
        }
      })
      .addCase(updateDigitalLibraryContent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteDigitalLibraryContent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteDigitalLibraryContent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.content = state.content.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteDigitalLibraryContent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearLibraryError } = digitalLibrarySlice.actions;

// Selectors
export const selectLibraryContent = (state) => state.digitalLibrary.content;
export const selectLibraryStatus = (state) => state.digitalLibrary.status;
export const selectLibraryError = (state) => state.digitalLibrary.error;

export default digitalLibrarySlice.reducer;
