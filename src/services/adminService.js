import api from './axios'

/**
 * Admin Service - Handles admin-specific operations
 * Backend: /api/admin
 */
const adminService = {
  /**
   * Get all pending content contributor requests
   * @returns {Promise<Array>} Array of pending users
   */
  async getPendingContributors() {
    const response = await api.get('/admin/contributors/pending')
    const users = response.data?.content || []
    return users
  },

  /**
   * Approve a pending content contributor
   * @param {string} userId - User ID to approve
   * @returns {Promise<Object>} Updated user object
   */
  async approveContributor(userId) {
    const response = await api.patch(`/admin/contributors/${userId}/approve`)
    return response.data?.content
  },

  /**
   * Reject a pending content contributor
   * @param {string} userId - User ID to reject
   * @returns {Promise<Object>} Updated user object
   */
  async rejectContributor(userId) {
    const response = await api.patch(`/admin/contributors/${userId}/reject`)
    return response.data?.content
  },
}

export default adminService
