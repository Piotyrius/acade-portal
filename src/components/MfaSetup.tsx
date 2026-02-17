import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Eye, EyeOff, Loader2, Shield, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface MfaSetupProps {
  secret: string;
  qrCodeUri?: string;
  userEmail: string;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
}

export function MfaSetup({ secret, qrCodeUri, userEmail, onVerify, onCancel }: MfaSetupProps) {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [code, setCode] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Generate otpauth URI if not provided
  const otpAuthUri = qrCodeUri || `otpauth://totp/Academy%20CRM:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=Academy%20CRM`;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast({
      title: t('pages.mfaSetupCopySuccess'),
      description: t('pages.mfaSetupCopyDescription'),
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({
        title: t('pages.mfaSetupInvalidCodeTitle'),
        description: t('pages.mfaSetupInvalidCodeDescription'),
        variant: 'destructive',
      });
      return;
    }

    setVerifying(true);
    try {
      await onVerify(code);
      setStep('verify');
    } catch (error: any) {
      toast({
        title: t('pages.mfaSetupVerificationFailedTitle'),
        description: error.response?.data?.detail || error.message || t('pages.mfaSetupVerificationFailedDescription'),
        variant: 'destructive',
      });
      setCode('');
    } finally {
      setVerifying(false);
    }
  };

  if (step === 'verify') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            {t('pages.mfaSetupSuccessTitle')}
          </CardTitle>
          <CardDescription>{t('pages.mfaSetupSuccessDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {t('pages.mfaSetupSuccessMessage')}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={onCancel} className="w-full">
              {t('pages.mfaSetupButtonDone')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {t('pages.mfaSetupTitle')}
          </CardTitle>
          <CardDescription>
            {t('pages.mfaSetupDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: QR Code and Secret */}
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-border">
                <QRCodeSVG value={otpAuthUri} size={200} level="M" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {t('pages.mfaSetupScanInstructions')}
              </p>
            </div>

            {/* Manual Entry Option */}
            <div className="space-y-2">
              <Label>{t('pages.mfaSetupManualEntry')}</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm">
                  {showSecret ? secret : '•'.repeat(secret.length)}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopySecret}
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>{t('pages.mfaSetupInstructionsTitle')}</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>{t('pages.mfaSetupInstructions1')}</li>
                  <li>{t('pages.mfaSetupInstructions2')}</li>
                  <li>{t('pages.mfaSetupInstructions3')}</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>

          {/* Step 2: Verification */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>{t('pages.mfaSetupVerificationLabel')}</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  disabled={verifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {t('pages.mfaSetupVerificationHelper')}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleVerify}
                disabled={code.length !== 6 || verifying}
                className="flex-1"
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('pages.mfaSetupButtonVerifying')}
                  </>
                ) : (
                  t('pages.mfaSetupButtonVerify')
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={verifying}
              >
                {t('pages.mfaSetupButtonCancel')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

