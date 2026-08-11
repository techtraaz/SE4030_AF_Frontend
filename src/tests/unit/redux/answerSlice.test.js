/**
 * Unit Tests - Answer Slice
 * Tests Redux state management for answers/comments
 */

import { configureStore } from '@reduxjs/toolkit';
import answerReducer, {
  fetchAnswersByPost,
  createAnswerAsync,
  updateAnswerAsync,
  deleteAnswerAsync,
  acceptAnswerAsync,
  clearError,
} from '@/features/forum/answerSlice';
import answerService from '@/services/forum/answerService';

jest.mock('@/services/forum/answerService');

describe('Answer Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        answer: answerReducer,
      },
    });
    jest.clearAllMocks();
  });

  // ─── INITIAL STATE ─────────────────────────────────────────────
  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().answer;
      expect(state.answers).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isCreating).toBe(false);
      expect(state.isFetching).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  // ─── FETCH ANSWERS BY POST ─────────────────────────────────────
  describe('fetchAnswersByPost', () => {
    it('should handle fetchAnswersByPost.pending', () => {
      const action = { type: fetchAnswersByPost.pending.type };
      const state = answerReducer(undefined, action);
      expect(state.isFetching).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchAnswersByPost.fulfilled with content wrapper', () => {
      const mockAnswers = [
        { _id: 'a1', content: 'Answer 1', upvotes: 5 },
        { _id: 'a2', content: 'Answer 2', upvotes: 3 },
      ];
      const mockPayload = { content: mockAnswers };
      const action = {
        type: fetchAnswersByPost.fulfilled.type,
        payload: mockPayload,
      };
      const state = answerReducer(undefined, action);
      expect(state.isFetching).toBe(false);
      expect(state.answers).toEqual(mockAnswers);
    });

    it('should handle fetchAnswersByPost.fulfilled with direct array response', () => {
      const mockAnswers = [
        { _id: 'a1', content: 'Answer 1' },
        { _id: 'a2', content: 'Answer 2' },
      ];
      const action = {
        type: fetchAnswersByPost.fulfilled.type,
        payload: mockAnswers,
      };
      const state = answerReducer(undefined, action);
      expect(state.answers).toEqual(mockAnswers);
    });

    it('should handle fetchAnswersByPost.fulfilled with nested answers key', () => {
      const mockAnswers = [{ _id: 'a1', content: 'Answer 1' }];
      const mockPayload = {
        content: {
          answers: mockAnswers,
        },
      };
      const action = {
        type: fetchAnswersByPost.fulfilled.type,
        payload: mockPayload,
      };
      const state = answerReducer(undefined, action);
      expect(state.answers).toEqual(mockAnswers);
    });

    it('should handle fetchAnswersByPost.rejected', () => {
      const mockError = 'Failed to fetch answers';
      const action = {
        type: fetchAnswersByPost.rejected.type,
        payload: mockError,
      };
      const state = answerReducer(undefined, action);
      expect(state.isFetching).toBe(false);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── CREATE ANSWER ─────────────────────────────────────────────
  describe('createAnswerAsync', () => {
    it('should handle createAnswerAsync.pending', () => {
      const action = { type: createAnswerAsync.pending.type };
      const state = answerReducer(undefined, action);
      expect(state.isCreating).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should add new answer with content wrapper', () => {
      const initialState = {
        answers: [{ _id: 'a1', content: 'Existing Answer' }],
        isCreating: false,
      };
      const newAnswer = { _id: 'a2', content: 'New Answer', upvotes: 0 };
      const mockPayload = { content: newAnswer };
      const action = {
        type: createAnswerAsync.fulfilled.type,
        payload: mockPayload,
      };
      const state = answerReducer(initialState, action);
      expect(state.isCreating).toBe(false);
      expect(state.answers).toHaveLength(2);
      expect(state.answers[1]).toEqual(newAnswer);
    });

    it('should add new answer with direct payload', () => {
      const initialState = {
        answers: [],
        isCreating: false,
      };
      const newAnswer = { _id: 'a1', content: 'New Answer' };
      const action = {
        type: createAnswerAsync.fulfilled.type,
        payload: newAnswer,
      };
      const state = answerReducer(initialState, action);
      expect(state.answers).toHaveLength(1);
      expect(state.answers[0]).toEqual(newAnswer);
    });

    it('should not add answer if payload is invalid', () => {
      const initialState = {
        answers: [{ _id: 'a1', content: 'Existing' }],
        isCreating: false,
      };
      const action = {
        type: createAnswerAsync.fulfilled.type,
        payload: null,
      };
      const state = answerReducer(initialState, action);
      expect(state.answers).toHaveLength(1);
      expect(state.isCreating).toBe(false);
    });

    it('should handle createAnswerAsync.rejected', () => {
      const mockError = 'Failed to create answer';
      const action = {
        type: createAnswerAsync.rejected.type,
        payload: mockError,
      };
      const state = answerReducer(undefined, action);
      expect(state.isCreating).toBe(false);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── UPDATE ANSWER ─────────────────────────────────────────────
  describe('updateAnswerAsync', () => {
    it('should update answer in answers array', () => {
      const initialState = {
        answers: [
          { _id: 'a1', content: 'Old Content' },
          { _id: 'a2', content: 'Other Answer' },
        ],
      };
      const updatedAnswer = { _id: 'a1', content: 'Updated Content' };
      const action = {
        type: updateAnswerAsync.fulfilled.type,
        payload: updatedAnswer,
      };
      const state = answerReducer(initialState, action);
      expect(state.answers[0]).toEqual(updatedAnswer);
      expect(state.answers[1]._id).toBe('a2');
    });

    it('should not modify if answer not found', () => {
      const initialState = {
        answers: [{ _id: 'a1', content: 'Answer 1' }],
      };
      const updatedAnswer = { _id: 'a999', content: 'Nonexistent' };
      const action = {
        type: updateAnswerAsync.fulfilled.type,
        payload: updatedAnswer,
      };
      const state = answerReducer(initialState, action);
      expect(state.answers[0]._id).toBe('a1');
    });
  });

  // ─── DELETE ANSWER ─────────────────────────────────────────────
  describe('deleteAnswerAsync', () => {
    it('should remove answer from answers array', () => {
      const initialState = {
        answers: [
          { _id: 'a1', content: 'Answer 1' },
          { _id: 'a2', content: 'Answer 2' },
          { _id: 'a3', content: 'Answer 3' },
        ],
      };
      const action = {
        type: deleteAnswerAsync.fulfilled.type,
        payload: 'a2',
      };
      const state = answerReducer(initialState, action);
      expect(state.answers).toHaveLength(2);
      expect(state.answers.find(a => a._id === 'a2')).toBeUndefined();
      expect(state.answers.find(a => a._id === 'a1')).toBeDefined();
      expect(state.answers.find(a => a._id === 'a3')).toBeDefined();
    });

    it('should handle deleting non-existent answer', () => {
      const initialState = {
        answers: [{ _id: 'a1', content: 'Answer 1' }],
      };
      const action = {
        type: deleteAnswerAsync.fulfilled.type,
        payload: 'a999',
      };
      const state = answerReducer(initialState, action);
      expect(state.answers).toHaveLength(1);
    });
  });

  // ─── ACCEPT ANSWER ────────────────────────────────────────────
  describe('acceptAnswerAsync', () => {
    it('should handle acceptAnswerAsync.pending', () => {
      const action = { type: acceptAnswerAsync.pending.type };
      const state = answerReducer(undefined, action);
      expect(state.isLoading).toBe(true);
    });

    it('should update answer to marked as accepted', () => {
      const initialState = {
        answers: [
          { _id: 'a1', content: 'Answer 1', isAccepted: false },
          { _id: 'a2', content: 'Answer 2', isAccepted: false },
        ],
        isLoading: false,
      };
      const acceptedAnswer = { _id: 'a1', content: 'Answer 1', isAccepted: true };
      const mockPayload = { content: acceptedAnswer };
      const action = {
        type: acceptAnswerAsync.fulfilled.type,
        payload: mockPayload,
      };
      const state = answerReducer(initialState, action);
      expect(state.isLoading).toBe(false);
      expect(state.answers[0].isAccepted).toBe(true);
    });

    it('should handle acceptAnswerAsync.rejected', () => {
      const mockError = 'Failed to accept answer';
      const action = {
        type: acceptAnswerAsync.rejected.type,
        payload: mockError,
      };
      const state = answerReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
    });
  });

  // ─── CLEAR ERROR ────────────────────────────────────────────────
  describe('clearError', () => {
    it('should clear error when clearError action is dispatched', () => {
      const initialState = {
        error: 'Some error',
        answers: [],
        isLoading: false,
      };
      const state = answerReducer(initialState, clearError());
      expect(state.error).toBeNull();
    });
  });

  // ─── MULTIPLE OPERATIONS ────────────────────────────────────────
  describe('Multiple Operations Sequence', () => {
    it('should handle create then accept answer workflow', () => {
      let state = answerReducer(undefined, {
        type: createAnswerAsync.fulfilled.type,
        payload: { _id: 'a1', content: 'New Answer', isAccepted: false },
      });
      expect(state.answers).toHaveLength(1);
      expect(state.answers[0].isAccepted).toBe(false);

      state = answerReducer(state, {
        type: acceptAnswerAsync.fulfilled.type,
        payload: { content: { _id: 'a1', content: 'New Answer', isAccepted: true } },
      });
      expect(state.answers[0].isAccepted).toBe(true);
    });

    it('should handle fetch, update, and delete sequence', () => {
      const mockAnswers = [
        { _id: 'a1', content: 'Answer 1' },
        { _id: 'a2', content: 'Answer 2' },
      ];
      let state = answerReducer(undefined, {
        type: fetchAnswersByPost.fulfilled.type,
        payload: mockAnswers,
      });
      expect(state.answers).toHaveLength(2);

      state = answerReducer(state, {
        type: updateAnswerAsync.fulfilled.type,
        payload: { _id: 'a1', content: 'Updated Answer 1' },
      });
      expect(state.answers[0].content).toBe('Updated Answer 1');

      state = answerReducer(state, {
        type: deleteAnswerAsync.fulfilled.type,
        payload: 'a2',
      });
      expect(state.answers).toHaveLength(1);
    });
  });
});
