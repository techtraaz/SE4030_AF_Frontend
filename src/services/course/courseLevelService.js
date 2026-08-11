import api from '../axios';

/**
 * Course Level Service
 * Handles all API calls related to course levels
 */
const courseLevelService = {
  /**
   * Get all active course levels
   * @returns {Promise} - Course levels array
   */
  async getAllLevels() {
    const response = await api.get('/course-level');
    return response.data?.content || [];
  },

  /**
   * Get course level by ID
   * @param {string} id - Level ID
   * @returns {Promise} - Course level object
   */
  async getLevelById(id) {
    const response = await api.get(`/course-level/${id}`);
    return response.data?.content;
  },

  /**
   * Create a new course level (Admin only)
   * @param {Object} levelData - Level data
   * @returns {Promise} - Created level
   */
  async createLevel(levelData) {
    const response = await api.post('/course-level', levelData);
    return response.data?.content;
  },

  /**
   * Update a course level (Admin only)
   * @param {string} id - Level ID
   * @param {Object} levelData - Updated level data
   * @returns {Promise} - Updated level
   */
  async updateLevel(id, levelData) {
    const response = await api.put(`/course-level/${id}`, levelData);
    return response.data?.content;
  },

  /**
   * Delete a course level (Admin only)
   * @param {string} id - Level ID
   * @returns {Promise} - Delete confirmation
   */
  async deleteLevel(id) {
    const response = await api.delete(`/course-level/${id}`);
    return response;
  }
};

export default courseLevelService;
