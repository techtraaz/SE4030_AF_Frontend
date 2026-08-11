import { useState, useEffect } from 'react'
import { toastService } from '@/services/toastService'
import optionService from '@/services/quiz/optionService'
import distractorService from '@/services/quiz/distractorService'

/**
 * Custom hook for managing question options
 */
export const useQuizOptions = (questionId) => {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [generatingDistractors, setGeneratingDistractors] = useState(false)
  const [generatedDistractors, setGeneratedDistractors] = useState([])
  const [newOption, setNewOption] = useState({
    optionText: '',
    isCorrect: false,
  })

  useEffect(() => {
    if (questionId) {
      loadOptions()
    } else {
      setOptions([])
    }
  }, [questionId])

  const loadOptions = async () => {
    try {
      const data = await optionService.getOptionsByQuestion(questionId)
      setOptions(data)
    } catch (error) {
      toastService.error('Failed to load options')
    }
  }

  const addOption = async () => {
    if (!questionId) {
      toastService.error('Please select a question first')
      return false
    }

    if (!newOption.optionText.trim()) {
      toastService.error('Option text is required')
      return false
    }

    try {
      setLoading(true)
      const optionData = {
        optionText: newOption.optionText,
        isCorrect: newOption.isCorrect,
        questionId,
      }
      
      const savedOption = await optionService.createOption(optionData)
      setOptions([...options, savedOption])
      setNewOption({ optionText: '', isCorrect: false })
      toastService.success('Option added successfully')
      return true
    } catch (error) {
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteOption = async (optionId, skipConfirm = false) => {
    // Allow parent component to handle confirmation
    if (!skipConfirm) {
      // This will be handled by the parent component with ConfirmDialog
      return { needsConfirmation: true, optionId }
    }

    try {
      setLoading(true)
      await optionService.deleteOption(optionId)
      setOptions(options.filter(o => o._id !== optionId))
      toastService.success('Option deleted')
      return { success: true }
    } catch (error) {
      toastService.error('Failed to delete option')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const toggleCorrect = async (option) => {
    try {
      setLoading(true)
      await optionService.updateOption(option._id, {
        ...option,
        isCorrect: !option.isCorrect,
      })
      await loadOptions()
      toastService.success('Option updated')
      return true
    } catch (error) {
      return false
    } finally {
      setLoading(false)
    }
  }

  const editOption = async (optionId, optionText, isCorrect) => {
    if (!optionText.trim()) {
      toastService.error('Option text is required')
      return false
    }

    try {
      setLoading(true)
      await optionService.updateOption(optionId, {
        optionText: optionText.trim(),
        isCorrect,
      })
      await loadOptions()
      toastService.success('Option updated successfully')
      return true
    } catch (error) {
      toastService.error('Failed to update option')
      return false
    } finally {
      setLoading(false)
    }
  }

  const resetNewOption = () => {
    setNewOption({ optionText: '', isCorrect: false })
  }

  /**
   * Auto-generate distractor options using Datamuse API
   * Only works when there's at least one correct answer
   */
  const generateDistractorOptions = async (count = 3) => {
    // Find the correct answer
    const correctOption = options.find(opt => opt.isCorrect)
    
    if (!correctOption) {
      toastService.error('Please add a correct answer first before generating distractors')
      return false
    }

    try {
      setGeneratingDistractors(true)
      const result = await distractorService.generateDistractors(correctOption.optionText, count)
      setGeneratedDistractors(result.distractors || [])
      
      if (result.distractors && result.distractors.length > 0) {
        toastService.success(`Generated ${result.distractors.length} distractor option(s)`)
        return true
      } else {
        toastService.warning('Could not generate distractors for this answer')
        return false
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to generate distractors'
      toastService.error(errorMsg)
      return false
    } finally {
      setGeneratingDistractors(false)
    }
  }

  /**
   * Add a generated distractor as an option
   */
  const addGeneratedDistractor = async (distractorText) => {
    if (!questionId) {
      toastService.error('Please select a question first')
      return false
    }

    try {
      setLoading(true)
      const optionData = {
        optionText: distractorText,
        isCorrect: false, // Distractors are always wrong answers
        questionId,
      }
      
      const savedOption = await optionService.createOption(optionData)
      setOptions([...options, savedOption])
      
      // Remove from generated list
      setGeneratedDistractors(generatedDistractors.filter(d => d !== distractorText))
      
      toastService.success('Distractor added as option')
      return true
    } catch (error) {
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Clear generated distractors
   */
  const clearGeneratedDistractors = () => {
    setGeneratedDistractors([])
  }

  return {
    options,
    loading,
    generatingDistractors,
    generatedDistractors,
    newOption,
    setNewOption,
    addOption,
    deleteOption,
    toggleCorrect,
    editOption,
    loadOptions,
    resetNewOption,
    generateDistractorOptions,
    addGeneratedDistractor,
    clearGeneratedDistractors,
  }
}
