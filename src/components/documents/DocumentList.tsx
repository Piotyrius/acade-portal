import { useState } from 'react';
import { DocumentDto, deleteDocument, downloadDocument, downloadBlob } from '@/api/endpoints/documents';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Eye, Download, Trash2, FileText, Search } from 'lucide-react';

interface DocumentListProps {
    documents: DocumentDto[];
    isLoading: boolean;
}

export function DocumentList({ documents, isLoading }: DocumentListProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [visibilityFilter, setVisibilityFilter] = useState('all');
    const [previewDoc, setPreviewDoc] = useState<DocumentDto | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const deleteMutation = useMutation({
        mutationFn: deleteDocument,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast({ title: 'Success', description: 'Document deleted successfully' });
        },
        onError: (error) => {
            toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
        },
    });

    const downloadMutation = useMutation({
        mutationFn: downloadDocument,
        onSuccess: (blob, documentId) => {
            const doc = documents.find(d => d.id === documentId);
            if (doc) {
                const filename = getFilename(doc);
                downloadBlob(blob, filename);
                toast({ title: 'Success', description: 'Document downloaded successfully' });
            }
            setDownloadingId(null);
        },
        onError: (error) => {
            toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
            setDownloadingId(null);
        },
    });

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this document?')) {
            deleteMutation.mutate(id);
        }
    };

    const getFilename = (doc: DocumentDto): string => {
        // Extract filename from document description
        let filename = getCleanDescription(doc) || doc.id;
        
        // Sanitize filename (remove invalid characters)
        filename = filename.replace(/[<>:"/\\|?*]/g, '_').trim();
        
        // Try to extract extension from original file URL
        const fileUrl = doc.file;
        const urlMatch = fileUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        const extension = urlMatch ? urlMatch[1] : '';
        
        // Add extension if not already present
        if (extension && !filename.toLowerCase().endsWith(`.${extension.toLowerCase()}`)) {
            filename = `${filename}.${extension}`;
        } else if (!extension) {
            // Fallback to common extensions based on file type
            filename = `${filename}.pdf`;
        }
        
        return filename || `document_${doc.id}.pdf`;
    };

    const handleDownload = (doc: DocumentDto) => {
        if (downloadingId) return; // Prevent multiple simultaneous downloads
        setDownloadingId(doc.id);
        downloadMutation.mutate(doc.id);
    };

    const getCategoryFromDoc = (doc: DocumentDto) => {
        if (doc.kind === 'CONSENT') return 'Consent Form';
        if (doc.kind === 'ID') return 'ID Document';

        if (doc.description.startsWith('[Student Doc]')) return 'Student Document';
        if (doc.description.startsWith('[Course Material]')) return 'Course Material';
        if (doc.description.startsWith('[Admin]')) return 'Administrative';
        if (doc.description.startsWith('[Certificate]')) return 'Certificate';

        return 'Other';
    };

    const getCleanDescription = (doc: DocumentDto) => {
        return doc.description
            .replace(/^\[Student Doc\]\s*/, '')
            .replace(/^\[Course Material\]\s*/, '')
            .replace(/^\[Admin\]\s*/, '')
            .replace(/^\[Certificate\]\s*/, '');
    };

    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch =
            doc.description.toLowerCase().includes(search.toLowerCase()) ||
            doc.kind.toLowerCase().includes(search.toLowerCase());

        const category = getCategoryFromDoc(doc);
        // Map filter values to category names
        const matchesCategory = categoryFilter === 'all' ||
            (categoryFilter === 'STUDENT_DOC' && category === 'Student Document') ||
            (categoryFilter === 'COURSE_MATERIAL' && category === 'Course Material') ||
            (categoryFilter === 'ADMINISTRATIVE' && category === 'Administrative') ||
            (categoryFilter === 'CERTIFICATE' && category === 'Certificate') ||
            (categoryFilter === 'CONSENT' && category === 'Consent Form') ||
            (categoryFilter === 'ID' && category === 'ID Document') ||
            (categoryFilter === 'OTHER' && category === 'Other');

        const matchesVisibility = visibilityFilter === 'all' || doc.visibility === visibilityFilter;

        return matchesSearch && matchesCategory && matchesVisibility;
    });

    const getVisibilityVariant = (visibility: string) => {
        switch (visibility) {
            case 'ADMIN': return 'destructive';
            case 'LECTURER': return 'default';
            default: return 'secondary';
        }
    };

    const isPreviewable = (fileUrl: string) => {
        const ext = fileUrl.split('.').pop()?.toLowerCase();
        return ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(ext || '');
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search documents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="STUDENT_DOC">Student Document</SelectItem>
                        <SelectItem value="COURSE_MATERIAL">Course Material</SelectItem>
                        <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                        <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                        <SelectItem value="CONSENT">Consent Form</SelectItem>
                        <SelectItem value="ID">ID Document</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Visibility</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                        <SelectItem value="LECTURER">Lecturer</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading documents...
                                </TableCell>
                            </TableRow>
                        ) : filteredDocuments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No documents found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDocuments.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{getCategoryFromDoc(doc)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getCleanDescription(doc)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getVisibilityVariant(doc.visibility)}>
                                            {doc.visibility}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {isPreviewable(doc.file) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setPreviewDoc(doc)}
                                                    title="Preview"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDownload(doc)}
                                                disabled={downloadingId === doc.id}
                                                title="Download"
                                            >
                                                {downloadingId === doc.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(doc.id)}
                                                className="text-destructive hover:text-destructive"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Document Preview</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 bg-muted/20 rounded-md overflow-hidden flex items-center justify-center">
                        {previewDoc && (
                            <>
                                {previewDoc.file.toLowerCase().endsWith('.pdf') ? (
                                    <iframe
                                        src={previewDoc.file}
                                        className="w-full h-full"
                                        title="PDF Preview"
                                    />
                                ) : (
                                    <img
                                        src={previewDoc.file}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={() => previewDoc && handleDownload(previewDoc)}
                            disabled={previewDoc ? downloadingId === previewDoc.id : false}
                        >
                            {previewDoc && downloadingId === previewDoc.id ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Original
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
