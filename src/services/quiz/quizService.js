import api from '../axios'

/**
 * Quiz Service - Handles all quiz CRUD operations
 * Backend: /api/quiz/quizzes
 */
const quizService = {
  /**
   * Get all quizzes with optional filters
   * @param {Object} filters - { courseId, lessonId, isPublished }
   * @returns {Promise<Array>} Array of quiz objects
   */
  async getAllQuizzes(filters = {}) {
    const params = new URLSearchParams()
    if (filters.courseId) params.append('courseId', filters.courseId)
    if (filters.lessonId) params.append('lessonId', filters.lessonId)
    if (filters.isPublished !== undefined) params.append('isPublished', filters.isPublished)
    
    const response = await api.get(`/quiz/quizzes${params.toString() ? `?${params}` : ''}`)
    return response.data?.content || []
  },

  /**
   * Get a single quiz by ID
   * @param {string} id - Quiz ID
   * @returns {Promise<Object>} Quiz object with populated course/lesson
   */
  async getQuizById(id) {
    const response = await api.get(`/quiz/quizzes/${id}`)
    return response.data?.content
  },

  /**
   * Create a new quiz (Admin/Content Contributor only)
   * @param {Object} quizData - { title, description, courseId/lessonId, passingScore, timeLimitMinutes, maxAttempts }
   * @returns {Promise<Object>} Created quiz object
   */
  async createQuiz(quizData) {
    const response = await api.post('/quiz/quizzes', quizData)
    return response.data?.content
  },

  /**
   * Update an existing quiz (Admin/Content Contributor only)
   * Cannot update published quizzes
   * @param {string} id - Quiz ID
   * @param {Object} quizData - Updated quiz fields
   * @returns {Promise<Object>} Updated quiz object
   */
  async updateQuiz(id, quizData) {
    const response = await api.put(`/quiz/quizzes/${id}`, quizData)
    return response.data?.content
  },

  /**
   * Delete a quiz (Admin/Content Contributor only)
   * Cannot delete published quizzes or quizzes with attempts
   * @param {string} id - Quiz ID
   * @returns {Promise<Object>} Deleted quiz object
   */
  async deleteQuiz(id) {
    const response = await api.delete(`/quiz/quizzes/${id}`)
    return response.data?.content
  },

  /**
   * Publish a quiz (Admin only)
   * Requires at least one question
   * @param {string} id - Quiz ID
   * @returns {Promise<Object>} Published quiz object
   */
  async publishQuiz(id) {
    const response = await api.patch(`/quiz/quizzes/${id}/publish`)
    return response.data?.content
  },

  /**
   * Unpublish a quiz (Admin only)
   * Allows edits again
   * @param {string} id - Quiz ID
   * @returns {Promise<Object>} Unpublished quiz object
   */
  async unpublishQuiz(id) {
    const response = await api.patch(`/quiz/quizzes/${id}/unpublish`)
    return response.data?.content
  },
}

export default quizService
