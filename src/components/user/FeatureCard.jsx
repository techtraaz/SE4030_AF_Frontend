import * as Icons from 'lucide-react'

export default function FeatureCard({ icon, iconColor, title, description }) {
  const IconComponent = Icons[icon]
  
  return (
    <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white hover:shadow-lg transition-shadow duration-300">
      <div className={`w-16 h-16 ${iconColor} rounded-2xl flex items-center justify-center mb-6`}>
        {IconComponent && <IconComponent className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-bold text-brand-navy mb-3">{title}</h3>
      <p className="text-brand-gray leading-relaxed">{description}</p>
    </div>
  )
}