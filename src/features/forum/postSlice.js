import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from '../../services/forum/postService';

const initialState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const fetchPostsByForum = createAsyncThunk(
  'post/fetchPostsByForum',
  async ({ forumId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await postService.getPostsByForum(forumId, page, limit);
      // postService.getPostsByForum already returns response.data
      // API returns format: { posts: [...], page, limit, total }
      return response;
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || 'Failed to fetch posts';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'post/fetchPostById',
  async ({ forumId, postId }, { rejectWithValue }) => {
    try {
      const response = await postService.getPostById(forumId, postId);
      // postService already returns response.data
      return response;
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || 'Failed to fetch post';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createPostAsync = createAsyncThunk(
  'post/createPost',
  async ({ forumId, postData }, { rejectWithValue }) => {
    try {
      const response = await postService.createPost(forumId, postData);
      // postService already returns response.data (the created post object)
      return response;
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || 'Failed to create post';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updatePostAsync = createAsyncThunk(
  'post/updatePost',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const response = await postService.updatePost(postId, postData);
      // postService already returns response.data (the updated post object)
      return response;
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || 'Failed to update post';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deletePostAsync = createAsyncThunk(
  'post/deletePost',
  async ({ postId, forumId }, { rejectWithValue, getState }) => {
    try {
      // Use provided forumId or try to get from state
      let id = forumId;
      if (!id) {
        const state = getState();
        id = state.post.currentPost?.forumId || state.post.currentPost?.forum?._id;
      }
      
      const response = await postService.deletePost(id, postId);
      return postId;
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || 'Failed to delete post';
      return rejectWithValue(errorMessage);
    }
  }
);

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts by forum
      .addCase(fetchPostsByForum.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostsByForum.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle different response formats from backend
        // New format: { code, message, content: { posts, total, page, limit } }
        // Old format: { posts, data, page, limit, total }
        if (action.payload && typeof action.payload === 'object') {
          let postsData = [];
          let paginationData = { page: 1, limit: 10, total: 0 };

          // Try new format first (with content wrapper)
          if (action.payload.content && typeof action.payload.content === 'object') {
            postsData = action.payload.content.posts || action.payload.content.data || [];
            paginationData = {
              page: action.payload.content.page || 1,
              limit: action.payload.content.limit || 10,
              total: action.payload.content.total || 0,
            };
          } else {
            // Try old format (direct props)
            postsData = action.payload.posts || action.payload.data || action.payload.content || [];
            paginationData = {
              page: action.payload.page || 1,
              limit: action.payload.limit || 10,
              total: action.payload.total || 0,
            };
          }

          state.posts = postsData;
          state.pagination = paginationData;
          console.log('Posts fetched successfully:', {
            postsCount: postsData.length,
            payload: action.payload
          });
        } else {
          // Fallback if payload is undefined or not an object
          state.posts = [];
          state.pagination = { page: 1, limit: 10, total: 0 };
          console.warn('Empty or invalid posts response:', action.payload);
        }
      })
      .addCase(fetchPostsByForum.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle nested content wrapper: { code, message, content: { post object } }
        if (action.payload && action.payload.content) {
          state.currentPost = action.payload.content;
        } else {
          state.currentPost = action.payload;
        }
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create post
      .addCase(createPostAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPostAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // Only add post if it has valid data
        if (action.payload && typeof action.payload === 'object' && action.payload._id) {
          state.posts.unshift(action.payload);
        } else if (!action.payload) {
          // If API didn't return post data, we may need to refresh posts from server
          // This is a fallback - ideally backend should return the created post
          console.warn('Post created but API returned no data. Posts list may be incomplete.');
        }
      })
      .addCase(createPostAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update post
      .addCase(updatePostAsync.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
      })
      .addCase(updatePostAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete post
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload);
      })
      .addCase(deletePostAsync.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = postSlice.actions;
export default postSlice.reducer;