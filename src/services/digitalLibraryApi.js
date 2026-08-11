import api from './axios';

export const digitalLibraryApi = {
  // GET ALL Content
  getAllContent: async (params) => {
    const response = await api.get('/digital-library', { params });
    return response.data?.data || response.data?.content || [];
  },

  // UPLOAD Content (Must handle multipart/form-data)
  uploadContent: async (data) => {
    // Avoid passing FormData through Redux, construct it here to ensure it survives.
    const payload = new FormData();
    payload.append('title', data.title);
    payload.append('description', data.description || '');
    payload.append('category', data.category || 'General');
    payload.append('contentType', data.contentType);
    payload.append('file', data.file);

    const response = await api.post('/digital-library/upload', payload);
    return response.data?.data || response.data?.content || response.data;
  },

  // UPDATE Content
  updateContent: async (id, data) => {
    const payload = new FormData();
    if (data.title) payload.append('title', data.title);
    if (data.description) payload.append('description', data.description);
    if (data.category) payload.append('category', data.category);
    if (data.contentType) payload.append('contentType', data.contentType);
    if (data.file) payload.append('file', data.file);

    const response = await api.put(`/digital-library/${id}`, payload);    return response.data?.data || response.data?.content || response.data;
  },
  // DELETE Content
  deleteContent: async (id) => {
    const response = await api.delete(`/digital-library/${id}`);
    return response.data?.data || response.data?.content || response.data;
  },
};


