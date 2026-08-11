import { Search, Grid3x3, List, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Course Filters Component
 * Provides search, filtering, and view mode controls for courses
 * 
 * @param {string} searchTerm - Current search term
 * @param {Function} onSearchChange - Search change handler
 * @param {string} levelFilter - Current level filter
 * @param {Function} onLevelChange - Level filter change handler
 * @param {string} statusFilter - Current status filter
 * @param {Function} onStatusChange - Status filter change handler
 * @param {string} languageFilter - Current language filter
 * @param {Function} onLanguageChange - Language filter change handler
 * @param {string} categoryFilter - Current category filter
 * @param {Function} onCategoryChange - Category filter change handler
 * @param {Array} levels - Available levels
 * @param {Array} languages - Available languages
 * @param {Array} categories - Available categories
 * @param {string} viewMode - Current view mode ('grid' or 'list')
 * @param {Function} onViewModeChange - View mode change handler
 * @param {Function} onReset - Reset filters handler
 * @param {boolean} hasActiveFilters - Whether any filters are active
 * @param {boolean} showStatusFilter - Whether to show status filter (default: true)
 * @param {boolean} showCategoryFilter - Whether to show category filter (default: true)
 */
export default function CourseFilters({
  searchTerm,
  onSearchChange,
  levelFilter,
  onLevelChange,
  statusFilter,
  onStatusChange,
  languageFilter,
  onLanguageChange,
  categoryFilter,
  onCategoryChange,
  levels = [],
  languages = [],
  categories = [],
  viewMode,
  onViewModeChange,
  onReset,
  hasActiveFilters = false,
  showStatusFilter = true,
  showCategoryFilter = true
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Level Filter */}
            {levels.length > 0 && (
              <Select value={levelFilter} onValueChange={onLevelChange}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                    .map((level) => (
                      <SelectItem key={level._id} value={level._id}>
                        {level.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}

            {/* Status Filter */}
            {showStatusFilter && (
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="unpublished">Unpublished</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Language Filter */}
            {languages.length > 0 && (
              <Select value={languageFilter} onValueChange={onLanguageChange}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((language) => (
                      <SelectItem key={language._id} value={language._id}>
                        {language.name} {language.nativeName && `(${language.nativeName})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}

            {/* Category Filter */}
            {showCategoryFilter && categories.length > 0 && (
              <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Category" />
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
            )}

            {/* Reset & View Toggle */}
            <div className="flex gap-2 ml-auto">
              {hasActiveFilters && onReset && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onReset}
                  title="Reset filters"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              {viewMode && onViewModeChange && (
                <>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => onViewModeChange('grid')}
                    title="Grid view"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => onViewModeChange('list')}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
