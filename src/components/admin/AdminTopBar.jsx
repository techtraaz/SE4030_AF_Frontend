import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { LogOut, User, Settings, Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { logoutUser, clearUser } from '@/features/auth/authSlice'
import { getAreaLabel } from '@/config/sidebarConfig'
import { getRoleRoute } from '@/utils/routeHelper'
import useAuth from '@/hooks/useAuth'
import api from '@/services/axios'
import logo from '@/assets/images/logo.png'

/**
 * AdminTopBar Component
 * 
 * Features:
 * - User avatar with initials from email
 * - Role display from Redux state
 * - Dropdown menu with profile/settings/logout
 * - Responsive design
 * - Industry-standard structure for API integration
 */
export default function AdminTopBar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, status } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [profileFullName, setProfileFullName] = useState('')

  useEffect(() => {
    const fetchProfileName = async () => {
      if (status !== 'authenticated' || !user || user.role !== 'REFUGEE') {
        setProfileFullName('')
        return
      }

      try {
        const res = await api.get('/profile/get')
        setProfileFullName(res?.data?.content?.fullName?.trim() || '')
      } catch {
        // Fall back to auth payload name fields when profile fetch fails.
        setProfileFullName('')
      }
    }

    fetchProfileName()
  }, [status, user?._id, user?.role])

  const getDisplayName = (userData) => {
    if (!userData) return 'User'

    const fullName = userData.fullName?.trim()
    if (fullName) return fullName

    const firstName = userData.firstName?.trim()
    const lastName = userData.lastName?.trim()
    if (firstName || lastName) return `${firstName || ''} ${lastName || ''}`.trim()

    const name = userData.name?.trim()
    if (name) return name

    if (userData.email) {
      const emailName = userData.email.split('@')[0]
      return emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._-]/g, ' ')
    }

    return 'User'
  }

  const getInitials = (displayName) => {
    if (!displayName) return 'U'
    const parts = displayName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  // Format role for display
  const formatRole = (role) => {
    if (!role) return 'User'
    return role
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await dispatch(logoutUser()).unwrap()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
      // Clear state and navigate anyway
      dispatch(clearUser())
      navigate('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) return null

  const userName = profileFullName || getDisplayName(user)
  const userInitials = getInitials(userName)
  const userRole = formatRole(user.role)

  const areaLabel = getAreaLabel(user.role)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Logo & Area Label */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label="Go to home page"
          >
            <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center">
              <img 
                src={logo} 
                alt="Wordigo Logo" 
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-xl font-bold text-brand-navy">Wordigo</span>
          </button>
          <Badge variant="outline" className="text-xs font-medium">
            {areaLabel}
          </Badge>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-4">
          {/* User Info and Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-semibold text-sm">
                  {userInitials}
                </div>
                
                {/* User Info - Hidden on mobile */}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-brand-navy leading-tight">
                    {userName}
                  </span>
                  <span className="text-xs text-brand-gray leading-tight">
                    {userRole}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-brand-blue font-semibold mt-1">
                    {userRole}
                  </p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => navigate(getRoleRoute(user.role, 'profile'))}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => navigate(getRoleRoute(user.role, 'settings'))}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut || status === 'loading'}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}