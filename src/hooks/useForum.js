import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { unwrapResult } from '@reduxjs/toolkit';
import {
  fetchAllForums,
  fetchForumById,
  createForumAsync,
  joinForumAsync,
  leaveForumAsync,
  updateForumAsync,
  deleteForumAsync,
  fetchForumMembers,
  fetchBannedUsers,
  fetchUserForums,
  banMemberAsync,
  unbanMemberAsync,
} from '../features/forum/forumSlice';

export const useForums = () => {
  const dispatch = useDispatch();
  const { 
    forums, 
    currentForum, 
    currentForumMembers, 
    bannedMembers,
    membersPagination,
    bannedPagination,
    isLoading, 
    error, 
    userForums,
    userForumsPagination,
  } = useSelector((state) => state.forum);

  const getAllForums = () => {
    dispatch(fetchAllForums());
  };

  const getForumById = (forumId) => {
    dispatch(fetchForumById(forumId));
  };

  const createForum = (forumData) => {
    return dispatch(createForumAsync(forumData)).then(unwrapResult);
  };

  const updateForum = (forumId, forumData) => {
    return dispatch(updateForumAsync({ forumId, forumData })).then(unwrapResult);
  };

  const deleteForum = (forumId) => {
    return dispatch(deleteForumAsync(forumId)).then(unwrapResult);
  };

  const joinForum = (forumId) => {
    return dispatch(joinForumAsync(forumId)).then(unwrapResult);
  };

  const leaveForum = (forumId) => {
    return dispatch(leaveForumAsync(forumId)).then(unwrapResult);
  };

  const getForumMembers = (forumId, page = 1, limit = 10) => {
    return dispatch(fetchForumMembers({ forumId, page, limit }));
  };

  const getBannedUsers = (forumId, page = 1, limit = 10) => {
    return dispatch(fetchBannedUsers({ forumId, page, limit }));
  };

  const getUserForums = (page = 1, limit = 10) => {
    return dispatch(fetchUserForums({ page, limit }));
  };

  const banMember = (forumId, targetUserId, reason) => {
    return dispatch(banMemberAsync({ forumId, targetUserId, reason })).then(unwrapResult);
  };

  const unbanMember = (forumId, targetUserId) => {
    return dispatch(unbanMemberAsync({ forumId, targetUserId })).then(unwrapResult);
  };

  return {
    forums,
    currentForum,
    currentForumMembers,
    bannedMembers,
    membersPagination,
    bannedPagination,
    isLoading,
    error,
    userForums,
    userForumsPagination,
    getAllForums,
    getForumById,
    createForum,
    updateForum,
    deleteForum,
    joinForum,
    leaveForum,
    getForumMembers,
    getBannedUsers,
    getUserForums,
    banMember,
    unbanMember,
  };
};