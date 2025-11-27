import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getDocuments } from '@/api/endpoints/documents';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { ExampleBanner } from '@/components/ExampleBanner';

export default function Documents() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => getDocuments(undefined),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            Manage your documents, contracts, and course materials
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {!isLoading && documents.length === 0 && <ExampleBanner />}

      <DocumentList documents={documents} isLoading={isLoading} />

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <DocumentUpload onSuccess={() => setIsUploadOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

