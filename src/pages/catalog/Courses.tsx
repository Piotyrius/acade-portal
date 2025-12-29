import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, BookOpen, Edit, Trash2, Eye } from 'lucide-react';
import { exampleCourses } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourses, createCourse, updateCourse, deleteCourse, getPrograms } from '@/api/endpoints/catalog';
import { CourseDto } from '@/api/types';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

export default function Courses() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDto | null>(null);
  const [formData, setFormData] = useState({ program: '', title: '', code: '', hours: 1, credits: '', description: '' });

  // Mock data for preview
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => getPrograms(),
  });

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: t('pages.catalogCoursesToastCreateTitle'), description: t('pages.catalogCoursesToastCreateDescription') });
      setIsDialogOpen(false);
      setFormData({ program: '', title: '', code: '', hours: 1, credits: '', description: '' });
    },
    onError: (error) => {
      toast({ title: t('pages.catalogCoursesToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CourseDto> }) => updateCourse(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: t('pages.catalogCoursesToastUpdateTitle'), description: t('pages.catalogCoursesToastUpdateDescription') });
      setIsDialogOpen(false);
      setEditingCourse(null);
      setFormData({ program: '', title: '', code: '', hours: 1, credits: '', description: '' });
    },
    onError: (error) => {
      toast({ title: t('pages.catalogCoursesToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: t('pages.catalogCoursesToastDeleteTitle'), description: t('pages.catalogCoursesToastDeleteDescription') });
    },
    onError: (error) => {
      toast({ title: t('pages.catalogCoursesToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const displayCourses = courses.length === 0 ? exampleCourses.slice(0, 1) : courses;
  const filteredCourses = displayCourses.filter((c: any) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({ program: '', title: '', code: '', hours: 1, credits: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (course: CourseDto) => {
    setEditingCourse(course);
    setFormData({
      program: course.program,
      title: course.title,
      code: course.code,
      hours: course.hours,
      credits: course.credits?.toString() || '',
      description: course.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      program: formData.program,
      credits: formData.credits ? parseInt(formData.credits) : null,
    };
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('pages.catalogCoursesDeleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-40 bg-muted animate-pulse rounded" />
            <div className="h-5 w-56 bg-muted animate-pulse rounded mt-2" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between courses_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.catalogCoursesTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.catalogCoursesSubtitle')}</p>
        </div>
        <Button onClick={handleOpenCreate} className='courses_plus_btn'>
          <Plus className="mr-2 h-4 w-4" />
          {t('pages.catalogCoursesAddCourse')}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm courses_search">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('pages.catalogCoursesSearchPlaceholder')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {courses.length === 0 && <ExampleBanner />}
      <div className="space-y-4">
        {filteredCourses.map((course: any) => {
          const program = programs.find((p) => p.id === course.program);
          return (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 flex items-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {course.code} • {program?.name || t('pages.catalogCoursesUnknownProgram')}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">{course.hours}h</p>
                      <p className="text-xs text-muted-foreground">{t('pages.catalogCoursesHoursLabel')}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" className='edit_icon' size="sm" onClick={() => handleOpenEdit(course)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" className='delete_icon' size="sm" onClick={() => handleDelete(course.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && courses.length > 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {searchTerm ? t('pages.catalogCoursesNoResultsSearch') : t('pages.catalogCoursesNoResultsDefault')}
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? t('pages.catalogCoursesDialogEditTitle') : t('pages.catalogCoursesDialogCreateTitle')}</DialogTitle>
            <DialogDescription>
              {editingCourse ? t('pages.catalogCoursesDialogEditDescription') : t('pages.catalogCoursesDialogCreateDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="program">{t('pages.catalogCoursesFieldProgram')} *</Label>
                <Select value={formData.program} onValueChange={(value) => setFormData({ ...formData, program: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('pages.catalogCoursesFieldProgramPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">{t('pages.catalogCoursesFieldTitle')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t('pages.catalogCoursesFieldCode')} *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">{t('pages.catalogCoursesFieldHours')} *</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">{t('pages.catalogCoursesFieldCredits')}</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('pages.catalogCoursesFieldDescription')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('pages.catalogCoursesCancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCourse ? t('pages.catalogCoursesButtonUpdate') : t('pages.catalogCoursesButtonCreate')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
