import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Users as UsersIcon, Mail, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toastService } from '@/services/toastService'
import adminService from '@/services/adminService'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import useAuth from '@/hooks/useAuth'
import { format } from 'date-fns'

/**
 * Users Page - Admin page for managing content contributor approvals
 * Shows pending contributor requests and allows approve/reject actions
 */
export default function Users() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionType, setActionType] = useState(null) // 'approve' or 'reject'
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Validate user role on mount (Admin only)
  useEffect(() => {
    if (!user) {
      toastService.error('Please log in to access this page')
      navigate('/')
      return
    }
    
    if (user.role !== 'ADMIN') {
      toastService.error('This page is only accessible to administrators')
      navigate('/admin/dashboard')
      return
    }
  }, [user, navigate])

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchPendingContributors()
    }
  }, [user])

  const fetchPendingContributors = async () => {
    try {
      setLoading(true)
      const users = await adminService.getPendingContributors()
      setPendingUsers(users)
    } catch (error) {
      toastService.error('Failed to fetch pending contributors')
    } finally {
      setLoading(false)
    }
  }

  const openConfirmDialog = (user, action) => {
    setSelectedUser(user)
    setActionType(action)
    setIsDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedUser || !actionType) return

    try {
      setProcessing(true)
      const displayName = selectedUser.firstName && selectedUser.lastName 
        ? `${selectedUser.firstName} ${selectedUser.lastName}` 
        : selectedUser.email
      
      if (actionType === 'approve') {
        await adminService.approveContributor(selectedUser._id)
        toastService.success(`${displayName} has been approved as a content contributor`)
      } else if (actionType === 'reject') {
        await adminService.rejectContributor(selectedUser._id)
        toastService.success(`${displayName}'s request has been rejected`)
      }

      // Refresh the list
      fetchPendingContributors()
      setIsDialogOpen(false)
      setSelectedUser(null)
      setActionType(null)
    } catch (error) {
      // Error already handled by interceptor
      console.error('Action failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton text="Loading pending contributors..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage content contributor requests
        </p>
      </div>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-brand-blue" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {pendingUsers.length}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {pendingUsers.length === 1 ? 'user waiting' : 'users waiting'} for approval
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Pending Contributors List */}
      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground text-center">
              No pending contributor requests at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map((user, index) => {
            console.log(`DEBUG User ${index}:`, { 
              _id: user._id, 
              email: user.email, 
              firstName: user.firstName, 
              lastName: user.lastName,
              allKeys: Object.keys(user)
            });
            return (
              <Card key={user._id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* User Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {/* Show full name if available, otherwise fallback to email */}
                        {(user.firstName || user.lastName) ? (
                          <>
                            <h3 className="font-semibold text-lg">
                              {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                            </h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </>
                        ) : (
                          <h3 className="font-semibold text-lg">{user.email}</h3>
                        )}
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-700">
                        Pending
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Requested {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {user.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Button
                      size="sm"
                      className="flex-1 lg:flex-initial bg-green-600 hover:bg-green-700"
                      onClick={() => openConfirmDialog(user, 'approve')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 lg:flex-initial"
                      onClick={() => openConfirmDialog(user, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Contributor' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' ? (
                <>
                  Are you sure you want to approve <strong>
                    {selectedUser?.firstName && selectedUser?.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                      : selectedUser?.email}
                  </strong> as a content contributor?
                  They will be able to create and manage courses, lessons, and quizzes.
                </>
              ) : (
                <>
                  Are you sure you want to reject <strong>
                    {selectedUser?.firstName && selectedUser?.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                      : selectedUser?.email}
                  </strong>'s request?
                  This action will mark their account as rejected.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={processing}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
