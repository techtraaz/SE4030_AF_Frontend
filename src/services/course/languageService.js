import api from '../axios';

/**
 * Language Service
 * Handles all API calls related to languages
 */
const languageService = {
  /**
   * Get all active languages
   * @returns {Promise} - Languages array
   */
  async getAllLanguages() {
    const response = await api.get('/language');
    return response.data?.content || [];
  },

  /**
   * Get language by ID
   * @param {string} id - Language ID
   * @returns {Promise} - Language object
   */
  async getLanguageById(id) {
    const response = await api.get(`/language/${id}`);
    return response.data?.content;
  },

  /**
   * Create a new language (Admin only)
   * @param {Object} languageData - Language data
   * @returns {Promise} - Created language
   */
  async createLanguage(languageData) {
    const response = await api.post('/language', languageData);
    return response.data?.content;
  },

  /**
   * Update a language (Admin only)
   * @param {string} id - Language ID
   * @param {Object} languageData - Updated language data
   * @returns {Promise} - Updated language
   */
  async updateLanguage(id, languageData) {
    const response = await api.put(`/language/${id}`, languageData);
    return response.data?.content;
  },

  /**
   * Delete a language (Admin only)
   * @param {string} id - Language ID
   * @returns {Promise} - Delete confirmation
   */
  async deleteLanguage(id) {
    const response = await api.delete(`/language/${id}`);
    return response;
  }
};

export default languageService;
