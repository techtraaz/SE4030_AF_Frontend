import api from '../axios'

/**
 * Video Section Service
 * Handles video section CRUD operations
 * Backend: /api/lessons/:lessonId/video
 */
const videoService = {
  /**
   * Create video section for a lesson
   * @param {string} lessonId - Lesson ID
   * @param {Object} data - { videoUrl, subtitlesUrl, estimatedMb }
   * @returns {Promise<Object>} Created video section
   */
  async createVideo(lessonId, data) {
    const response = await api.post(`/lessons/${lessonId}/video`, data)
    return response.data?.content
  },

  /**
   * Get video section for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Video section
   */
  async getVideo(lessonId) {
    const response = await api.get(`/lessons/${lessonId}/video`)
    return response.data?.content
  },

  /**
   * Update video section for a lesson
   * @param {string} lessonId - Lesson ID
   * @param {Object} data - Updated video data
   * @returns {Promise<Object>} Updated video section
   */
  async updateVideo(lessonId, data) {
    const response = await api.put(`/lessons/${lessonId}/video`, data)
    return response.data?.content
  },

  /**
   * Delete video section for a lesson
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Deleted video section
   */
  async deleteVideo(lessonId) {
    const response = await api.delete(`/lessons/${lessonId}/video`)
    return response.data?.content
  },
}

export default videoService
