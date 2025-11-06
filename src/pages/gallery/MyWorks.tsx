import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Image as ImageIcon, Eye, Edit } from 'lucide-react';

export default function MyWorks() {
  const works = [
    { id: 1, title: 'Final Project - Portfolio Website', status: 'Published', views: 234, isPublic: true, thumbnail: null },
    { id: 2, title: 'React Dashboard UI', status: 'Draft', views: 0, isPublic: false, thumbnail: null },
    { id: 3, title: 'E-commerce Landing Page', status: 'Published', views: 156, isPublic: true, thumbnail: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Works</h2>
          <p className="text-muted-foreground">Upload and manage your project portfolio</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Upload Work
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {works.map((work) => (
          <Card key={work.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-base mb-2">{work.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={work.status === 'Published' ? 'default' : 'secondary'}>
                  {work.status}
                </Badge>
                {work.isPublic && <Badge variant="outline">Public</Badge>}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{work.views} views</span>
              </div>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
