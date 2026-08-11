import api from '../axios'

/**
 * Vocabulary Section Service
 * Handles vocabulary section CRUD operations
 * Backend: /api/lessons/:lessonId/vocabulary
 */
const vocabularyService = {
  /**
   * Create vocabulary section for a lesson
   * @param {string} lessonId - Lesson ID
   * @param {Object} data - { words: [{ word, meaning, exampleSentence, audioUrl, imageUrl }] }
   * @returns {Promise<Object>} Created vocabulary section
   */
  async createVocabulary(lessonId, data) {
    const response = await api.post(`/lessons/${lessonId}/vocabulary`, data)
    return response.data?.content
  },

  /**
   * Get vocabulary section for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Vocabulary section
   */
  async getVocabulary(lessonId) {
    const response = await api.get(`/lessons/${lessonId}/vocabulary`)
    return response.data?.content
  },

  /**
   * Update vocabulary section for a lesson
   * @param {string} lessonId - Lesson ID
   * @param {Object} data - Updated vocabulary data
   * @returns {Promise<Object>} Updated vocabulary section
   */
  async updateVocabulary(lessonId, data) {
    const response = await api.put(`/lessons/${lessonId}/vocabulary`, data)
    return response.data?.content
  },

  /**
   * Delete vocabulary section for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Deleted vocabulary section
   */
  async deleteVocabulary(lessonId) {
    const response = await api.delete(`/lessons/${lessonId}/vocabulary`)
    return response.data?.content
  },
}

export default vocabularyService
