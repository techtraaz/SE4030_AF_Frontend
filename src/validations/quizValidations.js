import * as z from 'zod'

/**
 * Quiz Basic Info Validation Schema
 */
export const quizBasicInfoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  passingScore: z.coerce.number().min(0).max(100).default(60),
  timeLimit: z.coerce.number().min(0).optional(),
  maxAttempts: z.coerce.number().min(1).optional(),
  instructions: z.string().optional(),
  isRandomOrder: z.boolean().default(false),
})

/**
 * Quiz Question Schema
 */
export const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  type: z.enum(['multiple_choice', 'true_false', 'multiple_select', 'fill_blank']),
  points: z.number().min(1).default(1),
  explanation: z.string().optional(),
})

/**
 * Quiz Option Schema
 */
export const optionSchema = z.object({
  optionText: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
})
