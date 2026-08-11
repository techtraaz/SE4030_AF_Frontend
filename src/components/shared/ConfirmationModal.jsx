import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, FileX, AlertCircle } from 'lucide-react'

/**
 * ConfirmationModal - Reusable confirmation dialog
 * Supports different variants for different use cases
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default', // 'default' | 'danger' | 'warning'
  type = 'delete', // 'delete' | 'warning' | 'info'
  loading = false,
  itemName = '', // Name of the item being acted upon
}) => {
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="h-12 w-12 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />
      case 'info':
        return <AlertCircle className="h-12 w-12 text-blue-500" />
      default:
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />
    }
  }

  const getButtonVariant = () => {
    if (variant === 'danger' || type === 'delete') {
      return 'destructive'
    }
    return 'default'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center">
          <div className="mb-4">{getIcon()}</div>
          <DialogTitle className="text-center text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {message}
            {itemName && (
              <span className="block mt-2 font-semibold text-brand-navy">
                "{itemName}"
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationModal
