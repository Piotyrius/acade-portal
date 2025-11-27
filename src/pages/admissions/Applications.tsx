import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Check, X, Eye } from 'lucide-react';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, updateApplication, acceptApplication } from '@/api/endpoints/admissions';
import { getPrograms, getCohorts } from '@/api/endpoints/catalog';
import { ApplicationDto } from '@/api/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Applications() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationDto | null>(null);
  const [selectedCohort, setSelectedCohort] = useState('');

  // Mock data for preview
  const mockApplications: ApplicationDto[] = [
    { id: '1', program: '1', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1-555-0101', status: 'NEW', created_at: '2024-02-01T10:30:00Z', updated_at: '2024-02-01T10:30:00Z' },
    { id: '2', program: '1', name: 'Michael Chen', email: 'michael.chen@email.com', phone: '+1-555-0102', status: 'ACCEPTED', created_at: '2024-02-02T14:15:00Z', updated_at: '2024-02-05T09:20:00Z' },
    { id: '3', program: '2', name: 'Emily Rodriguez', email: 'emily.r@email.com', phone: '+1-555-0103', status: 'NEW', created_at: '2024-02-03T16:45:00Z', updated_at: '2024-02-03T16:45:00Z' },
    { id: '4', program: '3', name: 'David Kim', email: 'david.kim@email.com', phone: '+1-555-0104', status: 'ACCEPTED', created_at: '2024-02-04T11:20:00Z', updated_at: '2024-02-06T10:15:00Z' },
    { id: '5', program: '1', name: 'Jessica Martinez', email: 'jessica.m@email.com', phone: '+1-555-0105', status: 'REJECTED', created_at: '2024-02-05T09:00:00Z', updated_at: '2024-02-07T14:30:00Z' },
  ];

  const mockPrograms = [
    { id: '1', name: 'Cybersecurity Fundamentals', code: 'CS-101', description: '', active: true, version: '1.0', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
    { id: '2', name: 'Advanced Penetration Testing', code: 'CS-301', description: '', active: true, version: '1.0', created_at: '2024-01-16T00:00:00Z', updated_at: '2024-01-16T00:00:00Z' },
    { id: '3', name: 'Cloud Security Architecture', code: 'CS-201', description: '', active: true, version: '1.0', created_at: '2024-01-17T00:00:00Z', updated_at: '2024-01-17T00:00:00Z' },
  ];

  const { data: applications = mockApplications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => getApplications(),
  });

  const { data: programs = mockPrograms } = useQuery({
    queryKey: ['programs'],
    queryFn: () => getPrograms(),
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
    enabled: !!selectedApp,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApplicationDto> }) => updateApplication(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      toast({ title: 'Success', description: 'Application updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: ({ id, cohortId }: { id: string; cohortId: string }) => acceptApplication(id, cohortId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications', 'enrollments'] });
      toast({ title: 'Success', description: 'Application accepted and enrollment created' });
      setAcceptDialogOpen(false);
      setSelectedApp(null);
      setSelectedCohort('');
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const displayApplications = applications;
  const filteredApplications = displayApplications.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAccept = (app: ApplicationDto) => {
    if (app.status !== 'ACCEPTED') {
      toast({
        title: 'Error',
        description: 'Application must be accepted first before creating enrollment',
        variant: 'destructive',
      });
      return;
    }
    setSelectedApp(app);
    setAcceptDialogOpen(true);
  };

  const handleAcceptSubmit = () => {
    if (!selectedApp || !selectedCohort) return;
    acceptMutation.mutate({ id: selectedApp.id, cohortId: selectedCohort });
  };

  const handleStatusChange = (id: string, status: 'NEW' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED') => {
    updateMutation.mutate({ id, data: { status } });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-48 bg-muted animate-pulse rounded" />
          <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

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
          <Input
            placeholder="Search applications..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {applications.length === 0 && <ExampleBanner />}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const program = programs.find((p) => p.id === app.program);
              return (
                <div key={app.id} className="flex items-center justify-between p-4 border border-border rounded-lg application_item">
                  
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 application_icon">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{app.name}</p>
                      <p className="text-sm text-muted-foreground">{app.email} • {app.phone}</p>
                      <p className="text-xs text-muted-foreground mt-1">{program?.name || 'Unknown Program'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 application_bottom">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground application_date">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    

                    <Badge
                      className='application_badge'
                      variant={
                        app.status === 'ACCEPTED'
                          ? 'default'
                          : app.status === 'REJECTED'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {app.status}
                    </Badge>
                    {(app.status === 'NEW' || app.status === 'IN_REVIEW') && (
                      <div className="flex gap-2 application_status_btns">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(app.id, 'ACCEPTED')}
                          className='application_accept'
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(app.id, 'REJECTED')}
                          className='application_reject'
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {app.status === 'ACCEPTED' && (
                      <Button className='create_enrollment_btn' size="sm" onClick={() => handleAccept(app)}>
                        Create Enrollment
                      </Button>
                    )}


                  </div>

                </div>
              );
            })}
          </div>
          {filteredApplications.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm ? 'No applications found' : 'No applications yet'}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Enrollment</DialogTitle>
            <DialogDescription>Select a cohort for {selectedApp?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cohort">Cohort *</Label>
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cohort" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptSubmit} disabled={!selectedCohort || acceptMutation.isPending}>
              Create Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
