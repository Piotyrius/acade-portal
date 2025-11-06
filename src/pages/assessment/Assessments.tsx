import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileCheck } from 'lucide-react';

export default function Assessments() {
  const assessments = [
    { id: 1, title: 'React Final Exam', course: 'React Basics', type: 'Exam', dueDate: '2024-01-20', submissions: 23, total: 30 },
    { id: 2, title: 'Python Project', course: 'Python Fundamentals', type: 'Project', dueDate: '2024-01-25', submissions: 18, total: 25 },
    { id: 3, title: 'JavaScript Quiz', course: 'Advanced JS', type: 'Quiz', dueDate: '2024-01-18', submissions: 32, total: 32 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assessments</h2>
          <p className="text-muted-foreground">Create and manage course assessments</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Assessment
        </Button>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <FileCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{assessment.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {assessment.course} • Due: {assessment.dueDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{assessment.type}</Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {assessment.submissions}/{assessment.total}
                    </p>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
