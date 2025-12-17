import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from '@/components/ui/select';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPaymentSchedules,
  markPaymentSchedulesOverdue,
  PaymentScheduleDto,
} from '@/api/endpoints/payments';
import { getInvoices } from '@/api/endpoints/payments';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';

export default function PaymentSchedules() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<string>('all');

  const { data: paymentSchedules = [], isLoading } = useQuery({
    queryKey: ['paymentSchedules', selectedStatus, selectedInvoice],
    queryFn: () =>
      getPaymentSchedules({
        status: selectedStatus && selectedStatus !== 'all' ? selectedStatus as any : undefined,
        invoice: selectedInvoice && selectedInvoice !== 'all' ? selectedInvoice : undefined,
      }),
    enabled: user?.role === 'ADMIN',
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => getInvoices(),
    enabled: user?.role === 'ADMIN',
  });

  const markOverdueMutation = useMutation({
    mutationFn: markPaymentSchedulesOverdue,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['paymentSchedules'] });
      toast({
        title: 'Success',
        description: `Marked ${data.marked_overdue} payment schedules as overdue`,
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'PAID':
        return 'default';
      case 'OVERDUE':
        return 'destructive';
      case 'SKIPPED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount || '0');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GEL',
    }).format(num);
  };

  const filteredSchedules = paymentSchedules.filter((schedule: PaymentScheduleDto) => {
    return (
      searchTerm === '' ||
      schedule.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.invoice?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Schedules</h2>
          <p className="text-muted-foreground">You don't have permission to view payment schedules</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-40 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Schedules</h2>
          <p className="text-muted-foreground">Track and manage payment schedules</p>
        </div>
        <Button
          variant="outline"
          onClick={() => markOverdueMutation.mutate()}
          disabled={markOverdueMutation.isPending}
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Mark Overdue
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search schedules..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Invoices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Invoices</SelectItem>
            {invoices.map((invoice: any) => (
              <SelectItem key={invoice.id} value={invoice.id}>
                {invoice.invoice_number || invoice.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="SKIPPED">Skipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSchedules.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payment schedules found</p>
            ) : (
              filteredSchedules.map((schedule: PaymentScheduleDto) => {
                const isOverdue =
                  schedule.status === 'OVERDUE' ||
                  (schedule.status === 'PENDING' &&
                    new Date(schedule.scheduled_date) < new Date());
                return (
                  <div
                    key={schedule.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      isOverdue ? 'border-destructive bg-destructive/5' : 'border-border'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">
                          {schedule.invoice_number || `Schedule #${schedule.id.slice(0, 8)}`}
                        </p>
                        <Badge variant={getStatusVariant(schedule.status)}>
                          {schedule.status_display || schedule.status}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">Amount: {formatCurrency(schedule.amount)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scheduled: {new Date(schedule.scheduled_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {schedule.status === 'PAID' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

