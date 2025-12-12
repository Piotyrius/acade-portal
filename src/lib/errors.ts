export function getErrorMessage(err: any): string {
  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data === 'string') {
      const text = data.trim();
      // Render/Django often returns an HTML error page for unhandled 500s.
      if (text.startsWith('<!doctype html') || text.startsWith('<html')) {
        return 'Server error (500) from backend. Check backend logs for /admissions/applications/{id}/accept/.';
      }
      return text;
    }
    if (data.detail) return data.detail as string;
    try {
      return JSON.stringify(data);
    } catch {
      /* noop */
    }
  }
  return err?.message || 'Unexpected error';
}











