import { useState, useEffect } from 'react'
import { toastService } from '@/services/toastService'
import questionService from '@/services/quiz/questionService'

/**
 * Custom hook for managing quiz questions
 */
export const useQuizQuestions = (quizId) => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    type: 'multiple_choice',
    points: 1,
    explanation: '',
    order: 0,
  })

  useEffect(() => {
    if (quizId) {
      loadQuestions()
    } else {
      setQuestions([])
    }
  }, [quizId])

  const loadQuestions = async () => {
    try {
      const data = await questionService.getAllQuestionsByQuiz(quizId)
      setQuestions(data)
    } catch (error) {
      toastService.error('Failed to load questions')
    }
  }

  const addQuestion = async () => {
    if (!quizId) {
      toastService.error('Please save basic info first')
      return false
    }

    if (!newQuestion.questionText.trim()) {
      toastService.error('Question text is required')
      return false
    }

    try {
      setLoading(true)
      const questionData = {
        ...newQuestion,
        quizId,
        order: questions.length + 1,
      }
      
      const savedQuestion = await questionService.createQuestion(questionData)
      setQuestions([...questions, savedQuestion])
      setNewQuestion({
        questionText: '',
        type: 'multiple_choice',
        points: 1,
        explanation: '',
        order: 0,
      })
      toastService.success('Question added successfully')
      return true
    } catch (error) {
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteQuestion = async (questionId, skipConfirm = false) => {
    // Allow parent component to handle confirmation
    if (!skipConfirm) {
      // This will be handled by the parent component with ConfirmDialog
      return { needsConfirmation: true, questionId }
    }

    try {
      setLoading(true)
      await questionService.deleteQuestion(questionId)
      setQuestions(questions.filter(q => q._id !== questionId))
      toastService.success('Question deleted')
      return { success: true }
    } catch (error) {
      toastService.error('Failed to delete question')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const resetNewQuestion = () => {
    setNewQuestion({
      questionText: '',
      type: 'multiple_choice',
      points: 1,
      explanation: '',
      order: 0,
    })
  }

  return {
    questions,
    loading,
    newQuestion,
    setNewQuestion,
    addQuestion,
    deleteQuestion,
    loadQuestions,
    resetNewQuestion,
  }
}
