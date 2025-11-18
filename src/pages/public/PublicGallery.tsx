import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function PublicGallery() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: works = [], isLoading } = useQuery({
    queryKey: ['public-gallery'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:8000/api/v1/gallery/works/', {
        params: { is_public: true, status: 'PUBLISHED' }
      });
      return data.results || data;
    },
  });

  const filteredWorks = works.filter((work: any) => {
    if (!searchTerm) return true;
    return work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           work.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <ImageIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Gallery</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore amazing projects and creative works from our talented students
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search works..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredWorks.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No works found matching your search' : 'No published works yet'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Check back soon for amazing student projects!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredWorks.length} {filteredWorks.length === 1 ? 'work' : 'works'}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorks.map((work: any) => (
                <Card key={work.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                  {/* Image Section */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {work.media ? (
                      <img 
                        src={work.media} 
                        alt={work.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {work.status === 'PUBLISHED' && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500 text-white">Published</Badge>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <CardHeader>
                    <CardTitle className="text-xl line-clamp-2">{work.title}</CardTitle>
                    {work.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                        {work.description}
                      </p>
                    )}
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary" className="gap-1">
                        <span className="text-xs">👤</span>
                        {work.owner_name || 'Student'}
                      </Badge>
                      {work.published_at && (
                        <Badge variant="outline" className="text-xs">
                          {new Date(work.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Footer CTA */}
        <div className="mt-16 text-center bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Want to showcase your work?
          </h2>
          <p className="text-gray-600 mb-6">
            Join our academy and share your creative projects with the world
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/apply')}>
              Apply Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Student Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
