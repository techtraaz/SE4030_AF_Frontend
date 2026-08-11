/**
 * Unit Tests - Forum Service
 * Tests API calls for forum operations
 */

import forumService from '@/services/forum/forumService';
import api from '@/services/axios';

jest.mock('@/services/axios');

describe('Forum Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET ALL FORUMS ───────────────────────────────────────────
  describe('getAllForums', () => {
    it('should fetch all forums', async () => {
      const mockForums = [
        { _id: '1', name: 'Forum 1' },
        { _id: '2', name: 'Forum 2' },
      ];
      api.get.mockResolvedValue({ data: mockForums });

      const result = await forumService.getAllForums();

      expect(api.get).toHaveBeenCalledWith('/forums');
      expect(result).toEqual(mockForums);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      mockError.response = { data: 'Failed to fetch forums' };
      api.get.mockRejectedValue(mockError);

      await expect(forumService.getAllForums())
        .rejects.toEqual('Failed to fetch forums');
      expect(api.get).toHaveBeenCalledWith('/forums');
    });
  });

  // ─── GET FORUM BY ID ───────────────────────────────────────────
  describe('getForumById', () => {
    it('should fetch a specific forum by ID', async () => {
      const mockForum = { _id: '1', name: 'Test Forum' };
      api.get.mockResolvedValue({ data: mockForum });

      const result = await forumService.getForumById('1');

      expect(api.get).toHaveBeenCalledWith('/forums/1');
      expect(result).toEqual(mockForum);
    });

    it('should handle forum not found error', async () => {
      const mockError = new Error('Not Found');
      mockError.response = { data: 'Forum not found' };
      api.get.mockRejectedValue(mockError);

      await expect(forumService.getForumById('invalid'))
        .rejects.toEqual('Forum not found');
    });
  });

  // ─── CREATE FORUM ─────────────────────────────────────────────
  describe('createForum', () => {
    it('should create a new forum', async () => {
      const forumData = { name: 'New Forum', description: 'Test' };
      const mockResponse = { _id: '1', ...forumData };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await forumService.createForum(forumData);

      expect(api.post).toHaveBeenCalledWith('/forums', forumData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const forumData = { name: '' };
      const mockError = new Error('Validation failed');
      mockError.response = { data: 'Name is required' };
      api.post.mockRejectedValue(mockError);

      await expect(forumService.createForum(forumData))
        .rejects.toEqual('Name is required');
    });
  });

  // ─── UPDATE FORUM ─────────────────────────────────────────────
  describe('updateForum', () => {
    it('should update a forum', async () => {
      const forumData = { name: 'Updated Forum' };
      const mockResponse = { _id: '1', ...forumData };
      api.patch.mockResolvedValue({ data: mockResponse });

      const result = await forumService.updateForum('1', forumData);

      expect(api.patch).toHaveBeenCalledWith('/forums/1', forumData);
      expect(result).toEqual(mockResponse);
    });
  });

  // ─── DELETE FORUM ─────────────────────────────────────────────
  describe('deleteForum', () => {
    it('should delete a forum', async () => {
      api.delete.mockResolvedValue({ data: { message: 'Forum deleted' } });

      const result = await forumService.deleteForum('1');

      expect(api.delete).toHaveBeenCalledWith('/forums/1');
    });
  });

  // ─── GET FORUM MEMBERS ────────────────────────────────────────
  describe('getForumMembers', () => {
    it('should fetch forum members with pagination', async () => {
      const mockMembers = {
        members: [
          { _id: 'm1', userId: 'u1', username: 'user1' },
          { _id: 'm2', userId: 'u2', username: 'user2' },
        ],
        page: 1,
        limit: 10,
        total: 2,
      };
      api.get.mockResolvedValue({ data: mockMembers });

      const result = await forumService.getForumMembers('1', 1, 10);

      expect(api.get).toHaveBeenCalledWith('/forums/1/members', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockMembers);
    });

    it('should use default pagination values', async () => {
      api.get.mockResolvedValue({ data: { members: [] } });

      await forumService.getForumMembers('1');

      expect(api.get).toHaveBeenCalledWith('/forums/1/members', {
        params: { page: 1, limit: 10 },
      });
    });
  });

  // ─── GET BANNED USERS ──────────────────────────────────────────
  describe('getBannedUsers', () => {
    it('should fetch banned users', async () => {
      const mockBanned = {
        banned: [
          { _id: 'b1', userId: 'u3', username: 'banneduser', reason: 'Spam' },
        ],
        page: 1,
        limit: 10,
        total: 1,
      };
      api.get.mockResolvedValue({ data: mockBanned });

      const result = await forumService.getBannedUsers('1', 1, 10);

      expect(api.get).toHaveBeenCalledWith('/forums/1/banned', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockBanned);
    });
  });

  // ─── GET USER FORUMS ───────────────────────────────────────────
  describe('getUserForums', () => {
    it('should fetch user\'s forums', async () => {
      const mockUserForums = {
        forums: [
          { _id: '1', name: 'My Forum 1' },
          { _id: '2', name: 'My Forum 2' },
        ],
        page: 1,
        limit: 10,
        total: 2,
      };
      api.get.mockResolvedValue({ data: mockUserForums });

      const result = await forumService.getUserForums(1, 10);

      expect(api.get).toHaveBeenCalledWith('/forums/user/forums', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockUserForums);
    });
  });

  // ─── JOIN FORUM ────────────────────────────────────────────────
  describe('joinForum', () => {
    it('should join a forum', async () => {
      const mockResponse = { _id: '1', name: 'Forum', isMember: true };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await forumService.joinForum('1');

      expect(api.post).toHaveBeenCalledWith('/forums/1/join');
      expect(result).toEqual(mockResponse);
    });

    it('should handle already member error', async () => {
      const mockError = new Error('Already a member');
      mockError.response = { data: 'User is already a member' };
      api.post.mockRejectedValue(mockError);

      await expect(forumService.joinForum('1'))
        .rejects.toEqual('User is already a member');
    });
  });

  // ─── LEAVE FORUM ───────────────────────────────────────────────
  describe('leaveForum', () => {
    it('should leave a forum', async () => {
      api.delete.mockResolvedValue({ data: { message: 'Left forum' } });

      await forumService.leaveForum('1');

      expect(api.delete).toHaveBeenCalledWith('/forums/1/leave');
    });
  });

  // ─── BAN USER ──────────────────────────────────────────────────
  describe('banUser', () => {
    it('should ban a user from forum', async () => {
      const banData = { targetUserId: 'u1', reason: 'Spam' };
      const mockResponse = { message: 'User banned' };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await forumService.banUser('1', 'u1', 'Spam');

      expect(api.post).toHaveBeenCalledWith('/forums/1/ban', banData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle ban failure', async () => {
      const mockError = new Error('Cannot ban');
      mockError.response = { data: 'User not found' };
      api.post.mockRejectedValue(mockError);

      await expect(forumService.banUser('1', 'invalid', 'Spam'))
        .rejects.toEqual('User not found');
    });
  });

  // ─── ERROR HANDLING ────────────────────────────────────────────
  describe('Error Handling', () => {
    it('should handle HTML error responses', async () => {
      const htmlError = '<pre>Database connection failed</pre>';
      const mockError = new Error('Server error');
      mockError.response = { data: htmlError };
      api.get.mockRejectedValue(mockError);

      await expect(forumService.getAllForums())
        .rejects.toEqual('Database connection failed');
    });

    it('should handle string error messages', async () => {
      const mockError = new Error('Network error');
      mockError.response = { data: 'Network timeout' };
      api.get.mockRejectedValue(mockError);

      await expect(forumService.getAllForums())
        .rejects.toEqual('Network timeout');
    });

    it('should handle API errors without response', async () => {
      const mockError = new Error('Connection error');
      mockError.response = { data: 'Connection error' };
      api.get.mockRejectedValue(mockError);

      await expect(forumService.getAllForums())
        .rejects.toEqual('Connection error');
    });
  });
});
