export const validateForum = (forumData) => {
  const errors = {};

  if (!forumData.name || forumData.name.trim().length === 0) {
    errors.name = 'Forum name is required';
  }

  if (forumData.name && forumData.name.length < 3) {
    errors.name = 'Forum name must be at least 3 characters';
  }

  if (forumData.name && forumData.name.length > 100) {
    errors.name = 'Forum name must not exceed 100 characters';
  }

  if (!forumData.description || forumData.description.trim().length === 0) {
    errors.description = 'Forum description is required';
  }

  if (forumData.description && forumData.description.length < 10) {
    errors.description = 'Forum description must be at least 10 characters';
  }

  if (forumData.description && forumData.description.length > 500) {
    errors.description = 'Forum description must not exceed 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};