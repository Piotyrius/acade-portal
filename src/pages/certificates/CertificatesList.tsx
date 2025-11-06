import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Award, Download } from 'lucide-react';

export default function CertificatesList() {
  const certificates = [
    { id: 1, student: 'John Smith', course: 'React Basics', issueDate: '2024-01-15', certificateId: 'CERT-001234' },
    { id: 2, student: 'Sarah Johnson', course: 'Python Fundamentals', issueDate: '2024-01-14', certificateId: 'CERT-001235' },
    { id: 3, student: 'Mike Wilson', course: 'Advanced JavaScript', issueDate: '2024-01-13', certificateId: 'CERT-001236' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>
          <p className="text-muted-foreground">Issue and manage course completion certificates</p>
        </div>
        <Button>
          <Award className="mr-2 h-4 w-4" />
          Issue Certificate
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search certificates..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issued Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{cert.student}</p>
                    <p className="text-sm text-muted-foreground">{cert.course}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{cert.certificateId}</p>
                    <p className="text-xs text-muted-foreground">{cert.issueDate}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
