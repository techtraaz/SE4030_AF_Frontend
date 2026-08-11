import React from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

/**
 * QuizFilters - Comprehensive filtering component for quiz lists
 * Styled similar to LessonFilters for consistency
 */
const QuizFilters = ({ filters, onFilterChange, courses = [], onClearFilters }) => {
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
            placeholder="Search quizzes..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Course Filter */}
        {courses.length > 0 && (
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
          {filters.courseId && filters.courseId !== 'all' && (
            <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue rounded">
              Course: {courses.find(c => c._id === filters.courseId)?.title || 'Selected'}
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

export default QuizFilters
