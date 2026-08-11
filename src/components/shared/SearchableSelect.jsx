import React, { useState, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'

/**
 * SearchableSelect - A filterable select dropdown component
 * Allows users to search/filter options for easier selection
 */
const SearchableSelect = ({
  label,
  placeholder = 'Select...',
  value,
  onChange,
  options = [], // Array of { value, label, ...otherProps }
  emptyMessage = 'No options found',
  required = false,
  disabled = false,
  className = '',
  error = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options
    
    const search = searchTerm.toLowerCase()
    return options.filter(option => 
      option.label?.toLowerCase().includes(search) ||
      option.value?.toLowerCase().includes(search)
    )
  }, [options, searchTerm])

  const handleOpenChange = (open) => {
    setIsOpen(open)
    if (!open) {
      setSearchTerm('') // Reset search when closed
    }
  }

  const selectedLabel = options.find(opt => opt.value === value)?.label

  return (
    <div className={className}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select 
        value={value} 
        onValueChange={onChange}
        open={isOpen}
        onOpenChange={handleOpenChange}
        disabled={disabled}
      >
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={placeholder}>
            {selectedLabel || placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {/* Search input */}
          <div className="px-2 py-1.5 sticky top-0 bg-white border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8"
                onClick={(e) => e.stopPropagation()} // Prevent closing on input click
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-brand-gray">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default SearchableSelect
