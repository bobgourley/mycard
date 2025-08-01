/**
 * Username sanitization utilities for 123l.ink
 * Follows industry best practices for link-in-bio platforms
 */

export interface UsernameValidation {
  sanitized: string
  isValid: boolean
  errors: string[]
  preview: string
}

/**
 * Sanitizes a username by converting to lowercase, replacing spaces with dashes,
 * and removing invalid characters
 */
export function sanitizeUsername(input: string): string {
  return input
    .toLowerCase()
    .trim()
    // Replace spaces and multiple spaces with single dash
    .replace(/\s+/g, '-')
    // Replace underscores with dashes for consistency
    .replace(/_/g, '-')
    // Remove any characters that aren't letters, numbers, or dashes
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive dashes
    .replace(/-+/g, '-')
    // Remove leading and trailing dashes
    .replace(/^-+|-+$/g, '')
}

/**
 * Validates a username and returns sanitized version with validation results
 */
export function validateUsername(input: string): UsernameValidation {
  const sanitized = sanitizeUsername(input)
  const errors: string[] = []

  // Check minimum length
  if (sanitized.length < 3) {
    errors.push('Username must be at least 3 characters long')
  }

  // Check maximum length
  if (sanitized.length > 30) {
    errors.push('Username must be 30 characters or less')
  }

  // Check for reserved usernames
  const reservedUsernames = [
    'admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'root',
    'support', 'help', 'about', 'contact', 'privacy', 'terms',
    'login', 'signup', 'signin', 'register', 'dashboard', 'profile',
    'settings', 'account', 'billing', 'pricing', 'features',
    'blog', 'news', 'docs', 'documentation', 'status', 'health'
  ]

  if (reservedUsernames.includes(sanitized)) {
    errors.push('This username is reserved and cannot be used')
  }

  // Check if username starts or ends with dash (shouldn't happen after sanitization, but just in case)
  if (sanitized.startsWith('-') || sanitized.endsWith('-')) {
    errors.push('Username cannot start or end with a dash')
  }

  return {
    sanitized,
    isValid: errors.length === 0 && sanitized.length >= 3,
    errors,
    preview: `123l.ink/${sanitized}`
  }
}

/**
 * Formats display text to show what changes were made during sanitization
 */
export function getTransformationMessage(original: string, sanitized: string): string | null {
  if (original.toLowerCase().trim() === sanitized) {
    return null
  }

  const changes: string[] = []
  
  if (original !== original.toLowerCase()) {
    changes.push('converted to lowercase')
  }
  
  if (original.includes(' ')) {
    changes.push('spaces replaced with dashes')
  }
  
  if (original.includes('_')) {
    changes.push('underscores replaced with dashes')
  }
  
  if (/[^a-zA-Z0-9\s_-]/.test(original)) {
    changes.push('special characters removed')
  }

  if (changes.length === 0) {
    return null
  }

  return `Automatically ${changes.join(', ')}`
}
