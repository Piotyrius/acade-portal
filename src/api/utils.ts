/**
 * Safely extracts an array from API response data
 * Handles both paginated ({ results: [...] }) and direct array responses
 * Always returns an array, never undefined or null
 */
export function ensureArray<T>(data: any): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.results)) {
    return data.results;
  }
  // If data is not an array and doesn't have results, return empty array
  return [];
}

