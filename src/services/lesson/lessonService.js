import api from '../axios'

/**
 * Lesson Service - Handles all lesson CRUD operations
 * Follows backend API structure from /api/lessons
 */
const lessonService = {
  /**
   * Get all lessons with optional filters
   * @param {Object} filters - { courseId, categoryId }
   * @returns {Promise<Array>} Array of lesson objects
   */
  async getAllLessons(filters = {}) {
    const params = new URLSearchParams()
    if (filters.courseId) params.append('courseId', filters.courseId)
    if (filters.categoryId) params.append('categoryId', filters.categoryId)
    
    const response = await api.get(`/lessons${params.toString() ? `?${params}` : ''}`)
    return response.data?.content || []
  },

  /**
   * Get a single lesson by ID with all sections populated
   * @param {string} id - Lesson ID
   * @returns {Promise<Object>} Lesson object with populated sections
   */
  async getLessonById(id) {
    const response = await api.get(`/lessons/${id}`)
    return response.data?.content
  },

  /**
   * Create a new lesson (Content Contributor only)
   * @param {Object} lessonData - { courseId, categoryId, title, description, difficulty, estimatedMinutes, order, thumbnail }
   * @returns {Promise<Object>} Created lesson object
   */
  async createLesson(lessonData) {
    const response = await api.post('/lessons', lessonData)
    return response.data?.content
  },

  /**
   * Update an existing lesson (Content Contributor only)
   * @param {string} id - Lesson ID
   * @param {Object} lessonData - Updated lesson fields
   * @returns {Promise<Object>} Updated lesson object
   */
  async updateLesson(id, lessonData) {
    const response = await api.put(`/lessons/${id}`, lessonData)
    return response.data?.content
  },

  /**
   * Delete a lesson (Content Contributor only)
   * Cascades to all sections
   * @param {string} id - Lesson ID
   * @returns {Promise<Object>} Deleted lesson object
   */
  async deleteLesson(id) {
    const response = await api.delete(`/lessons/${id}`)
    return response.data?.content
  },

  /**
   * Publish a lesson (Content Contributor only)
   * Requires all 4 sections (reading, listening, vocabulary, video) to exist
   * @param {string} id - Lesson ID
   * @returns {Promise<Object>} Published lesson object
   */
  async publishLesson(id) {
    const response = await api.patch(`/lessons/${id}/publish`)
    return response.data?.content
  },

  /**
   * Unpublish a lesson (Content Contributor only)
   * @param {string} id - Lesson ID
   * @returns {Promise<Object>} Unpublished lesson object
   */
  async unpublishLesson(id) {
    const response = await api.patch(`/lessons/${id}/unpublish`)
    return response.data?.content
  },
}

export default lessonService
