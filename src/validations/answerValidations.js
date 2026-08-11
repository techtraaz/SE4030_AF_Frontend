export const validateAnswer = (answerData) => {
  const errors = {};

  if (!answerData.content || answerData.content.trim().length === 0) {
    errors.content = 'Answer content is required';
  }

  if (answerData.content && answerData.content.length < 5) {
    errors.content = 'Answer content must be at least 5 characters';
  }

  if (answerData.content && answerData.content.length > 3000) {
    errors.content = 'Answer content must not exceed 3000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};