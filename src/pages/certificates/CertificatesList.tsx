import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Award, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCertificates, issueCertificate, revokeCertificate } from '@/api/endpoints/certificates';
import { getCohorts } from '@/api/endpoints/catalog';
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

export default function CertificatesList() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ cohort: '', student: '', force: false });

  // Mock data for preview
  const mockCertificates = [
    { id: '1', student: 'student-101', cohort: '1', serial: 'CERT-2024-001', qr_token: 'QR-001', issued_at: '2024-03-15T00:00:00Z', revoked_at: null, revocation_reason: null, status: 'ISSUED' as const },
    { id: '2', student: 'student-102', cohort: '1', serial: 'CERT-2024-002', qr_token: 'QR-002', issued_at: '2024-03-15T00:00:00Z', revoked_at: null, revocation_reason: null, status: 'ISSUED' as const },
    { id: '3', student: 'student-103', cohort: '4', serial: 'CERT-2023-089', qr_token: 'QR-089', issued_at: '2023-12-20T00:00:00Z', revoked_at: null, revocation_reason: null, status: 'ISSUED' as const },
    { id: '4', student: 'student-104', cohort: '4', serial: 'CERT-2023-090', qr_token: 'QR-090', issued_at: '2023-12-20T00:00:00Z', revoked_at: '2024-01-10T00:00:00Z', revocation_reason: 'Plagiarism discovered', status: 'REVOKED' as const },
  ];

  const mockCohorts = [
    { id: '1', course: '1', name: 'Network Security - Spring 2024', lecturer: 'lect-1', capacity: 30, start_date: '2024-03-01', end_date: '2024-05-30', status: 'ACTIVE' as const, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
    { id: '2', course: '2', name: 'Ethical Hacking - Evening Batch', lecturer: 'lect-2', capacity: 25, start_date: '2024-02-15', end_date: '2024-06-15', status: 'ENROLLING' as const, created_at: '2024-01-16T00:00:00Z', updated_at: '2024-01-16T00:00:00Z' },
    { id: '4', course: '1', name: 'Network Security - Fall 2023', lecturer: 'lect-1', capacity: 30, start_date: '2023-09-01', end_date: '2023-12-15', status: 'COMPLETED' as const, created_at: '2023-08-15T00:00:00Z', updated_at: '2023-12-15T00:00:00Z' },
  ];

  const { data: certificates = mockCertificates, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => getCertificates(),
  });

  const { data: cohorts = mockCohorts } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
  });

  const issueMutation = useMutation({
    mutationFn: issueCertificate,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
      toast({
        title: 'Success',
        description: `Issued ${result.issued} certificate(s)${result.errors.length > 0 ? `. ${result.errors.length} errors` : ''}`,
      });
      setIssueDialogOpen(false);
      setFormData({ cohort: '', student: '', force: false });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => revokeCertificate(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
      toast({ title: 'Success', description: 'Certificate revoked successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const filteredCertificates = certificates.filter((cert) =>
    cert.serial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIssue = () => {
    if (!formData.cohort) {
      toast({ title: 'Error', description: 'Please select a cohort', variant: 'destructive' });
      return;
    }
    const payload: any = { cohort_id: formData.cohort, force: formData.force };
    if (formData.student) {
      payload.student_id = formData.student;
    }
    issueMutation.mutate(payload);
  };

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this certificate?')) {
      revokeMutation.mutate({ id });
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
          <div className="h-10 w-44 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>
          <p className="text-muted-foreground">Issue and manage course completion certificates</p>
        </div>
        <Button onClick={() => setIssueDialogOpen(true)}>
          <Award className="mr-2 h-4 w-4" />
          Issue Certificate
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search certificates..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issued Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCertificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Student ID: {cert.student}</p>
                    <p className="text-sm text-muted-foreground">Cohort ID: {cert.cohort}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Serial: {cert.serial} • Issued: {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={cert.status === 'ISSUED' ? 'default' : 'destructive'}>{cert.status}</Badge>
                  {cert.status === 'ISSUED' && (
                    <Button variant="outline" size="sm" onClick={() => handleRevoke(cert.id)}>
                      Revoke
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {filteredCertificates.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm ? 'No certificates found' : 'No certificates issued yet'}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Certificate</DialogTitle>
            <DialogDescription>Issue a certificate for a student in a cohort</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cohort">Cohort *</Label>
              <Select value={formData.cohort} onValueChange={(value) => setFormData({ ...formData, cohort: value })}>
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
            <div className="space-y-2">
              <Label htmlFor="student">Student ID (optional, leave empty for bulk)</Label>
              <Input
                id="student"
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                placeholder="Student UUID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIssueDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleIssue} disabled={!formData.cohort || issueMutation.isPending}>
              Issue Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
