import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Award, Download, CheckCircle, ShieldCheck, Eye } from 'lucide-react';
import { exampleCertificates } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCertificates, issueCertificate, revokeCertificate, checkEligibility, verifyCertificate } from '@/api/endpoints/certificates';
import { getCohorts } from '@/api/endpoints/catalog';
import { getUsers } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ cohort: '', student: '', force: false });
  const [eligibilityData, setEligibilityData] = useState({ student: '', cohort: '' });
  const [verifyData, setVerifyData] = useState({ serialOrQr: '' });
  const [eligibilityResult, setEligibilityResult] = useState<{ eligible: boolean; reason?: string } | null>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => getCertificates(),
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => getUsers('STUDENT'),
    enabled: (user?.role === 'ADMIN' || user?.role === 'LECTURER') && (issueDialogOpen || eligibilityDialogOpen),
  });

  const issueMutation = useMutation({
    mutationFn: issueCertificate,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
      toast({
        title: t('pages.certificatesIssueSuccessTitle', 'Success'),
        description: t('pages.certificatesIssueSuccessDescription', `Issued ${result.issued} certificate(s)${result.errors.length > 0 ? `. ${result.errors.length} errors` : ''}`),
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
      toast({ title: t('pages.certificatesRevokeSuccessTitle', 'Success'), description: t('pages.certificatesRevokeSuccessDescription', 'Certificate revoked successfully') });
    },
    onError: (error) => {
      toast({ title: t('pages.certificatesErrorTitle', 'Error'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const eligibilityMutation = useMutation({
    mutationFn: ({ studentId, cohortId }: { studentId: string; cohortId: string }) =>
      checkEligibility(studentId, cohortId),
    onSuccess: (data) => {
      setEligibilityResult(data);
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (serialOrQr: string) => verifyCertificate(serialOrQr),
    onSuccess: (data) => {
      setVerifyResult(data);
    },
    onError: (error) => {
      toast({ title: t('pages.certificatesErrorTitle', 'Error'), description: getErrorMessage(error), variant: 'destructive' });
      setVerifyResult(null);
    },
  });

  const displayCertificates = certificates.length === 0 ? exampleCertificates.slice(0, 1) : certificates;
  const filteredCertificates = displayCertificates.filter((cert) =>
    cert.serial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIssue = () => {
    if (!formData.cohort) {
      toast({ title: 'Error', description: 'Please select a cohort', variant: 'destructive' });
      return;
    }
    const payload: any = { cohort_id: formData.cohort, force: formData.force };
    if (formData.student && formData.student !== 'all') {
      payload.student_id = formData.student;
    }
    issueMutation.mutate(payload);
  };

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this certificate?')) {
      revokeMutation.mutate({ id });
    }
  };

  const handleCheckEligibility = () => {
    if (!eligibilityData.student || !eligibilityData.cohort) {
      toast({
        title: 'Error',
        description: 'Student and cohort are required',
        variant: 'destructive',
      });
      return;
    }
    eligibilityMutation.mutate({
      studentId: eligibilityData.student,
      cohortId: eligibilityData.cohort,
    });
  };

  const handleVerify = () => {
    if (!verifyData.serialOrQr) {
      toast({
        title: 'Error',
        description: 'Serial number or QR token is required',
        variant: 'destructive',
      });
      return;
    }
    verifyMutation.mutate(verifyData.serialOrQr);
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
      <div className="flex items-center justify-between certificates_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.certificatesTitle', 'Certificates')}</h2>
          <p className="text-muted-foreground">{t('pages.certificatesSubtitle', 'Issue and manage course completion certificates')}</p>
        </div>
        <div className="flex gap-2 certificate_btn_wrapper">
          {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
            <>
              <Button variant="outline" onClick={() => setEligibilityDialogOpen(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('pages.certificatesCheckEligibility', 'Check Eligibility')}
              </Button>
              <Button variant="outline" onClick={() => setVerifyDialogOpen(true)}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {t('pages.certificatesVerify', 'Verify Certificate')}
              </Button>
            </>
          )}
          <div className="flex gap-2">
            {user?.role === 'ADMIN' && (
              <Button onClick={() => setIssueDialogOpen(true)} className='issue_certificate_btn'>
                <Award className="mr-2 h-4 w-4" />
                {t('pages.certificatesIssue', 'Issue Certificate')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm certificate_search">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('pages.certificatesSearchPlaceholder', 'Search certificates...')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {certificates.length === 0 && <ExampleBanner />}
      <Card>
        <CardHeader>
          <CardTitle>{t('pages.certificatesIssuedTitle', 'Issued Certificates')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCertificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 border border-border rounded-lg certificate_item">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 certificate_icon">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t('pages.certificatesStudentLabel', 'Student ID')}: {cert.student}</p>
                    <p className="text-sm text-muted-foreground">{t('pages.certificatesCohortLabel', 'Cohort ID')}: {cert.cohort}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('pages.certificatesSerialLabel', 'Serial')}: {cert.serial} • {t('pages.certificatesIssuedLabel', 'Issued')}: {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={cert.status === 'ISSUED' ? 'default' : 'destructive'}>{t(`pages.certificatesStatus_${cert.status}`, cert.status)}</Badge>
                  {cert.status === 'ISSUED' && (
                    <Button variant="outline" size="sm" onClick={() => handleRevoke(cert.id)}>
                      {t('pages.certificatesRevoke', 'Revoke')}
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
              {searchTerm ? t('pages.certificatesNoResultsSearch', 'No certificates found') : t('pages.certificatesNoResultsDefault', 'No certificates issued yet')}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.certificatesIssueDialogTitle', 'Issue Certificate')}</DialogTitle>
            <DialogDescription>{t('pages.certificatesIssueDialogDescription', 'Issue a certificate for a student in a cohort')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cohort">{t('pages.certificatesCohortLabel', 'Cohort')} *</Label>
              <Select value={formData.cohort} onValueChange={(value) => setFormData({ ...formData, cohort: value })}>
                  <SelectTrigger>
                  <SelectValue placeholder={t('pages.certificatesSelectCohortPlaceholder', 'Select cohort')} />
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
              <Label htmlFor="student">{t('pages.certificatesStudentOptionalLabel', 'Student (optional, leave empty for bulk)')}</Label>
              <Select
                value={formData.student}
                onValueChange={(value) => setFormData({ ...formData, student: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('pages.certificatesSelectStudentPlaceholder', 'Select student (optional)')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pages.certificatesAllEligible', 'All eligible students')}</SelectItem>
                  {students.map((student: any) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="force"
                checked={formData.force}
                onChange={(e) => setFormData({ ...formData, force: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="force" className="cursor-pointer">
                {t('pages.certificatesForceIssue', 'Force issue (ignore eligibility checks)')}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIssueDialogOpen(false)}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button onClick={handleIssue} disabled={!formData.cohort || issueMutation.isPending}>
              {issueMutation.isPending ? t('creating', 'Creating...') : t('pages.certificatesIssue', 'Issue Certificate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
        <>
          <Dialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen}>
            <DialogContent>
              <DialogHeader>
                    <DialogTitle>{t('pages.certificatesEligibilityTitle', 'Check Eligibility')}</DialogTitle>
                    <DialogDescription>{t('pages.certificatesEligibilityDescription', 'Check if a student is eligible for a certificate')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="eligibility_student">{t('pages.certificatesStudentLabel', 'Student')} *</Label>
                  <Select
                    value={eligibilityData.student}
                    onValueChange={(value) => setEligibilityData({ ...eligibilityData, student: value })}
                  >
                    <SelectTrigger>
                        <SelectValue placeholder={t('pages.certificatesSelectStudentPlaceholder', 'Select student')} />
                      </SelectTrigger>
                    <SelectContent>
                      {students.map((student: any) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eligibility_cohort">{t('pages.certificatesCohortLabel', 'Cohort')} *</Label>
                  <Select
                    value={eligibilityData.cohort}
                    onValueChange={(value) => setEligibilityData({ ...eligibilityData, cohort: value })}
                  >
                    <SelectTrigger>
                        <SelectValue placeholder={t('pages.certificatesSelectCohortPlaceholder', 'Select cohort')} />
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
                {eligibilityResult && (
                  <div className={`p-4 rounded-lg ${eligibilityResult.eligible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`font-medium ${eligibilityResult.eligible ? 'text-green-800' : 'text-red-800'}`}>
                      {eligibilityResult.eligible ? `✓ ${t('pages.certificatesEligible', 'Eligible')}` : `✗ ${t('pages.certificatesNotEligible', 'Not Eligible')}`}
                    </p>
                    {eligibilityResult.reason && (
                      <p className={`text-sm mt-1 ${eligibilityResult.eligible ? 'text-green-700' : 'text-red-700'}`}>
                        {eligibilityResult.reason}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setEligibilityDialogOpen(false);
                  setEligibilityResult(null);
                  setEligibilityData({ student: '', cohort: '' });
                }}>
                  {t('close', 'Close')}
                </Button>
                <Button onClick={handleCheckEligibility} disabled={eligibilityMutation.isPending || !eligibilityData.student || !eligibilityData.cohort}>
                  {eligibilityMutation.isPending ? t('pages.certificatesChecking', 'Checking...') : t('pages.certificatesCheckEligibility', 'Check Eligibility')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('pages.certificatesVerifyTitle', 'Verify Certificate')}</DialogTitle>
                <DialogDescription>{t('pages.certificatesVerifyDescription', 'Verify a certificate by serial number or QR token')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="verify_serial">{t('pages.certificatesVerifySerialLabel', 'Serial Number or QR Token')} *</Label>
                  <Input
                    id="verify_serial"
                    value={verifyData.serialOrQr}
                    onChange={(e) => setVerifyData({ serialOrQr: e.target.value })}
                    placeholder={t('pages.certificatesVerifyPlaceholder', 'Enter serial number or QR token')}
                  />
                </div>
                {verifyResult && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="font-medium text-green-800">✓ Certificate Verified</p>
                    <div className="mt-2 space-y-1 text-sm text-green-700">
                      <p>Serial: {verifyResult.serial}</p>
                      <p>Student: {verifyResult.student_name || verifyResult.student}</p>
                      <p>Cohort: {verifyResult.cohort_name || verifyResult.cohort}</p>
                      <p>Status: {verifyResult.status}</p>
                      <p>Issued: {new Date(verifyResult.issued_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setVerifyDialogOpen(false);
                  setVerifyResult(null);
                  setVerifyData({ serialOrQr: '' });
                }}>
                  {t('close', 'Close')}
                </Button>
                <Button onClick={handleVerify} disabled={verifyMutation.isPending || !verifyData.serialOrQr}>
                  {verifyMutation.isPending ? t('pages.certificatesVerifying', 'Verifying...') : t('pages.certificatesVerify', 'Verify')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
