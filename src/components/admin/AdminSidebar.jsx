import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { getSidebarMenuByRole, isMenuItemActive } from '@/config/sidebarConfig'
import useAuth from '@/hooks/useAuth'

/**
 * AdminSidebar Component
 * 
 * Features:
 * - Role-based menu rendering
 * - Active route highlighting
 * - Sticky/fixed positioning
 * - Section grouping with headers
 * - Smooth hover transitions
 * - Accessible keyboard navigation
 * - Responsive design
 * 
 * Props:
 * - className: Optional additional CSS classes
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} Sidebar component
 */
export default function AdminSidebar({ className }) {
  const { user } = useAuth()
  const location = useLocation()

  // Get menu items based on user role
  const menuSections = getSidebarMenuByRole(user?.role)

  if (!user) return null

  return (
    <aside
      className={cn(
        'w-[200px] bg-white border-r border-gray-200 h-full overflow-y-auto',
        className
      )}
    >
      <nav className="py-6 px-3">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-8' : ''}>
            {/* Section Header */}
            {section.section && (
              <div className="px-3 mb-3">
                <h3 className="text-[10px] font-bold text-brand-gray tracking-wider uppercase">
                  {section.section}
                </h3>
              </div>
            )}

            {/* Menu Items */}
            <ul className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon
                const isActive = isMenuItemActive(item.href, location.pathname)

                return (
                  <li key={itemIndex}>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-brand-blue text-white shadow-sm'
                          : 'text-brand-navy hover:bg-gray-50 hover:text-brand-blue'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 flex-shrink-0',
                          isActive ? 'text-white' : 'text-brand-gray'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}