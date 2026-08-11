import api from '../axios'

/**
 * Enrollment API Service
 * Handles all enrollment-related API calls for refugees
 */

const enrollmentService = {
  /**
   * Enroll in a course
   * @param {string} courseId - Course ID to enroll in
   * @returns {Promise} - Enrollment object
   */
  async enrollInCourse(courseId) {
    const response = await api.post('/enrollments', { courseId })
    return response.data?.content
  },

  /**
   * Unenroll from a course
   * @param {string} courseId - Course ID to unenroll from
   * @returns {Promise} - Success confirmation
   */
  async unenrollFromCourse(courseId) {
    const response = await api.delete(`/enrollments/${courseId}`)
    return response.data?.content
  },

  /**
   * Get my enrollments with optional status filter
   * @param {string} status - Optional status filter (ACTIVE, COMPLETED, DROPPED)
   * @returns {Promise} - Array of enrollments
   */
  async getMyEnrollments(status = null) {
    const url = status ? `/enrollments?status=${status}` : '/enrollments'
    const response = await api.get(url)
    return response.data?.content || []
  },

  /**
   * Get enrollment details for a specific course
   * @param {string} courseId - Course ID
   * @returns {Promise} - Enrollment object with details
   */
  async getEnrollmentDetails(courseId) {
    const response = await api.get(`/enrollments/${courseId}`)
    return response.data?.content
  },

  /**
   * Update enrollment progress
   * @param {string} courseId - Course ID
   * @param {Object} progressData - Progress update data
   * @param {number} progressData.progress - Progress percentage (0-100)
   * @param {string} progressData.completedLessonId - Completed lesson ID
   * @returns {Promise} - Updated enrollment
   */
  async updateProgress(courseId, progressData) {
    const response = await api.patch(`/enrollments/${courseId}/progress`, progressData)
    return response.data?.content
  },

  /**
   * Check if enrolled in a course
   * @param {string} courseId - Course ID
   * @returns {Promise<boolean>} - True if enrolled
   */
  async checkEnrollmentStatus(courseId) {
    try {
      const response = await api.get(`/enrollments/${courseId}/status`)
      return response.data?.content?.isEnrolled || false
    } catch (error) {
      return false
    }
  },

  /**
   * Get enrollment statistics
   * @returns {Promise} - Statistics object
   */
  async getMyEnrollmentStats() {
    const response = await api.get('/enrollments/statistics')
    return response.data?.content
  }
}

export default enrollmentService
