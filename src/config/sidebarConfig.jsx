import {
  BookOpen,
  BarChart3,
  FolderOpen,
  HelpCircle,
  Users,
  Settings,
  FileText,
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  User,
  BookMarked,
  ListChecks,
  FolderTree,
  Library,
  Languages
} from 'lucide-react'

/**
 * Sidebar Configuration
 * 
 * Defines menu items for different user roles
 * Each role has its own navigation structure
 * 
 * Structure:
 * - section: Optional group heading (e.g., "MANAGEMENT")
 * - icon: Lucide React icon component
 * - label: Display text
 * - href: Navigation path
 * - roles: Array of roles that can see this item
 */

export const sidebarConfig = {
  // Content Contributor Menu Items
  CONTENT_CONTRIBUTOR: [
    {
      section: 'OVERVIEW',
      items: [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          href: '/admin/dashboard'
        }
      ]
    },
    {
      section: 'MANAGEMENT',
      items: [
        {
          icon: BookOpen,
          label: 'My Courses',
          href: '/admin/my-courses'
        },
        {
          icon: BookMarked,
          label: 'My Lessons',
          href: '/admin/my-lessons'
        },
        {
          icon: ListChecks,
          label: 'My Quizzes',
          href: '/admin/my-quizzes'
        },
        {
          icon: MessageSquare,
          label: 'Forums',
          href: '/admin/forums'
        },
        {
          icon: Library,
          label: 'Digital Library',
          href: '/admin/digital-library'
        }
      ]
    },
    {
      section: 'SETTINGS',
      items:[
        {
          icon: User,
          label: 'Profile',
          href: '/admin/profile'
        }
      ],
    }
  ],

  // Admin Menu Items (for future implementation)
  ADMIN: [
    {
      section: 'DASHBOARD',
      items: [
        {
          icon: LayoutDashboard,
          label: 'Overview',
          href: '/admin/dashboard'
        }
      ]
    },
    {
      section: 'MANAGEMENT',
      items: [
        {
          icon: Users,
          label: 'Users',
          href: '/admin/users'
        },
        {
          icon: BookOpen,
          label: 'Courses',
          href: '/admin/courses'
        },
        {
          icon: MessageSquare,
          label: 'Forums',
          href: '/admin/forums'
        }
      ]
    },
    {
      section: 'SYSTEM',
      items: [
        {
          icon: Settings,
          label: 'Settings',
          href: '/admin/settings'
        }
      ]
    }
  ],

  // Moderator Menu Items (for future implementation)
  MODERATOR: [
    {
      section: 'MANAGEMENT',
      items: [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          href: '/admin/dashboard'
        },
        {
          icon: MessageSquare,
          label: 'Moderation',
          href: '/admin/moderation'
        },
        {
          icon: Users,
          label: 'Users',
          href: '/admin/users'
        },
        {
          icon: FileText,
          label: 'Reports',
          href: '/admin/reports'
        },
        {
          icon: HelpCircle,
          label: 'Support',
          href: '/admin/support'
        }
      ]
    }
  ],

  // Instructor Menu Items (for future implementation)
  INSTRUCTOR: [
    {
      section: 'TEACHING',
      items: [
        {
          icon: GraduationCap,
          label: 'My Classes',
          href: '/admin/my-classes'
        },
        {
          icon: BookOpen,
          label: 'Course Material',
          href: '/admin/course-material'
        },
        {
          icon: Users,
          label: 'Students',
          href: '/admin/students'
        },
        {
          icon: BarChart3,
          label: 'Performance',
          href: '/admin/performance'
        }
      ]
    },
    {
      section: 'RESOURCES',
      items: [
        {
          icon: FolderOpen,
          label: 'Resources',
          href: '/admin/resources'
        },
        {
          icon: HelpCircle,
          label: 'Support',
          href: '/admin/support'
        }
      ]
    }
  ],

  // Refugee Menu Items
  REFUGEE: [
    {
      section: 'OVERVIEW',
      items: [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          href: '/dashboard',
          description: 'Your learning overview'
        }
      ]
    },
    {
      section: 'LEARNING',
      items: [
        {
          icon: BookOpen,
          label: 'My Courses',
          href: '/dashboard/my-courses',
          description: 'View enrolled and available courses'
        },
        {
          icon: MessageSquare,
          label: 'My Forums',
          href: '/dashboard/my-forums',
          description: 'Forums I have joined'
        },
        {
          icon: BarChart3,
          label: 'My Progress',
          href: '/dashboard/progress'
        }
      ]
    },
    {
      section: 'RESOURCES',
      items: [
        {
          icon: Library,
          label: 'Digital Library',
          href: '/dashboard/digital-library'
        },
        {
          icon: Languages,
          label: 'Translate',
          href: '/dashboard/translate',
        }
      ]
    },
    {
      section: 'PROFILE',
      items:[
        {
          icon: User,
          label: 'Profile',
          href: '/dashboard/profile'
        }
      ],
    }
  ]
}

/**
 * Get sidebar menu items for a specific role
 * @param {string} role - User role (e.g., 'CONTENT_CONTRIBUTOR', 'ADMIN', 'REFUGEE')
 * @returns {Array} Menu sections with items
 */
export const getSidebarMenuByRole = (role) => {
  return sidebarConfig[role] || sidebarConfig.REFUGEE || []
}

/**
 * Get dashboard title based on user role
 * @param {string} role - User role
 * @returns {string} Dashboard title
 */
export const getDashboardTitle = (role) => {
  const titles = {
    ADMIN: 'Admin Dashboard',
    CONTENT_CONTRIBUTOR: 'Content Creator',
    REFUGEE: 'Learning Dashboard',
    MODERATOR: 'Moderator Dashboard',
    INSTRUCTOR: 'Instructor Dashboard'
  }
  return titles[role] || 'Dashboard'
}

/**
 * Get area label based on user role
 * @param {string} role - User role
 * @returns {string} Area label
 */
export const getAreaLabel = (role) => {
  const labels = {
    ADMIN: 'Admin Area',
    CONTENT_CONTRIBUTOR: 'Creator Studio',
    REFUGEE: 'My Learning',
    MODERATOR: 'Moderation Area',
    INSTRUCTOR: 'Teaching Area'
  }
  return labels[role] || 'Dashboard'
}

/**
 * Check if a menu item is active based on current path
 * @param {string} href - Menu item href
 * @param {string} currentPath - Current pathname
 * @returns {boolean} True if item is active
 */
export const isMenuItemActive = (href, currentPath) => {
  // Exact match
  if (href === currentPath) return true
  
  // For root paths, only match exactly (don't match sub-routes)
  if (href === '/' || href === '/dashboard' || href === '/admin') {
    return false
  }
  
  // Special handling: highlight "My Forums" when viewing forum details or posts
  if (href === '/dashboard/my-forums' && 
      (currentPath.includes('/dashboard/forum/') || currentPath.includes('/dashboard/post/'))) {
    return true
  }

  // Special handling: highlight "Forums" admin menu when viewing forum details from admin
  if (href === '/admin/forums' && currentPath.includes('/dashboard/forum/')) {
    return true
  }
  
  // Check if current path starts with menu href and next character is '/' or end of string
  // This allows /admin/courses to match /admin/courses/123 but not /admin/courses-new
  if (currentPath.startsWith(href)) {
    const nextChar = currentPath.charAt(href.length)
    return nextChar === '/' || nextChar === '' || nextChar === '?'
  }
  
  return false
}