import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ClipboardCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAttendanceRecords } from '@/api/endpoints/attendance';
import { getSessions } from '@/api/endpoints/catalog';
import { useState } from 'react';

export default function AttendanceList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => getAttendanceRecords(),
    staleTime: 2 * 60 * 1000, // 2 minutes for attendance data
  });

  // Only fetch sessions if we have records to display
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => getSessions(),
    enabled: records.length > 0, // Only fetch if we have attendance records
    staleTime: 5 * 60 * 1000, // 5 minutes for session data
  });

  const filteredRecords = records.filter((record) => {
    const session = sessions.find((s) => s.id === record.session);
    return searchTerm === '' || session?.cohort?.toString().includes(searchTerm);
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'default';
      case 'ABSENT':
        return 'destructive';
      case 'LATE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-40 bg-muted animate-pulse rounded" />
            <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
          </div>
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

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
          <Input
            placeholder="Search attendance..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const session = sessions.find((s) => s.id === record.session);
              return (
                <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">Student ID: {record.student}</p>
                    <p className="text-sm text-muted-foreground">
                      Session: {session ? new Date(session.start_at).toLocaleString() : 'Unknown'} •{' '}
                      {new Date(record.marked_at).toLocaleDateString()}
                    </p>
                    {record.note && <p className="text-xs text-muted-foreground mt-1">Note: {record.note}</p>}
                  </div>
                  <Badge variant={getStatusVariant(record.status)}>{record.status}</Badge>
                </div>
              );
            })}
          </div>
          {filteredRecords.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm ? 'No attendance records found' : 'No attendance records yet'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
