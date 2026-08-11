import api from '../axios'

/**
 * Quiz Attempt Service - Handles quiz taking and attempt history
 * Backend: /api/quiz/attempts
 */
const quizAttemptService = {
  /**
   * Submit a quiz attempt
   * @param {Object} attemptData - { quizId, responses: [{ questionId, selectedOptionId/selectedOptionIds }], timeTakenSeconds }
   * @returns {Promise<Object>} Attempt result with score and pass status
   */
  async submitQuizAttempt(attemptData) {
    const response = await api.post('/quiz/attempts', attemptData)
    return response.data?.content
  },

  /**
   * Get a specific attempt by ID with all responses
   * @param {string} id - Attempt ID
   * @returns {Promise<Object>} Attempt object with responses
   */
  async getAttemptById(id) {
    const response = await api.get(`/quiz/attempts/${id}`)
    return response.data?.content
  },

  /**
   * Get all attempts by a specific user (refugee)
   * @param {string} refugeeId - User ID
   * @param {string} quizId - Optional quiz filter
   * @returns {Promise<Array>} Array of attempts
   */
  async getUserQuizAttempts(refugeeId, quizId = null) {
    const url = quizId 
      ? `/quiz/attempts/user/${refugeeId}?quizId=${quizId}`
      : `/quiz/attempts/user/${refugeeId}`
    
    const response = await api.get(url)
    return response.data?.content || []
  },

  /**
   * Get quiz statistics (Admin/Content Contributor only)
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>} Statistics object { totalAttempts, averageScore, passRate, highestScore, lowestScore }
   */
  async getQuizStatistics(quizId) {
    const response = await api.get(`/quiz/attempts/quiz/${quizId}/statistics`)
    return response.data?.content
  },
}

export default quizAttemptService
