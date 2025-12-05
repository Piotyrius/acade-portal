import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, RotateCcw, Search, Archive } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import {
  getArchivedFiles,
  downloadArchivedFile,
  restoreArchivedFile,
  downloadBlob,
  FileObjectDto,
  FileObjectRequest,
} from '@/api/endpoints/archive';
import { getUsers } from '@/api/endpoints/auth';

// Helper function to format file size
function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ArchiveBrowser() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<string>('all');
  const [deletedByFilter, setDeletedByFilter] = useState<string>('all');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileObjectDto | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const { data: archivedFiles = [], isLoading } = useQuery({
    queryKey: ['archivedFiles', ownerTypeFilter, deletedByFilter, searchTerm],
    queryFn: () =>
      getArchivedFiles({
        owner_type: ownerTypeFilter !== 'all' ? (ownerTypeFilter as any) : undefined,
        deleted_by: deletedByFilter !== 'all' ? deletedByFilter : undefined,
        search: searchTerm || undefined,
      }),
    enabled: user?.role === 'ADMIN',
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    enabled: user?.role === 'ADMIN',
  });

  const restoreMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FileObjectRequest }) =>
      restoreArchivedFile(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['archivedFiles'] });
      toast({ title: 'Success', description: 'File restored successfully' });
      setRestoreDialogOpen(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleDownload = async (file: FileObjectDto) => {
    try {
      setIsDownloading(file.id);
      const blob = await downloadArchivedFile(file.id);
      downloadBlob(blob, file.original_name);
      toast({ title: 'Success', description: 'File downloaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    } finally {
      setIsDownloading(null);
    }
  };

  const handleRestore = (file: FileObjectDto) => {
    setSelectedFile(file);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = () => {
    if (!selectedFile) return;

    const payload: FileObjectRequest = {
      original_name: selectedFile.original_name,
      owner_type: selectedFile.owner_type,
      owner_id: selectedFile.owner_id || undefined,
      mime_type: selectedFile.mime_type,
      size: selectedFile.size || undefined,
      visibility: selectedFile.visibility,
      is_archived: false,
    };

    restoreMutation.mutate({ id: selectedFile.id, payload });
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Archive Browser</h2>
          <p className="text-muted-foreground">You don't have permission to view archived files</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Archive Browser</h2>
          <p className="text-muted-foreground">Browse and restore deleted files</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archived Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={ownerTypeFilter} onValueChange={setOwnerTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Owner Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="DOCUMENT">Document</SelectItem>
                  <SelectItem value="GALLERY_WORK">Gallery Work</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deletedByFilter} onValueChange={setDeletedByFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Deleted By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.first_name} {u.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {archivedFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No archived files found</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>MIME Type</TableHead>
                      <TableHead>Deleted At</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">{file.original_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{file.owner_type}</Badge>
                        </TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell className="text-muted-foreground">{file.mime_type}</TableCell>
                        <TableCell>
                          {file.deleted_at
                            ? new Date(file.deleted_at).toLocaleDateString()
                            : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              file.visibility === 'PUBLIC'
                                ? 'default'
                                : file.visibility === 'ADMIN'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {file.visibility}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(file)}
                              disabled={isDownloading === file.id}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {isDownloading === file.id ? 'Downloading...' : 'Download'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(file)}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restore
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore File</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this file? It will be moved back from the archive.
            </DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-2 py-4">
              <div>
                <Label>File Name</Label>
                <p className="text-sm font-medium">{selectedFile.original_name}</p>
              </div>
              <div>
                <Label>Type</Label>
                <p className="text-sm text-muted-foreground">{selectedFile.owner_type}</p>
              </div>
              <div>
                <Label>Size</Label>
                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRestoreConfirm}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? 'Restoring...' : 'Restore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


