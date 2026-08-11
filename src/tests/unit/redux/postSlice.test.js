/**
 * Unit Tests - Post Slice
 * Tests Redux state management for posts
 */

import { configureStore } from '@reduxjs/toolkit';
import postReducer, {
  fetchPostsByForum,
  fetchPostById,
  createPostAsync,
  updatePostAsync,
  deletePostAsync,
  clearError,
} from '@/features/forum/postSlice';
import postService from '@/services/forum/postService';

jest.mock('@/services/forum/postService');

describe('Post Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        post: postReducer,
      },
    });
    jest.clearAllMocks();
  });

  // ─── INITIAL STATE ─────────────────────────────────────────────
  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().post;
      expect(state.posts).toEqual([]);
      expect(state.currentPost).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
      });
    });
  });

  // ─── FETCH POSTS BY FORUM ──────────────────────────────────────
  describe('fetchPostsByForum', () => {
    it('should handle fetchPostsByForum.pending', () => {
      const action = { type: fetchPostsByForum.pending.type };
      const state = postReducer(undefined, action);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchPostsByForum.fulfilled with new format (content wrapper)', () => {
      const mockPosts = [
        { _id: 'p1', title: 'Post 1', content: 'Content 1' },
        { _id: 'p2', title: 'Post 2', content: 'Content 2' },
      ];
      const mockPayload = {
        content: {
          posts: mockPosts,
          page: 1,
          limit: 10,
          total: 2,
        },
      };
      const action = {
        type: fetchPostsByForum.fulfilled.type,
        payload: mockPayload,
      };
      const state = postReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.posts).toEqual(mockPosts);
      expect(state.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
      });
    });

    it('should handle fetchPostsByForum.fulfilled with old format (direct props)', () => {
      const mockPosts = [
        { _id: 'p1', title: 'Post 1' },
        { _id: 'p2', title: 'Post 2' },
      ];
      const mockPayload = {
        posts: mockPosts,
        page: 1,
        limit: 10,
        total: 2,
      };
      const action = {
        type: fetchPostsByForum.fulfilled.type,
        payload: mockPayload,
      };
      const state = postReducer(undefined, action);
      expect(state.posts).toEqual(mockPosts);
      expect(state.pagination.total).toBe(2);
    });

    it('should handle fetchPostsByForum.fulfilled with empty response', () => {
      const mockPayload = {};
      const action = {
        type: fetchPostsByForum.fulfilled.type,
        payload: mockPayload,
      };
      const state = postReducer(undefined, action);
      expect(state.posts).toEqual([]);
      expect(state.pagination.total).toBe(0);
    });

    it('should handle fetchPostsByForum.rejected', () => {
      const mockError = 'Failed to fetch posts';
      const action = {
        type: fetchPostsByForum.rejected.type,
        payload: mockError,
      };
      const state = postReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── FETCH POST BY ID ──────────────────────────────────────────
  describe('fetchPostById', () => {
    it('should handle fetchPostById.pending', () => {
      const action = { type: fetchPostById.pending.type };
      const state = postReducer(undefined, action);
      expect(state.isLoading).toBe(true);
    });

    it('should set currentPost with nested content wrapper', () => {
      const mockPost = { _id: 'p1', title: 'Post Title', content: 'Post Content' };
      const mockPayload = { content: mockPost };
      const action = {
        type: fetchPostById.fulfilled.type,
        payload: mockPayload,
      };
      const state = postReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.currentPost).toEqual(mockPost);
    });

    it('should set currentPost with direct payload', () => {
      const mockPost = { _id: 'p1', title: 'Post Title' };
      const action = {
        type: fetchPostById.fulfilled.type,
        payload: mockPost,
      };
      const state = postReducer(undefined, action);
      expect(state.currentPost).toEqual(mockPost);
    });

    it('should handle fetchPostById.rejected', () => {
      const mockError = 'Post not found';
      const action = {
        type: fetchPostById.rejected.type,
        payload: mockError,
      };
      const state = postReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── CREATE POST ────────────────────────────────────────────────
  describe('createPostAsync', () => {
    it('should handle createPostAsync.pending', () => {
      const action = { type: createPostAsync.pending.type };
      const state = postReducer(undefined, action);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should add new post to beginning of posts array', () => {
      const initialState = {
        posts: [{ _id: 'p1', title: 'Old Post' }],
        isLoading: false,
        error: null,
      };
      const newPost = { _id: 'p2', title: 'New Post' };
      const action = {
        type: createPostAsync.fulfilled.type,
        payload: newPost,
      };
      const state = postReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.posts[0]).toEqual(newPost);
      expect(state.posts).toHaveLength(2);
    });

    it('should not add post if payload is invalid', () => {
      const initialState = {
        posts: [{ _id: 'p1', title: 'Old Post' }],
        isLoading: false,
        error: null,
      };
      const action = {
        type: createPostAsync.fulfilled.type,
        payload: null,
      };
      const state = postReducer(initialState, action);
      expect(state.posts).toHaveLength(1);
    });

    it('should handle createPostAsync.rejected', () => {
      const mockError = 'Failed to create post';
      const action = {
        type: createPostAsync.rejected.type,
        payload: mockError,
      };
      const state = postReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── UPDATE POST ────────────────────────────────────────────────
  describe('updatePostAsync', () => {
    it('should update post in posts list and currentPost', () => {
      const initialState = {
        posts: [
          { _id: 'p1', title: 'Old Title', content: 'Old Content' },
          { _id: 'p2', title: 'Other Post' },
        ],
        currentPost: { _id: 'p1', title: 'Old Title', content: 'Old Content' },
        isLoading: false,
        error: null,
      };
      const updatedPost = { _id: 'p1', title: 'New Title', content: 'New Content' };
      const action = {
        type: updatePostAsync.fulfilled.type,
        payload: updatedPost,
      };
      const state = postReducer(initialState, action);
      expect(state.posts[0]).toEqual(updatedPost);
      expect(state.currentPost).toEqual(updatedPost);
    });

    it('should handle update when currentPost does not match', () => {
      const initialState = {
        posts: [{ _id: 'p1', title: 'Post 1' }],
        currentPost: { _id: 'p2', title: 'Other Post' },
      };
      const updatedPost = { _id: 'p1', title: 'Updated' };
      const action = {
        type: updatePostAsync.fulfilled.type,
        payload: updatedPost,
      };
      const state = postReducer(initialState, action);
      expect(state.posts[0]).toEqual(updatedPost);
      expect(state.currentPost._id).toBe('p2');
    });

    it('should handle updatePostAsync.rejected', () => {
      const mockError = 'Failed to update post';
      const action = {
        type: updatePostAsync.rejected.type,
        payload: mockError,
      };
      const state = postReducer(undefined, action);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── DELETE POST ────────────────────────────────────────────────
  describe('deletePostAsync', () => {
    it('should remove post from posts array', () => {
      const initialState = {
        posts: [
          { _id: 'p1', title: 'Post 1' },
          { _id: 'p2', title: 'Post 2' },
        ],
        isLoading: false,
        error: null,
      };
      const action = {
        type: deletePostAsync.fulfilled.type,
        payload: 'p1',
      };
      const state = postReducer(initialState, action);
      expect(state.posts).toHaveLength(1);
      expect(state.posts[0]._id).toBe('p2');
    });

    it('should handle deletePostAsync.rejected', () => {
      const mockError = 'Failed to delete post';
      const action = {
        type: deletePostAsync.rejected.type,
        payload: mockError,
      };
      const state = postReducer(undefined, action);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── CLEAR ERROR ────────────────────────────────────────────────
  describe('clearError', () => {
    it('should clear error when clearError action is dispatched', () => {
      const initialState = {
        error: 'Some error',
        posts: [],
        currentPost: null,
      };
      const state = postReducer(initialState, clearError());
      expect(state.error).toBeNull();
    });
  });

  // ─── PAGINATION ────────────────────────────────────────────────
  describe('Pagination', () => {
    it('should maintain pagination info across operations', () => {
      const initialState = {
        posts: [],
        pagination: {
          page: 2,
          limit: 20,
          total: 45,
        },
      };
      const mockPosts = [{ _id: 'p1' }];
      const action = {
        type: fetchPostsByForum.fulfilled.type,
        payload: {
          content: {
            posts: mockPosts,
            page: 2,
            limit: 20,
            total: 45,
          },
        },
      };
      const state = postReducer(initialState, action);
      expect(state.pagination.page).toBe(2);
      expect(state.pagination.limit).toBe(20);
      expect(state.pagination.total).toBe(45);
    });
  });
});
