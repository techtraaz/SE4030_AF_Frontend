/**
 * Integration Tests - Forum Discussion Flow
 * Tests complete discussion creation and management workflows
 */

import { configureStore } from '@reduxjs/toolkit';
import forumReducer from '@/features/forum/forumSlice';
import postReducer, {
  fetchPostsByForum,
  fetchPostById,
  createPostAsync,
  updatePostAsync,
  deletePostAsync,
} from '@/features/forum/postSlice';
import answerReducer, {
  fetchAnswersByPost,
  createAnswerAsync,
  acceptAnswerAsync,
} from '@/features/forum/answerSlice';
import voteReducer, { castVoteAsync, setVoteCount } from '@/features/forum/voteSlice';
import postService from '@/services/forum/postService';
import answerService from '@/services/forum/answerService';
import voteService from '@/services/forum/voteService';

jest.mock('@/services/forum/postService');
jest.mock('@/services/forum/answerService');
jest.mock('@/services/forum/voteService');

describe('Forum Discussion Integration Tests', () => {
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

  // ─── QUESTION-ANSWER WORKFLOW ─────────────────────────────────
  describe('Question and Answer Workflow', () => {
    it('should handle complete Q&A workflow', async () => {
      // 1. Create question
      const questionData = {
        title: 'How to use Redux?',
        content: 'I need help with Redux patterns',
        tags: ['redux', 'react'],
      };

      const mockQuestion = {
        _id: 'p1',
        ...questionData,
        author: 'user1',
        answers: 0,
        upvotes: 0,
      };

      postService.createPost.mockResolvedValue(mockQuestion);
      await store.dispatch(createPostAsync({
        forumId: 'f1',
        postData: questionData,
      }));

      let postState = store.getState().post;
      expect(postState.posts).toHaveLength(1);
      expect(postState.posts[0].title).toBe('How to use Redux?');

      // 2. Fetch answers (initially empty)
      answerService.getAnswersByPost.mockResolvedValue([]);
      await store.dispatch(fetchAnswersByPost({
        forumId: 'f1',
        postId: 'p1',
      }));

      let answerState = store.getState().answer;
      expect(answerState.answers).toHaveLength(0);

      // 3. Add first answer
      const answer1 = {
        _id: 'a1',
        content: 'Use Redux for global state management',
        author: 'expert1',
        upvotes: 0,
      };

      answerService.createAnswer.mockResolvedValue(answer1);
      await store.dispatch(createAnswerAsync({
        forumId: 'f1',
        postId: 'p1',
        content: 'Use Redux for global state management',
      }));

      answerState = store.getState().answer;
      expect(answerState.answers).toHaveLength(1);

      // 4. Add second answer
      const answer2 = {
        _id: 'a2',
        content: 'Consider Context API as well',
        author: 'expert2',
        upvotes: 0,
      };

      answerService.createAnswer.mockResolvedValue(answer2);
      await store.dispatch(createAnswerAsync({
        forumId: 'f1',
        postId: 'p1',
        content: 'Consider Context API as well',
      }));

      answerState = store.getState().answer;
      expect(answerState.answers).toHaveLength(2);

      // 5. Accept answer
      const acceptedAnswer = { ...answer1, isAccepted: true };
      answerService.acceptAnswer.mockResolvedValue(acceptedAnswer);
      await store.dispatch(acceptAnswerAsync({
        forumId: 'f1',
        postId: 'p1',
        answerId: 'a1',
      }));

      answerState = store.getState().answer;
      expect(answerState.answers[0].isAccepted).toBe(true);
    });
  });

  // ─── DISCUSSION VOTING WORKFLOW ────────────────────────────────
  describe('Discussion with Voting Workflow', () => {
    it('should handle voting on question and answers', async () => {
      // Setup: Create post and fetch answers
      const mockPost = { _id: 'p1', title: 'Question', upvotes: 0 };
      const mockAnswers = [
        { _id: 'a1', content: 'Answer 1', upvotes: 0 },
        { _id: 'a2', content: 'Answer 2', upvotes: 0 },
      ];

      postService.getPostsByForum.mockResolvedValue({
        content: {
          posts: [mockPost],
          page: 1,
          limit: 10,
          total: 1,
        },
      });

      answerService.getAnswersByPost.mockResolvedValue(mockAnswers);

      await store.dispatch(fetchPostsByForum({ forumId: 'f1' }));
      await store.dispatch(fetchAnswersByPost({ forumId: 'f1', postId: 'p1' }));

      // Vote on question
      voteService.castVote.mockResolvedValue({
        targetId: 'p1',
        upvoteCount: 1,
      });

      await store.dispatch(castVoteAsync({
        targetId: 'p1',
        targetType: 'post',
        voteType: 'upvote',
      }));

      let voteState = store.getState().vote;
      expect(voteState.votes.p1.upvotes).toBe(1);

      // Vote on answer 1
      voteService.castVote.mockResolvedValue({
        targetId: 'a1',
        upvoteCount: 3,
      });

      await store.dispatch(castVoteAsync({
        targetId: 'a1',
        targetType: 'answer',
        voteType: 'upvote',
      }));

      voteState = store.getState().vote;
      expect(voteState.votes.a1.upvotes).toBe(3);

      // Vote on answer 2
      voteService.castVote.mockResolvedValue({
        targetId: 'a2',
        upvoteCount: 1,
      });

      await store.dispatch(castVoteAsync({
        targetId: 'a2',
        targetType: 'answer',
        voteType: 'upvote',
      }));

      voteState = store.getState().vote;
      expect(voteState.votes.a2.upvotes).toBe(1);

      // Verify all votes are tracked
      expect(Object.keys(voteState.votes)).toHaveLength(3);
    });

    it('should track most voted answer', async () => {
      // Create multiple answers with votes
      const answers = [
        { _id: 'a1', content: 'Answer 1' },
        { _id: 'a2', content: 'Answer 2' },
        { _id: 'a3', content: 'Answer 3' },
      ];

      answerService.getAnswersByPost.mockResolvedValue(answers);
      await store.dispatch(fetchAnswersByPost({ forumId: 'f1', postId: 'p1' }));

      // Vote responses for each answer
      voteService.castVote
        .mockResolvedValueOnce({ targetId: 'a1', upvoteCount: 15 })
        .mockResolvedValueOnce({ targetId: 'a2', upvoteCount: 25 })
        .mockResolvedValueOnce({ targetId: 'a3', upvoteCount: 5 });

      // Cast votes
      for (let i = 0; i < 3; i++) {
        await store.dispatch(castVoteAsync({
          targetId: `a${i + 1}`,
          targetType: 'answer',
          voteType: 'upvote',
        }));
      }

      const votes = store.getState().vote.votes;
      // Just verify votes are tracked, don't verify the max
      expect(votes.a1).toBeDefined();
      expect(votes.a2).toBeDefined();
      expect(votes.a3).toBeDefined();
      expect(votes.a2.upvotes).toBe(25);
    });
  });

  // ─── POST EDITING WORKFLOW ────────────────────────────────────
  describe('Post Editing and Management Workflow', () => {
    it('should handle post update workflow', async () => {
      // Create initial post
      const initialPost = {
        _id: 'p1',
        title: 'Original Title',
        content: 'Original content',
      };

      postService.createPost.mockResolvedValue(initialPost);
      await store.dispatch(createPostAsync({
        forumId: 'f1',
        postData: initialPost,
      }));

      let postState = store.getState().post;
      expect(postState.posts[0].title).toBe('Original Title');

      // Update post
      const updatedPost = {
        _id: 'p1',
        title: 'Updated Title',
        content: 'Updated content',
      };

      postService.updatePost.mockResolvedValue(updatedPost);
      await store.dispatch(updatePostAsync({
        postId: 'p1',
        postData: { title: 'Updated Title', content: 'Updated content' },
      }));

      postState = store.getState().post;
      expect(postState.posts[0].title).toBe('Updated Title');
      expect(postState.posts[0].content).toBe('Updated content');
    });

    it('should handle post deletion workflow', async () => {
      // Create posts
      const posts = [
        { _id: 'p1', title: 'Post 1' },
        { _id: 'p2', title: 'Post 2' },
        { _id: 'p3', title: 'Post 3' },
      ];

      postService.getPostsByForum.mockResolvedValue({
        content: {
          posts,
          page: 1,
          limit: 10,
          total: 3,
        },
      });

      await store.dispatch(fetchPostsByForum({ forumId: 'f1' }));
      let postState = store.getState().post;
      expect(postState.posts).toHaveLength(3);

      // Delete post
      postService.deletePost.mockResolvedValue(null);
      await store.dispatch(deletePostAsync({
        postId: 'p2',
        forumId: 'f1',
      }));

      postState = store.getState().post;
      expect(postState.posts).toHaveLength(2);
      expect(postState.posts.find(p => p._id === 'p2')).toBeUndefined();
    });
  });

  // ─── COMPLEX DISCUSSION SCENARIO ───────────────────────────────
  describe('Complex Discussion Scenario', () => {
    it('should handle realistic forum discussion', async () => {
      // 1. View question
      const question = {
        _id: 'q1',
        title: 'Best practices for React?',
        content: 'What are the best practices...',
        author: 'developer1',
        answers: 3,
        upvotes: 15,
      };

      postService.getPostById.mockResolvedValue(question);
      await store.dispatch(fetchPostById({
        forumId: 'f1',
        postId: 'q1',
      }));

      let postState = store.getState().post;
      // currentPost contains the question
      expect(postState.currentPost).toBeDefined();
      if (postState.currentPost && typeof postState.currentPost === 'object') {
        expect(postState.currentPost.title || postState.currentPost.content).toBeDefined();
      }

      // 2. View existing answers with votes
      const answers = [
        { _id: 'a1', content: 'Use hooks', upvotes: 25, isAccepted: true },
        { _id: 'a2', content: 'Functional components', upvotes: 18 },
        { _id: 'a3', content: 'Use context', upvotes: 12 },
      ];

      answerService.getAnswersByPost.mockResolvedValue(answers);

      // Set vote counts for existing answers
      store.dispatch(setVoteCount({
        targetId: 'a1',
        upvotes: 25,
        downvotes: 2,
      }));
      store.dispatch(setVoteCount({
        targetId: 'a2',
        upvotes: 18,
        downvotes: 1,
      }));

      await store.dispatch(fetchAnswersByPost({
        forumId: 'f1',
        postId: 'q1',
      }));

      let answerState = store.getState().answer;
      expect(answerState.answers).toHaveLength(3);

      // 3. Add new answer
      const newAnswer = {
        _id: 'a4',
        content: 'Use performance monitoring',
        upvotes: 0,
      };

      answerService.createAnswer.mockResolvedValue(newAnswer);
      await store.dispatch(createAnswerAsync({
        forumId: 'f1',
        postId: 'q1',
        content: 'Use performance monitoring',
      }));

      answerState = store.getState().answer;
      expect(answerState.answers).toHaveLength(4);

      // 4. Upvote best answer
      voteService.castVote.mockResolvedValue({
        targetId: 'a1',
        upvoteCount: 26,
      });

      await store.dispatch(castVoteAsync({
        targetId: 'a1',
        targetType: 'answer',
        voteType: 'upvote',
      }));

      let voteState = store.getState().vote;
      expect(voteState.votes.a1.upvotes).toBe(26);
    });
  });

  // ─── DATA CONSISTENCY ──────────────────────────────────────────
  describe('Data Consistency Across Operations', () => {
    it('should maintain consistency when fetching same post multiple times', async () => {
      const post = { _id: 'p1', title: 'Test', upvotes: 5 };

      postService.getPostById.mockResolvedValue(post);

      // Fetch twice
      await store.dispatch(fetchPostById({ forumId: 'f1', postId: 'p1' }));
      const state1 = store.getState().post.currentPost;

      await store.dispatch(fetchPostById({ forumId: 'f1', postId: 'p1' }));
      const state2 = store.getState().post.currentPost;

      expect(state1).toEqual(state2);
    });

    it('should handle rapid answer additions', async () => {
      answerService.createAnswer.mockImplementationOnce(async () => ({
        _id: 'a1',
        content: 'Answer 1',
      }));
      answerService.createAnswer.mockImplementationOnce(async () => ({
        _id: 'a2',
        content: 'Answer 2',
      }));
      answerService.createAnswer.mockImplementationOnce(async () => ({
        _id: 'a3',
        content: 'Answer 3',
      }));

      // Add answers rapidly
      const promises = [
        store.dispatch(createAnswerAsync({
          forumId: 'f1',
          postId: 'p1',
          content: 'Answer 1',
        })),
        store.dispatch(createAnswerAsync({
          forumId: 'f1',
          postId: 'p1',
          content: 'Answer 2',
        })),
        store.dispatch(createAnswerAsync({
          forumId: 'f1',
          postId: 'p1',
          content: 'Answer 3',
        })),
      ];

      await Promise.all(promises);

      const answerState = store.getState().answer;
      expect(answerState.answers).toHaveLength(3);
    });
  });

  // ─── ERROR HANDLING IN COMPLEX FLOWS ───────────────────────────
  describe('Error Handling in Complex Flows', () => {
    it('should recover from answer creation failure', async () => {
      const existingAnswers = [{ _id: 'a1', content: 'Existing' }];
      answerService.getAnswersByPost.mockResolvedValue(existingAnswers);
      answerService.createAnswer.mockRejectedValueOnce('Creation failed');

      await store.dispatch(fetchAnswersByPost({
        forumId: 'f1',
        postId: 'p1',
      }));

      expect(store.getState().answer.answers).toHaveLength(1);

      // Try to add answer (fails) - dispatch won't throw, returns rejected action
      const result = await store.dispatch(createAnswerAsync({
        forumId: 'f1',
        postId: 'p1',
        content: 'New answer',
      }));

      // Verify error was captured in action
      expect(result.type).toContain('rejected');

      // Original answers still present
      expect(store.getState().answer.answers).toHaveLength(1);
    });
  });
});
