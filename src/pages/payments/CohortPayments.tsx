import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getCohortPaymentSummary, getCohorts } from '@/api/endpoints/payments';
import { getCohorts as getCohortsCatalog } from '@/api/endpoints/catalog';
import { formatCurrencyString } from '@/utils/paymentsFormatting';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function CohortPayments() {
  const [selectedCohortId, setSelectedCohortId] = useState<string>('');

  const { data: cohorts = [], isLoading: cohortsLoading } = useQuery({
    queryKey: ['cohorts'],
    queryFn: getCohortsCatalog,
  });

  const { data: paymentSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['cohort-payment-summary', selectedCohortId],
    queryFn: () => getCohortPaymentSummary(selectedCohortId),
    enabled: !!selectedCohortId,
  });

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'OVERDUE':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      case 'PARTIAL':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Partial</Badge>;
      default:
        return <Badge variant="outline">Unpaid</Badge>;
    }
  };

  if (cohortsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cohort Payment Summary</h2>
        <p className="text-muted-foreground">
          View payment status for all students in a cohort
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Cohort</CardTitle>
          <CardDescription>Choose a cohort to view payment summary</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCohortId} onValueChange={setSelectedCohortId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a cohort" />
            </SelectTrigger>
            <SelectContent>
              {cohorts.map((cohort) => (
                <SelectItem key={cohort.id} value={cohort.id}>
                  {cohort.name} - {cohort.course_title || 'Course'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCohortId && (
        <>
          {summaryLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-muted-foreground mt-2">Loading payment summary...</p>
              </CardContent>
            </Card>
          ) : paymentSummary ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Expected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {formatCurrencyString(paymentSummary.total_expected?.toString() || '0')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrencyString(paymentSummary.total_paid?.toString() || '0')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-destructive">
                      {formatCurrencyString(paymentSummary.outstanding?.toString() || '0')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Student Payments</CardTitle>
                  <CardDescription>
                    Payment status for all students in {paymentSummary.cohort_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentSummary.students && paymentSummary.students.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No students found</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Outstanding</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentSummary.students?.map((student: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{student.student_name}</TableCell>
                            <TableCell>{student.student_email}</TableCell>
                            <TableCell>{student.invoice_number || 'N/A'}</TableCell>
                            <TableCell>{formatCurrencyString(student.total_amount?.toString() || '0')}</TableCell>
                            <TableCell>{formatCurrencyString(student.total_paid?.toString() || '0')}</TableCell>
                            <TableCell className={parseFloat(student.outstanding?.toString() || '0') > 0 ? 'text-destructive font-medium' : ''}>
                              {formatCurrencyString(student.outstanding?.toString() || '0')}
                            </TableCell>
                            <TableCell>{getPaymentStatusBadge(student.payment_status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No payment data available for this cohort
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedCohortId && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Please select a cohort to view payment summary
          </CardContent>
        </Card>
      )}
    </div>
  );
}




