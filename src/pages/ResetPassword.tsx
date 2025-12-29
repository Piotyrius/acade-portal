import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { confirmPasswordReset } from '@/api/endpoints/auth';
import { Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast({
        title: t('pages.resetPasswordErrorInvalidLinkTitle'),
        description: t('pages.resetPasswordErrorInvalidLinkDescription'),
        variant: 'destructive',
      });
      navigate('/forgot-password');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: t('pages.resetPasswordErrorPasswordsNotMatchTitle'),
        description: t('pages.resetPasswordErrorPasswordsNotMatchDescription'),
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: t('pages.resetPasswordErrorPasswordTooShortTitle'),
        description: t('pages.resetPasswordErrorPasswordTooShortDescription'),
        variant: 'destructive',
      });
      return;
    }

    if (!token) {
      toast({
        title: t('pages.resetPasswordErrorInvalidTokenTitle'),
        description: t('pages.resetPasswordErrorInvalidTokenDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset(token, password);
      setIsSuccess(true);
      toast({
        title: t('pages.resetPasswordToastSuccessTitle'),
        description: t('pages.resetPasswordToastSuccessDescription'),
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || t('pages.resetPasswordErrorFallback');
      toast({
        title: t('pages.resetPasswordToastErrorTitle'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('pages.resetPasswordSuccessTitle')}</CardTitle>
            <CardDescription>
              {t('pages.resetPasswordSuccessDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('pages.resetPasswordSuccessRedirectMessage')}
            </p>
            <Button asChild className="w-full">
              <Link to="/login">{t('pages.resetPasswordButtonGoToLogin')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src="/logo.svg" alt="Cyber Academy" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl">{t('pages.resetPasswordTitle')}</CardTitle>
          <CardDescription>
            {t('pages.resetPasswordSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('pages.resetPasswordFieldNewPassword')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('pages.resetPasswordFieldNewPasswordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                {t('pages.resetPasswordFieldNewPasswordHelper')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('pages.resetPasswordFieldConfirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('pages.resetPasswordFieldConfirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('pages.resetPasswordButtonResetting') : t('pages.resetPasswordButtonReset')}
            </Button>
            <div className="text-center">
              <Button asChild variant="link" className="text-sm">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('pages.resetPasswordButtonBackToLogin')}
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

