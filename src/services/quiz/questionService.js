import api from '../axios'

/**
 * Question Service - Handles quiz question operations
 * Backend: /api/quiz/questions
 */
const questionService = {
  /**
   * Create a new question with optional options
   * @param {Object} questionData - { quizId, questionText, type, explanation, points, order, options: [] }
   * @returns {Promise<Object>} Created question object
   */
  async createQuestion(questionData) {
    const response = await api.post('/quiz/questions', questionData)
    return response.data?.content
  },

  /**
   * Get all questions for a quiz
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Array>} Array of questions with options
   */
  async getAllQuestionsByQuiz(quizId) {
    const response = await api.get(`/quiz/questions/quiz/${quizId}`)
    return response.data?.content || []
  },

  /**
   * Get a single question by ID with options
   * @param {string} id - Question ID
   * @returns {Promise<Object>} Question object with options
   */
  async getQuestionById(id) {
    const response = await api.get(`/quiz/questions/${id}`)
    return response.data?.content
  },

  /**
   * Update a question (cannot update if quiz is published)
   * @param {string} id - Question ID
   * @param {Object} questionData - Updated question fields
   * @returns {Promise<Object>} Updated question object
   */
  async updateQuestion(id, questionData) {
    const response = await api.put(`/quiz/questions/${id}`, questionData)
    return response.data?.content
  },

  /**
   * Delete a question (cannot delete if quiz is published)
   * @param {string} id - Question ID
   * @returns {Promise<Object>} Deleted question object
   */
  async deleteQuestion(id) {
    const response = await api.delete(`/quiz/questions/${id}`)
    return response.data?.content
  },

  /**
   * Reorder questions in a quiz
   * @param {string} quizId - Quiz ID
   * @param {Array} questions - Array of { questionId, order }
   * @returns {Promise<Array>} Array of reordered questions
   */
  async reorderQuestions(quizId, questions) {
    const response = await api.patch(`/quiz/questions/quiz/${quizId}/reorder`, { questions })
    return response.data?.content || []
  },
}

export default questionService
