import { useState, useEffect, useRef } from 'react'
import { Heart, BookOpen, MessageSquare, Share2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PageHero from '@/components/user/PageHero'
import ActionCard from '@/components/user/ActionCard'

/**
 * Get Involved Page
 * Shows ways to contribute and support the platform
 * Minimal page without backend integration
 */
export default function GetInvolved() {
  const [animating, setAnimating] = useState(true)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const sectionRefs = useRef({})

  useEffect(() => {
    const timer = setTimeout(() => setAnimating(false), 500)
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
  const ways = [
    {
      icon: BookOpen,
      title: 'Become a Content Contributor',
      description: 'Share your expertise by creating educational content. Help build courses that empower refugees worldwide.',
      action: 'Apply as Contributor',
      href: '/courses',
      color: 'bg-blue-100 text-brand-blue'
    },
    {
      icon: MessageSquare,
      title: 'Support Learners',
      description: 'Join our community and help answer questions, provide encouragement, and share your learning journey.',
      action: 'Join Community',
      href: '/courses',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Share2,
      title: 'Spread the Word',
      description: 'Help us reach more learners by sharing our platform with those who could benefit from free language education.',
      action: 'Share Platform',
      href: '/courses',
      color: 'bg-purple-100 text-purple-600'
    },
  ]

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-brand-ivory to-white"
      style={{
        opacity: animating ? 0 : 1,
        transition: 'opacity 0.5s ease-in'
      }}
    >
      {/* Hero Section */}
      <PageHero
        icon={Heart}
        title="Get Involved"
        description="Join us in making quality language education accessible to everyone. Together, we can break down barriers and create opportunities for displaced communities."
      />

      {/* Ways to Contribute */}
      <section 
        id="ways" 
        ref={(el) => (sectionRefs.current.ways = el)}
        className="py-16"
        style={{
          opacity: isVisible('ways') ? 1 : 0,
          transform: isVisible('ways') ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
                Ways to Make a Difference
              </h2>
              <p className="text-lg text-brand-gray">
                Every contribution, big or small, helps create opportunities for learners
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
              {ways.map((way, index) => (
                <ActionCard
                  key={index}
                  icon={way.icon}
                  title={way.title}
                  description={way.description}
                  action={way.action}
                  href={way.href}
                  color={way.color}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statement */}
      <section 
        id="impact" 
        ref={(el) => (sectionRefs.current.impact = el)}
        className="py-16 bg-white"
        style={{
          opacity: isVisible('impact') ? 1 : 0,
          transform: isVisible('impact') ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-lg">
              <CardContent className="p-8 md:p-12 text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">
                  Your Impact Matters
                </h3>
                <p className="text-lg text-brand-gray mb-8">
                  When you get involved, you're not just contributing to a platform—you're 
                  changing lives. You're helping refugees rebuild, integrate, and thrive in 
                  their new communities through the power of language.
                </p>
                <Link to="/curriculum">
                  <Button 
                    size="lg" 
                    className="bg-brand-blue hover:bg-brand-blue-deep h-12 px-8 text-base rounded-xl shadow-lg"
                  >
                    Explore Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
