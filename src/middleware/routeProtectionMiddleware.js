/**
 * Route Protection Middleware - Checks authentication before accessing protected routes
 * Used with React Router to protect admin and user routes
 */

export const isAuthenticated = () => {
  const token = sessionStorage.getItem('token')
  return !!token
}

export const getUserRole = () => {
  const auth = sessionStorage.getItem('auth')
  if (!auth) return null
  try {
    const user = JSON.parse(auth)
    return user.role || user.userType || null
  } catch (error) {
    console.error('Error parsing auth data:', error)
    return null
  }
}

export const isAdmin = () => {
  const role = getUserRole()
  return role === 'admin' || role === 'ADMIN'
}

export const isUser = () => {
  const role = getUserRole()
  return role === 'user' || role === 'USER' || role === 'student'
}

export default {
  isAuthenticated,
  getUserRole,
  isAdmin,
  isUser,
}
