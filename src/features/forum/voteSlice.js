import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import voteService from '../../services/forum/voteService';

const initialState = {
  votes: {}, // { targetId: { voteType, count } }
  isLoading: false,
  error: null,
};

export const castVoteAsync = createAsyncThunk(
  'vote/castVote',
  async ({ targetId, targetType, voteType, forumId, postId }, { rejectWithValue }) => {
    try {
      const response = await voteService.castVote(targetId, targetType, voteType, forumId, postId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const voteSlice = createSlice({
  name: 'vote',
  initialState,
  reducers: {
    setVoteCount: (state, action) => {
      const { targetId, upvotes, downvotes } = action.payload;
      state.votes[targetId] = { upvotes, downvotes };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(castVoteAsync.pending, (state, action) => {
        const { targetId, voteType } = action.meta.arg;
        const current = state.votes[targetId] || { upvotes: 0, downvotes: 0 };
        
        // Calculate optimistic state
        state.votes[targetId] = {
          upvotes: voteType === 'upvote' 
            ? current.upvotes + 1 
            : current.upvotes,
          downvotes: voteType === 'downvote' 
            ? current.downvotes + 1 
            : current.downvotes,
        };
        state.isLoading = true;
        state.error = null;
      })
      .addCase(castVoteAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const { targetId } = action.meta.arg;
        // Backend returns the updated target with upvoteCount
        const payload = action.payload;
        state.votes[targetId] = {
          upvotes: payload.upvoteCount || 0,
          downvotes: 0,
        };
      })
      .addCase(castVoteAsync.rejected, (state, action) => {
        state.isLoading = false;
        // On error, keep existing vote state or reset to 0
        const targetId = action.meta.arg.targetId;
        state.votes[targetId] = state.votes[targetId] || { upvotes: 0, downvotes: 0 };
        state.error = action.payload;
      });
  },
});

export const { setVoteCount } = voteSlice.actions;
export default voteSlice.reducer;