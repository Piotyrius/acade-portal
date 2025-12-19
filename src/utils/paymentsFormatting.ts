export function formatCurrencyString(amount: string | number, currency: string = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount || '0') : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
}

export function formatCurrencyMinor(amountMinor: number, currency: string = 'USD'): string {
  const major = amountMinor / 100;
  return formatCurrencyString(major, currency);
}

export function formatEnrollmentLabel(enrollment: any): string {
  if (!enrollment) return '';
  const student = enrollment.student_name || enrollment.student_email || enrollment.student || 'Unknown Student';
  const cohort = enrollment.cohort_name || enrollment.cohort || 'Unknown Cohort';
  return `${student} - ${cohort}`;
}




