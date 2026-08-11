import { Card, CardContent } from '@/components/ui/card'

/**
 * StatCard Component
 * Reusable statistics card for displaying metrics
 * @param {Object} icon - Lucide icon component
 * @param {number|string} value - Statistic value
 * @param {string} label - Statistic label
 * @param {string} color - Background and text color classes
 */
export default function StatCard({ icon: Icon, value, label, color = 'bg-blue-100 text-brand-blue' }) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6 text-center">
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="text-3xl md:text-4xl font-bold text-brand-navy mb-2">
          {value.toLocaleString()}
        </div>
        <p className="text-brand-gray font-medium">
          {label}
        </p>
      </CardContent>
    </Card>
  )
}
