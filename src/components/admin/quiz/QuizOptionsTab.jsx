import React, { useState } from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Sparkles, Loader2, X, Edit2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * QuizOptionsTab - Third tab for managing question options
 */
const QuizOptionsTab = ({
  selectedQuestion,
  options,
  newOption,
  loading,
  generatingDistractors,
  generatedDistractors,
  onOptionChange,
  onAddOption,
  onDeleteOption,
  onEditOption,
  onToggleCorrect,
  onGenerateDistractors,
  onAddGeneratedDistractor,
  onClearGeneratedDistractors,
  onFinish,
  onBackToQuestions,
}) => {
  const [editingOptionId, setEditingOptionId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [editingIsCorrect, setEditingIsCorrect] = useState(false)

  if (!selectedQuestion) return null

  const handleStartEdit = (option) => {
    setEditingOptionId(option._id)
    setEditingText(option.optionText)
    setEditingIsCorrect(option.isCorrect)
  }

  const handleCancelEdit = () => {
    setEditingOptionId(null)
    setEditingText('')
    setEditingIsCorrect(false)
  }

  const handleSaveEdit = async () => {
    const success = await onEditOption(editingOptionId, editingText, editingIsCorrect)
    if (success) {
      handleCancelEdit()
    }
  }

  // Check if question type supports auto-generation
  const supportsAutoGeneration = selectedQuestion.type === 'multiple_choice'
  // Check if there's a correct answer to base distractors on
  const hasCorrectAnswer = options.some(opt => opt.isCorrect)

  return (
    <TabsContent value="options" className="space-y-4 mt-4">
      {/* Question Info */}
      <div className="border-l-4 border-brand-primary pl-4 mb-4">
        <p className="font-medium text-brand-gray text-sm">Managing Options For:</p>
        <p className="font-semibold">{selectedQuestion.questionText}</p>
        <Badge variant="outline" className="mt-1 capitalize">
          {selectedQuestion.type.replace('_', ' ')}
        </Badge>
      </div>

      {/* Add New Option Form */}
      <div className="border rounded-lg p-4 bg-brand-gray/5">
        <h3 className="font-semibold mb-3">Add New Option</h3>
        <div className="space-y-3">
          <div>
            <Label>Option Text *</Label>
            <Input
              value={newOption.optionText}
              onChange={(e) => onOptionChange({ ...newOption, optionText: e.target.value })}
              placeholder="Enter option text..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isCorrect" 
                checked={newOption.isCorrect}
                onCheckedChange={(checked) => onOptionChange({ ...newOption, isCorrect: checked })}
              />
              <Label htmlFor="isCorrect" className="cursor-pointer">
                This is a correct answer
              </Label>
            </div>

            <Button type="button" onClick={onAddOption} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
        </div>
      </div>

      {/* AI-Powered Distractor Generator (Third-Party API Integration) */}
      {supportsAutoGeneration && (
        <div className="border-2 border-dashed border-brand-blue/30 rounded-lg p-4 bg-brand-blue/5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-blue" />
                <h3 className="font-semibold text-brand-blue">AI Auto-Generate Wrong Options</h3>
                <Badge variant="outline" className="bg-white">Third-Party API</Badge>
              </div>
              <p className="text-sm text-brand-gray mt-1">
                Automatically generate plausible wrong answers using Datamuse API
              </p>
            </div>
            
            {generatedDistractors.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onClearGeneratedDistractors}
                className="text-brand-gray hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!hasCorrectAnswer ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              💡 Add a <strong>correct answer</strong> first to enable auto-generation
            </div>
          ) : generatedDistractors.length === 0 ? (
            <Button
              onClick={() => onGenerateDistractors(3)}
              disabled={generatingDistractors || loading}
              className="w-full bg-brand-blue hover:bg-brand-blue-deep"
            >
              {generatingDistractors ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating options...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate 3 Wrong Options
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-brand-navy mb-2">
                Generated Options ({generatedDistractors.length}):
              </p>
              {generatedDistractors.map((distractor, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between bg-white border rounded-lg p-3 hover:border-brand-blue/50 transition-colors"
                >
                  <span className="flex-1">{distractor}</span>
                  <Button
                    size="sm"
                    onClick={() => onAddGeneratedDistractor(distractor)}
                    disabled={loading}
                    className="bg-brand-blue hover:bg-brand-blue-deep"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGenerateDistractors(3)}
                disabled={generatingDistractors || loading}
                className="w-full mt-2"
              >
                {generatingDistractors ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate More
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Options List */}
      <div className="space-y-2">
        <h3 className="font-semibold">Options ({options.length})</h3>
        {options.length === 0 ? (
          <p className="text-brand-gray text-center py-8">No options added yet</p>
        ) : (
          <div className="space-y-2">
            {options.map((opt, index) => {
              const isEditing = editingOptionId === opt._id
              
              return (
                <div 
                  key={opt._id} 
                  className={cn(
                    "border rounded-lg p-3",
                    opt.isCorrect && !isEditing && "bg-brand-blue/10 border-brand-blue/30"
                  )}
                >
                  {isEditing ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-brand-gray">{String.fromCharCode(65 + index)}.</span>
                        <Input
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          placeholder="Enter option text..."
                          className="flex-1"
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={editingIsCorrect}
                            onCheckedChange={setEditingIsCorrect}
                            id={`edit-correct-${opt._id}`}
                          />
                          <Label htmlFor={`edit-correct-${opt._id}`} className="cursor-pointer">
                            This is a correct answer
                          </Label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={loading}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={loading || !editingText.trim()}
                            className="bg-brand-blue hover:bg-brand-blue-deep"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox 
                          checked={opt.isCorrect}
                          onCheckedChange={() => onToggleCorrect(opt)}
                          disabled={loading}
                        />
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                        <span className="flex-1">{opt.optionText}</span>
                        {opt.isCorrect && (
                          <Badge variant="default" className="bg-brand-blue">Correct</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleStartEdit(opt)}
                          disabled={loading}
                          title="Edit option"
                        >
                          <Edit2 className="h-4 w-4 text-brand-blue" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onDeleteOption(opt._id)}
                          disabled={loading}
                          title="Delete option"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onBackToQuestions}>
          Back to Questions
        </Button>
        <Button onClick={onFinish}>
          Finish
        </Button>
      </div>
    </TabsContent>
  )
}

export default QuizOptionsTab
