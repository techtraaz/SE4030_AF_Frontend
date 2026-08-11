/**
 * Unit Tests - Vote Slice
 * Tests Redux state management for votes (upvotes/downvotes)
 */

import { configureStore } from '@reduxjs/toolkit';
import voteReducer, {
  castVoteAsync,
  setVoteCount,
} from '@/features/forum/voteSlice';
import voteService from '@/services/forum/voteService';

jest.mock('@/services/forum/voteService');

describe('Vote Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        vote: voteReducer,
      },
    });
    jest.clearAllMocks();
  });

  // ─── INITIAL STATE ─────────────────────────────────────────────
  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().vote;
      expect(state.votes).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  // ─── SET VOTE COUNT (REDUCER) ──────────────────────────────────
  describe('setVoteCount', () => {
    it('should set vote count for a target', () => {
      const state = voteReducer(undefined, setVoteCount({
        targetId: 'post1',
        upvotes: 10,
        downvotes: 2,
      }));
      expect(state.votes.post1).toEqual({
        upvotes: 10,
        downvotes: 2,
      });
    });

    it('should update existing vote count', () => {
      const initialState = {
        votes: {
          post1: { upvotes: 5, downvotes: 1 },
        },
        isLoading: false,
        error: null,
      };
      const state = voteReducer(initialState, setVoteCount({
        targetId: 'post1',
        upvotes: 15,
        downvotes: 3,
      }));
      expect(state.votes.post1).toEqual({
        upvotes: 15,
        downvotes: 3,
      });
    });

    it('should add vote count for multiple targets', () => {
      let state = voteReducer(undefined, setVoteCount({
        targetId: 'post1',
        upvotes: 5,
        downvotes: 1,
      }));
      state = voteReducer(state, setVoteCount({
        targetId: 'answer1',
        upvotes: 3,
        downvotes: 0,
      }));
      expect(Object.keys(state.votes)).toHaveLength(2);
      expect(state.votes.post1.upvotes).toBe(5);
      expect(state.votes.answer1.upvotes).toBe(3);
    });
  });

  // ─── CAST VOTE ASYNC ───────────────────────────────────────────
  describe('castVoteAsync', () => {
    it('should handle castVoteAsync.pending for upvote', () => {
      const action = {
        type: castVoteAsync.pending.type,
        meta: {
          arg: {
            targetId: 'post1',
            voteType: 'upvote',
          },
        },
      };
      const state = voteReducer(undefined, action);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.votes.post1).toEqual({
        upvotes: 1,
        downvotes: 0,
      });
    });

    it('should handle castVoteAsync.pending for downvote', () => {
      const action = {
        type: castVoteAsync.pending.type,
        meta: {
          arg: {
            targetId: 'post1',
            voteType: 'downvote',
          },
        },
      };
      const state = voteReducer(undefined, action);
      expect(state.votes.post1).toEqual({
        upvotes: 0,
        downvotes: 1,
      });
    });

    it('should increment upvote count on pending', () => {
      const initialState = {
        votes: {
          post1: { upvotes: 5, downvotes: 2 },
        },
        isLoading: false,
        error: null,
      };
      const action = {
        type: castVoteAsync.pending.type,
        meta: {
          arg: {
            targetId: 'post1',
            voteType: 'upvote',
          },
        },
      };
      const state = voteReducer(initialState, action);
      expect(state.votes.post1.upvotes).toBe(6);
      expect(state.votes.post1.downvotes).toBe(2);
    });

    it('should handle castVoteAsync.fulfilled with backend response', () => {
      const initialState = {
        votes: {
          post1: { upvotes: 6, downvotes: 2 },
        },
        isLoading: true,
        error: null,
      };
      const mockResponse = {
        upvoteCount: 8,
      };
      const action = {
        type: castVoteAsync.fulfilled.type,
        payload: mockResponse,
        meta: {
          arg: {
            targetId: 'post1',
          },
        },
      };
      const state = voteReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.votes.post1.upvotes).toBe(8);
    });

    it('should handle castVoteAsync.rejected', () => {
      const initialState = {
        votes: {
          post1: { upvotes: 6, downvotes: 2 },
        },
        isLoading: true,
        error: null,
      };
      const mockError = 'Failed to cast vote';
      const action = {
        type: castVoteAsync.rejected.type,
        payload: mockError,
        meta: {
          arg: {
            targetId: 'post1',
          },
        },
      };
      const state = voteReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
      expect(state.votes.post1).toBeDefined();
    });

    it('should reset votes on error for new target', () => {
      const initialState = {
        votes: {},
        isLoading: true,
        error: null,
      };
      const mockError = 'Vote failed';
      const action = {
        type: castVoteAsync.rejected.type,
        payload: mockError,
        meta: {
          arg: {
            targetId: 'post1',
          },
        },
      };
      const state = voteReducer(initialState, action);
      expect(state.votes.post1).toEqual({
        upvotes: 0,
        downvotes: 0,
      });
    });
  });

  // ─── MULTIPLE TARGETS ──────────────────────────────────────────
  describe('Multiple Vote Targets', () => {
    it('should manage votes for multiple posts independently', () => {
      let state = voteReducer(undefined, setVoteCount({
        targetId: 'post1',
        upvotes: 10,
        downvotes: 2,
      }));
      state = voteReducer(state, setVoteCount({
        targetId: 'post2',
        upvotes: 5,
        downvotes: 1,
      }));

      expect(state.votes.post1).toEqual({ upvotes: 10, downvotes: 2 });
      expect(state.votes.post2).toEqual({ upvotes: 5, downvotes: 1 });
    });

    it('should handle votes for both posts and answers', () => {
      let state = voteReducer(undefined, setVoteCount({
        targetId: 'post1',
        upvotes: 10,
        downvotes: 0,
      }));
      state = voteReducer(state, setVoteCount({
        targetId: 'answer1',
        upvotes: 5,
        downvotes: 0,
      }));

      expect(Object.keys(state.votes)).toHaveLength(2);
      expect(state.votes.post1.upvotes).toBe(10);
      expect(state.votes.answer1.upvotes).toBe(5);
    });
  });

  // ─── VOTE TRANSITIONS ──────────────────────────────────────────
  describe('Vote Transitions', () => {
    it('should handle changing from upvote to downvote', () => {
      let state = voteReducer(undefined, setVoteCount({
        targetId: 'post1',
        upvotes: 5,
        downvotes: 0,
      }));

      // Simulate downvoting
      const action = {
        type: castVoteAsync.fulfilled.type,
        payload: {
          upvoteCount: 3,
        },
        meta: {
          arg: {
            targetId: 'post1',
          },
        },
      };
      state = voteReducer(state, action);
      expect(state.votes.post1.upvotes).toBe(3);
    });

    it('should maintain vote state across operations', () => {
      let state = voteReducer(undefined, setVoteCount({
        targetId: 'post1',
        upvotes: 5,
        downvotes: 2,
      }));

      // Pending vote cast
      state = voteReducer(state, {
        type: castVoteAsync.pending.type,
        meta: {
          arg: {
            targetId: 'post1',
            voteType: 'upvote',
          },
        },
      });
      expect(state.votes.post1.upvotes).toBe(6);

      // Fulfilled
      state = voteReducer(state, {
        type: castVoteAsync.fulfilled.type,
        payload: { upvoteCount: 6 },
        meta: {
          arg: {
            targetId: 'post1',
          },
        },
      });
      expect(state.votes.post1.upvotes).toBe(6);
      expect(state.isLoading).toBe(false);
    });
  });

  // ─── EDGE CASES ────────────────────────────────────────────────
  describe('Edge Cases', () => {
    it('should handle zero vote counts', () => {
      const state = voteReducer(undefined, setVoteCount({
        targetId: 'post1',
        upvotes: 0,
        downvotes: 0,
      }));
      expect(state.votes.post1).toEqual({ upvotes: 0, downvotes: 0 });
    });

    it('should handle no initial votes for new target on pending', () => {
      const state = voteReducer(
        { votes: {}, isLoading: false, error: null },
        {
          type: castVoteAsync.pending.type,
          meta: {
            arg: {
              targetId: 'newpost',
              voteType: 'upvote',
            },
          },
        }
      );
      expect(state.votes.newpost).toEqual({ upvotes: 1, downvotes: 0 });
    });

    it('should preserve all votes on single rejection', () => {
      const initialState = {
        votes: {
          post1: { upvotes: 10, downvotes: 2 },
          post2: { upvotes: 5, downvotes: 1 },
        },
        isLoading: true,
        error: null,
      };
      const action = {
        type: castVoteAsync.rejected.type,
        payload: 'Error',
        meta: {
          arg: {
            targetId: 'post1',
          },
        },
      };
      const state = voteReducer(initialState, action);
      expect(state.votes.post1).toBeDefined();
      expect(state.votes.post2).toEqual({ upvotes: 5, downvotes: 1 });
    });
  });
});
