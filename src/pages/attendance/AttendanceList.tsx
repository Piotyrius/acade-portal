import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ClipboardCheck } from 'lucide-react';

export default function AttendanceList() {
  const attendance = [
    { id: 1, student: 'John Smith', course: 'React Basics', date: '2024-01-15', status: 'Present' },
    { id: 2, student: 'Sarah Johnson', course: 'React Basics', date: '2024-01-15', status: 'Present' },
    { id: 3, student: 'Mike Wilson', course: 'React Basics', date: '2024-01-15', status: 'Absent' },
    { id: 4, student: 'Emma Davis', course: 'React Basics', date: '2024-01-15', status: 'Late' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">Track student attendance records</p>
        </div>
        <Button>
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search attendance..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">{record.student}</p>
                  <p className="text-sm text-muted-foreground">{record.course} • {record.date}</p>
                </div>
                <Badge 
                  variant={
                    record.status === 'Present' ? 'default' : 
                    record.status === 'Absent' ? 'destructive' : 
                    'secondary'
                  }
                >
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
