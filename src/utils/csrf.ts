/**
 * CSRF token utilities for secure form submissions
 */

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

/**
 * Get the CSRF token from cookie
 */
export const getCsrfToken = (): string => {
  return getCookie('XSRF-TOKEN') || '';
};

/**
 * Get headers with CSRF token for API requests
 */
export const getCsrfHeaders = (): Record<string, string> => {
  const token = getCsrfToken();
  return token ? { 'X-XSRF-TOKEN': token } : {};
}; 