import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import {
  fetchPostsByForum,
  fetchPostById,
  createPostAsync,
  updatePostAsync,
  deletePostAsync,
} from '../features/forum/postSlice';

export const usePosts = () => {
  const dispatch = useDispatch();
  const { posts, currentPost, isLoading, error, pagination } = useSelector(
    (state) => state.post
  );

  const getPostsByForum = (forumId, page = 1, limit = 10) => {
    return dispatch(fetchPostsByForum({ forumId, page, limit }));
  };

  const getPostById = (forumId, postId) => {
    return dispatch(fetchPostById({ forumId, postId }));
  };

  const createPost = (forumId, postData) => {
    return dispatch(createPostAsync({ forumId, postData })).then(unwrapResult);
  };

  const updatePost = (postId, postData) => {
    return dispatch(updatePostAsync({ postId, postData })).then(unwrapResult);
  };

  const deletePost = (postId, forumId) => {
    return dispatch(deletePostAsync({ postId, forumId })).then(unwrapResult);
  };

  return {
    posts,
    currentPost,
    isLoading,
    error,
    pagination,
    getPostsByForum,
    getPostById,
    createPost,
    updatePost,
    deletePost,
  };
};