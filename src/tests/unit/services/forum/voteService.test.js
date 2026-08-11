/**
 * Unit Tests - Vote Service
 * Tests API calls for voting operations (upvotes/downvotes)
 */

import voteService from '@/services/forum/voteService';
import api from '@/services/axios';

jest.mock('@/services/axios');

describe('Vote Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── CAST VOTE ─────────────────────────────────────────────────
  describe('castVote', () => {
    it('should cast an upvote on a post', async () => {
      const mockResponse = {
        targetId: 'p1',
        upvoteCount: 6,
        downvoteCount: 1,
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote('p1', 'post', 'upvote');

      expect(api.post).toHaveBeenCalledWith('/votes', {
        targetId: 'p1',
        targetType: 'post',
        voteType: 'upvote',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should cast a downvote on a post', async () => {
      const mockResponse = {
        targetId: 'p1',
        upvoteCount: 5,
        downvoteCount: 2,
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote('p1', 'post', 'downvote');

      expect(api.post).toHaveBeenCalledWith('/votes', {
        targetId: 'p1',
        targetType: 'post',
        voteType: 'downvote',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should cast an upvote on an answer', async () => {
      const mockResponse = {
        targetId: 'a1',
        upvoteCount: 4,
        downvoteCount: 0,
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote('a1', 'answer', 'upvote');

      expect(api.post).toHaveBeenCalledWith('/votes', {
        targetId: 'a1',
        targetType: 'answer',
        voteType: 'upvote',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should cast a downvote on an answer', async () => {
      const mockResponse = {
        targetId: 'a1',
        upvoteCount: 3,
        downvoteCount: 1,
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote('a1', 'answer', 'downvote');

      expect(api.post).toHaveBeenCalledWith('/votes', {
        targetId: 'a1',
        targetType: 'answer',
        voteType: 'downvote',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle vote with optional forum and post IDs', async () => {
      const mockResponse = {
        targetId: 'a1',
        upvoteCount: 5,
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote(
        'a1',
        'answer',
        'upvote',
        'forum1',
        'post1'
      );

      expect(api.post).toHaveBeenCalledWith('/votes', {
        targetId: 'a1',
        targetType: 'answer',
        voteType: 'upvote',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  // ─── VOTE RESPONSES ────────────────────────────────────────────
  describe('Vote Responses', () => {
    it('should return vote count response', async () => {
      const mockResponse = {
        targetId: 'p1',
        upvoteCount: 10,
        downvoteCount: 2,
        isUpvoted: true,
        isDownvoted: false,
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote('p1', 'post', 'upvote');

      expect(result.upvoteCount).toBe(10);
      expect(result.downvoteCount).toBe(2);
      expect(result.isUpvoted).toBe(true);
    });

    it('should handle minimum vote count (0)', async () => {
      const mockResponse = {
        targetId: 'p1',
        upvoteCount: 0,
        downvoteCount: 0,
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote('p1', 'post', 'downvote');

      expect(result.upvoteCount).toBe(0);
      expect(result.downvoteCount).toBe(0);
    });

    it('should handle large vote counts', async () => {
      const mockResponse = {
        targetId: 'p1',
        upvoteCount: 999999,
        downvoteCount: 50000,
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote('p1', 'post', 'upvote');

      expect(result.upvoteCount).toBe(999999);
      expect(result.downvoteCount).toBe(50000);
    });
  });

  // ─── ERROR HANDLING ────────────────────────────────────────────
  describe('Error Handling', () => {
    it('should handle target not found error', async () => {
      const mockError = new Error('Not found');
      mockError.response = { data: 'Post/Answer not found' };
      api.post.mockRejectedValue(mockError);

      await expect(voteService.castVote('invalid', 'post', 'upvote'))
        .rejects.toEqual('Post/Answer not found');
    });

    it('should handle unauthorized vote error', async () => {
      const mockError = new Error('Unauthorized');
      mockError.response = { data: 'User must be logged in' };
      api.post.mockRejectedValue(mockError);

      await expect(voteService.castVote('p1', 'post', 'upvote'))
        .rejects.toEqual('User must be logged in');
    });

    it('should handle duplicate vote error', async () => {
      const mockError = new Error('Conflict');
      mockError.response = { data: 'User already voted' };
      api.post.mockRejectedValue(mockError);

      await expect(voteService.castVote('p1', 'post', 'upvote'))
        .rejects.toEqual('User already voted');
    });

    it('should handle invalid target type error', async () => {
      const mockError = new Error('Bad request');
      mockError.response = { data: 'Invalid target type' };
      api.post.mockRejectedValue(mockError);

      await expect(voteService.castVote('p1', 'invalid', 'upvote'))
        .rejects.toEqual('Invalid target type');
    });

    it('should handle invalid vote type error', async () => {
      const mockError = new Error('Bad request');
      mockError.response = { data: 'Invalid vote type' };
      api.post.mockRejectedValue(mockError);

      await expect(voteService.castVote('p1', 'post', 'invalid'))
        .rejects.toEqual('Invalid vote type');
    });

    it('should handle network error', async () => {
      const mockError = new Error('Network error');
      mockError.response = { data: 'Network timeout' };
      api.post.mockRejectedValue(mockError);

      await expect(voteService.castVote('p1', 'post', 'upvote'))
        .rejects.toEqual('Network timeout');
    });

    it('should handle server error', async () => {
      const mockError = new Error('Server error');
      mockError.response = { data: 'Database error' };
      api.post.mockRejectedValue(mockError);

      await expect(voteService.castVote('p1', 'post', 'upvote'))
        .rejects.toEqual('Database error');
    });

    it('should handle vote with no response', async () => {
      const mockError = new Error('Request error');
      mockError.response = { data: 'Request error' };
      api.post.mockRejectedValue(mockError);

      await expect(voteService.castVote('p1', 'post', 'upvote'))
        .rejects.toEqual('Request error');
    });
  });

  // ─── VOTE COMBINATIONS ─────────────────────────────────────────
  describe('Vote Type Combinations', () => {
    const targets = [
      { targetId: 'p1', targetType: 'post' },
      { targetId: 'a1', targetType: 'answer' },
    ];
    const voteTypes = ['upvote', 'downvote'];

    targets.forEach(({ targetId, targetType }) => {
      voteTypes.forEach((voteType) => {
        it(`should handle ${voteType} on ${targetType} ${targetId}`, async () => {
          const mockResponse = {
            targetId,
            upvoteCount: 5,
            downvoteCount: 1,
          };
          api.post.mockResolvedValue({ data: mockResponse });

          const result = await voteService.castVote(
            targetId,
            targetType,
            voteType
          );

          expect(api.post).toHaveBeenCalledWith('/votes', {
            targetId,
            targetType,
            voteType,
          });
          expect(result).toEqual(mockResponse);
        });
      });
    });
  });

  // ─── OPTIONAL PARAMETERS ───────────────────────────────────────
  describe('Optional Parameters', () => {
    it('should accept optional forumId parameter', async () => {
      const mockResponse = { targetId: 'p1', upvoteCount: 5 };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote(
        'p1',
        'post',
        'upvote',
        'forum1'
      );

      expect(api.post).toHaveBeenCalledWith('/votes', {
        targetId: 'p1',
        targetType: 'post',
        voteType: 'upvote',
      });
    });

    it('should accept optional postId parameter', async () => {
      const mockResponse = { targetId: 'a1', upvoteCount: 3 };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote(
        'a1',
        'answer',
        'upvote',
        'forum1',
        'post1'
      );

      expect(api.post).toHaveBeenCalledWith('/votes', {
        targetId: 'a1',
        targetType: 'answer',
        voteType: 'upvote',
      });
    });

    it('should handle all parameters provided', async () => {
      const mockResponse = { targetId: 'a1', upvoteCount: 4 };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote(
        'a1',
        'answer',
        'downvote',
        'forum1',
        'post1'
      );

      expect(api.post).toHaveBeenCalledWith('/votes', {
        targetId: 'a1',
        targetType: 'answer',
        voteType: 'downvote',
      });
      expect(result.upvoteCount).toBeDefined();
    });
  });

  // ─── API CALL VERIFICATION ────────────────────────────────────
  describe('API Call Verification', () => {
    it('should use correct endpoint', async () => {
      api.post.mockResolvedValue({ data: { targetId: 'p1' } });

      await voteService.castVote('p1', 'post', 'upvote');

      const callArgs = api.post.mock.calls[0];
      expect(callArgs[0]).toBe('/votes');
    });

    it('should send vote data in correct format', async () => {
      api.post.mockResolvedValue({ data: {} });

      await voteService.castVote('p1', 'post', 'upvote');

      const callData = api.post.mock.calls[0][1];
      expect(callData).toHaveProperty('targetId');
      expect(callData).toHaveProperty('targetType');
      expect(callData).toHaveProperty('voteType');
      expect(Object.keys(callData)).toHaveLength(3);
    });
  });

  // ─── EDGE CASES ────────────────────────────────────────────────
  describe('Edge Cases', () => {
    it('should handle empty targetId gracefully', async () => {
      const mockError = new Error('Validation error');
      mockError.response = { data: 'Target ID is required' };
      api.post.mockRejectedValue(mockError);

      await expect(voteService.castVote('', 'post', 'upvote'))
        .rejects.toEqual('Target ID is required');
    });

    it('should handle special characters in targetId', async () => {
      const mockResponse = { targetId: 'p1_special-id', upvoteCount: 5 };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await voteService.castVote(
        'p1_special-id',
        'post',
        'upvote'
      );

      expect(result.targetId).toBe('p1_special-id');
    });

    it('should handle rapid vote requests', async () => {
      api.post.mockResolvedValue({ data: { targetId: 'p1', upvoteCount: 1 } });

      const promise1 = voteService.castVote('p1', 'post', 'upvote');
      const promise2 = voteService.castVote('p1', 'post', 'upvote');

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(api.post).toHaveBeenCalledTimes(2);
    });
  });
});
