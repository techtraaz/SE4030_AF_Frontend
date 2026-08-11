import React from 'react'
import { TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, GripVertical } from 'lucide-react'

/**
 * QuizQuestionsTab - Second tab for managing questions
 */
const QuizQuestionsTab = ({
  questions,
  newQuestion,
  loading,
  onQuestionChange,
  onAddQuestion,
  onDeleteQuestion,
  onSelectQuestion,
  onFinish,
  onBack,
}) => {
  return (
    <TabsContent value="questions" className="space-y-4 mt-4">
      {/* Add New Question Form */}
      <div className="border rounded-lg p-4 bg-brand-gray/5">
        <h3 className="font-semibold mb-3">Add New Question</h3>
        <div className="space-y-3">
          <div>
            <Label>Question Text *</Label>
            <textarea
              value={newQuestion.questionText}
              onChange={(e) => onQuestionChange({ ...newQuestion, questionText: e.target.value })}
              placeholder="Enter your question..."
              className="w-full min-h-[80px] px-3 py-2 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Question Type</Label>
              <Select 
                value={newQuestion.type} 
                onValueChange={(value) => onQuestionChange({ ...newQuestion, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="multiple_select">Multiple Select</SelectItem>
                  <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Points</Label>
              <Input
                type="number"
                value={newQuestion.points}
                onChange={(e) => onQuestionChange({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>

            <div className="flex items-end">
              <Button 
                type="button" 
                onClick={onAddQuestion} 
                disabled={loading} 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>

          <div>
            <Label>Explanation (Optional)</Label>
            <Input
              value={newQuestion.explanation}
              onChange={(e) => onQuestionChange({ ...newQuestion, explanation: e.target.value })}
              placeholder="Explanation shown after answering"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-2">
        <h3 className="font-semibold">Questions ({questions.length})</h3>
        {questions.length === 0 ? (
          <p className="text-brand-gray text-center py-8">No questions added yet</p>
        ) : (
          <div className="space-y-2">
            {questions.map((q, index) => (
              <div key={q._id} className="border rounded-lg p-3 hover:bg-brand-gray/5 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <GripVertical className="h-4 w-4 text-brand-gray" />
                      <span className="font-medium">Q{index + 1}.</span>
                      <Badge variant="outline" className="capitalize">
                        {q.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-brand-gray">
                        {q.points} point{q.points !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="ml-6">{q.questionText}</p>
                    {q.explanation && (
                      <p className="ml-6 text-sm text-brand-gray mt-1">💡 {q.explanation}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onSelectQuestion(q)}
                    >
                      Manage Options
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onDeleteQuestion(q._id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onFinish} disabled={questions.length === 0}>
          Finish
        </Button>
      </div>
    </TabsContent>
  )
}

export default QuizQuestionsTab
