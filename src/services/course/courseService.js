import api from '../axios'

/**
 * Course API Service
 * Handles all course-related API calls
 */

const courseService = {
  /**
   * Get all courses with optional filters
   * @param {Object} filters - Optional filters
   * @param {string} filters.categoryId - Filter by category ID
   * @param {string} filters.level - Filter by level (Beginner, Intermediate, Advanced) [legacy]
   * @param {string} filters.levelId - Filter by level ID [new]
   * @param {string} filters.language - Filter by language [legacy]
   * @param {string} filters.languageId - Filter by language ID [new]
   * @param {string} filters.createdById - Filter by creator ID
   * @param {boolean} filters.isPublished - Filter by published status
   * @param {string} filters.search - Search term for course title
   * @returns {Promise} - Course array
   */
  async getAllCourses(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.categoryId) params.append('categoryId', filters.categoryId)
    if (filters.level) params.append('level', filters.level)
    if (filters.levelId) params.append('levelId', filters.levelId)
    if (filters.language) params.append('language', filters.language)
    if (filters.languageId) params.append('languageId', filters.languageId)
    if (filters.createdById) params.append('createdById', filters.createdById)
    if (filters.isPublished !== undefined) params.append('isPublished', filters.isPublished)
    
    const queryString = params.toString()
    const url = `/course${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get(url)
    return response.data?.content || []
  },

  /**
   * Get a single course by ID
   * @param {string} id - Course ID
   * @returns {Promise} - Course object
   */
  async getCourseById(id) {
    const response = await api.get(`/course/${id}`)
    return response.data?.content
  },

  /**
   * Create a new course
   * @param {Object} courseData - Course data
   * @returns {Promise} - Created course
   */
  async createCourse(courseData) {
    const response = await api.post('/course', courseData)
    return response.data?.content
  },

  /**
   * Update a course
   * @param {string} id - Course ID
   * @param {Object} courseData - Updated course data
   * @returns {Promise} - Updated course
   */
  async updateCourse(id, courseData) {
    const response = await api.put(`/course/${id}`, courseData)
    return response.data?.content
  },

  /**
   * Delete a course
   * @param {string} id - Course ID
   * @returns {Promise} - Delete confirmation
   */
  async deleteCourse(id) {
    const response = await api.delete(`/course/${id}`)
    return response.data?.content
  },

  /**
   * Publish a course
   * @param {string} id - Course ID
   * @returns {Promise} - Updated course
   */
  async publishCourse(id) {
    const response = await api.patch(`/course/${id}/publish`)
    return response.data?.content
  },

  /**
   * Unpublish a course
   * @param {string} id - Course ID
   * @returns {Promise} - Updated course
   */
  async unpublishCourse(id) {
    const response = await api.patch(`/course/${id}/unpublish`)
    return response.data?.content
  },

  /**
   * Get courses by creator
   * @param {string} creatorId - Creator user ID
   * @returns {Promise} - Course array
   */
  async getCoursesByCreator(creatorId) {
    const response = await api.get(`/course/creator/${creatorId}`)
    return response.data?.content || []
  },

  /**
   * Get course statistics
   * @param {string} id - Course ID
   * @returns {Promise} - Course statistics
   */
  async getCourseStatistics(id) {
    const response = await api.get(`/course/${id}/statistics`)
    return response.data?.content
  },

  /**
   * Get global course statistics
   * @returns {Promise} - Global statistics
   */
  async getGlobalStatistics() {
    const response = await api.get('/course/statistics/global')
    return response.data?.content
  }
}

export default courseService
