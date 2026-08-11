import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileQuestion, ListPlus, CheckCircle } from 'lucide-react'
import { toastService } from '@/services/toastService'
import useAuth from '@/hooks/useAuth'
import { useQuizForm } from '@/hooks/useQuizForm'
import { useQuizQuestions } from '@/hooks/useQuizQuestions'
import { useQuizOptions } from '@/hooks/useQuizOptions'
import QuizBasicInfoTab from './QuizBasicInfoTab'
import QuizQuestionsTab from './QuizQuestionsTab'
import QuizOptionsTab from './QuizOptionsTab'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

/**
 * ManageQuizModal - Refactored quiz management modal
 * Uses custom hooks and separate tab components for better maintainability
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when modal closes
 * @param {object} quiz - Quiz object for edit mode (null for create)
 * @param {string} courseId - Pre-selected course ID (for course quiz creation)
 * @param {string} lessonId - Pre-selected lesson ID (for lesson quiz creation)
 * @param {function} onSuccess - Called after successful quiz creation/update
 */
const ManageQuizModal = ({ 
  isOpen, 
  onClose, 
  quiz = null, 
  courseId = null,
  lessonId = null,
  onSuccess = () => {} 
}) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('basic')
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [showDeleteQuestionConfirm, setShowDeleteQuestionConfirm] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [showDeleteOptionConfirm, setShowDeleteOptionConfirm] = useState(false)
  const [optionToDelete, setOptionToDelete] = useState(null)

  // Custom hooks for form and data management
  const quizForm = useQuizForm(user, quiz, courseId, lessonId)
  const questionsHook = useQuizQuestions(currentQuiz?._id)
  const optionsHook = useQuizOptions(selectedQuestion?._id)

  // Handle quiz submission
  const onSubmitBasicInfo = async (data) => {
    const savedQuiz = await quizForm.saveQuiz(data)
    if (savedQuiz) {
      setCurrentQuiz(savedQuiz)
      setActiveTab('questions')
    }
  }

  // Handle question selection
  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question)
    setActiveTab('options')
  }

  // Handle question deletion
  const handleDeleteQuestion = async (questionId) => {
    const result = await questionsHook.deleteQuestion(questionId)
    if (result.needsConfirmation) {
      setQuestionToDelete(questionId)
      setShowDeleteQuestionConfirm(true)
    }
  }

  // Confirm and delete question
  const confirmDeleteQuestion = async () => {
    if (questionToDelete) {
      const result = await questionsHook.deleteQuestion(questionToDelete, true)
      if (result.success && selectedQuestion?._id === questionToDelete) {
        setSelectedQuestion(null)
      }
      setQuestionToDelete(null)
    }
  }

  // Handle option deletion
  const handleDeleteOption = async (optionId) => {
    const result = await optionsHook.deleteOption(optionId)
    if (result.needsConfirmation) {
      setOptionToDelete(optionId)
      setShowDeleteOptionConfirm(true)
    }
  }

  // Confirm and delete option
  const confirmDeleteOption = async () => {
    if (optionToDelete) {
      await optionsHook.deleteOption(optionToDelete, true)
      setOptionToDelete(null)
    }
  }

  // Reset all state and close modal
  const handleClose = () => {
    if (currentQuiz) {
      onSuccess()
    }
    
    quizForm.resetForm()
    questionsHook.resetNewQuestion()
    optionsHook.resetNewOption()
    setActiveTab('basic')
    setCurrentQuiz(null)
    setSelectedQuestion(null)
    onClose()
  }

  const handleFinish = () => {
    if (questionsHook.questions.length === 0) {
      toastService.error('Please add at least one question')
      return
    }
    handleClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {quizForm.isEditMode ? 'Edit Quiz' : 'Create New Quiz'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              <FileQuestion className="h-4 w-4 mr-1" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="questions" disabled={!currentQuiz}>
              <ListPlus className="h-4 w-4 mr-1" />
              Questions ({questionsHook.questions.length})
            </TabsTrigger>
            <TabsTrigger value="options" disabled={!selectedQuestion}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Options ({optionsHook.options.length})
            </TabsTrigger>
          </TabsList>

          <form onSubmit={quizForm.handleSubmit(onSubmitBasicInfo)}>
            <QuizBasicInfoTab
              register={quizForm.register}
              errors={quizForm.errors}
              watch={quizForm.watch}
              setValue={quizForm.setValue}
              loading={quizForm.loading}
              courses={quizForm.courses}
              lessons={quizForm.lessons}
              quizType={quizForm.quizType}
              selectedCourseId={quizForm.selectedCourseId}
              selectedLessonId={quizForm.selectedLessonId}
              isEditMode={quizForm.isEditMode}
              onQuizTypeChange={(type) => {
                quizForm.setQuizType(type)
                if (type === 'course') quizForm.setSelectedLessonId('')
                else quizForm.setSelectedCourseId('')
              }}
              onCourseChange={quizForm.setSelectedCourseId}
              onLessonChange={quizForm.setSelectedLessonId}
              onCancel={handleClose}
            />
          </form>

          <QuizQuestionsTab
            questions={questionsHook.questions}
            newQuestion={questionsHook.newQuestion}
            loading={questionsHook.loading}
            onQuestionChange={questionsHook.setNewQuestion}
            onAddQuestion={questionsHook.addQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onSelectQuestion={handleSelectQuestion}
            onFinish={handleFinish}
            onBack={() => setActiveTab('basic')}
          />

          <QuizOptionsTab
            selectedQuestion={selectedQuestion}
            options={optionsHook.options}
            newOption={optionsHook.newOption}
            loading={optionsHook.loading}
            generatingDistractors={optionsHook.generatingDistractors}
            generatedDistractors={optionsHook.generatedDistractors}
            onOptionChange={optionsHook.setNewOption}
            onAddOption={optionsHook.addOption}
            onDeleteOption={handleDeleteOption}
            onEditOption={optionsHook.editOption}
            onToggleCorrect={optionsHook.toggleCorrect}
            onGenerateDistractors={optionsHook.generateDistractorOptions}
            onAddGeneratedDistractor={optionsHook.addGeneratedDistractor}
            onClearGeneratedDistractors={optionsHook.clearGeneratedDistractors}
            onFinish={handleFinish}
            onBackToQuestions={() => {
              setSelectedQuestion(null)
              setActiveTab('questions')
            }}
          />
        </Tabs>

        {/* Delete Question Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteQuestionConfirm}
          onClose={() => {
            setShowDeleteQuestionConfirm(false)
            setQuestionToDelete(null)
          }}
          onConfirm={confirmDeleteQuestion}
          title="Delete Question"
          description="Are you sure you want to delete this question? This will also delete all associated options. This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />

        {/* Delete Option Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteOptionConfirm}
          onClose={() => {
            setShowDeleteOptionConfirm(false)
            setOptionToDelete(null)
          }}
          onConfirm={confirmDeleteOption}
          title="Delete Option"
          description="Are you sure you want to delete this option? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </DialogContent>
    </Dialog>
  )
}

export default ManageQuizModal
