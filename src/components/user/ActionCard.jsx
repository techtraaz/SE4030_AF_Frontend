import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * ActionCard Component
 * Reusable card with icon, title, description and action button
 * Used for contributions, ways to get involved, etc.
 * @param {Object} icon - Lucide icon component
 * @param {string} title - Card title
 * @param {string} description - Card description
 * @param {string} action - Button text (optional)
 * @param {string} href - Link destination (optional)
 * @param {string} color - Icon background and text color classes
 * @param {Function} onClick - Click handler (optional)
 */
export default function ActionCard({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  href, 
  color = 'bg-blue-100 text-brand-blue',
  onClick 
}) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <CardHeader>
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4`}>
          <Icon className="h-7 w-7" />
        </div>
        <CardTitle className="text-xl text-brand-navy">{title}</CardTitle>
        <CardDescription className="text-brand-gray leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      {(action && (href || onClick)) && (
        <CardContent className="mt-auto">
          {href ? (
            <Link to={href}>
              <Button 
                variant="outline" 
                className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
              >
                {action}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button 
              variant="outline" 
              className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
              onClick={onClick}
            >
              {action}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}
