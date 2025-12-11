import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Assessments from './Assessments';
import Submissions from './Submissions';
import Grades from './Grades';

export default function AssessmentUnified() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assessment</h2>
        <p className="text-muted-foreground">Manage assessments, submissions, and grades</p>
      </div>

      <Tabs defaultValue="assessments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
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

