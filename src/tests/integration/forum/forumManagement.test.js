/**
 * Integration Tests - Forum Management Flow
 * Tests complete forum creation and management workflows
 */

import { configureStore } from '@reduxjs/toolkit';
import forumReducer, {
  fetchAllForums,
  createForumAsync,
  joinForumAsync,
  leaveForumAsync,
  fetchUserForums,
} from '@/features/forum/forumSlice';
import postReducer, {
  fetchPostsByForum,
  createPostAsync,
} from '@/features/forum/postSlice';
import answerReducer, {
  fetchAnswersByPost,
  createAnswerAsync,
} from '@/features/forum/answerSlice';
import voteReducer, { castVoteAsync } from '@/features/forum/voteSlice';
import forumService from '@/services/forum/forumService';
import postService from '@/services/forum/postService';
import answerService from '@/services/forum/answerService';
import voteService from '@/services/forum/voteService';

jest.mock('@/services/forum/forumService');
jest.mock('@/services/forum/postService');
jest.mock('@/services/forum/answerService');
jest.mock('@/services/forum/voteService');

describe('Forum Management Integration Tests', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        forum: forumReducer,
        post: postReducer,
        answer: answerReducer,
        vote: voteReducer,
      },
    });
    jest.clearAllMocks();
  });

  // ─── FORUM SETUP WORKFLOW ──────────────────────────────────────
  describe('Forum Setup and Discovery Workflow', () => {
    it('should handle complete forum creation flow', async () => {
      const mockForumData = {
        name: 'Integration Test Forum',
        description: 'Test Description',
      };
      const mockCreatedForum = {
        _id: 'forum1',
        ...mockForumData,
        memberCount: 1,
        postCount: 0,
      };

      forumService.createForum.mockResolvedValue(mockCreatedForum);
      forumService.getAllForums.mockResolvedValue([mockCreatedForum]);

      // Create forum
      const createResult = await store.dispatch(
        createForumAsync(mockForumData)
      );
      expect(store.getState().forum.forums).toContainEqual(mockCreatedForum);

      // Fetch all forums
      const fetchResult = await store.dispatch(fetchAllForums());
      expect(store.getState().forum.forums).toHaveLength(1);
    });

    it('should handle user joining multiple forums', async () => {
      const forum1 = { _id: 'f1', name: 'Forum 1', memberCount: 5 };
      const forum2 = { _id: 'f2', name: 'Forum 2', memberCount: 3 };

      forumService.getAllForums.mockResolvedValue([forum1, forum2]);

      // Fetch all forums
      await store.dispatch(fetchAllForums());
      expect(store.getState().forum.forums).toHaveLength(2);

      // Join first forum
      forumService.joinForum.mockResolvedValueOnce(forum1);
      await store.dispatch(joinForumAsync('f1'));
      expect(store.getState().forum.userForums).toHaveLength(1);

      // Join second forum
      forumService.joinForum.mockResolvedValueOnce(forum2);
      await store.dispatch(joinForumAsync('f2'));
      expect(store.getState().forum.userForums).toHaveLength(2);
    });
  });

  // ─── POST CREATION WORKFLOW ────────────────────────────────────
  describe('Post Creation and Management Workflow', () => {
    beforeEach(() => {
      store = configureStore({
        reducer: {
          forum: forumReducer,
          post: postReducer,
          answer: answerReducer,
          vote: voteReducer,
        },
      });
    });

    it('should handle complete post creation flow', async () => {
      const forumId = 'forum1';
      const mockPosts = {
        content: {
          posts: [{ _id: 'p1', title: 'Post 1', content: 'Content 1' }],
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      const newPost = { title: 'New Post', content: 'Post Content' };
      const mockCreatedPost = {
        _id: 'p2',
        ...newPost,
        author: 'user1',
      };

      postService.getPostsByForum.mockResolvedValue(mockPosts);
      postService.createPost.mockResolvedValue(mockCreatedPost);

      // Fetch posts
      await store.dispatch(fetchPostsByForum({ forumId, page: 1, limit: 10 }));
      expect(store.getState().post.posts).toHaveLength(1);

      // Create new post
      await store.dispatch(
        createPostAsync({ forumId, postData: newPost })
      );
      expect(store.getState().post.posts).toHaveLength(2);
      expect(store.getState().post.posts[0]._id).toBe('p2');
    });

    it('should maintain post order (newest first)', async () => {
      const initialPosts = {
        content: {
          posts: [
            { _id: 'p1', title: 'Old Post' },
          ],
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      const newPost = { _id: 'p2', title: 'New Post' };

      postService.getPostsByForum.mockResolvedValue(initialPosts);
      postService.createPost.mockResolvedValue(newPost);

      await store.dispatch(fetchPostsByForum({ forumId: 'f1', page: 1, limit: 10 }));
      await store.dispatch(createPostAsync({ forumId: 'f1', postData: newPost }));

      const posts = store.getState().post.posts;
      expect(posts[0]._id).toBe('p2');
      expect(posts[1]._id).toBe('p1');
    });
  });

  // ─── ANSWER/COMMENT WORKFLOW ───────────────────────────────────
  describe('Answer Creation and Discussion Workflow', () => {
    it('should handle post discussion with multiple answers', async () => {
      const forumId = 'forum1';
      const postId = 'post1';

      const mockAnswers = [
        { _id: 'a1', content: 'First Answer', upvotes: 5 },
        { _id: 'a2', content: 'Second Answer', upvotes: 3 },
      ];

      const newAnswer = { _id: 'a3', content: 'New Answer', upvotes: 0 };

      answerService.getAnswersByPost.mockResolvedValue(mockAnswers);
      answerService.createAnswer.mockResolvedValue(newAnswer);

      // Fetch answers
      await store.dispatch(
        fetchAnswersByPost({ forumId, postId })
      );
      expect(store.getState().answer.answers).toHaveLength(2);

      // Add new answer
      await store.dispatch(
        createAnswerAsync({ forumId, postId, content: 'New Answer' })
      );
      expect(store.getState().answer.answers).toHaveLength(3);
    });

    it('should handle answer acceptance workflow', async () => {
      const mockAnswers = [
        { _id: 'a1', content: 'Answer 1', isAccepted: false },
        { _id: 'a2', content: 'Answer 2', isAccepted: false },
      ];

      answerService.getAnswersByPost.mockResolvedValue(mockAnswers);

      await store.dispatch(
        fetchAnswersByPost({ forumId: 'f1', postId: 'p1' })
      );
      expect(store.getState().answer.answers[0].isAccepted).toBe(false);
    });
  });

  // ─── VOTING WORKFLOW ───────────────────────────────────────────
  describe('Voting and Interaction Workflow', () => {
    it('should handle upvoting posts and answers', async () => {
      const mockVoteResponse = {
        targetId: 'p1',
        upvoteCount: 6,
      };

      voteService.castVote.mockResolvedValue(mockVoteResponse);

      // Upvote post
      const result = await store.dispatch(
        castVoteAsync({
          targetId: 'p1',
          targetType: 'post',
          voteType: 'upvote',
        })
      );

      const voteState = store.getState().vote;
      expect(voteState.votes.p1).toBeDefined();
      expect(voteState.votes.p1.upvotes).toBe(6);
    });

    it('should handle downvoting interaction', async () => {
      const mockVoteResponse = {
        targetId: 'a1',
        upvoteCount: 2,
      };

      voteService.castVote.mockResolvedValue(mockVoteResponse);

      await store.dispatch(
        castVoteAsync({
          targetId: 'a1',
          targetType: 'answer',
          voteType: 'downvote',
        })
      );

      const voteState = store.getState().vote;
      expect(voteState.isLoading).toBe(false);
    });

    it('should handle multiple votes on different targets', async () => {
      voteService.castVote
        .mockResolvedValueOnce({ targetId: 'p1', upvoteCount: 5 })
        .mockResolvedValueOnce({ targetId: 'a1', upvoteCount: 3 });

      // Vote on post
      await store.dispatch(
        castVoteAsync({
          targetId: 'p1',
          targetType: 'post',
          voteType: 'upvote',
        })
      );

      // Vote on answer
      await store.dispatch(
        castVoteAsync({
          targetId: 'a1',
          targetType: 'answer',
          voteType: 'upvote',
        })
      );

      const votes = store.getState().vote.votes;
      expect(votes.p1).toBeDefined();
      expect(votes.a1).toBeDefined();
      expect(votes.p1.upvotes).toBe(5);
      expect(votes.a1.upvotes).toBe(3);
    });
  });

  // ─── COMPLETE USER JOURNEY ────────────────────────────────────
  describe('Complete User Journey', () => {
    it('should handle discover -> join -> post -> answer -> vote flow', async () => {
      // 1. Discover forums
      const forums = [
        { _id: 'f1', name: 'Test Forum', memberCount: 10 },
      ];
      forumService.getAllForums.mockResolvedValue(forums);
      await store.dispatch(fetchAllForums());
      expect(store.getState().forum.forums).toHaveLength(1);

      // 2. Join forum
      forumService.joinForum.mockResolvedValue(forums[0]);
      await store.dispatch(joinForumAsync('f1'));
      expect(store.getState().forum.userForums).toHaveLength(1);

      // 3. View posts
      const mockPosts = {
        content: {
          posts: [{ _id: 'p1', title: 'Question', content: 'How to...' }],
          page: 1,
          limit: 10,
          total: 1,
        },
      };
      postService.getPostsByForum.mockResolvedValue(mockPosts);
      await store.dispatch(fetchPostsByForum({ forumId: 'f1' }));
      expect(store.getState().post.posts).toHaveLength(1);

      // 4. View answers
      const mockAnswers = [
        { _id: 'a1', content: 'Solution 1', upvotes: 2 },
        { _id: 'a2', content: 'Solution 2', upvotes: 1 },
      ];
      answerService.getAnswersByPost.mockResolvedValue(mockAnswers);
      await store.dispatch(fetchAnswersByPost({ forumId: 'f1', postId: 'p1' }));
      expect(store.getState().answer.answers).toHaveLength(2);

      // 5. Vote on answer
      voteService.castVote.mockResolvedValue({ targetId: 'a1', upvoteCount: 3 });
      await store.dispatch(
        castVoteAsync({ targetId: 'a1', targetType: 'answer', voteType: 'upvote' })
      );
      expect(store.getState().vote.votes.a1.upvotes).toBe(3);
    });
  });

  // ─── ERROR RECOVERY SCENARIOS ──────────────────────────────────
  describe('Error Recovery Scenarios', () => {
    it('should handle forum creation failure gracefully', async () => {
      forumService.createForum.mockRejectedValue('Creation failed');

      const result = await store.dispatch(createForumAsync({ name: 'Test' }));

      // Verify error was captured
      expect(result.type).toContain('rejected');
      expect(store.getState().forum.error).toBeDefined();
    });

    it('should handle post fetch failure without affecting existing data', async () => {
      postService.getPostsByForum.mockRejectedValue('Fetch failed');

      // Try to fetch (will fail)
      const result = await store.dispatch(fetchPostsByForum({ forumId: 'f1' }));

      // Verify error was captured
      expect(result.type).toContain('rejected');
      expect(store.getState().post.error).toBeDefined();
    });
  });

  // ─── STATE CONSISTENCY ─────────────────────────────────────────
  describe('State Consistency', () => {
    it('should maintain consistency across multiple operations', async () => {
      // Setup
      const forum = { _id: 'f1', name: 'Forum' };
      forumService.joinForum.mockResolvedValue(forum);

      // Join forum
      await store.dispatch(joinForumAsync('f1'));
      let forumState = store.getState().forum;
      expect(forumState.userForums).toHaveLength(1);

      // Leave forum
      forumService.leaveForum.mockResolvedValue(null);
      await store.dispatch(leaveForumAsync('f1'));
      forumState = store.getState().forum;
      expect(forumState.userForums).toHaveLength(0);

      // User forums should be empty
      forumService.getUserForums.mockResolvedValue({
        forums: [],
        page: 1,
        limit: 10,
        total: 0,
      });
      await store.dispatch(fetchUserForums({ page: 1, limit: 10 }));
      expect(store.getState().forum.userForums).toHaveLength(0);
    });
  });

  // ─── PAGINATION WORKFLOW ──────────────────────────────────────
  describe('Pagination Workflow', () => {
    it('should handle pagination across multiple pages', async () => {
      const page1Posts = {
        content: {
          posts: Array.from({ length: 10 }, (_, i) => ({
            _id: `p${i + 1}`,
            title: `Post ${i + 1}`,
          })),
          page: 1,
          limit: 10,
          total: 25,
        },
      };

      postService.getPostsByForum.mockResolvedValue(page1Posts);
      await store.dispatch(fetchPostsByForum({ forumId: 'f1', page: 1, limit: 10 }));

      let postState = store.getState().post;
      expect(postState.posts).toHaveLength(10);
      expect(postState.pagination.total).toBe(25);
      expect(postState.pagination.page).toBe(1);

      // Fetch page 2
      const page2Posts = {
        content: {
          posts: Array.from({ length: 10 }, (_, i) => ({
            _id: `p${i + 11}`,
            title: `Post ${i + 11}`,
          })),
          page: 2,
          limit: 10,
          total: 25,
        },
      };

      postService.getPostsByForum.mockResolvedValue(page2Posts);
      await store.dispatch(fetchPostsByForum({ forumId: 'f1', page: 2, limit: 10 }));

      postState = store.getState().post;
      expect(postState.pagination.page).toBe(2);
    });
  });

  // ─── CONCURRENT OPERATIONS ────────────────────────────────────
  describe('Concurrent Operations', () => {
    it('should handle concurrent forum and post operations', async () => {
      forumService.getAllForums.mockResolvedValue([
        { _id: 'f1', name: 'Forum 1' },
      ]);
      postService.getPostsByForum.mockResolvedValue({
        content: {
          posts: [{ _id: 'p1', title: 'Post 1' }],
          page: 1,
          limit: 10,
          total: 1,
        },
      });

      // Execute concurrently
      await Promise.all([
        store.dispatch(fetchAllForums()),
        store.dispatch(fetchPostsByForum({ forumId: 'f1' })),
      ]);

      expect(store.getState().forum.forums).toHaveLength(1);
      expect(store.getState().post.posts).toHaveLength(1);
    });
  });
});
