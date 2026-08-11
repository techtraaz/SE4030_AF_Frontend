import api from '../axios'

/**
 * Listening Section Service
 * Handles listening section CRUD operations
 * Backend: /api/lessons/:lessonId/listening
 */
const listeningService = {
  /**
   * Create listening section for a lesson
   * @param {string} lessonId - Lesson ID
   * @param {Object} data - { audioUrl, slowAudioUrl, transcript }
   * @returns {Promise<Object>} Created listening section
   */
  async createListening(lessonId, data) {
    const response = await api.post(`/lessons/${lessonId}/listening`, data)
    return response.data?.content
  },

  /**
   * Get listening section for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Listening section
   */
  async getListening(lessonId) {
    const response = await api.get(`/lessons/${lessonId}/listening`)
    return response.data?.content
  },

  /**
   * Update listening section for a lesson
   * @param {string} lessonId - Lesson ID
   * @param {Object} data - Updated listening data
   * @returns {Promise<Object>} Updated listening section
   */
  async updateListening(lessonId, data) {
    const response = await api.put(`/lessons/${lessonId}/listening`, data)
    return response.data?.content
  },

  /**
   * Delete listening section for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Deleted listening section
   */
  async deleteListening(lessonId) {
    const response = await api.delete(`/lessons/${lessonId}/listening`)
    return response.data?.content
  },
}

export default listeningService
