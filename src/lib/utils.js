import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Extract username from authorId/author object which may have nested structure
export function getAuthorName(authorObj) {
  if (!authorObj) return 'Anonymous';
  
  // If authorObj is a string ID (just the ID), can't display name
  if (typeof authorObj === 'string') return 'Anonymous';
  
  // Try direct properties on the author/authorId object
  if (authorObj.username) return authorObj.username;
  if (authorObj.email) return authorObj.email.split('@')[0];
  if (authorObj.firstName && authorObj.lastName) {
    return `${authorObj.firstName} ${authorObj.lastName}`;
  }
  if (authorObj.firstName) return authorObj.firstName;
  if (authorObj.name) return authorObj.name;
  
  // Try nested user object (in case it's { user: { username, ... } })
  if (typeof authorObj.user === 'object' && authorObj.user) {
    if (authorObj.user.username) return authorObj.user.username;
    if (authorObj.user.email) return authorObj.user.email.split('@')[0];
  }
  
  // Fallback
  return 'Anonymous';
}