import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, BookOpen } from 'lucide-react';

export default function Courses() {
  const courses = [
    { id: 1, name: 'Introduction to React', code: 'REACT-101', program: 'Web Development', status: 'Active', enrolled: 45 },
    { id: 2, name: 'Python Fundamentals', code: 'PY-101', program: 'Data Science', status: 'Active', enrolled: 38 },
    { id: 3, name: 'Advanced JavaScript', code: 'JS-201', program: 'Web Development', status: 'Active', enrolled: 32 },
    { id: 4, name: 'Machine Learning Basics', code: 'ML-101', program: 'Data Science', status: 'Draft', enrolled: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">Browse and manage courses</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search courses..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{course.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {course.code} • {course.program}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={course.status === 'Active' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{course.enrolled} enrolled</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
