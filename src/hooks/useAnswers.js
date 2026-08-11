import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAnswersByPost,
  createAnswerAsync,
  updateAnswerAsync,
  deleteAnswerAsync,
  acceptAnswerAsync,
} from '../features/forum/answerSlice';

export const useAnswers = () => {
  const dispatch = useDispatch();
  const { answers, isLoading, isCreating, isFetching, error } = useSelector((state) => state.answer);

  const getAnswersByPost = (forumId, postId) => {
    return dispatch(fetchAnswersByPost({ forumId, postId }));
  };

  const createAnswer = (forumId, postId, content) => {
    return dispatch(createAnswerAsync({ forumId, postId, content }));
  };

  const updateAnswer = (answerId, content) => {
    return dispatch(updateAnswerAsync({ answerId, content }));
  };

  const deleteAnswer = (forumId, postId, answerId) => {
    return dispatch(deleteAnswerAsync({ forumId, postId, answerId }));
  };

  const acceptAnswer = (forumId, postId, answerId) => {
    return dispatch(acceptAnswerAsync({ forumId, postId, answerId }));
  };

  return {
    answers,
    isLoading,
    isCreating,
    isFetching,
    error,
    getAnswersByPost,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    acceptAnswer,
  };
};