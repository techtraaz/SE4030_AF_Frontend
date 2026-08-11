import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import FeatureCard from '@/components/user/FeatureCard'
import TestimonialCarousel from '@/components/user/TestimonialCarousel'
import Footer from '@/components/user/Footer'
import {
  heroData,
  featuresData,
  pathToMasteryData,
  impactData,
  testimonialsData,
  ctaData
} from '@/data/homeData'

export default function Home() {
  const [animating, setAnimating] = useState(true)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const sectionRefs = useRef({})

  useEffect(() => {
    const timer = setTimeout(() => setAnimating(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1 }
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const isVisible = (id) => visibleSections.has(id)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Optimized to fit viewport */}
      <section className="relative h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-brand-ivory via-white to-blue-50">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-blue-deep/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-8 items-center w-full py-8">
            {/* Left Content */}
            <div
              className="flex flex-col justify-center"
              style={{
                opacity: animating ? 0 : 1,
                transform: animating ? 'translateY(30px)' : 'translateY(0)',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs md:text-sm font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4 md:mb-6 w-fit">
                <span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse" />
                {heroData.badge.text}
              </div>

              {/* Main Headline - Responsive sizing */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-5 text-brand-navy leading-tight">
                {heroData.title}
                <br />
                <span className="text-brand-blue">{heroData.titleHighlight}</span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-brand-gray-dark leading-relaxed mb-6 md:mb-8 max-w-xl">
                {heroData.subtitle}
              </p>

              {/* CTA Buttons - Compact */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8">
                <Link to="/courses">
                  <Button className="bg-brand-blue text-white hover:bg-brand-blue-deep h-11 md:h-12 px-6 md:px-8 text-sm md:text-base rounded-xl shadow-lg shadow-brand-blue/30 hover:shadow-xl transition-all w-full sm:w-auto">
                    Browse Courses
                    <Icons.ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </Link>
                <Link to="/impact">
                  <Button
                    variant="outline"
                    className="border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white h-11 md:h-12 px-6 md:px-8 text-sm md:text-base rounded-xl transition-all w-full sm:w-auto"
                  >
                    <Icons.PlayCircle className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                    Our Impact
                  </Button>
                </Link>
              </div>

              {/* Stats - Compact */}
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                {heroData.stats.map((stat, index) => (
                  <div key={index} className="text-center sm:text-left">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-navy mb-0.5 md:mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-brand-gray">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image - Hidden on mobile, visible on large screens */}
            <div
              className="relative hidden lg:flex items-center justify-center ml-18 xl:ml-36"
              style={{
                opacity: animating ? 0 : 1,
                transform: animating ? 'translateX(30px)' : 'translateX(0)',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
              }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-brand-blue/20 to-purple-100 p-6 max-w-lg">
                <img
                  src={heroData.image.url}
                  alt={heroData.image.alt}
                  className="rounded-2xl w-full h-auto object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs text-brand-gray">
                  Join 500+ students online now
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={(el) => (sectionRefs.current.features = el)}
        className="py-16 md:py-24 bg-brand-gray-ghost"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div
            className="text-center mb-12 md:mb-16"
            style={{
              opacity: isVisible('features') ? 1 : 0,
              transform: isVisible('features') ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.6s ease-out'
            }}
          >
            <div className="inline-block text-xs md:text-sm font-bold text-brand-blue tracking-wider mb-3 md:mb-4">
              {featuresData.sectionBadge}
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy mb-4 md:mb-6">
              {featuresData.title}
            </h2>
            <p className="text-lg md:text-xl text-brand-gray max-w-3xl mx-auto leading-relaxed">
              {featuresData.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {featuresData.features.map((feature, index) => (
              <div
                key={index}
                style={{
                  opacity: isVisible('features') ? 1 : 0,
                  transform: isVisible('features') ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.6s ease-out ${index * 0.1}s`
                }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Path to Mastery Section */}
      <section
        id="path"
        ref={(el) => (sectionRefs.current.path = el)}
        className="py-16 md:py-24 bg-white"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div
            className="text-center mb-12 md:mb-16"
            style={{
              opacity: isVisible('path') ? 1 : 0,
              transform: isVisible('path') ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.6s ease-out'
            }}
          >
            <div className="inline-block text-xs md:text-sm font-bold text-brand-blue tracking-wider mb-3 md:mb-4">
              {pathToMasteryData.sectionBadge}
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy">
              {pathToMasteryData.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pathToMasteryData.steps.map((step, index) => {
              const IconComponent = Icons[step.icon]
              return (
                <div
                  key={index}
                  className="text-center"
                  style={{
                    opacity: isVisible('path') ? 1 : 0,
                    transform: isVisible('path') ? 'translateY(0)' : 'translateY(30px)',
                    transition: `all 0.6s ease-out ${index * 0.15}s`
                  }}
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 ${step.iconColor} rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg`}>
                    {IconComponent && <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-brand-navy mb-3 md:mb-4">{step.title}</h3>
                  <p className="text-sm md:text-base text-brand-gray leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section
        id="impact"
        ref={(el) => (sectionRefs.current.impact = el)}
        className="py-16 md:py-24 bg-brand-blue text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <img
            src={impactData.backgroundImage.url}
            alt={impactData.backgroundImage.alt}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div
            className="text-center"
            style={{
              opacity: isVisible('impact') ? 1 : 0,
              transform: isVisible('impact') ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.6s ease-out'
            }}
          >
            <div className="inline-block text-xs md:text-sm font-bold text-blue-200 tracking-wider mb-3 md:mb-4">
              {impactData.sectionBadge}
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              {impactData.title}
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-8 md:mb-12">{impactData.subtitle}</p>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-2xl mx-auto">
              {impactData.stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-5xl md:text-6xl font-bold mb-2">{stat.value}</div>
                  <div className="text-base md:text-lg text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        ref={(el) => (sectionRefs.current.testimonials = el)}
        className="py-16 md:py-24 bg-brand-gray-ghost"
      >
        <div
          className="container mx-auto px-6 lg:px-8"
          style={{
            opacity: isVisible('testimonials') ? 1 : 0,
            transform: isVisible('testimonials') ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease-out'
          }}
        >
          <TestimonialCarousel testimonials={testimonialsData} />
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        ref={(el) => (sectionRefs.current.cta = el)}
        className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50"
      >
        <div
          className="container mx-auto px-6 lg:px-8"
          style={{
            opacity: isVisible('cta') ? 1 : 0,
            transform: isVisible('cta') ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease-out'
          }}
        >
          <div className="max-w-4xl mx-auto text-center bg-white rounded-3xl p-8 md:p-12 shadow-xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy mb-4 md:mb-6">
              {ctaData.title}
            </h2>
            <p className="text-lg md:text-xl text-brand-gray mb-8 md:mb-10 leading-relaxed">
              {ctaData.description}
            </p>
            <Link to="/curriculum">
              <Button className="bg-brand-blue text-white hover:bg-brand-blue-deep h-12 md:h-14 px-8 md:px-10 text-base md:text-lg rounded-xl shadow-lg shadow-brand-blue/30 hover:shadow-xl transition-all">
                Browse Courses
                <Icons.ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}