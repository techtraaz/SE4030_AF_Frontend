import apiClient from '../axios';

/**
 * Distractor Service - Third-Party API Integration
 * Integrates with backend Datamuse API endpoints for quiz enhancement
 */

/**
 * Generate distractor options (plausible wrong answers) for a question
 * @param {string} correctAnswer - The correct answer text
 * @param {number} count - Number of distractors to generate (1-10)
 * @returns {Promise<Object>} Response with distractors array
 */
const generateDistractors = async (correctAnswer, count = 3) => {
  const response = await apiClient.post('/quiz/distractors/generate', {
    correctAnswer,
    count
  });
  return response.data.content;
};

/**
 * Generate contextual hints for a question
 * @param {string} correctAnswer - The correct answer text
 * @param {number} maxHints - Maximum number of hints (default: 3)
 * @returns {Promise<Object>} Response with hints array and formatted hint text
 */
const generateHints = async (correctAnswer, maxHints = 3) => {
  const response = await apiClient.post('/quiz/distractors/hints', {
    correctAnswer,
    maxHints
  });
  return response.data.content;
};

/**
 * Get educational context (synonyms, related words) for a word
 * @param {string} word - The word to get context for
 * @returns {Promise<Object>} Response with synonyms and related words
 */
const getEducationalContext = async (word) => {
  const response = await apiClient.get(`/quiz/distractors/context/${encodeURIComponent(word)}`);
  return response.data.content;
};

const distractorService = {
  generateDistractors,
  generateHints,
  getEducationalContext
};

export default distractorService;
