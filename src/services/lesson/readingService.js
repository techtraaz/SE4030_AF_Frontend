import api from '../axios'

/**
 * Reading Section Service
 * Handles reading section CRUD operations
 * Backend: /api/lessons/:lessonId/reading
 */
const readingService = {
  /**
   * Create reading section for a lesson
   * @param {string} lessonId - Lesson ID
   * @param {Object} data - { content, highlightWords: [{ word, meaning, translation }] }
   * @returns {Promise<Object>} Created reading section
   */
  async createReading(lessonId, data) {
    const response = await api.post(`/lessons/${lessonId}/reading`, data)
    return response.data?.content
  },

  /**
   * Get reading section for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Reading section
   */
  async getReading(lessonId) {
    const response = await api.get(`/lessons/${lessonId}/reading`)
    return response.data?.content
  },

  /**
   * Update reading section for a lesson
   * @param {string} lessonId - Lesson ID
   * @param {Object} data - Updated reading data
   * @returns {Promise<Object>} Updated reading section
   */
  async updateReading(lessonId, data) {
    const response = await api.put(`/lessons/${lessonId}/reading`, data)
    return response.data?.content
  },

  /**
   * Delete reading section for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Deleted reading section
   */
  async deleteReading(lessonId) {
    const response = await api.delete(`/lessons/${lessonId}/reading`)
    return response.data?.content
  },
}

export default readingService
