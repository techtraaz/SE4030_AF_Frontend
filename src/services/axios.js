import axios from 'axios'
import { handleErrorByType } from './errorHandler.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle all errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')

    // Show error toast globally - interceptor handles ALL errors
    handleErrorByType(error)

    // Clear auth state and redirect for 401 errors (if not auth endpoint)
    if (status === 401 && !isAuthEndpoint) {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('auth')
      window.location.href = '/'
    }

    return Promise.reject(error)
  }
)

export default api