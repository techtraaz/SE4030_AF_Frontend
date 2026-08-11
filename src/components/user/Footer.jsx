import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { footerData } from '@/data/homeData'
import logo from '@/assets/images/logo.png'

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center">
                <img 
                  src={logo} 
                  alt="Wordigo Logo" 
                  className="w-5 h-5 object-contain"
                />
              </div>
              <span className="text-2xl font-bold">Wordigo</span>
            </Link>
            <p className="text-gray-300 leading-relaxed max-w-md">
              {footerData.brand.description}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {footerData.social.map((social) => {
                const IconComponent = Icons[social.icon]
                return (
                  <a
                    key={social.icon}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-blue flex items-center justify-center transition-colors"
                    aria-label={social.icon}
                  >
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links Columns */}
          {footerData.sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-sm tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-brand-blue transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left max-w-2xl">
              {footerData.legal.note}
            </p>
            <div className="flex gap-6">
              {footerData.legal.links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">{footerData.copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}