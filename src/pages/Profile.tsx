import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMe, updateProfile } from '@/api/endpoints/auth';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { User, Mail, Shield } from 'lucide-react';

export default function Profile() {
  const { user, setAuth } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: !user, // Only fetch if user not in store
  });

  const displayUser = user || currentUser;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  // Initialize form data when user is available
  useEffect(() => {
    if (displayUser) {
      setFormData({
        first_name: displayUser.firstName || displayUser.first_name || '',
        last_name: displayUser.lastName || displayUser.last_name || '',
        email: displayUser.email || '',
      });
    }
  }, [displayUser]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
    });
  };

  const initials = displayUser
    ? `${displayUser.firstName?.[0] || displayUser.first_name?.[0] || ''}${displayUser.lastName?.[0] || displayUser.last_name?.[0] || ''}`
    : 'U';

  if (isLoading && !user) {
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
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {displayUser?.firstName || displayUser?.first_name} {displayUser?.lastName || displayUser?.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{displayUser?.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {displayUser?.role}
                </Badge>
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">
                      {displayUser?.firstName || displayUser?.first_name} {displayUser?.lastName || displayUser?.last_name}
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
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
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
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              <Button variant="outline" disabled>
                Enable 2FA (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

