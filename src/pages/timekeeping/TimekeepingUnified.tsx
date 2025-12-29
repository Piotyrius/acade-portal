import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkLogs from './WorkLogs';
import Rates from './Rates';
import Timesheets from './Timesheets';
import { useTranslation } from 'react-i18next';

export default function TimekeepingUnified() {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t('pages.timekeepingTitle')}
        </h2>
        <p className="text-muted-foreground">
          {t('pages.timekeepingSubtitle')}
        </p>
      </div>

      <Tabs defaultValue="worklogs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="worklogs">
            {t('pages.timekeepingTabWorkLogs')}
          </TabsTrigger>
          <TabsTrigger value="rates">
            {t('pages.timekeepingTabRates')}
          </TabsTrigger>
          <TabsTrigger value="timesheets">
            {t('pages.timekeepingTabTimesheets')}
          </TabsTrigger>
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

