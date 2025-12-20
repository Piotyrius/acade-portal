import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getMyPayments } from '@/api/endpoints/payments';
import { InvoiceDto } from '@/api/endpoints/payments';
import { format } from 'date-fns';
import { formatCurrencyString } from '@/utils/paymentsFormatting';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function StudentPayments() {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['my-payments'],
    queryFn: getMyPayments,
  });

  const getPaymentStatusBadge = (invoice: InvoiceDto) => {
    const status = invoice.payment_status_display || invoice.status;
    const isOverdue = invoice.is_overdue || false;
    
    if (status === 'PAID' || invoice.outstanding_amount === '0.00') {
      return <Badge className="bg-green-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
    }
    if (status === 'PARTIAL') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Partial</Badge>;
    }
    return <Badge variant="outline">Unpaid</Badge>;
  };

  const getDaysUntilDue = (invoice: InvoiceDto) => {
    if (invoice.days_until_due !== undefined) {
      const days = invoice.days_until_due;
      if (days < 0) {
        return `${Math.abs(days)} days overdue`;
      } else if (days === 0) {
        return 'Due today';
      } else {
        return `${days} days remaining`;
      }
    }
    return null;
  };

  const totalOutstanding = invoices.reduce((sum, inv) => {
    const outstanding = parseFloat(inv.outstanding_amount || '0');
    return sum + outstanding;
  }, 0);

  const totalPaid = invoices.reduce((sum, inv) => {
    const paid = parseFloat(inv.paid_amount || '0');
    return sum + paid;
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Payments</h2>
        <p className="text-muted-foreground">
          View your invoices, payment status, and due dates
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {formatCurrencyString(totalOutstanding.toString())}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrencyString(totalPaid.toString())}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {invoices.filter(inv => inv.outstanding_amount !== '0.00').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>All your invoices and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No invoices found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Cohort</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.cohort_name || 'N/A'}</TableCell>
                    <TableCell>{formatCurrencyString(invoice.total_amount)}</TableCell>
                    <TableCell>{formatCurrencyString(invoice.paid_amount || '0')}</TableCell>
                    <TableCell className={parseFloat(invoice.outstanding_amount || '0') > 0 ? 'text-destructive font-medium' : ''}>
                      {formatCurrencyString(invoice.outstanding_amount || '0')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</div>
                        {getDaysUntilDue(invoice) && (
                          <div className="text-xs text-muted-foreground">
                            {getDaysUntilDue(invoice)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPaymentStatusBadge(invoice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

