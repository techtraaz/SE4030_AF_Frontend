export const formatTimeAgo = (date) => {
  const now = new Date();
  const postDate = new Date(date);
  const secondsPast = (now - postDate) / 1000;

  if (secondsPast < 60) return 'just now';
  if (secondsPast < 3600) return `${Math.floor(secondsPast / 60)}m ago`;
  if (secondsPast < 86400) return `${Math.floor(secondsPast / 3600)}h ago`;
  if (secondsPast < 2592000) return `${Math.floor(secondsPast / 86400)}d ago`;
  return postDate.toLocaleDateString();
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};