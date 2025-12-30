import { useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { useTranslation } from 'react-i18next';

// Helper function to format file size
function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ArchiveBrowser() {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<string>('all');
  const [deletedByFilter, setDeletedByFilter] = useState<string>('all');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileObjectDto | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Debounce search so typing doesn't refetch + show full-page skeleton each keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { data: archivedFiles = [], isLoading, isFetching } = useQuery({
    queryKey: ['archivedFiles', ownerTypeFilter, deletedByFilter, searchTerm],
    queryFn: () =>
      getArchivedFiles({
        owner_type: ownerTypeFilter !== 'all' ? (ownerTypeFilter as any) : undefined,
        deleted_by: deletedByFilter !== 'all' ? deletedByFilter : undefined,
        search: searchTerm || undefined,
      }),
    placeholderData: keepPreviousData,
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
      toast({ title: t('pages.archiveBrowserToastRestoreSuccessTitle'), description: t('pages.archiveBrowserToastRestoreSuccessDescription') });
      setRestoreDialogOpen(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({ title: t('pages.archiveBrowserToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleDownload = async (file: FileObjectDto) => {
    try {
      setIsDownloading(file.id);
      const blob = await downloadArchivedFile(file.id);
      downloadBlob(blob, file.original_name);
      toast({ title: t('pages.archiveBrowserToastDownloadSuccessTitle'), description: t('pages.archiveBrowserToastDownloadSuccessDescription') });
    } catch (error) {
      toast({ title: t('pages.archiveBrowserToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
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
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.archiveBrowserTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.archiveBrowserNoPermission')}</p>
        </div>
      </div>
    );
  }

  if (isLoading && archivedFiles.length === 0) {
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
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.archiveBrowserTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.archiveBrowserSubtitle')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pages.archiveBrowserCardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('pages.archiveBrowserSearchPlaceholder')}
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <Select value={ownerTypeFilter} onValueChange={setOwnerTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder={t('pages.archiveBrowserFilterOwnerTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pages.archiveBrowserFilterAllTypes')}</SelectItem>
                  <SelectItem value="DOCUMENT">{t('pages.archiveBrowserFilterTypeDocument')}</SelectItem>
                  <SelectItem value="GALLERY_WORK">{t('pages.archiveBrowserFilterTypeGalleryWork')}</SelectItem>
                  <SelectItem value="OTHER">{t('pages.archiveBrowserFilterTypeOther')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deletedByFilter} onValueChange={setDeletedByFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder={t('pages.archiveBrowserFilterDeletedByPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pages.archiveBrowserFilterAllUsers')}</SelectItem>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.first_name} {u.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {isFetching && (
              <p className="text-xs text-muted-foreground">
                {t('pages.archiveBrowserSearching')}
              </p>
            )}
            {archivedFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('pages.archiveBrowserNoneFound')}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pages.archiveBrowserColumnFileName')}</TableHead>
                      <TableHead>{t('pages.archiveBrowserColumnType')}</TableHead>
                      <TableHead>{t('pages.archiveBrowserColumnSize')}</TableHead>
                      <TableHead>{t('pages.archiveBrowserColumnMimeType')}</TableHead>
                      <TableHead>{t('pages.archiveBrowserColumnDeletedAt')}</TableHead>
                      <TableHead>{t('pages.archiveBrowserColumnVisibility')}</TableHead>
                      <TableHead className="text-right">{t('pages.archiveBrowserColumnActions')}</TableHead>
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
                            : t('pages.archiveBrowserUnknown')}
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
                              {isDownloading === file.id ? t('pages.archiveBrowserButtonDownloading') : t('pages.archiveBrowserButtonDownload')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(file)}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              {t('pages.archiveBrowserButtonRestore')}
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
            <DialogTitle>{t('pages.archiveBrowserDialogRestoreTitle')}</DialogTitle>
            <DialogDescription>
              {t('pages.archiveBrowserDialogRestoreDescription')}
            </DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-2 py-4">
              <div>
                <Label>{t('pages.archiveBrowserDialogFieldFileName')}</Label>
                <p className="text-sm font-medium">{selectedFile.original_name}</p>
              </div>
              <div>
                <Label>{t('pages.archiveBrowserDialogFieldType')}</Label>
                <p className="text-sm text-muted-foreground">{selectedFile.owner_type}</p>
              </div>
              <div>
                <Label>{t('pages.archiveBrowserDialogFieldSize')}</Label>
                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              {t('pages.archiveBrowserDialogCancel')}
            </Button>
            <Button
              onClick={handleRestoreConfirm}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? t('pages.archiveBrowserDialogButtonRestoring') : t('pages.archiveBrowserDialogButtonRestore')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


