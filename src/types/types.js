/**
 * Shared type definitions and constants
 */
export const UserRole = { 
    ADMIN: 'admin', 
    USER: 'user',
    CONTENT_CONTRIBUTOR: 'content_contributor',
    REFUGEE: 'refugee'
}

// Forum Membership
export const MEMBERSHIP_STATUS = {
  MEMBER: 'member',
  NON_MEMBER: 'non_member',
  BANNED: 'banned',
};

// Vote Types
export const VOTE_TYPES = {
  CAST_VOTE: 'CAST_VOTE',
  GET_VOTES: 'GET_VOTES',
};

// Answer Types
export const ANSWER_TYPES = {
  CREATE_ANSWER: 'CREATE_ANSWER',
  GET_ANSWERS: 'GET_ANSWERS',
  UPDATE_ANSWER: 'UPDATE_ANSWER',
  DELETE_ANSWER: 'DELETE_ANSWER',
  ACCEPT_ANSWER: 'ACCEPT_ANSWER',
};

// Post Types
export const POST_TYPES = {
  CREATE_POST: 'CREATE_POST',
  GET_POSTS: 'GET_POSTS',
  GET_POST_BY_ID: 'GET_POST_BY_ID',
  UPDATE_POST: 'UPDATE_POST',
  DELETE_POST: 'DELETE_POST',
};

// Forum Types
export const FORUM_TYPES = {
  CREATE_FORUM: 'CREATE_FORUM',
  GET_FORUMS: 'GET_FORUMS',
  GET_FORUM_BY_ID: 'GET_FORUM_BY_ID',
  UPDATE_FORUM: 'UPDATE_FORUM',
  DELETE_FORUM: 'DELETE_FORUM',
  JOIN_FORUM: 'JOIN_FORUM',
  LEAVE_FORUM: 'LEAVE_FORUM',
  BAN_USER: 'BAN_USER',
  UNBAN_USER: 'UNBAN_USER',
};