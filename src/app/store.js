import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice.js'
import lessonReducer from '../features/lesson/lessonSlice.js'
import quizReducer from '../features/quiz/quizSlice.js'
import digitalLibraryReducer from '../features/digitalLibrary/digitalLibrarySlice'
import apiMiddleware from '../middleware/apiMiddleware.js'
import authMiddleware from '../middleware/authMiddleware.js'
import logger from '../middleware/logger.js'
import forumReducer from '../features/forum/forumSlice.js'
import postReducer from '../features/forum/postSlice.js'
import answerReducer from '../features/forum/answerSlice.js'
import voteReducer from '../features/forum/voteSlice.js'

export const store = configureStore({
  reducer: { 
    auth: authReducer,
    lessons: lessonReducer,
    quizzes: quizReducer,
    forum: forumReducer,
    post: postReducer,
    answer: answerReducer,
    vote: voteReducer,
    digitalLibrary: digitalLibraryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiMiddleware)
      .concat(authMiddleware)
      .concat(logger),
})

export default store