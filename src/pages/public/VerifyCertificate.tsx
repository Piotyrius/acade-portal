import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { verifyCertificate } from '@/api/endpoints/certificates';
import { Shield, CheckCircle, XCircle, Search, Award, Calendar, User } from 'lucide-react';
import { CertificateDto } from '@/api/types';
import { useTranslation } from 'react-i18next';

export default function VerifyCertificate() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!serial.trim()) {
      toast({
        title: t('pages.verifyCertificateSerialRequiredTitle'),
        description: t('pages.verifyCertificateSerialRequiredDescription'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const result = await verifyCertificate(serial.trim());
      setCertificate(result);
      toast({
        title: t('pages.verifyCertificateFoundTitle'),
        description: t('pages.verifyCertificateFoundDescription'),
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || t('pages.verifyCertificateErrorFallback'));
      toast({
        title: t('pages.verifyCertificateFailedTitle'),
        description: t('pages.verifyCertificateFailedDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Certificate Verification</h1>
          <p className="mt-2 text-muted-foreground">
            {t('pages.verifyCertificateSubtitle')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('pages.verifyCertificateFormTitle')}</CardTitle>
            <CardDescription>{t('pages.verifyCertificateFormSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t('pages.verifyCertificatePlaceholder')}
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleVerify} disabled={loading}>
                {loading ? (
                  t('pages.verifyCertificateButtonLoading')
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    {t('pages.verifyCertificateButtonIdle')}
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>{t('pages.verifyCertificateErrorAlertTitle')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {certificate && (
              <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>{t('pages.verifyCertificateVerifiedAlertTitle')}</AlertTitle>
                <AlertDescription>
                  {t('pages.verifyCertificateVerifiedAlertDescription')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {certificate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {t('pages.verifyCertificateDetailsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('pages.verifyCertificateSerialLabel')}
                  </p>
                  <p className="mt-1 font-mono text-sm">{certificate.serial_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('pages.verifyCertificateStatusLabel')}
                  </p>
                  <div className="mt-1">
                    {certificate.status === 'ISSUED' ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {t('pages.verifyCertificateStatusIssued')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        {t('pages.verifyCertificateStatusRevoked')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('pages.verifyCertificateStudentLabel')}
                </p>
                <p className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {certificate.student_name}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('pages.verifyCertificateCourseLabel')}
                </p>
                <p className="mt-1">{certificate.cohort_name}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('pages.verifyCertificateIssueDateLabel')}
                  </p>
                  <p className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(certificate.issued_at).toLocaleDateString()}
                  </p>
                </div>
                {certificate.revoked_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('pages.verifyCertificateRevokedDateLabel')}
                    </p>
                    <p className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(certificate.revoked_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {certificate.revocation_reason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('pages.verifyCertificateRevocationReasonLabel')}
                  </p>
                  <p className="mt-1 text-sm">{certificate.revocation_reason}</p>
                </div>
              )}

              {certificate.qr_code && (
                <div className="flex justify-center pt-4">
                  <img
                    src={certificate.qr_code}
                    alt="Certificate QR Code"
                    className="h-32 w-32 rounded border"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>
            {t('pages.verifyCertificateFooterLine1')}
          </p>
          <p className="mt-2">
            {t('pages.verifyCertificateFooterLine2')}{' '}
            <a href="mailto:info@academy.ge" className="text-primary hover:underline">
              {t('pages.verifyCertificateFooterEmail')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
