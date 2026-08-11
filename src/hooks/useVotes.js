import { useDispatch, useSelector } from 'react-redux';
import { castVoteAsync, setVoteCount } from '../features/forum/voteSlice';

export const useVote = () => {
  const dispatch = useDispatch();
  const { votes, isLoading, error } = useSelector((state) => state.vote);

  const castVote = (targetId, targetType, voteType, forumId, postId) => {
    return dispatch(castVoteAsync({ targetId, targetType, voteType, forumId, postId }));
  };

  const getVoteCount = (targetId) => {
    return votes[targetId] || { upvotes: 0, downvotes: 0 };
  };

  const updateVoteCount = (targetId, upvotes, downvotes) => {
    dispatch(setVoteCount({ targetId, upvotes, downvotes }));
  };

  return {
    votes,
    isLoading,
    error,
    castVote,
    getVoteCount,
    updateVoteCount,
  };
};