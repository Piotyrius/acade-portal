import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getMyEnrollments, getMyAttendance, getMyAssessments, getMyGrades, getMyCertificates, getMyOutstandingBalance, getMyPayments } from '@/api/endpoints/studentPortal';
import { BookOpen, ClipboardCheck, FileCheck, Award, GraduationCap, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { exampleEnrollments, exampleAttendance, exampleAssessments, exampleGrades, exampleCertificates } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { formatCurrencyMinor, formatCurrencyString } from '@/utils/paymentsFormatting';

export default function StudentPortal() {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: getMyEnrollments,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: getMyAttendance,
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['my-assessments'],
    queryFn: getMyAssessments,
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['my-grades'],
    queryFn: getMyGrades,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: getMyCertificates,
  });

  const { data: outstandingBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['my-outstanding-balance'],
    queryFn: getMyOutstandingBalance,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['my-payments'],
    queryFn: getMyPayments,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'PRESENT':
      case 'ISSUED':
      case 'PAID':
      case 'COMPLETED':
        return 'default';
      case 'PENDING':
      case 'LATE':
      case 'PARTIAL':
        return 'secondary';
      case 'ABSENT':
      case 'REVOKED':
      case 'OVERDUE':
      case 'FAILED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort((a: any, b: any) => {
    const dateA = new Date(a.processed_at || a.created_at || a.issued_at || 0);
    const dateB = new Date(b.processed_at || b.created_at || b.issued_at || 0);
    return dateB.getTime() - dateA.getTime();
  });

  const displayEnrollments = enrollments.length === 0 ? exampleEnrollments.slice(0, 1) : enrollments;
  const displayAttendance = attendance.length === 0 ? exampleAttendance.slice(0, 1) : attendance;
  const displayAssessments = assessments.length === 0 ? exampleAssessments.slice(0, 1) : assessments;
  const displayGrades = grades.length === 0 ? exampleGrades.slice(0, 1) : grades;
  const displayCertificates = certificates.length === 0 ? exampleCertificates.slice(0, 1) : certificates;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Portal</h2>
          <p className="text-muted-foreground">View your enrollments, attendance, assessments, grades, certificates, and financial information</p>
        </div>
      </div>

      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">
            <BookOpen className="mr-2 h-4 w-4" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="assessments">
            <FileCheck className="mr-2 h-4 w-4" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="grades">
            <GraduationCap className="mr-2 h-4 w-4" />
            Grades
          </TabsTrigger>
          <TabsTrigger value="certificates">
            <Award className="mr-2 h-4 w-4" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="mr-2 h-4 w-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>My Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayEnrollments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No enrollments found</p>
                ) : (
                  displayEnrollments.map((enrollment: any) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Cohort: {enrollment.cohort_name || enrollment.cohort}</p>
                        <p className="text-sm text-muted-foreground">
                          Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(enrollment.status)}>{enrollment.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>My Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayAttendance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No attendance records found</p>
                ) : (
                  displayAttendance.map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{record.session_cohort || 'Session'}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.session_start ? format(new Date(record.session_start), 'PPp') : 'Date not available'}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(record.status)}>{record.status_display || record.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>My Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayAssessments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No assessments found</p>
                ) : (
                  displayAssessments.map((assessment: any) => (
                    <div key={assessment.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{assessment.title}</p>
                        <Badge variant="outline">{assessment.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{assessment.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Max Score: {assessment.max_score}</span>
                        {assessment.due_date && (
                          <span>Due: {format(new Date(assessment.due_date), 'PPp')}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>My Grades</CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayGrades.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No grades found</p>
                ) : (
                  displayGrades.map((grade: any) => (
                    <div key={grade.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{grade.assessment_title || 'Assessment'}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {grade.score} / {grade.max_score} ({grade.percentage}%)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">{grade.percentage}%</p>
                        <p className="text-xs text-muted-foreground">
                          {grade.graded_at ? format(new Date(grade.graded_at), 'PP') : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>My Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayCertificates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No certificates found</p>
                ) : (
                  displayCertificates.map((certificate: any) => (
                    <div key={certificate.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Serial: {certificate.serial}</p>
                        <p className="text-sm text-muted-foreground">
                          Cohort: {certificate.cohort_name || certificate.cohort}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Issued: {certificate.issued_at ? format(new Date(certificate.issued_at), 'PP') : 'N/A'}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(certificate.status)}>{certificate.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <div className="space-y-6">
            {/* Outstanding Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle>Outstanding Balance</CardTitle>
                <CardDescription>Your total outstanding balance across all invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {balanceLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : outstandingBalance ? (
                  <div className="space-y-4">
                    <div className={`text-4xl font-bold ${outstandingBalance.outstanding_balance_minor > 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {formatCurrency(outstandingBalance.outstanding_balance_minor, outstandingBalance.currency)}
                    </div>
                    {outstandingBalance.outstanding_balance_minor > 0 ? (
                      <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-destructive">Outstanding Balance</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You have an outstanding balance. Please make a payment to avoid any service interruptions.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-600">All Paid</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You have no outstanding balance. Great job staying on top of your payments!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Unable to load balance information</p>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your recent payments and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : sortedPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No payment history available</p>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPayments.map((item: any) => {
                          // Determine if this is a payment or invoice
                          const isPayment = item.payment_method !== undefined;
                          const isInvoice = item.invoice_number !== undefined || item.status === 'ISSUED' || item.status === 'PARTIAL' || item.status === 'PAID' || item.status === 'OVERDUE';
                          
                          const date = item.processed_at || item.issued_at || item.created_at;
                          const reference = isPayment 
                            ? (item.transaction_id || item.id.slice(0, 8))
                            : (item.invoice_number || item.id.slice(0, 8));
                          const amount = isPayment 
                            ? formatCurrencyString(item.amount, item.currency || 'USD')
                            : formatCurrencyString(item.total_amount || item.amount, item.currency || 'USD');
                          const status = item.status || 'PENDING';
                          const type = isPayment ? 'Payment' : isInvoice ? 'Invoice' : 'Transaction';

                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                {date ? format(new Date(date), 'PPp') : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{type}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {reference}
                              </TableCell>
                              <TableCell className="font-medium">
                                {amount}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusVariant(status)}>
                                  {item.status_display || status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoices Section (if payments include invoices) */}
            {sortedPayments.some((item: any) => item.invoice_number !== undefined) && (
              <Card>
                <CardHeader>
                  <CardTitle>My Invoices</CardTitle>
                  <CardDescription>View and manage your invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedPayments
                      .filter((item: any) => item.invoice_number !== undefined)
                      .map((invoice: any) => (
                        <div key={invoice.id} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">
                                Invoice #{invoice.invoice_number || invoice.id.slice(0, 8)}
                              </p>
                              {invoice.cohort_name && (
                                <p className="text-sm text-muted-foreground">
                                  Cohort: {invoice.cohort_name}
                                </p>
                              )}
                            </div>
                            <Badge variant={getStatusVariant(invoice.status)}>
                              {invoice.status_display || invoice.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total Amount</p>
                              <p className="font-medium">
                                {formatCurrencyString(invoice.total_amount, invoice.currency || 'USD')}
                              </p>
                            </div>
                            {invoice.paid_amount && (
                              <div>
                                <p className="text-muted-foreground">Paid</p>
                                <p className="font-medium text-green-600">
                                  {formatCurrencyString(invoice.paid_amount, invoice.currency || 'USD')}
                                </p>
                              </div>
                            )}
                            {invoice.outstanding_amount && parseFloat(invoice.outstanding_amount) > 0 && (
                              <div>
                                <p className="text-muted-foreground">Outstanding</p>
                                <p className="font-medium text-destructive">
                                  {formatCurrencyString(invoice.outstanding_amount, invoice.currency || 'USD')}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground">Due Date</p>
                              <p className="font-medium">
                                {invoice.due_date ? format(new Date(invoice.due_date), 'PP') : 'N/A'}
                              </p>
                              {invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'PAID' && (
                                <p className="text-xs text-destructive mt-1">Overdue</p>
                              )}
                            </div>
                          </div>
                          {invoice.notes && (
                            <p className="text-sm text-muted-foreground mt-3">{invoice.notes}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

