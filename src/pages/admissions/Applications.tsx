import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, UserPlus } from 'lucide-react';

export default function Applications() {
  const applications = [
    { id: 1, name: 'John Smith', email: 'john@example.com', program: 'Web Development', status: 'Pending', date: '2024-01-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', program: 'Data Science', status: 'Approved', date: '2024-01-14' },
    { id: 3, name: 'Mike Wilson', email: 'mike@example.com', program: 'Mobile Dev', status: 'Rejected', date: '2024-01-13' },
    { id: 4, name: 'Emma Davis', email: 'emma@example.com', program: 'Web Development', status: 'Pending', date: '2024-01-12' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Applications</h2>
          <p className="text-muted-foreground">Review and process student applications</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search applications..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{app.name}</p>
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{app.program}</p>
                    <p className="text-xs text-muted-foreground">{app.date}</p>
                  </div>
                  <Badge 
                    variant={
                      app.status === 'Approved' ? 'default' : 
                      app.status === 'Rejected' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {app.status}
                  </Badge>
                  {app.status === 'Pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Approve</Button>
                      <Button size="sm" variant="outline">Reject</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
