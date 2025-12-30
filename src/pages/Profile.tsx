import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMe, updateProfile, setupMfa, verifyMfa, disableMfa } from '@/api/endpoints/auth';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { User, Mail, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { MfaSetup } from '@/components/MfaSetup';
import { uploadProfilePicture } from '@/api/endpoints/gallery';
import { useTranslation } from 'react-i18next';


export default function Profile() {
  const { t } = useTranslation('common');
  const { user, setAuth } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [mfaDisableOpen, setMfaDisableOpen] = useState(false);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [avatarBuster, setAvatarBuster] = useState(() => Date.now());
  const [pendingProfilePictureFile, setPendingProfilePictureFile] = useState<File | null>(null);
  // Fetch full user data (includes profile picture + MFA state)
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !!user,
  });

  const displayUser = currentUser || user;
  const firstName = displayUser
    ? 'firstName' in displayUser
      ? displayUser.firstName
      : displayUser.first_name
    : '';
  const lastName = displayUser
    ? 'lastName' in displayUser
      ? displayUser.lastName
      : displayUser.last_name
    : '';
  const profilePictureUrl: string | undefined = (displayUser as any)?.profile_picture_url || undefined;
  const profilePictureSrc = profilePictureUrl
    ? `${profilePictureUrl}${profilePictureUrl.includes('?') ? '&' : '?'}v=${avatarBuster}`
    : undefined;
  const mfaEnabled = Boolean((displayUser as any)?.mfa_enabled);

  // Bump cache buster whenever /me refetches so the browser doesn't reuse the old cached image.
  useEffect(() => {
    if (currentUser) {
      setAvatarBuster(Date.now());
    }
  }, [currentUser]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  // Initialize form data when user is available
  useEffect(() => {
    if (displayUser) {
      setFormData({
        first_name: firstName || '',
        last_name: lastName || '',
        email: displayUser.email || '',
      });
    }
  }, [displayUser, firstName, lastName]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update auth store with new user data
      const currentAuth = useAuthStore.getState();
      if (currentAuth.user) {
        setAuth(
          {
            ...currentAuth.user,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
          },
          currentAuth.accessToken!,
          currentAuth.refreshToken!
        );
      }
      qc.invalidateQueries({ queryKey: ['me'] });
      toast({ title: t('pages.profileToastUpdateSuccessTitle'), description: t('pages.profileToastUpdateSuccessDescription') });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({ title: t('pages.profileToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fileToUpload = pendingProfilePictureFile;

      // Update name fields first so the store reflects the latest user details.
      await updateMutation.mutateAsync({
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      // Only upload picture when user submits the form.
      if (fileToUpload) {
        await uploadPictureMutation.mutateAsync(fileToUpload);
      }

      setPendingProfilePictureFile(null);
    } catch {
      // Errors are handled by mutation onError/toasts.
    }
  };

  // MFA Setup Mutation
  const mfaSetupMutation = useMutation({
    mutationFn: setupMfa,
    onSuccess: (data) => {
      // The API might return the secret in different fields
      const secret = (data as any).mfa_secret || (data as any).secret || (data as any).totp_secret || '';
      if (!secret) {
        toast({
          title: t('pages.profileToastErrorTitle'),
          description: t('pages.profileMfaErrorSecretRetrieval'),
          variant: 'destructive',
        });
        return;
      }
      setMfaSecret(secret);
      setMfaSetupOpen(true);
    },
    onError: (error) => {
      toast({
        title: t('pages.profileToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  // MFA Verify Mutation
  const mfaVerifyMutation = useMutation({
    mutationFn: verifyMfa,
    onSuccess: (data) => {
      // Update auth store
      const currentAuth = useAuthStore.getState();
      if (currentAuth.user) {
        setAuth(
          {
            ...currentAuth.user,
            mfa_enabled: true,
          },
          currentAuth.accessToken!,
          currentAuth.refreshToken!
        );
      }
      qc.invalidateQueries({ queryKey: ['me'] });
      toast({
        title: t('pages.profileToastMfaEnabledTitle'),
        description: t('pages.profileToastMfaEnabledDescription'),
      });
      setMfaSetupOpen(false);
      setMfaSecret(null);
    },
    onError: (error) => {
      throw error; // Let MfaSetup component handle the error
    },
  });

  // add profile picture

  const uploadPictureMutation = useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: async () => {
      // The upload endpoint doesn't always return the full profile_picture_url.
      // Refetch /me to get the authoritative updated URL, then update cache + store.
      try {
        const freshMe = await fetchMe();
        qc.setQueryData(['me'], freshMe);

        const currentAuth = useAuthStore.getState();
        if (currentAuth.user) {
          setAuth(
            {
              ...currentAuth.user,
              profile_picture_url: (freshMe as any).profile_picture_url,
            },
            currentAuth.accessToken!,
            currentAuth.refreshToken!
          );
        }

        setAvatarBuster(Date.now());
      } finally {
        qc.invalidateQueries({ queryKey: ['me'] });
      }

      toast({
        title: t('pages.profileToastPictureUpdateTitle'),
        description: t('pages.profileToastPictureUpdateDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('pages.profileToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  // MFA Disable Mutation
  const mfaDisableMutation = useMutation({
    mutationFn: disableMfa,
    onSuccess: (data) => {
      // Update auth store
      const currentAuth = useAuthStore.getState();
      if (currentAuth.user) {
        setAuth(
          {
            ...currentAuth.user,
            mfa_enabled: false,
          },
          currentAuth.accessToken!,
          currentAuth.refreshToken!
        );
      }
      qc.invalidateQueries({ queryKey: ['me'] });
      toast({
        title: t('pages.profileToastMfaDisabledTitle'),
        description: t('pages.profileToastMfaDisabledDescription'),
      });
      setMfaDisableOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('pages.profileToastErrorTitle'),
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const handleStartMfaSetup = () => {
    mfaSetupMutation.mutate();
  };

  const handleVerifyMfa = async (code: string) => {
    await mfaVerifyMutation.mutateAsync(code);
  };

  const handleDisableMfa = () => {
    mfaDisableMutation.mutate();
  };

  const initials = displayUser
    ? `${firstName?.[0] || ''}${lastName?.[0] || ''}`
    : 'U';

  if (isLoading && !displayUser) {
    return <div className="p-6">{t('pages.profileLoading')}</div>;
  }

  

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('pages.profileTitle')}</h2>
        <p className="text-muted-foreground">{t('pages.profileSubtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('pages.profileCardInfoTitle')}</CardTitle>
            <CardDescription>{t('pages.profileCardInfoDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">


            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    {profilePictureUrl ? (
                      <AvatarImage 
                        src={profilePictureSrc} 
                        alt={`${firstName} ${lastName}`}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="text-lg font-semibold">
                      {firstName} {lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{displayUser?.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      {displayUser?.role === 'ADMIN' ? t('layout.userRoleAdmin') : 
                       displayUser?.role === 'LECTURER' ? t('layout.userRoleLecturer') : 
                       displayUser?.role === 'STUDENT' ? t('layout.userRoleStudent') : 
                       displayUser?.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('pages.profileFieldFullName')}</p>
                    <p className="text-sm text-muted-foreground">
                      {firstName} {lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('pages.profileFieldEmail')}</p>
                    <p className="text-sm text-muted-foreground">{displayUser?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('pages.profileFieldRole')}</p>
                    <p className="text-sm text-muted-foreground">
                      {displayUser?.role === 'ADMIN' ? t('layout.userRoleAdmin') : 
                       displayUser?.role === 'LECTURER' ? t('layout.userRoleLecturer') : 
                       displayUser?.role === 'STUDENT' ? t('layout.userRoleStudent') : 
                       displayUser?.role}
                    </p>
                  </div>
                </div>
                <Button onClick={() => setIsEditing(true)}>{t('pages.profileButtonEdit')}</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    {profilePictureUrl ? (
                      <AvatarImage 
                        src={profilePictureSrc} 
                        alt={`${firstName} ${lastName}`}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary text-white text-2xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <Label
                      htmlFor="profile-upload"
                      className="cursor-pointer text-sm font-medium underline"
                    >
                      {t('pages.profileButtonChangePicture')}
                    </Label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setPendingProfilePictureFile(file);
                      }}
                    />
                    {pendingProfilePictureFile ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('pages.profilePictureSelected', { name: pendingProfilePictureFile.name })}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first_name">{t('pages.profileFieldFirstName')}</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">{t('pages.profileFieldLastName')}</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('pages.profileFieldEmail')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">{t('pages.profileEmailCannotChange')}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={updateMutation.isPending || uploadPictureMutation.isPending}>
                    {updateMutation.isPending || uploadPictureMutation.isPending ? t('pages.profileButtonSaving') : t('pages.profileButtonSaveChanges')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setPendingProfilePictureFile(null);
                    }}
                  >
                    {t('pages.profileButtonCancel')}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('pages.profileCardSecurityTitle')}</CardTitle>
            <CardDescription>{t('pages.profileCardSecurityDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('pages.profileFieldPassword')}</Label>
              <p className="text-sm text-muted-foreground">{t('pages.profilePasswordLastChanged')}</p>
              <Button variant="outline">{t('pages.profileButtonChangePassword')}</Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('pages.profileFieldMfa')}</Label>
                  <p className="text-sm text-muted-foreground">{t('pages.profileMfaDescription')}</p>
                </div>
                {mfaEnabled ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('pages.profileMfaStatusEnabled')}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {t('pages.profileMfaStatusDisabled')}
                  </Badge>
                )}
              </div>
              {mfaEnabled ? (
                <Button
                  variant="outline"
                  onClick={() => setMfaDisableOpen(true)}
                  disabled={mfaDisableMutation.isPending}
                >
                  {mfaDisableMutation.isPending ? t('pages.profileButtonDisabling') : t('pages.profileButtonDisableMfa')}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleStartMfaSetup}
                  disabled={mfaSetupMutation.isPending}
                >
                  {mfaSetupMutation.isPending ? t('pages.profileButtonSettingUp') : t('pages.profileButtonEnableMfa')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFA Setup Dialog */}
      <Dialog open={mfaSetupOpen} onOpenChange={setMfaSetupOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('pages.profileMfaDialogSetupTitle')}</DialogTitle>
            <DialogDescription>
              {t('pages.profileMfaDialogSetupDescription')}
            </DialogDescription>
          </DialogHeader>
          {mfaSecret && (
            <MfaSetup
              secret={mfaSecret}
              userEmail={displayUser?.email || ''}
              onVerify={handleVerifyMfa}
              onCancel={() => {
                setMfaSetupOpen(false);
                setMfaSecret(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* MFA Disable Confirmation Dialog */}
      <AlertDialog open={mfaDisableOpen} onOpenChange={setMfaDisableOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('pages.profileMfaDialogDisableTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('pages.profileMfaDialogDisableDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('pages.profileButtonCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableMfa}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('pages.profileButtonDisableMfa')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

