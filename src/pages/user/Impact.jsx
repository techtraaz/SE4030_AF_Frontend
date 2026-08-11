import { useState, useEffect, useRef } from 'react'
import { BookOpen, Users, Globe, Award, Target, Heart, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageHero from '@/components/user/PageHero'
import StatCard from '@/components/user/StatCard'
import courseService from '@/services/course/courseService'
import categoryService from '@/services/lesson/categoryService'
import languageService from '@/services/course/languageService'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'

/**
 * Our Impact Page
 * Shows platform statistics and mission
 * Uses real data from the database
 */
export default function Impact() {
  const [loading, setLoading] = useState(true)
  const [animating, setAnimating] = useState(true)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const sectionRefs = useRef({})
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    languages: 0,
    categories: 0
  })

  useEffect(() => {
    const timer = setTimeout(() => setAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    fetchStats()
  }, [])

  // Re-bind observers after loading so refs are mounted before observing.
  useEffect(() => {
    if (loading) return

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
  }, [loading])

  const isVisible = (id) => visibleSections.has(id)

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      const [courses, languages, categories] = await Promise.all([
        courseService.getAllCourses({ isPublished: true }),
        languageService.getAllLanguages().catch(() => []),
        categoryService.getAllCategories().catch(() => []),
      ])

      const totalEnrollments = courses.reduce((sum, course) => sum + (course.totalEnrollments || 0), 0)

      setStats({
        totalCourses: courses.length,
        totalEnrollments,
        languages: languages.length,
        categories: categories.length
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton text="Loading impact data..." />
  }

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
        title="Our Impact"
        description="Empowering refugees and displaced communities through accessible, quality language education. Every course, every lesson, every word learned is a step towards a brighter future."
      />

      {/* Statistics Section */}
      <section 
        id="stats" 
        ref={(el) => (sectionRefs.current.stats = el)}
        className="py-16 -mt-12"
        style={{
          opacity: isVisible('stats') ? 1 : 0,
          transform: isVisible('stats') ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={BookOpen}
              value={stats.totalCourses}
              label="Quality Courses"
              color="bg-blue-100 text-brand-blue"
            />
            <StatCard
              icon={Users}
              value={stats.totalEnrollments}
              label="Total Enrollments"
              color="bg-green-100 text-green-600"
            />
            <StatCard
              icon={Globe}
              value={stats.languages}
              label="Languages Supported"
              color="bg-purple-100 text-purple-600"
            />
            <StatCard
              icon={Award}
              value={stats.categories}
              label="Course Categories"
              color="bg-orange-100 text-orange-600"
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section 
        id="mission" 
        ref={(el) => (sectionRefs.current.mission = el)}
        className="py-16 bg-white"
        style={{
          opacity: isVisible('mission') ? 1 : 0,
          transform: isVisible('mission') ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
                Our Mission
              </h2>
              <p className="text-lg text-brand-gray">
                Breaking down language barriers, one learner at a time
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <MissionCard
                icon={Target}
                title="Accessibility"
                description="Free, high-quality language education available to everyone, everywhere."
              />
              <MissionCard
                icon={Heart}
                title="Empowerment"
                description="Building confidence and skills to help refugees integrate and thrive in new communities."
              />
              <MissionCard
                icon={TrendingUp}
                title="Growth"
                description="Continuous improvement in our courses and platform to better serve our learners."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stories Section */}
      <section 
        id="stories" 
        ref={(el) => (sectionRefs.current.stories = el)}
        className="py-16 bg-gradient-to-b from-blue-50 to-white"
        style={{
          opacity: isVisible('stories') ? 1 : 0,
          transform: isVisible('stories') ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">
              Every Learner Counts
            </h2>
            <p className="text-lg text-brand-gray mb-8">
              Behind every enrollment is a person working towards a better future. 
              Our platform serves as a bridge, connecting displaced individuals with 
              the language skills they need to rebuild their lives, find employment, 
              and integrate into new communities.
            </p>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-2xl md:text-3xl font-bold text-brand-blue mb-2">
                {stats.totalEnrollments}+
              </p>
              <p className="text-brand-gray">
                Learners have taken steps toward fluency through our platform
              </p>
              <Link to="/curriculum" className="inline-block mt-6">
                <Button className="bg-brand-blue hover:bg-brand-blue-deep">
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function MissionCard({ icon: Icon, title, description }) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-brand-blue" />
        </div>
        <CardTitle className="text-xl text-brand-navy">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-brand-gray">{description}</p>
      </CardContent>
    </Card>
  )
}
