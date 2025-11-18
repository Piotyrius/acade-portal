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

export default function VerifyCertificate() {
  const { toast } = useToast();
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!serial.trim()) {
      toast({
        title: 'Serial number required',
        description: 'Please enter a certificate serial number',
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
        title: 'Certificate found',
        description: 'Certificate is valid and verified',
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Certificate not found or invalid');
      toast({
        title: 'Verification failed',
        description: 'Certificate not found or invalid',
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
            Verify the authenticity of Cyber Academy certificates
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Certificate Serial Number</CardTitle>
            <CardDescription>
              Enter the serial number from the certificate to verify its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., CERT-2024-XXXXXX"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleVerify} disabled={loading}>
                {loading ? (
                  'Verifying...'
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verify
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {certificate && (
              <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Certificate Verified</AlertTitle>
                <AlertDescription>
                  This certificate is valid and has been issued by Cyber Academy
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
                Certificate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                  <p className="mt-1 font-mono text-sm">{certificate.serial_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {certificate.status === 'ISSUED' ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Issued
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Revoked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Student</p>
                <p className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {certificate.student_name}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Course</p>
                <p className="mt-1">{certificate.cohort_name}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                  <p className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(certificate.issued_at).toLocaleDateString()}
                  </p>
                </div>
                {certificate.revoked_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revoked Date</p>
                    <p className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(certificate.revoked_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {certificate.revocation_reason && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revocation Reason</p>
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
            This verification service confirms the authenticity of certificates issued by Cyber
            Academy.
          </p>
          <p className="mt-2">
            For questions or concerns, please contact{' '}
            <a href="mailto:info@academy.ge" className="text-primary hover:underline">
              info@academy.ge
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
