/**
 * Formats a date for display in the timeline
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  /**
   * Safely stores an object in localStorage with JSON stringification
   * @param key - Storage key
   * @param value - Value to store
   */
  export const setLocalStorage = <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error storing data in localStorage:', error);
    }
  };
  
  /**
   * Safely retrieves and parses an object from localStorage
   * @param key - Storage key
   * @param defaultValue - Default value if key doesn't exist
   * @returns Parsed value or default
   */
  export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error('Error retrieving data from localStorage:', error);
      return defaultValue;
    }
  };
  
  /**
   * Truncates a string to a specified length and adds ellipsis if needed
   * @param str - String to truncate
   * @param length - Maximum length
   * @returns Truncated string
   */
  export const truncateString = (str: string, length: number): string => {
    if (str.length <= length) return str;
    return str.slice(0, length - 3) + '...';
  };
  
  /**
   * Debounces a function to prevent multiple rapid calls
   * @param fn - Function to debounce
   * @param delay - Delay in milliseconds
   * @returns Debounced function
   */
  export const debounce = <T extends (...args: any[]) => any>(
    fn: T, 
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return function(...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };