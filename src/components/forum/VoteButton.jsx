import React, { useState, useEffect, useMemo } from 'react';
import { useVote } from '../../hooks/useVotes';
import { BiUpvote, BiDownvote, BiSolidUpvote, BiSolidDownvote } from 'react-icons/bi';
import { useSelector } from 'react-redux';

const EMPTY_VOTES = {};

const VoteButton = ({ targetId, targetType, initialVotes, forumId, postId }) => {
  const { castVote, isLoading } = useVote();
  const reduxVotes = useSelector((state) => state.vote.votes[targetId]) || EMPTY_VOTES;
  const [userVote, setUserVote] = useState(null);
  const [voteCount, setVoteCount] = useState(initialVotes);
  const [isAnimating, setIsAnimating] = useState(false);

  // Update vote count when Redux votes change
  useEffect(() => {
    if (reduxVotes.upvotes !== undefined || reduxVotes.downvotes !== undefined) {
      setVoteCount({
        upvotes: reduxVotes.upvotes || initialVotes.upvotes || 0,
        downvotes: reduxVotes.downvotes || initialVotes.downvotes || 0,
      });
    }
  }, [reduxVotes, initialVotes]);

  const handleVote = async (voteType) => {
    // Optimistic update
    if (userVote === voteType) {
      setUserVote(null);
      setVoteCount((prev) => ({
        ...prev,
        [voteType === 'upvote' ? 'upvotes' : 'downvotes']: Math.max(
          0,
          prev[voteType === 'upvote' ? 'upvotes' : 'downvotes'] - 1
        ),
      }));
    } else {
      if (userVote) {
        setVoteCount((prev) => ({
          ...prev,
          [userVote === 'upvote' ? 'upvotes' : 'downvotes']: Math.max(
            0,
            prev[userVote === 'upvote' ? 'upvotes' : 'downvotes'] - 1
          ),
        }));
      }
      setUserVote(voteType);
      setVoteCount((prev) => ({
        ...prev,
        [voteType === 'upvote' ? 'upvotes' : 'downvotes']:
          prev[voteType === 'upvote' ? 'upvotes' : 'downvotes'] + 1,
      }));
    }
    try {
      await castVote(targetId, targetType, voteType, forumId, postId);
    } catch (error) {
      console.error('Vote error:', error);
      // On error, revert to current Redux state or initial votes
      setVoteCount(reduxVotes.upvotes !== undefined ? reduxVotes : initialVotes);
      setUserVote(null);
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-gray-600">
      <button
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
        className={`p-1 rounded hover:bg-gray-100 transition ${
          userVote === 'upvote' ? 'text-orange-500' : 'text-gray-600'
        }${isAnimating ? 'scale-110' : 'scale-100'} transform transition-transform`}
      >
        {userVote === 'upvote' ? (
          <BiSolidUpvote size={18} />
        ) : (
          <BiUpvote size={18} />
        )}
      </button>

      <span className={`text-sm font-medium transition-all ${
        isAnimating ? 'scale-125' : 'scale-100'
      }transform`} >
        {voteCount.upvotes || 0}
      </span>

      <button
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
        className={`p-1 rounded hover:bg-gray-100 transition ${
          userVote === 'downvote' ? 'text-blue-500' : 'text-gray-600'
        } ${isAnimating ? 'scale-110' : 'scale-100'} transform transition-transform`}
      >
        {userVote === 'downvote' ? (
          <BiSolidDownvote size={18} />
        ) : (
          <BiDownvote size={18} />
        )}
      </button>
    </div>
  );
};

export default VoteButton;