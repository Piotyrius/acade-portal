export function getErrorMessage(err: any): string {
  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail as string;
    try {
      return JSON.stringify(data);
    } catch {
      /* noop */
    }
  }
  return err?.message || 'Unexpected error';
}





