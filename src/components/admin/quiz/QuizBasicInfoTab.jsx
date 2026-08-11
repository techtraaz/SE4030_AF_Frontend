import React from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import SearchableSelect from '@/components/shared/SearchableSelect'

/**
 * QuizBasicInfoTab - First tab for quiz basic information
 */
const QuizBasicInfoTab = ({
  register,
  errors,
  watch,
  setValue,
  loading,
  courses,
  lessons,
  quizType,
  selectedCourseId,
  selectedLessonId,
  isEditMode,
  onQuizTypeChange,
  onCourseChange,
  onLessonChange,
  onCancel,
}) => {
  return (
    <TabsContent value="basic" className="space-y-4 mt-4">
      <div className="space-y-4">
        {/* Quiz Association */}
        <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
          <Label>Quiz Association *</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="course"
                checked={quizType === 'course'}
                onChange={(e) => onQuizTypeChange(e.target.value)}
                className="w-4 h-4"
                disabled={isEditMode}
              />
              <span>Course Quiz</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="lesson"
                checked={quizType === 'lesson'}
                onChange={(e) => onQuizTypeChange(e.target.value)}
                className="w-4 h-4"
                disabled={isEditMode}
              />
              <span>Lesson Quiz</span>
            </label>
          </div>

          {quizType === 'course' && (
            <SearchableSelect
              label="Select Course"
              placeholder="Choose a course..."
              value={selectedCourseId}
              onChange={onCourseChange}
              options={courses.map(c => ({ value: c._id, label: c.title }))}
              required
              disabled={isEditMode}
              error={!selectedCourseId ? 'Course is required' : ''}
              emptyMessage="No courses found. Please create a course first."
            />
          )}

          {quizType === 'lesson' && (
            <>
              <SearchableSelect
                label="Select Course (to load lessons)"
                placeholder="Choose a course first..."
                value={selectedCourseId}
                onChange={onCourseChange}
                options={courses.map(c => ({ value: c._id, label: c.title }))}
                disabled={isEditMode}
                emptyMessage="No courses found."
              />
              {selectedCourseId && (
                <SearchableSelect
                  label="Select Lesson"
                  placeholder="Choose a lesson..."
                  value={selectedLessonId}
                  onChange={onLessonChange}
                  options={lessons.map(l => ({ value: l._id, label: l.title }))}
                  required
                  disabled={isEditMode}
                  error={!selectedLessonId ? 'Lesson is required' : ''}
                  emptyMessage="No lessons found for this course."
                />
              )}
            </>
          )}
          
          {isEditMode && (
            <p className="text-sm text-brand-gray">
              Quiz association cannot be changed after creation
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title">Quiz Title *</Label>
          <Input id="title" {...register('title')} placeholder="Enter quiz title" />
          {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register('description')}
            placeholder="Brief description of the quiz"
            className="w-full min-h-[80px] px-3 py-2 border rounded-md"
          />
        </div>

        {/* Instructions */}
        <div>
          <Label htmlFor="instructions">Instructions</Label>
          <textarea
            id="instructions"
            {...register('instructions')}
            placeholder="Instructions for taking the quiz"
            className="w-full min-h-[80px] px-3 py-2 border rounded-md"
          />
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="passingScore">Passing Score (%)</Label>
            <Input type="number" id="passingScore" {...register('passingScore')} />
            {errors.passingScore && <p className="text-sm text-red-500 mt-1">{errors.passingScore.message}</p>}
          </div>

          <div>
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input type="number" id="timeLimit" {...register('timeLimit')} placeholder="Optional" />
          </div>

          <div>
            <Label htmlFor="maxAttempts">Max Attempts</Label>
            <Input type="number" id="maxAttempts" {...register('maxAttempts')} placeholder="Optional" />
          </div>
        </div>

        {/* Random Order */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isRandomOrder" 
            checked={watch('isRandomOrder')}
            onCheckedChange={(checked) => setValue('isRandomOrder', checked)}
          />
          <Label htmlFor="isRandomOrder" className="cursor-pointer">
            Randomize question order
          </Label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditMode ? 'Update & Continue' : 'Create & Continue'}
          </Button>
        </div>
      </div>
    </TabsContent>
  )
}

export default QuizBasicInfoTab
