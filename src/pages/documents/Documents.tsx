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
import { useTranslation } from 'react-i18next';

export default function Documents() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { t } = useTranslation('common');

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => getDocuments(undefined),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('common:pages.documentsTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('common:pages.documentsSubtitle')}
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('common:pages.documentsUploadCta')}
        </Button>
      </div>

      {!isLoading && documents.length === 0 && <ExampleBanner />}

      <DocumentList documents={documents} isLoading={isLoading} />

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {t('common:pages.documentsUploadDialogTitle')}
            </DialogTitle>
          </DialogHeader>
          <DocumentUpload onSuccess={() => setIsUploadOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

