import api from '../axios'

/**
 * Category API Service
 * Handles all category-related API calls
 */

const categoryService = {
  /**
   * Get all categories
   * @returns {Promise} - Category array
   */
  async getAllCategories() {
    const response = await api.get('/categories')
    return response.data.content || []
  },

  /**
   * Get a single category by ID
   * @param {string} id - Category ID
   * @returns {Promise} - Category object
   */
  async getCategoryById(id) {
    const response = await api.get(`/categories/${id}`)
    return response.data.content
  },

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Promise} - Created category
   */
  async createCategory(categoryData) {
    const response = await api.post('/categories', categoryData)
    return response.data.content
  },

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise} - Updated category
   */
  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData)
    return response.data.content
  },

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise} - Delete confirmation
   */
  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  }
}

export default categoryService
