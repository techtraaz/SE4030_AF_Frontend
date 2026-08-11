import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import forumService from '../../services/forum/forumService';

const initialState = {
  forums: [],
  currentForum: null,
  currentForumMembers: [],
  bannedMembers: [],
  membersPagination: { page: 1, limit: 10, total: 0 },
  bannedPagination: { page: 1, limit: 10, total: 0 },
  isLoading: false,
  error: null,
  userForums: [],
  userForumsPagination: { page: 1, limit: 10, total: 0 },
};

export const fetchAllForums = createAsyncThunk(
  'forum/fetchAllForums',
  async (_, { rejectWithValue }) => {
    try {
      const response = await forumService.getAllForums();
      // forumService returns response.data which is: { code, message, content: [...forums] }
      const content = response?.content || response?.data || response;
      // Content should be an array of forums
      return Array.isArray(content) ? content : (content.content || content.data || []);
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to fetch forums';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchForumById = createAsyncThunk(
  'forum/fetchForumById',
  async (forumId, { rejectWithValue }) => {
    try {
      const response = await forumService.getForumById(forumId);
      // Axios wraps in response.data. Backend returns forum object directly
      const data = response.data?.data || response.data?.content || response.data || response;
      return data.content || data;
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to fetch forum';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createForumAsync = createAsyncThunk(
  'forum/createForum',
  async (forumData, { rejectWithValue }) => {
    try {
      const response = await forumService.createForum(forumData);
      // forumService returns response.data which is: { code, message, content: {...forum} }
      const content = response?.content || response?.data || response;
      return content.content || content.data || content;
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to create forum';
      return rejectWithValue(errorMessage);
    }
  }
);

export const joinForumAsync = createAsyncThunk(
  'forum/joinForum',
  async (forumId, { rejectWithValue }) => {
    try {
      const response = await forumService.joinForum(forumId);
      // forumService returns response.data which is: { code, message, content: {...forum} }
      const content = response?.content || response?.data || response;
      return content.content || content.data || content;
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to join forum';
      return rejectWithValue(errorMessage);
    }
  }
);

export const leaveForumAsync = createAsyncThunk(
  'forum/leaveForum',
  async (forumId, { rejectWithValue }) => {
    try {
      const response = await forumService.leaveForum(forumId);
      // forumService returns response.data which is: { code, message, content: null or {...} }
      // Just return the forumId since we're just removing membership
      return forumId;
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to leave forum';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateForumAsync = createAsyncThunk(
  'forum/updateForum',
  async ({ forumId, forumData }, { rejectWithValue }) => {
    try {
      const response = await forumService.updateForum(forumId, forumData);
      // forumService returns response.data which is: { code, message, content: {...forum} }
      const content = response?.content || response?.data || response;
      return content.content || content.data || content;
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to update forum';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteForumAsync = createAsyncThunk(
  'forum/deleteForum',
  async (forumId, { rejectWithValue }) => {
    try {
      const response = await forumService.deleteForum(forumId);
      return forumId;
    } catch (error) {
      // Handle different error formats
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || error?.msg || 'Failed to delete forum';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchForumMembers = createAsyncThunk(
  'forum/fetchForumMembers',
  async ({ forumId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await forumService.getForumMembers(forumId, page, limit);
      // forumService returns response.data which is: { code, message, content: { members, total, page, limit } }
      const content = response?.content || response?.data || response;
      return content;
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to fetch members';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchBannedUsers = createAsyncThunk(
  'forum/fetchBannedUsers',
  async ({ forumId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await forumService.getBannedUsers(forumId, page, limit);
      // forumService returns response.data which is: { code, message, content: { banned, total, page, limit } }
      const content = response?.content || response?.data || response;
      // Content should already have banned, total, page, limit
      return content;
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to fetch banned users';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserForums = createAsyncThunk(
  'forum/fetchUserForums',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await forumService.getUserForums(page, limit);
      // forumService returns response.data which is: { code, message, content: { forums: [...], total, page, limit } }
      const content = response?.content || response?.data || response;
      
      // Extract the actual forums array from nested structure
      const data = {
        forums: content?.forums || [],
        total: content?.total || 0,
        page: content?.page || page || 1,
        limit: content?.limit || limit || 10
      };
      
      console.log('DEBUG fetchUserForums response:', response);
      console.log('DEBUG fetchUserForums content:', content);
      console.log('DEBUG fetchUserForums returning:', data);
      
      return data;
    } catch (error) {
      console.error('DEBUG fetchUserForums error:', error);
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to fetch user forums';
      return rejectWithValue(errorMessage);
    }
  }
);

export const banMemberAsync = createAsyncThunk(
  'forum/banMember',
  async ({ forumId, targetUserId, reason }, { rejectWithValue }) => {
    try {
      const response = await forumService.banUser(forumId, targetUserId, reason);
      // forumService returns response.data which is: { code, message, content: {...ban} }
      const content = response?.content || response?.data || response;
      return content.content || content.data || content;
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to ban member';
      return rejectWithValue(errorMessage);
    }
  }
);

export const unbanMemberAsync = createAsyncThunk(
  'forum/unbanMember',
  async ({ forumId, targetUserId }, { rejectWithValue }) => {
    try {
      const response = await forumService.unbanUser(forumId, targetUserId);
      // forumService returns response.data which is: { code, message, content: {...} }
      const content = response?.content || response?.data || response;
      return content.content || content.data || content;
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to unban member';
      return rejectWithValue(errorMessage);
    }
  }
);

const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all forums
      .addCase(fetchAllForums.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllForums.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forums = action.payload;
      })
      .addCase(fetchAllForums.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch forum by ID
      .addCase(fetchForumById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchForumById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentForum = action.payload;
      })
      .addCase(fetchForumById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create forum
      .addCase(createForumAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createForumAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forums.push(action.payload);
      })
      .addCase(createForumAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Join forum
      .addCase(joinForumAsync.fulfilled, (state, action) => {
        const forum = action.payload;
  
        // Add to userForums if not already there
        if (!state.userForums.find(f => f._id === forum._id)) {
          state.userForums.push(forum);
        }
        
        // Update the forum in forums list to mark as member
        const forumIndex = state.forums.findIndex(f => f._id === forum._id);
        if (forumIndex !== -1) {
          state.forums[forumIndex].isMember = true;
          // Use backend's memberCount if available, otherwise increment
          state.forums[forumIndex].memberCount = forum.memberCount || 
            ((state.forums[forumIndex].memberCount || 0) + 1);
        }
        
        // Update current forum if viewing it
        if (state.currentForum?._id === forum._id) {
          state.currentForum.isMember = true;
          state.currentForum.memberCount = forum.memberCount || 
            ((state.currentForum.memberCount || 0) + 1);
        }
      })
      .addCase(joinForumAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Leave forum
      .addCase(leaveForumAsync.fulfilled, (state, action) => {
        state.userForums = state.userForums.filter(
          (f) => f._id !== action.payload
        );
        
        // Update the forum in forums list to mark as not member and decrement count
        const forumIndex = state.forums.findIndex(f => f._id === action.payload);
        if (forumIndex !== -1) {
          state.forums[forumIndex].isMember = false;
          state.forums[forumIndex].memberCount = Math.max(0, (state.forums[forumIndex].memberCount || 1) - 1);
        }
        
        // Update current forum if viewing it
        if (state.currentForum?._id === action.payload) {
          state.currentForum.isMember = false;
          state.currentForum.memberCount = Math.max(0, (state.currentForum.memberCount || 1) - 1);
        }
      })
      .addCase(leaveForumAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update forum
      .addCase(updateForumAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateForumAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.forums.findIndex((f) => f._id === action.payload._id);
        if (index !== -1) {
          state.forums[index] = action.payload;
        }
        if (state.currentForum?._id === action.payload._id) {
          state.currentForum = action.payload;
        }
      })
      .addCase(updateForumAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete forum
      .addCase(deleteForumAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteForumAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forums = state.forums.filter((f) => f._id !== action.payload);
        if (state.currentForum?._id === action.payload) {
          state.currentForum = null;
        }
      })
      .addCase(deleteForumAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch forum members
      .addCase(fetchForumMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchForumMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        // Members array contains user data in userId field or directly on member
        state.currentForumMembers = (payload.members || []).map(member => {
          // Handle different response formats from backend
          const userObj = typeof member.userId === 'object' ? member.userId : member;
          return {
            _id: member._id,
            userId: member.userId,
            joinedAt: member.joinedAt,
            // Flatten user data for easier access - try multiple sources
            username: member.username || userObj?.username || userObj?.email?.split('@')[0] || 'Unknown',
            email: member.email || userObj?.email || 'N/A',
            firstName: member.firstName || userObj?.firstName || ''
          };
        });
        state.membersPagination = {
          page: payload.page || 1,
          limit: payload.limit || 10,
          total: payload.total || 0,
        };
      })
      .addCase(fetchForumMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch banned users
      .addCase(fetchBannedUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBannedUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        // Banned array contains user data in userId field or directly on ban
        state.bannedMembers = (payload.banned || []).map(ban => {
          // Handle different response formats from backend
          const userObj = typeof ban.userId === 'object' ? ban.userId : ban;
          return {
            _id: ban._id,
            userId: ban.userId,
            reason: ban.reason,
            createdAt: ban.createdAt,
            // Flatten user data for easier access - try multiple sources
            username: ban.username || userObj?.username || userObj?.email?.split('@')[0] || 'Unknown',
            email: ban.email || userObj?.email || 'N/A',
            firstName: ban.firstName || userObj?.firstName || ''
          };
        });
        state.bannedPagination = {
          page: payload.page || 1,
          limit: payload.limit || 10,
          total: payload.total || 0,
        };
      })
      .addCase(fetchBannedUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch user forums
      .addCase(fetchUserForums.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserForums.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        // Forums array contains ForumMembership objects with nested forumId
        // Extract forum data from nested structure
        state.userForums = (payload.forums || []).map(membership => ({
          _id: membership.forumId?._id,
          name: membership.forumId?.name,
          description: membership.forumId?.description,
          createdBy: membership.forumId?.createdBy,
          memberCount: membership.memberCount,
          joinedAt: membership.joinedAt,
          // Keep original for reference
          forumId: membership.forumId
        }));
        state.userForumsPagination = {
          page: payload.page || 1,
          limit: payload.limit || 10,
          total: payload.total || 0,
        };
      })
      .addCase(fetchUserForums.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Ban member
      .addCase(banMemberAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(banMemberAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const bannedUserId = action.payload.userId || action.payload;
        
        // Remove the banned user from current members
        state.currentForumMembers = state.currentForumMembers.filter(
          (m) => m.userId?._id !== bannedUserId && m.userId !== bannedUserId
        );
        
        // Add to banned members if not already there
        if (!state.bannedMembers.find((m) => m.userId?._id === bannedUserId || m.userId === bannedUserId)) {
          state.bannedMembers.push(action.payload);
        }
      })
      .addCase(banMemberAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Unban member
      .addCase(unbanMemberAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unbanMemberAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const unbannedUserId = action.payload.userId || action.payload;
        
        // Remove from banned members
        state.bannedMembers = state.bannedMembers.filter(
          (m) => m.userId?._id !== unbannedUserId && m.userId !== unbannedUserId
        );
      })
      .addCase(unbanMemberAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = forumSlice.actions;
export default forumSlice.reducer;