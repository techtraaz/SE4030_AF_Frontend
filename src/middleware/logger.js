/**
 * Logger Middleware - Development Only
 * Logs dispatched actions + resulting state. No-op in production.
 */

export const logger = (store) => (next) => (action) => {
  if (import.meta.env?.DEV) {
    console.groupCollapsed(`[redux] ${action?.type}`)
    console.log('action:', action)
    const result = next(action)
    console.log('next state:', store.getState())
    console.groupEnd()
    return result
  }
  return next(action)
}

export default logger
