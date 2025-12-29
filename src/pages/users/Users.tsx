import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserDto } from '@/api/types';
import { getUsersPaginated, createUser, updateUser, deleteUser } from '@/api/endpoints/auth';
import { getEnrollmentsPaginated, getApplications } from '@/api/endpoints/admissions';
import { Plus, Pencil, Trash2, Search, UserCheck, UserX, Phone, ChevronDown, ChevronUp, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Users() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { id: userIdParam } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const userRowRef = useRef<HTMLTableRowElement>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'STUDENT' as 'ADMIN' | 'LECTURER' | 'STUDENT',
  });

  // Query
  const search = searchQuery.trim();
  const { data: usersPage, isLoading } = useQuery({
    queryKey: ['users', 'STUDENT', page, search],
    queryFn: () =>
      getUsersPaginated({
        role: 'STUDENT',
        page,
        search: search || undefined,
      }),
  });

  const users = usersPage?.results ?? [];

  // Handle user ID parameter - auto-expand and scroll to user
  useEffect(() => {
    if (userIdParam) {
      // First check if user is on current page
      const user = users.find((u) => u.id === userIdParam);
      if (user) {
        // Expand the user
        setExpandedUsers((prev) => new Set(prev).add(userIdParam));
        // Scroll to user after a short delay to ensure DOM is updated
        setTimeout(() => {
          const element = document.getElementById(`user-row-${userIdParam}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Remove the ID from URL after showing (keep it clean)
            navigate('/users', { replace: true });
          }
        }, 200);
      } else if (users.length > 0 && !isLoading) {
        // User not found on current page - fetch them directly
        queryClient.fetchQuery({
          queryKey: ['users', 'STUDENT', 1, userIdParam],
          queryFn: () =>
            getUsersPaginated({
              role: 'STUDENT',
              page: 1,
              search: userIdParam,
            }),
        }).then((data: any) => {
          const foundUser = data?.results?.find((u: UserDto) => u.id === userIdParam);
          if (foundUser) {
            // Set search to find the user
            setSearchQuery(foundUser.email || `${foundUser.first_name} ${foundUser.last_name}`);
            setPage(1);
            // Expand will happen in next render
            setTimeout(() => {
              setExpandedUsers((prev) => new Set(prev).add(userIdParam));
              setTimeout(() => {
                const element = document.getElementById(`user-row-${userIdParam}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  navigate('/users', { replace: true });
                }
              }, 200);
            }, 100);
          } else {
            // User not found at all
            navigate('/users', { replace: true });
          }
        });
      }
    }
  }, [userIdParam, users, isLoading, queryClient, navigate]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: t('pages.usersToastCreateTitle'),
        description: t('pages.usersToastCreateDescription'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('pages.usersToastCreateErrorTitle'),
        description: error.response?.data?.message || t('pages.usersErrorFallback'),
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditOpen(false);
      setSelectedUser(null);
      resetForm();
      toast({
        title: t('pages.usersToastUpdateTitle'),
        description: t('pages.usersToastUpdateDescription'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('pages.usersToastUpdateErrorTitle'),
        description: error.response?.data?.message || t('pages.usersErrorFallback'),
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeleteOpen(false);
      setSelectedUser(null);
      toast({
        title: t('pages.usersToastDeleteTitle'),
        description: t('pages.usersToastDeleteDescription'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('pages.usersToastDeleteErrorTitle'),
        description: error.response?.data?.message || t('pages.usersErrorFallback'),
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'STUDENT',
    });
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    const { password, ...updateData } = formData;
    updateMutation.mutate({ id: selectedUser.id, data: updateData });
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    deleteMutation.mutate(selectedUser.id);
  };

  const openEditDialog = (user: UserDto) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      role: user.role,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (user: UserDto) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const users = usersPage?.results ?? [];
  const canGoPrev = page > 1;
  const canGoNext = Boolean(usersPage?.next);

  const formatCohortNames = (names: string[], totalCount?: number) => {
    const unique = Array.from(new Set(names.filter(Boolean)));
    if (unique.length === 0) return '-';
    const shown = unique.slice(0, 2);
    const extra = Math.max(0, (totalCount ?? unique.length) - shown.length);
    return `${shown.join(', ')}${extra > 0 ? ` +${extra}` : ''}`;
  };

  const UserCohortCell = ({ user }: { user: UserDto }) => {
    if (user.role === 'STUDENT') {
      const { data, isLoading } = useQuery({
        queryKey: ['studentEnrollments', user.id],
        queryFn: () => getEnrollmentsPaginated({ student: user.id, page: 1 }),
        enabled: Boolean(user.id),
      });

      if (isLoading) return <span className="text-muted-foreground">{t('pages.usersLoadingCohorts')}</span>;

      const results = data?.results ?? [];
      const names = results.map((e: any) => e.cohort_name || e.cohort);
      return <>{formatCohortNames(names, data?.count)}</>;
    }

    return <>-</>;
  };

  const UserDetailsCell = ({ user }: { user: UserDto }) => {
    if (user.role !== 'STUDENT') return null;

    const { data: applications } = useQuery({
      queryKey: ['studentApplications', user.email],
      queryFn: () => getApplications(),
      enabled: Boolean(user.email),
      select: (apps) => apps.filter((app: any) => app.email === user.email),
    });

    const application = applications?.[0];
    const parentPhones = application?.phones?.filter((p: any) => 
      p.name?.toLowerCase().includes('parent') || 
      p.name?.toLowerCase().includes('guardian') ||
      p.name?.toLowerCase().includes('მშობელი') ||
      p.name?.toLowerCase().includes('родитель')
    ) || [];

    if (!application && !user.phone) return null;

    return (
      <div className="py-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.phone && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('pages.usersDetailsPhone')}</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{user.phone}</p>
            </div>
          )}
          {parentPhones.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{t('pages.usersDetailsParentPhone')}</span>
              </div>
              <div className="space-y-1 pl-6">
                {parentPhones.map((p: any, idx: number) => (
                  <p key={idx} className="text-sm font-medium text-primary">
                    {p.name}: {p.phone}
                  </p>
                ))}
              </div>
            </div>
          )}
          {application?.phones && application.phones.length > 0 && parentPhones.length === 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('pages.usersDetailsAdditionalPhones')}</span>
              </div>
              <div className="space-y-1 pl-6">
                {application.phones.map((p: any, idx: number) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    {p.name ? `${p.name}: ${p.phone}` : p.phone}
                  </p>
                ))}
              </div>
            </div>
          )}
          {application?.notes && (
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('pages.usersDetailsNotes')}</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{application.notes}</p>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('pages.usersDetailsEmail')}</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{user.email}</p>
          </div>
        </div>
      </div>
    );
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'LECTURER':
        return 'default';
      case 'STUDENT':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between add_user_wrapper">
        <div>
          <h1 className="text-3xl font-bold tracking-tight user_title">{t('pages.usersTitle')}</h1>
          <p className="text-muted-foreground user_description">{t('pages.usersSubtitle')}</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className='add_user_btn'>
          <Plus />
          {t('pages.usersButtonAdd')}
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('pages.usersSearchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('pages.usersColumnEmail')}</TableHead>
              <TableHead>{t('pages.usersColumnName')}</TableHead>
              <TableHead>{t('pages.usersColumnCohort')}</TableHead>
              <TableHead>{t('pages.usersColumnPhone')}</TableHead>
              <TableHead>{t('pages.usersColumnRole')}</TableHead>
              <TableHead>{t('pages.usersColumnStatus')}</TableHead>
              <TableHead className="w-[100px]">{t('pages.usersColumnActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  {t('pages.usersLoading')}
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => {
                const isExpanded = expandedUsers.has(user.id);
                return (
                  <>
                    <TableRow 
                      key={user.id}
                      id={`user-row-${user.id}`}
                      ref={userIdParam === user.id ? userRowRef : null}
                    >
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>
                        <UserCohortCell user={user} />
                      </TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role === 'ADMIN' ? t('layout.userRoleAdmin') : 
                           user.role === 'LECTURER' ? t('layout.userRoleLecturer') : 
                           user.role === 'STUDENT' ? t('layout.userRoleStudent') : 
                           user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="outline" className="gap-1">
                            <UserCheck className="h-3 w-3" />
                            {t('pages.usersStatusActive')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <UserX className="h-3 w-3" />
                            {t('pages.usersStatusInactive')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newExpanded = new Set(expandedUsers);
                              if (isExpanded) {
                                newExpanded.delete(user.id);
                              } else {
                                newExpanded.add(user.id);
                              }
                              setExpandedUsers(newExpanded);
                            }}
                            title={isExpanded ? t('pages.usersHideDetails') : t('pages.usersShowDetails')}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit user"
                            title="Edit"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete user"
                            title="Delete"
                            onClick={() => openDeleteDialog(user)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/50">
                          <UserDetailsCell user={user} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  {t('pages.usersNoneFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!canGoPrev}
        >
          {t('pages.usersPaginationPrevious')}
        </Button>
        <div className="text-sm text-muted-foreground">
          {t('pages.usersPaginationPage', { page })}
        </div>
        <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={!canGoNext}>
          {t('pages.usersPaginationNext')}
        </Button>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.usersCreateDialogTitle')}</DialogTitle>
            <DialogDescription>{t('pages.usersCreateDialogDescription')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-email">{t('pages.usersFieldEmail')}</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-password">{t('pages.usersFieldPassword')}</Label>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-first-name">{t('pages.usersFieldFirstName')}</Label>
                <Input
                  id="create-first-name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-last-name">{t('pages.usersFieldLastName')}</Label>
                <Input
                  id="create-last-name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-phone">{t('pages.usersFieldPhone')}</Label>
              <Input
                id="create-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-role">{t('pages.usersFieldRole')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('pages.usersFieldRolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">{t('pages.usersRoleStudent')}</SelectItem>
                  <SelectItem value="LECTURER">{t('pages.usersRoleLecturer')}</SelectItem>
                  <SelectItem value="ADMIN">{t('pages.usersRoleAdmin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              {t('pages.usersDialogCancel')}
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending
                ? t('pages.usersCreateDialogButtonCreating')
                : t('pages.usersCreateDialogButtonCreate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.usersEditDialogTitle')}</DialogTitle>
            <DialogDescription>{t('pages.usersEditDialogDescription')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">{t('pages.usersFieldEmail')}</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-first-name">{t('pages.usersFieldFirstName')}</Label>
                <Input
                  id="edit-first-name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-last-name">{t('pages.usersFieldLastName')}</Label>
                <Input
                  id="edit-last-name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">{t('pages.usersFieldPhone')}</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">{t('pages.usersFieldRole')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('pages.usersFieldRolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">{t('pages.usersRoleStudent')}</SelectItem>
                  <SelectItem value="LECTURER">{t('pages.usersRoleLecturer')}</SelectItem>
                  <SelectItem value="ADMIN">{t('pages.usersRoleAdmin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {t('pages.usersDialogCancel')}
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending
                ? t('pages.usersEditDialogButtonUpdating')
                : t('pages.usersEditDialogButtonUpdate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('pages.usersDeleteDialogTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('pages.usersDeleteDialogDescription', { email: selectedUser?.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('pages.usersDialogCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending
                ? t('pages.usersDeleteDialogButtonDeleting')
                : t('pages.usersDeleteDialogButtonDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
