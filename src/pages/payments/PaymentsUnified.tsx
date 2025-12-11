import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Payments from './Payments';
import Invoices from './Invoices';
import Discounts from './Discounts';
import PaymentPlans from './PaymentPlans';
import PaymentMethods from './PaymentMethods';
import PaymentSchedules from './PaymentSchedules';
import Pricings from './Pricings';

export default function PaymentsUnified() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        <p className="text-muted-foreground">Manage all payment-related operations</p>
      </div>

      <Tabs defaultValue="payments-invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payments-invoices">Payments & Invoices</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="payments-invoices" className="space-y-6 mt-6">
          <Tabs defaultValue="invoices" className="w-full">
            <TabsList>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="invoices" className="mt-4">
              <div className="space-y-6">
                <Invoices />
              </div>
            </TabsContent>
            <TabsContent value="payments" className="mt-4">
              <div className="space-y-6">
                <Payments />
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Tabs defaultValue="payment-plans" className="w-full">
            <TabsList>
              <TabsTrigger value="payment-plans">Payment Plans</TabsTrigger>
              <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
              <TabsTrigger value="pricings">Pricings</TabsTrigger>
            </TabsList>
            <TabsContent value="payment-plans" className="mt-4">
              <PaymentPlans />
            </TabsContent>
            <TabsContent value="payment-methods" className="mt-4">
              <PaymentMethods />
            </TabsContent>
            <TabsContent value="pricings" className="mt-4">
              <Pricings />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="discounts" className="mt-6">
          <Discounts />
        </TabsContent>

        <TabsContent value="schedules" className="mt-6">
          <PaymentSchedules />
        </TabsContent>
      </Tabs>
    </div>
  );
}

