import { useState, useEffect, useRef } from 'react'
import { Search, Filter, Grid, List, BookOpen, Clock, Users, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import courseService from '@/services/course/courseService'
import categoryService from '@/services/lesson/categoryService'
import courseLevelService from '@/services/course/courseLevelService'
import languageService from '@/services/course/languageService'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import useAuth from '@/hooks/useAuth'
import { useAuthModal } from '@/context/AuthModalContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

/**
 * Public Courses Page
 * Shows all published courses to visitors
 * Prompts login/register when clicking "Enroll"
 */
export default function Courses() {
  const { user } = useAuth()
  const { openRegister } = useAuthModal()
  const navigate = useNavigate()
  
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [levels, setLevels] = useState([])
  const [languages, setLanguages] = useState([])
  const [loading, setLoading] = useState(true)
  const [animating, setAnimating] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [visibleSections, setVisibleSections] = useState(new Set())
  const sectionRefs = useRef({})
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const timer = setTimeout(() => setAnimating(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [selectedLevel, selectedLanguage, selectedCategory])

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
  }, [loading])

  const isVisible = (id) => visibleSections.has(id)

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [coursesData, categoriesData, levelsData, languagesData] = await Promise.all([
        courseService.getAllCourses({ isPublished: true }),
        categoryService.getAllCategories().catch(() => []),
        courseLevelService.getAllLevels().catch(() => []),
        languageService.getAllLanguages().catch(() => []),
      ])
      
      setCourses(coursesData || [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setLevels(Array.isArray(levelsData) ? levelsData : [])
      setLanguages(Array.isArray(languagesData) ? languagesData : [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const filters = { isPublished: true }
      
      if (selectedLevel !== 'all') filters.levelId = selectedLevel
      if (selectedLanguage !== 'all') filters.languageId = selectedLanguage
      if (selectedCategory !== 'all') filters.categoryId = selectedCategory
      
      const coursesData = await courseService.getAllCourses(filters)
      setCourses(coursesData || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const handleEnroll = (course) => {
    if (!user) {
      openRegister()
    } else if (user.role === 'REFUGEE') {
      navigate(`/dashboard/courses/${course._id}`)
    } else {
      navigate('/dashboard')
    }
  }

  const filteredCourses = courses.filter(course => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      course.title?.toLowerCase().includes(search) ||
      course.description?.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return <LoadingSkeleton text="Loading courses..." />
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
      <section className="bg-gradient-to-r from-brand-blue to-brand-blue-deep text-white py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Our Courses
            </h1>
            <p className="text-lg text-blue-100">
              Discover quality language education designed for refugees and displaced communities. 
              Start your learning journey today with courses tailored to your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section 
        id="filters" 
        ref={(el) => (sectionRefs.current.filters = el)}
        className="border-b bg-white sticky top-20 z-10 shadow-sm"
        style={{
          opacity: isVisible('filters') ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="container mx-auto px-6 lg:px-8 py-6">
          <div className="grid gap-4 md:grid-cols-5">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Level Filter */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level._id} value={level._id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Language Filter */}
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((language) => (
                  <SelectItem key={language._id} value={language._id}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle & Results */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </p>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid/List */}
      <section 
        id="courses" 
        ref={(el) => (sectionRefs.current.courses = el)}
        className="container mx-auto px-6 lg:px-8 py-12"
        style={{
          opacity: isVisible('courses') ? 1 : 0,
          transform: isVisible('courses') ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-brand-navy mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search term
            </p>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
              : 'flex flex-col gap-4'
          )}>
            {filteredCourses.map((course, index) => (
              <div
                key={course._id}
                style={{
                  opacity: isVisible('courses') ? 1 : 0,
                  transform: isVisible('courses') ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`
                }}
              >
                <CourseCard
                  course={course}
                  viewMode={viewMode}
                  onEnroll={handleEnroll}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

/**
 * Course Card Component
 */
function CourseCard({ course, viewMode, onEnroll }) {
  const imageUrl = course.thumbnail || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop'
  
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex flex-col md:flex-row">
          <img
            src={imageUrl}
            alt={course.title}
            className="w-full md:w-64 h-48 object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
          />
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{course.levelId?.name || 'Beginner'}</Badge>
                  <Badge variant="secondary">{course.languageId?.name || 'English'}</Badge>
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">{course.title}</h3>
                <p className="text-muted-foreground line-clamp-2">{course.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.totalEnrollments || 0} enrolled</span>
                </div>
              </div>
              <Button 
                onClick={() => onEnroll(course)}
                className="bg-brand-blue hover:bg-brand-blue-deep"
              >
                Enroll Now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-brand-navy hover:bg-white">
            {course.levelId?.name || 'Beginner'}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {course.languageId?.name || 'English'}
          </Badge>
          {course.categoryId && (
            <Badge variant="outline" className="text-xs">
              {course.categoryId.name}
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-bold text-brand-navy line-clamp-2 leading-tight">
          {course.title}
        </h3>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {course.description}
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{course.lessons?.length || 0} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{course.totalEnrollments || 0} students</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={() => onEnroll(course)}
          className="w-full bg-brand-blue hover:bg-brand-blue-deep"
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          Enroll Now
        </Button>
      </CardFooter>
    </Card>
  )
}
