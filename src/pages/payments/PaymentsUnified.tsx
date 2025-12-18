import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getInvoices, getPayments } from '@/api/endpoints/payments';

export default function PaymentsUnified() {
  const navigate = useNavigate();

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices-dashboard'],
    queryFn: () => getInvoices(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments-dashboard'],
    queryFn: () => getPayments(),
  });

  const outstandingCount = invoices.filter(
    (i: any) => i.status === 'ISSUED' || i.status === 'OVERDUE',
  ).length;

  const totalReceived = payments
    .filter((p: any) => p.status === 'COMPLETED')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount || '0'), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing & Payments</h2>
          <p className="text-muted-foreground">
            See your outstanding invoices, recent payments, and manage billing settings.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/payments/invoices')}>
            <FileText className="mr-2 h-4 w-4" />
            View Invoices
          </Button>
          <Button variant="outline" onClick={() => navigate('/payments/payments')}>
            <DollarSign className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{outstandingCount}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Invoices that are issued or overdue.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{invoices.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Total invoices in the system.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalReceived.toLocaleString(undefined, {
                style: 'currency',
                currency: 'USD',
              })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Total value of completed payments.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

