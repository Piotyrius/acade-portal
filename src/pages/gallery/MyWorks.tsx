import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Image as ImageIcon, Eye, Edit } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyWorks, uploadWork, publishWork } from '@/api/endpoints/gallery';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';

export default function MyWorks() {
  const { toast } = useToast();
  const qc = useQueryClient();
  // Mock data for preview
  const mockWorks = [
    { id: '1', owner: 'user-1', title: 'Network Security Lab Report', description: 'Analysis of network vulnerabilities', media: '/mock-image.jpg', status: 'PUBLISHED' as const, is_public: true, published_at: '2024-02-15T00:00:00Z' },
    { id: '2', owner: 'user-1', title: 'Penetration Testing Documentation', description: 'Complete pentest report with findings', media: '/mock-image.jpg', status: 'PUBLISHED' as const, is_public: true, published_at: '2024-02-10T00:00:00Z' },
    { id: '3', owner: 'user-1', title: 'Security Audit Presentation', description: 'Slides from final project presentation', media: '/mock-image.jpg', status: 'DRAFT' as const, is_public: false, published_at: null },
    { id: '4', owner: 'user-1', title: 'Firewall Configuration Guide', description: 'Step-by-step firewall setup', media: '/mock-image.jpg', status: 'PUBLISHED' as const, is_public: true, published_at: '2024-02-05T00:00:00Z' },
  ];

  const { data } = useQuery({ queryKey: ['my-works'], queryFn: getMyWorks });
  const works = data || mockWorks;

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const uploadMut = useMutation({
    mutationFn: (payload: { title: string; file: File }) => uploadWork(payload),
    onSuccess: () => {
      toast({ title: 'Uploaded', description: 'Work uploaded as draft' });
      setTitle('');
      setFile(null);
      qc.invalidateQueries({ queryKey: ['my-works'] });
    },
    onError: (e: any) => toast({ title: 'Upload failed', description: getErrorMessage(e), variant: 'destructive' }),
  });

  const publishMut = useMutation({
    mutationFn: (id: string) => publishWork(id),
    onSuccess: () => {
      toast({ title: 'Published', description: 'Work is now visible' });
      qc.invalidateQueries({ queryKey: ['my-works'] });
    },
    onError: (e: any) => toast({ title: 'Publish failed', description: getErrorMessage(e), variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Works</h2>
          <p className="text-muted-foreground">Upload and manage your project portfolio</p>
        </div>
        <div className="flex items-end gap-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <Button onClick={() => file && title && uploadMut.mutate({ title, file })} disabled={!file || !title || uploadMut.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            {uploadMut.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {works.map((work: any) => (
          <Card key={work.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-base mb-2">{work.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={work.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {work.status}
                </Badge>
                {work.is_public && <Badge variant="outline">Public</Badge>}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>—</span>
              </div>
              {work.status !== 'PUBLISHED' ? (
                <Button variant="default" size="sm" onClick={() => publishMut.mutate(work.id)} disabled={publishMut.isPending}>
                  {publishMut.isPending ? 'Publishing...' : 'Publish'}
                </Button>
              ) : (
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
