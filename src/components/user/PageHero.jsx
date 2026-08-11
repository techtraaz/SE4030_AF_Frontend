/**
 * PageHero Component
 * Reusable hero section for public pages
 * @param {Object} icon - Lucide icon component
 * @param {string} title - Hero title text
 * @param {string} description - Hero description text
 * @param {string} gradient - Optional gradient class (default: brand-blue to brand-blue-deep)
 */
export default function PageHero({ icon: Icon, title, description, gradient = 'from-brand-blue to-brand-blue-deep' }) {
  return (
    <section className={`bg-gradient-to-r ${gradient} text-white py-20`}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {Icon && <Icon className="h-16 w-16 mx-auto mb-6 opacity-90" />}
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {title}
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
