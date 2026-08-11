import { Outlet, Navigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import AdminTopBar from '@/components/admin/AdminTopBar'
import AdminSidebar from '@/components/admin/AdminSidebar'

/**
 * AdminLayout Component
 * Fixed topbar and sidebar with scrollable main content area
 */
export default function AdminLayout() {
  const { user, status } = useAuth()

  // Redirect to home if not authenticated (modal will handle login)
  if (status !== 'authenticated' || !user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Fixed at top */}
      <AdminTopBar />

      {/* Main Layout - Sidebar + Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - Fixed, with internal scroll if needed */}
        <AdminSidebar />

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}