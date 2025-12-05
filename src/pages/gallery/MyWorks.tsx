// MyWorks.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Image as ImageIcon, Eye, Edit, Trash2 } from 'lucide-react';
import { ExampleBanner } from '@/components/ExampleBanner';
import { exampleWorks } from '@/utils/exampleData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyWorks,
  uploadWork,
  publishWork,
  unpublishWork,
  toggleWorkVisibility,
} from '@/api/endpoints/gallery';
import { WorkDto } from '@/api/types';
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
import { useAuthStore } from '@/store/authStore';
import api from '@/api/client';

export default function MyWorks() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['my-works'], queryFn: getMyWorks });
  const user = useAuthStore((state) => state.user);
  const works = data || [];
const displayWorks: WorkDto[] =
  works.length === 0
    ? exampleWorks.slice(0, 1).map((ex: Partial<WorkDto>, idx) => ({
        id: ex.id ?? `example-${idx}`,
        owner: ex.owner ?? '',
        title: ex.title,
        description: ex.description ?? '',
        media: ex.media ?? '',
        media_url: (ex as any).media_url ?? '', // or cast to any if media_url isn’t in WorkDto
        status: ex.status ?? 'DRAFT',
        is_public: ex.is_public ?? false,
        published_at: ex.published_at ?? null,
        created_at: (ex as any).created_at ?? null,
        updated_at: (ex as any).updated_at ?? null,
      }))
    : works;



  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkDto | null>(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });
  const [togglingWorkId, setTogglingWorkId] = useState<string | null>(null);

  // Upload mutation: pass owner from auth store; description is optional
  const uploadMut = useMutation({
    mutationFn: (payload: { owner: string; title: string; description?: string; file: File }) =>
      uploadWork(payload),
    onSuccess: () => {
      toast({ title: 'Uploaded', description: 'Work uploaded as draft' });
      setTitle('');
      setDescription('');
      setFile(null);
      qc.invalidateQueries({ queryKey: ['my-works'] });
    },
    onError: (e: any) =>
      toast({ title: 'Upload failed', description: getErrorMessage(e), variant: 'destructive' }),
  });

  // Publish/unpublish/visibility/update/delete mutations (unchanged)
  const publishMut = useMutation({
    mutationFn: (id: string) => publishWork(id),
    onSuccess: () => {
      toast({ title: 'Published', description: 'Work is now visible' });
      qc.invalidateQueries({ queryKey: ['my-works'] });
    },
    onError: (e: any) =>
      toast({ title: 'Publish failed', description: getErrorMessage(e), variant: 'destructive' }),
  });

  const unpublishMut = useMutation({
    mutationFn: (id: string) => unpublishWork(id),
    onSuccess: () => {
      toast({ title: 'Unpublished', description: 'Work unpublished successfully' });
      qc.invalidateQueries({ queryKey: ['my-works'] });
    },
    onError: (e: any) =>
      toast({ title: 'Unpublish failed', description: getErrorMessage(e), variant: 'destructive' }),
  });

  const toggleVisibilityMut = useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      toggleWorkVisibility(id, isPublic),
    onMutate: ({ id }) => {
      setTogglingWorkId(id);
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Visibility Updated',
        description: `Work is now ${variables.isPublic ? 'public' : 'private'}`,
      });
      qc.invalidateQueries({ queryKey: ['my-works'] });
    },
    onError: (e: any) => {
      toast({ title: 'Update failed', description: getErrorMessage(e), variant: 'destructive' });
    },
    onSettled: () => {
      setTogglingWorkId(null);
    },
  });


  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title: string; description?: string } }) =>
      api.patch(`/api/v1/gallery/works/${id}/`, data),
    onSuccess: () => {
      toast({ title: 'Updated', description: 'Work updated successfully' });
      qc.invalidateQueries({ queryKey: ['my-works'] });
      setIsEditDialogOpen(false);
      setEditingWork(null);
    },
    onError: (e: any) =>
      toast({ title: 'Update failed', description: getErrorMessage(e), variant: 'destructive' }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/gallery/works/${id}/`),
    onSuccess: () => {
      toast({ title: 'Deleted', description: 'Work deleted successfully' });
      qc.invalidateQueries({ queryKey: ['my-works'] });
    },
    onError: (e: any) =>
      toast({ title: 'Delete failed', description: getErrorMessage(e), variant: 'destructive' }),
  });

  const handleOpenEdit = (work: WorkDto) => {
    setEditingWork(work);
    setEditFormData({ title: work.title, description: work.description || '' });
    setIsEditDialogOpen(true);
  };

  const handleUpdateWork = () => {
    if (editingWork) {
      updateMut.mutate({ id: editingWork.id, data: editFormData });
    }
  };

  const handleDeleteWork = (id: string) => {
    if (confirm('Are you sure you want to delete this work? This action cannot be undone.')) {
      deleteMut.mutate(id);
    }
  };
  

  return (
    <div className="space-y-6">
      {/* Header and upload form */}
      <div className="flex items-center justify-between gallery_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Works</h2>
          <p className="text-muted-foreground">Upload and manage your project portfolio</p>
        </div>
        <div className="flex items-end gap-2 header_upload_btns">
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              className="gallery_add_btn"
              placeholder="Project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              className="gallery_add_btn"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button
            className="gallery_add_btn"
            onClick={() => {
              if (file && title && user?.id) {
                uploadMut.mutate({ owner: user.id, title, description, file });
              }
            }}
            disabled={!file || !title || uploadMut.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            {uploadMut.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Optional example banner if no works */}
      {displayWorks.length === 0 && <ExampleBanner />}

      {/* List of works */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayWorks.map((work: WorkDto) => (
          <Card key={work.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
  <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
    {work.media ? (
      <img
        src={
          work.media_url
        }
        alt={work.title}
        className="w-full h-full object-cover"
      />
    ) : (
      <ImageIcon className="h-12 w-12 text-muted-foreground" />
    )}
  </div>
</CardHeader>

            <CardContent className="p-4">
              <CardTitle className="text-base mb-2">{work.title}</CardTitle>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={work.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {work.status}
                  </Badge>
                  {work.is_public && <Badge variant="outline">Public</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={`visibility-${work.id}`}
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Public
                  </Label>
                    <Switch
                      id={`visibility-${work.id}`}
                      checked={work.is_public ?? false}
                      onCheckedChange={(checked) => {
                        toggleVisibilityMut.mutate({ id: work.id, isPublic: checked });
                      }}
                      disabled={togglingWorkId === work.id || toggleVisibilityMut.isPending}
                    />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>—</span>
              </div>
              <div className="flex gap-2">
                {work.status === 'PUBLISHED' ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => unpublishMut.mutate(work.id)}
                    disabled={unpublishMut.isPending}
                  >
                    {unpublishMut.isPending ? 'Unpublishing...' : 'Unpublish'}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => publishMut.mutate(work.id)}
                    disabled={publishMut.isPending}
                  >
                    {publishMut.isPending ? 'Publishing...' : 'Publish'}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(work)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteWork(work.id)}
                  disabled={deleteMut.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Fallback if user has works but none match filters */}
      {displayWorks.length === 0 && works.length > 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No works yet. Upload your first project!
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Work</DialogTitle>
            <DialogDescription>Update your work details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                placeholder="Work title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
                placeholder="Describe your work..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateWork}
              disabled={!editFormData.title || updateMut.isPending}
            >
              {updateMut.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
