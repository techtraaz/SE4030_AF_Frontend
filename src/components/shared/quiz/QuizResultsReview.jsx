import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * QuizResultsReview - Display detailed quiz results with questions and answers
 * @param {Array} questions - Array of question objects with options
 * @param {Object} answers - User's answers (questionId -> answer)
 * @param {Array} results - Array of result objects from backend { questionId, isCorrect }
 * @param {boolean} showExplanations - Whether to show explanations (default: true)
 */
const QuizResultsReview = ({ 
  questions = [], 
  answers = {}, 
  results = [],
  showExplanations = true 
}) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-brand-gray">
        <p>No questions to review</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => {
        const userAnswer = answers[question._id]
        const correctOptions = question.options?.filter(opt => opt.isCorrect) || []
        const resultItem = results.find(r => r.questionId === question._id)
        const isCorrect = resultItem?.isCorrect || false
        
        return (
          <Card 
            key={question._id} 
            className={cn(
              'border-l-4',
              isCorrect ? 'border-l-brand-blue bg-brand-blue/5' : 'border-l-red-500 bg-red-50/30'
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-brand-blue mt-1 flex-shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                )}
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-lg">
                      Question {index + 1}: {question.questionText}
                    </p>
                    {question.points && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {question.points} pts
                      </Badge>
                    )}
                  </div>
                  
                  {question.type === 'fill_blank' ? (
                    <div>
                      <p className="text-sm text-brand-gray">Your Answer:</p>
                      <p className={cn(
                        'font-medium',
                        isCorrect ? 'text-brand-blue' : 'text-red-700'
                      )}>
                        {userAnswer || '(Not answered)'}
                      </p>
                      {!isCorrect && correctOptions.length > 0 && (
                        <>
                          <p className="text-sm text-brand-gray mt-2">Correct Answer:</p>
                          <p className="font-medium text-brand-blue">
                            {correctOptions[0]?.optionText}
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => {
                        const isSelected = question.type === 'multiple_select'
                          ? Array.isArray(userAnswer) && userAnswer.includes(option._id)
                          : userAnswer === option._id
                        
                        return (
                          <div
                            key={option._id}
                            className={cn(
                              'p-3 rounded border',
                              option.isCorrect && 'bg-brand-blue/10 border-brand-blue/40',
                              isSelected && !option.isCorrect && 'bg-red-100 border-red-400',
                              !option.isCorrect && !isSelected && 'bg-gray-50'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span className="flex-1">{option.optionText}</span>
                              {option.isCorrect && (
                                <Badge className="ml-auto bg-brand-blue">Correct</Badge>
                              )}
                              {isSelected && !option.isCorrect && (
                                <Badge variant="destructive" className="ml-auto">Your Choice</Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  
                  {showExplanations && question.explanation && (
                    <div className="mt-3 p-3 bg-brand-blue/5 border border-brand-blue/20 rounded">
                      <p className="text-sm font-semibold text-brand-blue mb-1">
                        Explanation:
                      </p>
                      <p className="text-sm text-brand-navy">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default QuizResultsReview
