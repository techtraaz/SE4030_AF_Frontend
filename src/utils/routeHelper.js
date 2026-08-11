/**
 * Route Helper Utilities
 * Provides role-based route generation to ensure consistent navigation
 */

/**
 * Get base path for a user role
 * @param {string} role - User role (REFUGEE, CONTENT_CONTRIBUTOR, ADMIN)
 * @returns {string} Base path for the role
 */
export const getBasePath = (role) => {
  switch (role) {
    case 'REFUGEE':
      return '/dashboard'
    case 'CONTENT_CONTRIBUTOR':
    case 'ADMIN':
      return '/admin'
    default:
      return '/dashboard'
  }
}

/**
 * Get role-specific route
 * @param {string} role - User role
 * @param {string} subPath - Subpath (e.g., 'profile', 'settings')
 * @returns {string} Full path for the route
 */
export const getRoleRoute = (role, subPath) => {
  const basePath = getBasePath(role)
  return `${basePath}/${subPath}`
}

/**
 * Check if user is on their correct base path
 * @param {string} role - User role
 * @param {string} currentPath - Current pathname
 * @returns {boolean} True if on correct base path
 */
export const isOnCorrectBasePath = (role, currentPath) => {
  const basePath = getBasePath(role)
  return currentPath.startsWith(basePath)
}
