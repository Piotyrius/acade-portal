import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';

export default function Programs() {
  const programs = [
    { id: 1, name: 'Web Development Bootcamp', code: 'WDB-2024', status: 'Active', courses: 12, students: 145 },
    { id: 2, name: 'Data Science Master', code: 'DSM-2024', status: 'Active', courses: 18, students: 98 },
    { id: 3, name: 'Mobile App Development', code: 'MAD-2024', status: 'Upcoming', courses: 10, students: 0 },
    { id: 4, name: 'UI/UX Design Program', code: 'UXD-2024', status: 'Active', courses: 8, students: 67 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Programs</h2>
          <p className="text-muted-foreground">Manage your educational programs</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search programs..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{program.name}</CardTitle>
                <Badge variant={program.status === 'Active' ? 'default' : 'secondary'}>
                  {program.status}
                </Badge>
              </div>
              <CardDescription>{program.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{program.courses} courses</span>
                <span className="text-muted-foreground">{program.students} students</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
