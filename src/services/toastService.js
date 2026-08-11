/**
 * Toast Service - Centralized toast notification handler
 * Wrapper around Sonner toast library for consistent notifications
 */

import { toast } from 'sonner'

export const toastService = {
  success: (message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      ...options,
    })
  },

  error: (message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      ...options,
    })
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...options,
    })
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Something went wrong',
      ...options,
    })
  },

  info: (message, options = {}) => {
    toast(message, {
      duration: 3000,
      ...options,
    })
  },

  warning: (message, options = {}) => {
    toast(message, {
      duration: 3500,
      icon: '⚠️',
      ...options,
    })
  },

  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  },
}

export default toastService
