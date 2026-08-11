import api from '../axios'

/**
 * Option Service - Handles quiz answer option operations
 * Backend: /api/quiz/options
 */
const optionService = {
  /**
   * Create a new option for a question
   * @param {Object} optionData - { questionId, optionText, isCorrect }
   * @returns {Promise<Object>} Created option object
   */
  async createOption(optionData) {
    const response = await api.post('/quiz/options', optionData)
    return response.data?.content
  },

  /**
   * Get all options for a question
   * @param {string} questionId - Question ID
   * @returns {Promise<Array>} Array of options
   */
  async getOptionsByQuestion(questionId) {
    const response = await api.get(`/quiz/options/question/${questionId}`)
    return response.data?.content || []
  },

  /**
   * Update an option (cannot update if quiz is published)
   * @param {string} id - Option ID
   * @param {Object} optionData - Updated option fields
   * @returns {Promise<Object>} Updated option object
   */
  async updateOption(id, optionData) {
    const response = await api.put(`/quiz/options/${id}`, optionData)
    return response.data?.content
  },

  /**
   * Delete an option (cannot delete last correct option)
   * @param {string} id - Option ID
   * @returns {Promise<Object>} Deleted option object
   */
  async deleteOption(id) {
    const response = await api.delete(`/quiz/options/${id}`)
    return response.data?.content
  },
}

export default optionService
