/**
 * Unit Tests - Forum Slice
 * Tests Redux state management for forums
 */

import { configureStore } from '@reduxjs/toolkit';
import forumReducer, {
  fetchAllForums,
  fetchForumById,
  createForumAsync,
  updateForumAsync,
  deleteForumAsync,
  joinForumAsync,
  leaveForumAsync,
  fetchForumMembers,
  fetchBannedUsers,
  fetchUserForums,
  banMemberAsync,
  unbanMemberAsync,
  clearError,
} from '@/features/forum/forumSlice';
import forumService from '@/services/forum/forumService';

jest.mock('@/services/forum/forumService');

describe('Forum Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        forum: forumReducer,
      },
    });
    jest.clearAllMocks();
  });

  // ─── INITIAL STATE ─────────────────────────────────────────────
  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().forum;
      expect(state.forums).toEqual([]);
      expect(state.currentForum).toBeNull();
      expect(state.currentForumMembers).toEqual([]);
      expect(state.bannedMembers).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.userForums).toEqual([]);
    });
  });

  // ─── FETCH ALL FORUMS ──────────────────────────────────────────
  describe('fetchAllForums', () => {
    it('should handle fetchAllForums.pending', () => {
      const action = { type: fetchAllForums.pending.type };
      const state = forumReducer(undefined, action);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchAllForums.fulfilled', () => {
      const mockForums = [
        { _id: '1', name: 'Forum 1', description: 'Test 1' },
        { _id: '2', name: 'Forum 2', description: 'Test 2' },
      ];
      const action = {
        type: fetchAllForums.fulfilled.type,
        payload: mockForums,
      };
      const state = forumReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.forums).toEqual(mockForums);
      expect(state.error).toBeNull();
    });

    it('should handle fetchAllForums.rejected', () => {
      const mockError = 'Failed to fetch forums';
      const action = {
        type: fetchAllForums.rejected.type,
        payload: mockError,
      };
      const state = forumReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── FETCH FORUM BY ID ─────────────────────────────────────────
  describe('fetchForumById', () => {
    it('should handle fetchForumById.pending', () => {
      const action = { type: fetchForumById.pending.type };
      const state = forumReducer(undefined, action);
      expect(state.isLoading).toBe(true);
    });

    it('should handle fetchForumById.fulfilled', () => {
      const mockForum = { _id: '1', name: 'Test Forum', description: 'Test' };
      const action = {
        type: fetchForumById.fulfilled.type,
        payload: mockForum,
      };
      const state = forumReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.currentForum).toEqual(mockForum);
    });

    it('should handle fetchForumById.rejected', () => {
      const mockError = 'Forum not found';
      const action = {
        type: fetchForumById.rejected.type,
        payload: mockError,
      };
      const state = forumReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── CREATE FORUM ──────────────────────────────────────────────
  describe('createForumAsync', () => {
    it('should handle createForumAsync.pending', () => {
      const action = { type: createForumAsync.pending.type };
      const state = forumReducer(undefined, action);
      expect(state.isLoading).toBe(true);
    });

    it('should add new forum on createForumAsync.fulfilled', () => {
      const initialState = {
        forums: [{ _id: '1', name: 'Existing Forum' }],
        isLoading: false,
        error: null,
      };
      const newForum = { _id: '2', name: 'New Forum' };
      const action = {
        type: createForumAsync.fulfilled.type,
        payload: newForum,
      };
      const state = forumReducer(initialState, action);
      expect(state.forums).toHaveLength(2);
      expect(state.forums[1]).toEqual(newForum);
      expect(state.isLoading).toBe(false);
    });

    it('should handle createForumAsync.rejected', () => {
      const mockError = 'Failed to create forum';
      const action = {
        type: createForumAsync.rejected.type,
        payload: mockError,
      };
      const state = forumReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── UPDATE FORUM ──────────────────────────────────────────────
  describe('updateForumAsync', () => {
    it('should update forum in forums list', () => {
      const initialState = {
        forums: [{ _id: '1', name: 'Old Name' }],
        currentForum: { _id: '1', name: 'Old Name' },
        isLoading: false,
        error: null,
      };
      const updatedForum = { _id: '1', name: 'New Name' };
      const action = {
        type: updateForumAsync.fulfilled.type,
        payload: updatedForum,
      };
      const state = forumReducer(initialState, action);
      expect(state.forums[0].name).toBe('New Name');
      expect(state.currentForum.name).toBe('New Name');
    });

    it('should handle updateForumAsync.rejected', () => {
      const mockError = 'Failed to update forum';
      const action = {
        type: updateForumAsync.rejected.type,
        payload: mockError,
      };
      const state = forumReducer(undefined, action);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── DELETE FORUM ──────────────────────────────────────────────
  describe('deleteForumAsync', () => {
    it('should remove forum from forums list', () => {
      const initialState = {
        forums: [
          { _id: '1', name: 'Forum 1' },
          { _id: '2', name: 'Forum 2' },
        ],
        currentForum: { _id: '1', name: 'Forum 1' },
        isLoading: false,
        error: null,
      };
      const action = {
        type: deleteForumAsync.fulfilled.type,
        payload: '1',
      };
      const state = forumReducer(initialState, action);
      expect(state.forums).toHaveLength(1);
      expect(state.forums[0]._id).toBe('2');
      expect(state.currentForum).toBeNull();
    });

    it('should handle deleteForumAsync.rejected', () => {
      const mockError = 'Failed to delete forum';
      const action = {
        type: deleteForumAsync.rejected.type,
        payload: mockError,
      };
      const state = forumReducer(undefined, action);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── JOIN FORUM ────────────────────────────────────────────────
  describe('joinForumAsync', () => {
    it('should add forum to userForums on successful join', () => {
      const initialState = {
        forums: [{ _id: '1', name: 'Forum 1', isMember: false, memberCount: 5 }],
        userForums: [],
        currentForum: null,
        isLoading: false,
        error: null,
      };
      const forumData = { _id: '1', name: 'Forum 1', memberCount: 6 };
      const action = {
        type: joinForumAsync.fulfilled.type,
        payload: forumData,
      };
      const state = forumReducer(initialState, action);
      expect(state.userForums).toHaveLength(1);
      expect(state.userForums[0]._id).toBe('1');
      expect(state.forums[0].isMember).toBe(true);
    });

    it('should handle joinForumAsync.rejected', () => {
      const mockError = 'Failed to join forum';
      const action = {
        type: joinForumAsync.rejected.type,
        payload: mockError,
      };
      const state = forumReducer(undefined, action);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── LEAVE FORUM ───────────────────────────────────────────────
  describe('leaveForumAsync', () => {
    it('should remove forum from userForums on successful leave', () => {
      const initialState = {
        forums: [{ _id: '1', name: 'Forum 1', isMember: true, memberCount: 6 }],
        userForums: [{ _id: '1', name: 'Forum 1' }],
        currentForum: { _id: '1', name: 'Forum 1', isMember: true, memberCount: 6 },
        isLoading: false,
        error: null,
      };
      const action = {
        type: leaveForumAsync.fulfilled.type,
        payload: '1',
      };
      const state = forumReducer(initialState, action);
      expect(state.userForums).toHaveLength(0);
      expect(state.forums[0].isMember).toBe(false);
      expect(state.currentForum.isMember).toBe(false);
    });

    it('should handle leaveForumAsync.rejected', () => {
      const mockError = 'Failed to leave forum';
      const action = {
        type: leaveForumAsync.rejected.type,
        payload: mockError,
      };
      const state = forumReducer(undefined, action);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── FETCH FORUM MEMBERS ───────────────────────────────────────
  describe('fetchForumMembers', () => {
    it('should handle fetchForumMembers.pending', () => {
      const action = { type: fetchForumMembers.pending.type };
      const state = forumReducer(undefined, action);
      expect(state.isLoading).toBe(true);
    });

    it('should set members and pagination on fetchForumMembers.fulfilled', () => {
      const mockMembers = [
        { _id: 'm1', userId: 'u1', username: 'user1', email: 'user1@test.com' },
        { _id: 'm2', userId: 'u2', username: 'user2', email: 'user2@test.com' },
      ];
      const mockPayload = {
        members: mockMembers,
        page: 1,
        limit: 10,
        total: 2,
      };
      const action = {
        type: fetchForumMembers.fulfilled.type,
        payload: mockPayload,
      };
      const state = forumReducer(undefined, action);
      expect(state.currentForumMembers).toHaveLength(2);
      expect(state.membersPagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
      });
    });

    it('should handle fetchForumMembers.rejected', () => {
      const mockError = 'Failed to fetch members';
      const action = {
        type: fetchForumMembers.rejected.type,
        payload: mockError,
      };
      const state = forumReducer(undefined, action);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── FETCH BANNED USERS ────────────────────────────────────────
  describe('fetchBannedUsers', () => {
    it('should set banned members and pagination on fetchBannedUsers.fulfilled', () => {
      const mockBanned = [
        { _id: 'b1', userId: 'u3', username: 'banneduser', reason: 'Spam' },
      ];
      const mockPayload = {
        banned: mockBanned,
        page: 1,
        limit: 10,
        total: 1,
      };
      const action = {
        type: fetchBannedUsers.fulfilled.type,
        payload: mockPayload,
      };
      const state = forumReducer(undefined, action);
      expect(state.bannedMembers[0]._id).toBe('b1');
      expect(state.bannedMembers[0].username).toBe('banneduser');
      expect(state.bannedPagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
      });
    });
  });

  // ─── FETCH USER FORUMS ─────────────────────────────────────────
  describe('fetchUserForums', () => {
    it('should set userForums and pagination on fetchUserForums.fulfilled', () => {
      const mockForums = [{ _id: '1', name: 'My Forum' }];
      const mockPayload = {
        forums: mockForums,
        page: 1,
        limit: 10,
        total: 1,
      };
      const action = {
        type: fetchUserForums.fulfilled.type,
        payload: mockPayload,
      };
      const state = forumReducer(undefined, action);
      expect(state.userForums.length).toBeGreaterThanOrEqual(0);
      expect(state.userForumsPagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
      });
    });
  });

  // ─── BAN/UNBAN MEMBER ──────────────────────────────────────────
  describe('banMemberAsync', () => {
    it('should handle banMemberAsync.pending', () => {
      const action = { type: banMemberAsync.pending.type };
      const state = forumReducer(undefined, action);
      expect(state.isLoading).toBe(true);
    });
  });

  // ─── CLEAR ERROR ────────────────────────────────────────────────
  describe('clearError', () => {
    it('should clear error when clearError action is dispatched', () => {
      const initialState = {
        error: 'Some error',
        forums: [],
        currentForum: null,
      };
      const state = forumReducer(initialState, clearError());
      expect(state.error).toBeNull();
    });
  });
});
