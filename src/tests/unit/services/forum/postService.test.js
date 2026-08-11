/**
 * Unit Tests - Post Service
 * Tests API calls for post operations
 */

import postService from '@/services/forum/postService';
import api from '@/services/axios';

jest.mock('@/services/axios');

describe('Post Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET POSTS BY FORUM ───────────────────────────────────────
  describe('getPostsByForum', () => {
    it('should fetch posts from a forum with pagination', async () => {
      const mockPosts = {
        posts: [
          { _id: 'p1', title: 'Post 1', content: 'Content 1' },
          { _id: 'p2', title: 'Post 2', content: 'Content 2' },
        ],
        page: 1,
        limit: 10,
        total: 2,
      };
      api.get.mockResolvedValue({ data: mockPosts });

      const result = await postService.getPostsByForum('forum1', 1, 10);

      expect(api.get).toHaveBeenCalledWith(
        '/forums/forum1/posts?page=1&limit=10'
      );
      expect(result).toEqual(mockPosts);
    });

    it('should use default pagination parameters', async () => {
      api.get.mockResolvedValue({ data: { posts: [] } });

      await postService.getPostsByForum('forum1');

      expect(api.get).toHaveBeenCalledWith(
        '/forums/forum1/posts?page=1&limit=10'
      );
    });

    it('should handle pagination on different pages', async () => {
      api.get.mockResolvedValue({ data: { posts: [] } });

      await postService.getPostsByForum('forum1', 2, 20);

      expect(api.get).toHaveBeenCalledWith(
        '/forums/forum1/posts?page=2&limit=20'
      );
    });

    it('should handle fetch error', async () => {
      const mockError = new Error('Network error');
      mockError.response = { data: 'Failed to fetch posts' };
      api.get.mockRejectedValue(mockError);

      await expect(postService.getPostsByForum('forum1'))
        .rejects.toEqual('Failed to fetch posts');
    });
  });

  // ─── GET POST BY ID ────────────────────────────────────────────
  describe('getPostById', () => {
    it('should fetch a specific post', async () => {
      const mockPost = {
        _id: 'p1',
        title: 'Post Title',
        content: 'Post Content',
        author: 'user1',
      };
      api.get.mockResolvedValue({ data: mockPost });

      const result = await postService.getPostById('forum1', 'p1');

      expect(api.get).toHaveBeenCalledWith('/forums/forum1/posts/p1');
      expect(result).toEqual(mockPost);
    });

    it('should handle post not found error', async () => {
      const mockError = new Error('Not found');
      mockError.response = { data: 'Post not found' };
      api.get.mockRejectedValue(mockError);

      await expect(postService.getPostById('forum1', 'invalid'))
        .rejects.toEqual('Post not found');
    });
  });

  // ─── CREATE POST ───────────────────────────────────────────────
  describe('createPost', () => {
    it('should create a new post in a forum', async () => {
      const postData = { title: 'New Post', content: 'Post Content' };
      const mockResponse = {
        _id: 'p1',
        ...postData,
        author: 'user1',
        createdAt: '2024-01-01',
      };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await postService.createPost('forum1', postData);

      expect(api.post).toHaveBeenCalledWith(
        '/forums/forum1/posts',
        postData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const postData = { title: '', content: '' };
      const mockError = new Error('Validation failed');
      mockError.response = { data: 'Title and content are required' };
      api.post.mockRejectedValue(mockError);

      await expect(postService.createPost('forum1', postData))
        .rejects.toEqual('Title and content are required');
    });

    it('should handle forum not found error', async () => {
      const mockError = new Error('Forum not found');
      mockError.response = { data: 'Forum does not exist' };
      api.post.mockRejectedValue(mockError);

      await expect(
        postService.createPost('invalid', { title: 'Test', content: 'Test' })
      ).rejects.toEqual('Forum not found');
    });
  });

  // ─── UPDATE POST ───────────────────────────────────────────────
  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const updateData = { title: 'Updated Title', content: 'Updated Content' };
      const mockResponse = {
        _id: 'p1',
        ...updateData,
        updatedAt: '2024-01-02',
      };
      api.put.mockResolvedValue({ data: mockResponse });

      const result = await postService.updatePost('forum1', 'p1', updateData);

      expect(api.put).toHaveBeenCalledWith(
        '/forums/forum1/posts/p1',
        updateData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle post not found during update', async () => {
      const mockError = new Error('Not found');
      mockError.response = { data: 'Post not found' };
      api.put.mockRejectedValue(mockError);

      await expect(
        postService.updatePost('forum1', 'invalid', { title: 'Test' })
      ).rejects.toEqual('Post not found');
    });

    it('should handle unauthorized update error', async () => {
      const mockError = new Error('Unauthorized');
      mockError.response = { data: 'Only post author can update' };
      api.put.mockRejectedValue(mockError);

      await expect(
        postService.updatePost('forum1', 'p1', { title: 'Test' })
      ).rejects.toEqual('Only post author can update');
    });
  });

  // ─── DELETE POST ───────────────────────────────────────────────
  describe('deletePost', () => {
    it('should delete a post', async () => {
      const mockResponse = { message: 'Post deleted' };
      api.delete.mockResolvedValue({ data: mockResponse });

      await postService.deletePost('forum1', 'p1');

      expect(api.delete).toHaveBeenCalledWith('/forums/forum1/posts/p1');
    });

    it('should handle post not found during delete', async () => {
      const mockError = new Error('Not found');
      mockError.response = { data: 'Post not found' };
      api.delete.mockRejectedValue(mockError);

      await expect(postService.deletePost('forum1', 'invalid'))
        .rejects.toEqual('Post not found');
    });

    it('should handle delete permission error', async () => {
      const mockError = new Error('Unauthorized');
      mockError.response = { data: 'Only post author can delete' };
      api.delete.mockRejectedValue(mockError);

      await expect(postService.deletePost('forum1', 'p1'))
        .rejects.toEqual('Only post author can delete');
    });
  });

  // ─── ERROR EXTRACTION ──────────────────────────────────────────
  describe('Error Extraction', () => {
    it('should extract error from HTML response', async () => {
      const htmlError = '<pre>Database error: connection timeout</pre>';
      const mockError = new Error('Server error');
      mockError.response = { data: htmlError };
      api.get.mockRejectedValue(mockError);

      await expect(postService.getPostsByForum('forum1'))
        .rejects.toEqual('Database error: connection timeout');
    });

    it('should handle plain text error messages', async () => {
      const mockError = new Error('Network error');
      mockError.response = { data: 'Connection refused' };
      api.get.mockRejectedValue(mockError);

      await expect(postService.getPostsByForum('forum1'))
        .rejects.toEqual('Connection refused');
    });

    it('should handle error objects with message property', async () => {
      const mockError = new Error('Request failed: Post not found');
      mockError.response = { data: mockError.message };
      api.get.mockRejectedValue(mockError);

      await expect(postService.getPostsByForum('forum1'))
        .rejects.toEqual('Request failed: Post not found');
    });
  });

  // ─── MULTIPLE POSTS OPERATIONS ────────────────────────────────
  describe('Multiple Posts Operations', () => {
    it('should handle multiple forum posts', async () => {
      const mockPostsPage1 = {
        posts: [
          { _id: 'p1', title: 'Post 1' },
          { _id: 'p2', title: 'Post 2' },
        ],
        page: 1,
        limit: 10,
        total: 25,
      };

      api.get.mockResolvedValue({ data: mockPostsPage1 });
      const result = await postService.getPostsByForum('forum1', 1, 10);

      expect(result.posts).toHaveLength(2);
      expect(result.total).toBe(25);
    });

    it('should handle empty forum posts', async () => {
      const mockEmptyResponse = {
        posts: [],
        page: 1,
        limit: 10,
        total: 0,
      };

      api.get.mockResolvedValue({ data: mockEmptyResponse });
      const result = await postService.getPostsByForum('forum1');

      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  // ─── POST DATA INTEGRITY ──────────────────────────────────────
  describe('Post Data Integrity', () => {
    it('should preserve all post fields on retrieval', async () => {
      const mockPost = {
        _id: 'p1',
        title: 'Complete Post',
        content: 'Post content here',
        author: 'user1',
        upvotes: 5,
        downvotes: 1,
        answers: 3,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z',
        tags: ['tag1', 'tag2'],
      };

      api.get.mockResolvedValue({ data: mockPost });
      const result = await postService.getPostById('forum1', 'p1');

      expect(result).toEqual(mockPost);
      expect(result.tags).toEqual(['tag1', 'tag2']);
      expect(result.upvotes).toBe(5);
    });

    it('should preserve all fields on post creation', async () => {
      const postData = {
        title: 'New Post',
        content: 'Content here',
        tags: ['tag1'],
      };

      const mockResponse = {
        ...postData,
        _id: 'p1',
        author: 'user1',
        upvotes: 0,
        downvotes: 0,
        answers: 0,
        createdAt: '2024-01-01T10:00:00Z',
      };

      api.post.mockResolvedValue({ data: mockResponse });
      const result = await postService.createPost('forum1', postData);

      expect(result._id).toBeDefined();
      expect(result.author).toBeDefined();
      expect(result.upvotes).toBe(0);
    });
  });
});
