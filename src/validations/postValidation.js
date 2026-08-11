export const validatePost = (postData) => {
  const errors = {};

  if (!postData.title || postData.title.trim().length === 0) {
    errors.title = 'Post title is required';
  }

  if (postData.title && postData.title.length < 5) {
    errors.title = 'Post title must be at least 5 characters';
  }

  if (postData.title && postData.title.length > 200) {
    errors.title = 'Post title must not exceed 200 characters';
  }

  if (!postData.content || postData.content.trim().length === 0) {
    errors.content = 'Post content is required';
  }

  if (postData.content && postData.content.length < 10) {
    errors.content = 'Post content must be at least 10 characters';
  }

  if (postData.content && postData.content.length > 5000) {
    errors.content = 'Post content must not exceed 5000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};