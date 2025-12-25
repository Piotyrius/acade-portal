import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, FileCheck } from 'lucide-react';
import Assessments from './Assessments';
import Submissions from './Submissions';
import Grades from './Grades';
import { useTranslation } from 'react-i18next';

export default function AssessmentUnified() {
  const [tab, setTab] = useState<'assessments' | 'submissions' | 'grades'>('assessments');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize tab from URL (?tab=grades) for deep links from Cohorts/Teaching
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'assessments' || tabParam === 'submissions' || tabParam === 'grades') {
      setTab(tabParam);
    }
  }, [searchParams]);

  const { t } = useTranslation('common');

  const handleGoToAttendance = () => {
    navigate('/attendance/list');
  };

  const handleGoToGrades = () => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'grades');
    navigate({ pathname: '/assessment', search: params.toString() });
    setTab('grades');
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('layout.teaching')}</h2>
          <p className="text-muted-foreground">{t('pages.catalogCohortsTakeAttendanceTitle')} &mdash; {t('dashboard.gradeSubmissions')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGoToAttendance}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            {t('pages.catalogCohortsTakeAttendanceTitle')}
          </Button>
          <Button onClick={handleGoToGrades}>
            <FileCheck className="mr-2 h-4 w-4" />
            {t('dashboard.gradeSubmissions')}
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessments">{t('assessment.tabs.assessments')}</TabsTrigger>
          <TabsTrigger value="submissions">{t('assessment.tabs.submissions')}</TabsTrigger>
          <TabsTrigger value="grades">{t('assessment.tabs.grades')}</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="mt-6">
          <div className="space-y-6">
            <Assessments />
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
          <div className="space-y-6">
            <Submissions />
          </div>
        </TabsContent>

        <TabsContent value="grades" className="mt-6">
          <div className="space-y-6">
            <Grades />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

