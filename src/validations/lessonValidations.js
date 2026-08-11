import * as z from 'zod'

/**
 * Lesson Basic Info Validation Schema
 */
export const lessonBasicInfoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  estimatedMinutes: z.coerce.number().min(1).max(300).default(10),
  order: z.coerce.number().optional(),
  thumbnail: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

/**
 * Highlight Word Schema (for reading section)
 */
export const highlightWordSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  meaning: z.string().min(1, 'Meaning is required'),
  translation: z.string().optional(),
})

/**
 * Vocabulary Word Schema
 */
export const vocabularyWordSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  meaning: z.string().min(1, 'Meaning is required'),
  exampleSentence: z.string().optional(),
  audioUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})
