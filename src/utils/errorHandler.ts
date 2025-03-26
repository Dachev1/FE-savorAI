// Remove the global declaration that's causing conflicts
// and use the existing ImportMeta interface

type ErrorSource = Error | unknown | string;

interface FormattedError {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Formats errors consistently across the application
 */
export const formatError = (error: ErrorSource): FormattedError => {
  // Handle Error objects
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      details: error.stack
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error
    };
  }
  
  // Handle unknown errors
  return {
    message: 'An unexpected error occurred',
    details: typeof error === 'object' ? JSON.stringify(error) : String(error)
  };
};

/**
 * Logs errors to console in development
 */
export const logError = (error: ErrorSource, context?: string): void => {
  if (import.meta.env.DEV) {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  }
  
  // Here you could also send errors to a monitoring service like Sentry
};

/**
 * Handles API errors specifically
 */
export const handleApiError = (error: unknown): FormattedError => {
  // You can add specific API error handling logic here
  return formatError(error);
};

export default {
  formatError,
  logError,
  handleApiError
}; 