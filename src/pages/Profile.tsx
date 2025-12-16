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


export default function Profile() {
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
      toast({ title: 'Success', description: 'Profile updated successfully' });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
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
          title: 'Error',
          description: 'Failed to retrieve MFA secret. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      setMfaSecret(secret);
      setMfaSetupOpen(true);
    },
    onError: (error) => {
      toast({
        title: 'Error',
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
        title: 'Success',
        description: 'MFA has been enabled successfully',
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
        title: 'Success',
        description: 'Profile picture updated!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
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
        title: 'Success',
        description: 'MFA has been disabled',
      });
      setMfaDisableOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
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
    return <div className="p-6">Loading profile...</div>;
  }

  

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal details and account information</CardDescription>
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
                      {displayUser?.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">
                      {firstName} {lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{displayUser?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-sm text-muted-foreground">{displayUser?.role}</p>
                  </div>
                </div>
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
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
                      Change Picture
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
                        Selected: {pendingProfilePictureFile.name}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={updateMutation.isPending || uploadPictureMutation.isPending}>
                    {updateMutation.isPending || uploadPictureMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setPendingProfilePictureFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">Last changed: Never</p>
              <Button variant="outline">Change Password</Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                {mfaEnabled ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Disabled
                  </Badge>
                )}
              </div>
              {mfaEnabled ? (
                <Button
                  variant="outline"
                  onClick={() => setMfaDisableOpen(true)}
                  disabled={mfaDisableMutation.isPending}
                >
                  {mfaDisableMutation.isPending ? 'Disabling...' : 'Disable MFA'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleStartMfaSetup}
                  disabled={mfaSetupMutation.isPending}
                >
                  {mfaSetupMutation.isPending ? 'Setting up...' : 'Enable MFA'}
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
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Follow the steps below to enable MFA for your account
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
            <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disable MFA? This will make your account less secure. 
              You can re-enable it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableMfa}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disable MFA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

