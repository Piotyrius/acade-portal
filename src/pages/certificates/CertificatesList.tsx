import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Award, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { exampleCertificates } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCertificates,
  issueCertificate,
  revokeCertificate,
  checkEligibility,
  verifyCertificate,
} from '@/api/endpoints/certificates';
import { getCohorts } from '@/api/endpoints/catalog';
import { getUsers } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

export default function CertificatesList() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [eligibilityDialogOpen, setEligibilityDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ cohort: '', student: '', force: false });
  const [eligibilityData, setEligibilityData] = useState({ student: '', cohort: '' });
  const [verifyData, setVerifyData] = useState({ serialOrQr: '' });
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean;
    reason?: string;
  } | null>(null);
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
        title: t('pages.certificatesToastIssueSuccessTitle'),
        description: t('pages.certificatesToastIssueSuccessDescription', {
          count: result.issued,
          errors: result.errors.length,
        }),
      });
      setIssueDialogOpen(false);
      setFormData({ cohort: '', student: '', force: false });
    },
    onError: (error) => {
      toast({
        title: t('pages.certificatesToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => revokeCertificate(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
      toast({
        title: t('pages.certificatesToastRevokeSuccessTitle'),
        description: t('pages.certificatesToastRevokeSuccessDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('pages.certificatesToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const eligibilityMutation = useMutation({
    mutationFn: ({ studentId, cohortId }: { studentId: string; cohortId: string }) =>
      checkEligibility(studentId, cohortId),
    onSuccess: (data) => {
      setEligibilityResult(data);
    },
    onError: (error) => {
      toast({
        title: t('pages.certificatesToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (serialOrQr: string) => verifyCertificate(serialOrQr),
    onSuccess: (data) => {
      setVerifyResult(data);
    },
    onError: (error) => {
      toast({
        title: t('pages.certificatesToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
      setVerifyResult(null);
    },
  });

  const displayCertificates = certificates.length === 0 ? exampleCertificates.slice(0, 1) : certificates;
  const filteredCertificates = displayCertificates.filter((cert) =>
    cert.serial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIssue = () => {
    if (!formData.cohort) {
      toast({
        title: t('pages.certificatesToastErrorTitle'),
        description: t('pages.certificatesErrorCohortRequired'),
        variant: 'destructive',
      });
      return;
    }
    const payload: any = { cohort_id: formData.cohort, force: formData.force };
    if (formData.student && formData.student !== 'all') {
      payload.student_id = formData.student;
    }
    issueMutation.mutate(payload);
  };

  const handleRevoke = (id: string) => {
    if (confirm(t('pages.certificatesConfirmRevoke'))) {
      revokeMutation.mutate({ id });
    }
  };

  const handleCheckEligibility = () => {
    if (!eligibilityData.student || !eligibilityData.cohort) {
      toast({
        title: t('pages.certificatesToastErrorTitle'),
        description: t('pages.certificatesErrorEligibilityRequired'),
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
        title: t('pages.certificatesToastErrorTitle'),
        description: t('pages.certificatesErrorSerialRequired'),
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
          <h2 className="text-3xl font-bold tracking-tight">
            {t('pages.certificatesTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('pages.certificatesSubtitle')}
          </p>
        </div>
        <div className="flex gap-2 certificate_btn_wrapper">
          {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
            <>
              <Button variant="outline" onClick={() => setEligibilityDialogOpen(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('pages.certificatesCtaCheckEligibility')}
              </Button>
              <Button variant="outline" onClick={() => setVerifyDialogOpen(true)}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {t('pages.certificatesCtaVerify')}
              </Button>
            </>
          )}
          <div className="flex gap-2">
            {user?.role === 'ADMIN' && (
              <Button onClick={() => setIssueDialogOpen(true)} className='issue_certificate_btn'>
                <Award className="mr-2 h-4 w-4" />
                {t('pages.certificatesCtaIssue')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm certificate_search">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('pages.certificatesSearchPlaceholder')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {certificates.length === 0 && <ExampleBanner />}
      <Card>
        <CardHeader>
          <CardTitle>{t('pages.certificatesCardTitle')}</CardTitle>
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
                    <p className="font-medium">
                      {t('pages.certificatesItemStudentId', { id: cert.student })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('pages.certificatesItemCohortId', { id: cert.cohort })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('pages.certificatesItemSerialIssued', {
                        serial: cert.serial,
                        date: new Date(cert.issued_at).toLocaleDateString(),
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={cert.status === 'ISSUED' ? 'default' : 'destructive'}>{cert.status}</Badge>
                  {cert.status === 'ISSUED' && (
                    <Button variant="outline" size="sm" onClick={() => handleRevoke(cert.id)}>
                      {t('pages.certificatesRevokeCta')}
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
              {searchTerm
                ? t('pages.certificatesNoneFoundSearch')
                : t('pages.certificatesNoneFoundDefault')}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.certificatesIssueDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('pages.certificatesIssueDialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cohort">
                {t('pages.certificatesIssueCohortLabel')}
              </Label>
              <Select value={formData.cohort} onValueChange={(value) => setFormData({ ...formData, cohort: value })}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('pages.certificatesIssueCohortPlaceholder')}
                  />
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
              <Label htmlFor="student">
                {t('pages.certificatesIssueStudentLabel')}
              </Label>
              <Select
                value={formData.student}
                onValueChange={(value) => setFormData({ ...formData, student: value })}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('pages.certificatesIssueStudentPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('pages.certificatesIssueStudentAllOption')}
                  </SelectItem>
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
                {t('pages.certificatesIssueForceLabel')}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIssueDialogOpen(false)}>
              {t('pages.certificatesCancel')}
            </Button>
            <Button onClick={handleIssue} disabled={!formData.cohort || issueMutation.isPending}>
              {issueMutation.isPending
                ? t('pages.certificatesIssueSubmitting')
                : t('pages.certificatesIssueSubmit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
        <>
          <Dialog open={eligibilityDialogOpen} onOpenChange={setEligibilityDialogOpen}>
            <DialogContent>
              <DialogHeader>
              <DialogTitle>{t('pages.certificatesEligibilityDialogTitle')}</DialogTitle>
              <DialogDescription>
                {t('pages.certificatesEligibilityDialogDescription')}
              </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                <Label htmlFor="eligibility_student">
                  {t('pages.certificatesEligibilityStudentLabel')}
                </Label>
                  <Select
                    value={eligibilityData.student}
                    onValueChange={(value) => setEligibilityData({ ...eligibilityData, student: value })}
                  >
                    <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'pages.certificatesEligibilityStudentPlaceholder',
                      )}
                    />
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
                <Label htmlFor="eligibility_cohort">
                  {t('pages.certificatesEligibilityCohortLabel')}
                </Label>
                  <Select
                    value={eligibilityData.cohort}
                    onValueChange={(value) => setEligibilityData({ ...eligibilityData, cohort: value })}
                  >
                    <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'pages.certificatesEligibilityCohortPlaceholder',
                      )}
                    />
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
                    {eligibilityResult.eligible
                      ? t('pages.certificatesEligibilityResultEligible')
                      : t('pages.certificatesEligibilityResultNotEligible')}
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
                {t('pages.certificatesClose')}
                </Button>
                <Button onClick={handleCheckEligibility} disabled={eligibilityMutation.isPending || !eligibilityData.student || !eligibilityData.cohort}>
                {eligibilityMutation.isPending
                  ? t('pages.certificatesEligibilityChecking')
                  : t('pages.certificatesCtaCheckEligibility')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
            <DialogContent>
              <DialogHeader>
              <DialogTitle>{t('pages.certificatesVerifyDialogTitle')}</DialogTitle>
              <DialogDescription>
                {t('pages.certificatesVerifyDialogDescription')}
              </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                <Label htmlFor="verify_serial">
                  {t('pages.certificatesVerifySerialLabel')}
                </Label>
                  <Input
                    id="verify_serial"
                    value={verifyData.serialOrQr}
                    onChange={(e) => setVerifyData({ serialOrQr: e.target.value })}
                  placeholder={t('pages.certificatesVerifySerialPlaceholder')}
                  />
                </div>
                {verifyResult && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="font-medium text-green-800">
                    {t('pages.certificatesVerifyResultTitle')}
                  </p>
                    <div className="mt-2 space-y-1 text-sm text-green-700">
                    <p>
                      {t('pages.certificatesVerifySerialLabelShort')}{' '}
                      {verifyResult.serial}
                    </p>
                    <p>
                      {t('pages.certificatesVerifyStudentLabel')}{' '}
                      {verifyResult.student_name || verifyResult.student}
                    </p>
                    <p>
                      {t('pages.certificatesVerifyCohortLabel')}{' '}
                      {verifyResult.cohort_name || verifyResult.cohort}
                    </p>
                    <p>
                      {t('pages.certificatesVerifyStatusLabel')}{' '}
                      {verifyResult.status}
                    </p>
                    <p>
                      {t('pages.certificatesVerifyIssuedLabel')}{' '}
                      {new Date(verifyResult.issued_at).toLocaleDateString()}
                    </p>
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
                {t('pages.certificatesClose')}
                </Button>
                <Button onClick={handleVerify} disabled={verifyMutation.isPending || !verifyData.serialOrQr}>
                {verifyMutation.isPending
                  ? t('pages.certificatesVerifySubmitting')
                  : t('pages.certificatesVerifySubmit')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
