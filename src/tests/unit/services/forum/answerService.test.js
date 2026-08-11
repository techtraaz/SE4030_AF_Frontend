/**
 * Unit Tests - Answer Service
 * Tests API calls for answer/comment operations
 */

import answerService from '@/services/forum/answerService';
import api from '@/services/axios';

jest.mock('@/services/axios');

describe('Answer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET ANSWERS BY POST ───────────────────────────────────────
  describe('getAnswersByPost', () => {
    it('should fetch answers for a post', async () => {
      const mockAnswers = [
        { _id: 'a1', content: 'Answer 1', upvotes: 5, author: 'user1' },
        { _id: 'a2', content: 'Answer 2', upvotes: 3, author: 'user2' },
      ];
      api.get.mockResolvedValue({ data: mockAnswers });

      const result = await answerService.getAnswersByPost('forum1', 'post1');

      expect(api.get).toHaveBeenCalledWith(
        '/forums/forum1/posts/post1/answers'
      );
      expect(result).toEqual(mockAnswers);
    });

    it('should handle no answers response', async () => {
      api.get.mockResolvedValue({ data: [] });

      const result = await answerService.getAnswersByPost('forum1', 'post1');

      expect(result).toEqual([]);
    });

    it('should handle fetch error', async () => {
      const mockError = new Error('Network error');
      mockError.response = { data: 'Failed to fetch answers' };
      api.get.mockRejectedValue(mockError);

      await expect(answerService.getAnswersByPost('forum1', 'post1'))
        .rejects.toEqual('Failed to fetch answers');
    });

    it('should handle post not found error', async () => {
      const mockError = new Error('Not found');
      mockError.response = { data: 'Post not found' };
      api.get.mockRejectedValue(mockError);

      await expect(answerService.getAnswersByPost('forum1', 'invalid'))
        .rejects.toEqual('Post not found');
    });
  });

  // ─── CREATE ANSWER ────────────────────────────────────────────
  describe('createAnswer', () => {
    it('should create a new answer', async () => {
      const answerContent = { content: 'This is my answer' };
      const mockResponse = {
        _id: 'a1',
        ...answerContent,
        author: 'user1',
        upvotes: 0,
        downvotes: 0,
        createdAt: '2024-01-01',
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await answerService.createAnswer(
        'forum1',
        'post1',
        'This is my answer'
      );

      expect(api.post).toHaveBeenCalledWith(
        '/forums/forum1/posts/post1/answers',
        answerContent
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty content error', async () => {
      const mockError = new Error('Validation error');
      mockError.response = { data: 'Content cannot be empty' };
      api.post.mockRejectedValue(mockError);

      await expect(
        answerService.createAnswer('forum1', 'post1', '')
      ).rejects.toEqual('Content cannot be empty');
    });

    it('should handle post not found error', async () => {
      const mockError = new Error('Not found');
      mockError.response = { data: 'Post not found' };
      api.post.mockRejectedValue(mockError);

      await expect(
        answerService.createAnswer('forum1', 'invalid', 'Answer content')
      ).rejects.toEqual('Post not found');
    });

    it('should handle authentication error', async () => {
      const mockError = new Error('Unauthorized');
      mockError.response = { data: 'User must be logged in' };
      api.post.mockRejectedValue(mockError);

      await expect(
        answerService.createAnswer('forum1', 'post1', 'Answer content')
      ).rejects.toEqual('User must be logged in');
    });
  });

  // ─── UPDATE ANSWER ────────────────────────────────────────────
  describe('updateAnswer', () => {
    it('should update an answer', async () => {
      const updateContent = { content: 'Updated answer content' };
      const mockResponse = {
        _id: 'a1',
        ...updateContent,
        updatedAt: '2024-01-02',
      };
      api.put.mockResolvedValue({ data: mockResponse });

      const result = await answerService.updateAnswer(
        'forum1',
        'post1',
        'a1',
        'Updated answer content'
      );

      expect(api.put).toHaveBeenCalledWith(
        '/forums/forum1/posts/post1/answers/a1',
        updateContent
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle answer not found error', async () => {
      const mockError = new Error('Not found');
      mockError.response = { data: 'Answer not found' };
      api.put.mockRejectedValue(mockError);

      await expect(
        answerService.updateAnswer('forum1', 'post1', 'invalid', 'Updated')
      ).rejects.toEqual('Answer not found');
    });

    it('should handle unauthorized update error', async () => {
      const mockError = new Error('Unauthorized');
      mockError.response = { data: 'Only answer author can update' };
      api.put.mockRejectedValue(mockError);

      await expect(
        answerService.updateAnswer('forum1', 'post1', 'a1', 'Updated')
      ).rejects.toEqual('Only answer author can update');
    });
  });

  // ─── DELETE ANSWER ────────────────────────────────────────────
  describe('deleteAnswer', () => {
    it('should delete an answer', async () => {
      const mockResponse = { message: 'Answer deleted' };
      api.delete.mockResolvedValue({ data: mockResponse });

      await answerService.deleteAnswer('forum1', 'post1', 'a1');

      expect(api.delete).toHaveBeenCalledWith(
        '/forums/forum1/posts/post1/answers/a1'
      );
    });

    it('should handle answer not found error', async () => {
      const mockError = new Error('Not found');
      mockError.response = { data: 'Answer not found' };
      api.delete.mockRejectedValue(mockError);

      await expect(
        answerService.deleteAnswer('forum1', 'post1', 'invalid')
      ).rejects.toEqual('Answer not found');
    });

    it('should handle unauthorized delete error', async () => {
      const mockError = new Error('Unauthorized');
      mockError.response = { data: 'Only answer author can delete' };
      api.delete.mockRejectedValue(mockError);

      await expect(
        answerService.deleteAnswer('forum1', 'post1', 'a1')
      ).rejects.toEqual('Only answer author can delete');
    });
  });

  // ─── ACCEPT ANSWER ────────────────────────────────────────────
  describe('acceptAnswer', () => {
    it('should accept an answer', async () => {
      const mockResponse = {
        _id: 'a1',
        content: 'Answer content',
        isAccepted: true,
      };
      api.patch.mockResolvedValue({ data: mockResponse });

      const result = await answerService.acceptAnswer('forum1', 'post1', 'a1');

      expect(api.patch).toHaveBeenCalledWith(
        '/forums/forum1/posts/post1/answers/a1/accept'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle answer not found error', async () => {
      const mockError = new Error('Not found');
      mockError.response = { data: 'Answer not found' };
      api.patch.mockRejectedValue(mockError);

      await expect(
        answerService.acceptAnswer('forum1', 'post1', 'invalid')
      ).rejects.toEqual('Answer not found');
    });

    it('should handle unauthorized accept error', async () => {
      const mockError = new Error('Unauthorized');
      mockError.response = { data: 'Only post author can accept answer' };
      api.patch.mockRejectedValue(mockError);

      await expect(
        answerService.acceptAnswer('forum1', 'post1', 'a1')
      ).rejects.toEqual('Only post author can accept answer');
    });

    it('should handle already accepted answer error', async () => {
      const mockError = new Error('Conflict');
      mockError.response = { data: 'Another answer already accepted' };
      api.patch.mockRejectedValue(mockError);

      await expect(
        answerService.acceptAnswer('forum1', 'post1', 'a1')
      ).rejects.toEqual('Another answer already accepted');
    });
  });

  // ─── ERROR HANDLING ────────────────────────────────────────────
  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network error');
      mockError.response = { data: 'Network timeout' };
      api.get.mockRejectedValue(mockError);

      await expect(answerService.getAnswersByPost('forum1', 'post1'))
        .rejects.toEqual('Network timeout');
    });

    it('should handle server errors', async () => {
      const mockError = new Error('Server error');
      mockError.response = { data: 'Database error' };
      api.get.mockRejectedValue(mockError);

      await expect(answerService.getAnswersByPost('forum1', 'post1'))
        .rejects.toEqual('Database error');
    });

    it('should handle API errors without response', async () => {
      const mockError = new Error('Request error');
      api.get.mockRejectedValue(mockError);

      await expect(answerService.getAnswersByPost('forum1', 'post1'))
        .rejects.toEqual('Request error');
    });
  });

  // ─── DATA INTEGRITY ────────────────────────────────────────────
  describe('Data Integrity', () => {
    it('should preserve all answer fields', async () => {
      const mockAnswer = {
        _id: 'a1',
        content: 'Answer content',
        author: 'user1',
        upvotes: 5,
        downvotes: 1,
        isAccepted: false,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      api.get.mockResolvedValue({ data: [mockAnswer] });
      const result = await answerService.getAnswersByPost('forum1', 'post1');

      expect(result[0]).toEqual(mockAnswer);
      expect(result[0].author).toBe('user1');
      expect(result[0].isAccepted).toBe(false);
      expect(result[0].upvotes).toBe(5);
    });

    it('should maintain answer references on operations', async () => {
      const answerContent = { content: 'Test answer' };
      const mockResponse = {
        _id: 'a1',
        ...answerContent,
        author: 'user1',
        createdAt: '2024-01-01',
      };

      api.post.mockResolvedValue({ data: mockResponse });
      const result = await answerService.createAnswer(
        'forum1',
        'post1',
        'Test answer'
      );

      expect(result._id).toBeDefined();
      expect(result.author).toBeDefined();
      expect(result.content).toBe('Test answer');
    });
  });

  // ─── ANSWER PAGINATION ────────────────────────────────────────
  describe('Answer Listing', () => {
    it('should handle multiple answers', async () => {
      const mockAnswers = Array.from({ length: 15 }, (_, i) => ({
        _id: `a${i + 1}`,
        content: `Answer ${i + 1}`,
        upvotes: Math.floor(Math.random() * 10),
      }));

      api.get.mockResolvedValue({ data: mockAnswers });
      const result = await answerService.getAnswersByPost('forum1', 'post1');

      expect(result).toHaveLength(15);
      expect(result[0]._id).toBe('a1');
      expect(result[14]._id).toBe('a15');
    });

    it('should handle empty answer list', async () => {
      api.get.mockResolvedValue({ data: [] });
      const result = await answerService.getAnswersByPost('forum1', 'post1');

      expect(result).toHaveLength(0);
    });
  });
});
