import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkLogs from './WorkLogs';
import Rates from './Rates';
import Timesheets from './Timesheets';

export default function TimekeepingUnified() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Timekeeping</h2>
        <p className="text-muted-foreground">Manage work logs, rates, and timesheets</p>
      </div>

      <Tabs defaultValue="worklogs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="worklogs">Work Logs</TabsTrigger>
          <TabsTrigger value="rates">Rates</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
        </TabsList>

        <TabsContent value="worklogs" className="mt-6">
          <div className="space-y-6">
            <WorkLogs />
          </div>
        </TabsContent>

        <TabsContent value="rates" className="mt-6">
          <div className="space-y-6">
            <Rates />
          </div>
        </TabsContent>

        <TabsContent value="timesheets" className="mt-6">
          <div className="space-y-6">
            <Timesheets />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

