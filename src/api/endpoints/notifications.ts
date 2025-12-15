import api from '@/api/client';
import { getApplications } from './admissions';
import { getSubmissions } from './assessment';
import { getInvoices, getPayments } from './payments';
import { getEnrollments } from './admissions';
import { formatDistanceToNow, subDays } from 'date-fns';

export interface Notification {
  id: string;
  type: 'academic' | 'financial' | 'system' | 'enrollment';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

// Generate notifications from real data
export async function getNotifications(): Promise<Notification[]> {
  const notifications: Notification[] = [];
  const now = new Date();
  const recentDays = 7; // Show notifications from last 7 days

  try {
    // Get recent applications (last 7 days)
    const applications = await getApplications();
    const recentApplications = applications.filter((app: any) => {
      const created = new Date(app.created_at);
      return created >= subDays(now, recentDays) && app.status === 'NEW';
    });

    recentApplications.forEach((app: any) => {
      notifications.push({
        id: `app-${app.id}`,
        type: 'enrollment',
        title: 'New Application',
        message: `${app.name} submitted a new application`,
        read: false,
        createdAt: app.created_at,
        href: '/admissions/applications',
      });
    });

    // Get ungraded submissions
    const submissions = await getSubmissions();
    const ungradedSubmissions = submissions.filter((sub: any) => !sub.graded);

    ungradedSubmissions.forEach((sub: any) => {
      notifications.push({
        id: `sub-${sub.id}`,
        type: 'academic',
        title: 'Submission Needs Grading',
        message: `New submission for ${sub.assessment_title || 'an assessment'}`,
        read: false,
        createdAt: sub.submitted_at || sub.created_at,
        href: '/assessment/submissions',
      });
    });

    // Get overdue invoices
    const invoices = await getInvoices({ status: 'OVERDUE' });
    invoices.forEach((invoice: any) => {
      notifications.push({
        id: `inv-${invoice.id}`,
        type: 'financial',
        title: 'Overdue Invoice',
        message: `Invoice ${invoice.invoice_number} is overdue`,
        read: false,
        createdAt: invoice.due_date || invoice.created_at,
        href: '/payments/invoices',
      });
    });

    // Get recent payments
    const payments = await getPayments();
    const recentPayments = payments.filter((payment: any) => {
      const created = new Date(payment.created_at);
      return created >= subDays(now, 1) && payment.status === 'COMPLETED';
    });

    recentPayments.slice(0, 5).forEach((payment: any) => {
      notifications.push({
        id: `pay-${payment.id}`,
        type: 'financial',
        title: 'Payment Received',
        message: `Payment of $${parseFloat(payment.amount || '0').toFixed(2)} received`,
        read: false,
        createdAt: payment.created_at,
        href: '/payments',
      });
    });

    // Get recent enrollments
    const enrollments = await getEnrollments();
    const recentEnrollments = enrollments.filter((enrollment: any) => {
      const created = new Date(enrollment.enrolled_at || enrollment.created_at);
      return created >= subDays(now, 1);
    });

    recentEnrollments.slice(0, 3).forEach((enrollment: any) => {
      notifications.push({
        id: `enr-${enrollment.id}`,
        type: 'enrollment',
        title: 'New Enrollment',
        message: `${enrollment.student_name || 'Student'} enrolled in ${enrollment.cohort_name || 'a cohort'}`,
        read: false,
        createdAt: enrollment.enrolled_at || enrollment.created_at,
        href: '/admissions/enrollments',
      });
    });

    // Sort by date (newest first)
    notifications.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return notifications.slice(0, 20); // Limit to 20 most recent
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  // Store read status in localStorage for now
  // In production, this would be an API call
  const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
  if (!readNotifications.includes(notificationId)) {
    readNotifications.push(notificationId);
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  // Store in localStorage
  const notifications = await getNotifications();
  const allIds = notifications.map(n => n.id);
  localStorage.setItem('readNotifications', JSON.stringify(allIds));
}

export function getReadNotificationIds(): string[] {
  return JSON.parse(localStorage.getItem('readNotifications') || '[]');
}



