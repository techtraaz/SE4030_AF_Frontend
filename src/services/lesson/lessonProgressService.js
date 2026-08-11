import api from "../axios";
import { handleApiError } from "../errorHandler";

const BASE_URL = "/lesson-progress";

/**
 * Mark a lesson as complete for the authenticated refugee
 * @param {string} courseId - ID of the course
 * @param {string} lessonId - ID of the lesson to mark as complete
 * @returns {Promise<Object>} Updated enrollment with progress
 */
export const markLessonComplete = async (courseId, lessonId) => {
  try {
    const response = await api.post(`${BASE_URL}/complete`, {
      courseId,
      lessonId,
    });
    return response.data.content;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Mark a lesson as incomplete for the authenticated refugee
 * @param {string} courseId - ID of the course
 * @param {string} lessonId - ID of the lesson to mark as incomplete
 * @returns {Promise<Object>} Updated enrollment with progress
 */
export const markLessonIncomplete = async (courseId, lessonId) => {
  try {
    const response = await api.post(`${BASE_URL}/incomplete`, {
      courseId,
      lessonId,
    });
    return response.data.content;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get lesson progress for a specific course
 * @param {string} courseId - ID of the course
 * @returns {Promise<Object>} Progress data for the course
 */
export const getCourseProgress = async (courseId) => {
  try {
    const response = await api.get(`${BASE_URL}/course/${courseId}`);
    return response.data.content;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get all lesson progress across all enrolled courses
 * @returns {Promise<Array>} Array of progress data for all courses
 */
export const getAllProgress = async () => {
  try {
    const response = await api.get(`${BASE_URL}`);
    return response.data.content;
  } catch (error) {
    throw handleApiError(error);
  }
};
