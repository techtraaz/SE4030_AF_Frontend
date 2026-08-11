import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

/**
 * LessonFilters - Filter component for lesson lists
 * Used in admin and user views to filter lessons
 */
const LessonFilters = ({ 
  filters = {}, 
  onFilterChange = () => {}, 
  onClearFilters = () => {},
  categories = [],
  showCourseFilter = false,
  courses = []
}) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = Object.values(filters).some(val => val && val !== 'all')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray" />
          <Input
            placeholder="Search lessons..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select 
          value={filters.categoryId || 'all'} 
          onValueChange={(value) => handleFilterChange('categoryId', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-[180px]">
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

        {/* Course Filter (optional) */}
        {showCourseFilter && (
          <Select 
            value={filters.courseId || 'all'} 
            onValueChange={(value) => handleFilterChange('courseId', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Difficulty Filter */}
        <Select 
          value={filters.difficulty || 'all'} 
          onValueChange={(value) => handleFilterChange('difficulty', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select 
          value={filters.isPublished || 'all'} 
          onValueChange={(value) => handleFilterChange('isPublished', value === 'all' ? '' : value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Draft</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onClearFilters}
            className="text-brand-gray hover:text-brand-navy"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-brand-gray">
          <span>Active filters:</span>
          {filters.search && (
            <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue rounded">
              Search: "{filters.search}"
            </span>
          )}
          {filters.categoryId && filters.categoryId !== 'all' && (
            <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue rounded">
              Category
            </span>
          )}
          {filters.difficulty && filters.difficulty !== 'all' && (
            <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue rounded">
              {filters.difficulty}
            </span>
          )}
          {filters.isPublished && filters.isPublished !== 'all' && (
            <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue rounded">
              {filters.isPublished === 'true' ? 'Published' : 'Draft'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default LessonFilters
