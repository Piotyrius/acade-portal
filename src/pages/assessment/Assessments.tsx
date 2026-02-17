import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileCheck, Edit, Trash2, Eye } from 'lucide-react';
import { exampleAssessments } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssessments, createAssessment, updateAssessment, deleteAssessment } from '@/api/endpoints/assessment';
import { getCohorts } from '@/api/endpoints/catalog';
import { AssessmentDto } from '@/api/types';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

export default function Assessments() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<AssessmentDto | null>(null);
  const [formData, setFormData] = useState({
    cohort: '',
    title: '',
    description: '',
    kind: 'QUIZ' as 'EXAM' | 'QUIZ' | 'PROJECT' | 'ASSIGNMENT',
    max_score: 100,
    weight: 1,
    due_at: '',
  });

  // Mock data for preview
  const mockAssessments = [
    { id: '1', cohort: '1', title: 'Network Security Midterm Exam', description: 'Comprehensive exam covering network protocols and security', type: 'EXAM' as const, max_score: 100, weight: 0.3, due_date: '2024-04-15', created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' },
    { id: '2', cohort: '1', title: 'Firewall Configuration Lab', description: 'Hands-on lab assignment for firewall setup', type: 'ASSIGNMENT' as const, max_score: 50, weight: 0.15, due_date: '2024-03-20', created_at: '2024-03-05T00:00:00Z', updated_at: '2024-03-05T00:00:00Z' },
    { id: '3', cohort: '2', title: 'Penetration Testing Quiz', description: 'Quick assessment on basic pentest methodologies', type: 'QUIZ' as const, max_score: 30, weight: 0.1, due_date: '2024-03-10', created_at: '2024-02-20T00:00:00Z', updated_at: '2024-02-20T00:00:00Z' },
    { id: '4', cohort: '2', title: 'Final Capstone Project', description: 'Complete security audit of a web application', type: 'PROJECT' as const, max_score: 150, weight: 0.4, due_date: '2024-06-01', created_at: '2024-02-15T00:00:00Z', updated_at: '2024-02-15T00:00:00Z' },
  ];

  const mockCohorts = [
    { id: '1', course: '1', name: 'Network Security - Spring 2024', lecturer: 'lect-1', capacity: 30, start_date: '2024-03-01', end_date: '2024-05-30', status: 'ACTIVE' as const, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
    { id: '2', course: '2', name: 'Ethical Hacking - Evening Batch', lecturer: 'lect-2', capacity: 25, start_date: '2024-02-15', end_date: '2024-06-15', status: 'ENROLLING' as const, created_at: '2024-01-16T00:00:00Z', updated_at: '2024-01-16T00:00:00Z' },
  ];

  const { data: assessments = mockAssessments, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => getAssessments(),
  });

  const { data: cohorts = mockCohorts } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
  });

  const createMutation = useMutation({
    mutationFn: createAssessment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assessments'] });
      toast({ title: t('pages.assessmentsToastCreateTitle'), description: t('pages.assessmentsToastCreateDescription') });
      setIsDialogOpen(false);
      setFormData({
        cohort: '',
        title: '',
        description: '',
        kind: 'QUIZ',
        max_score: 100,
        weight: 1,
        due_at: '',
      });
    },
    onError: (error) => {
      toast({ title: t('pages.assessmentsToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssessmentDto> }) => updateAssessment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assessments'] });
      toast({ title: t('pages.assessmentsToastUpdateTitle'), description: t('pages.assessmentsToastUpdateDescription') });
      setIsDialogOpen(false);
      setEditingAssessment(null);
    },
    onError: (error) => {
      toast({ title: t('pages.assessmentsToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAssessment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assessments'] });
      toast({ title: t('pages.assessmentsToastDeleteTitle'), description: t('pages.assessmentsToastDeleteDescription') });
    },
    onError: (error) => {
      toast({ title: t('pages.assessmentsToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleOpenCreate = () => {
    setEditingAssessment(null);
    setFormData({
      cohort: '',
      title: '',
      description: '',
      kind: 'QUIZ',
      max_score: 100,
      weight: 1,
      due_at: '',
    });
    setIsDialogOpen(true);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    // Pad month, day, hours, minutes
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const handleOpenEdit = (assessment: AssessmentDto) => {
    setEditingAssessment(assessment);
    setFormData({
      cohort: assessment.cohort || '',
      title: assessment.title || '',
      description: assessment.description || '',
      kind: assessment.kind || 'QUIZ',
      max_score: typeof assessment.max_score === 'number' ? assessment.max_score : 100,
      weight: typeof assessment.weight === 'number' ? assessment.weight : 1,
      due_at: formatDateForInput(assessment.due_at || assessment.due_date || ''),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      due_at: formData.due_at || null,
    };
    if (editingAssessment) {
      updateMutation.mutate({ id: editingAssessment.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t('pages.assessmentsDeleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-44 bg-muted animate-pulse rounded" />
            <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
          </div>
          <div className="h-10 w-44 bg-muted animate-pulse rounded" />
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
      <div className="flex items-center justify-between assesments_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.assessmentsTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.assessmentsSubtitle')}</p>
        </div>
        <div className="flex gap-2 assesments_create_btn_wrapper">
          <Button onClick={handleOpenCreate} className='assesments_create_btn'>
            <Plus className="mr-2 h-4 w-4" />
            {t('pages.assessmentsButtonCreate')}
          </Button>
        </div>
      </div>

      {assessments.length === 0 && <ExampleBanner />}
      <div className="space-y-4">
        {(assessments.length === 0 ? exampleAssessments.slice(0, 1) : assessments).map((assessment: any) => {
          const cohort = cohorts.find((c) => c.id === assessment.cohort);
          return (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between assesments_item">
                    
                  <div className='assesments_top_side'>

                    <div className="flex gap-4">
                      <div className="rounded-lg bg-primary/10 p-3 assesments_icon">
                        <FileCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>
                          {assessment.title}
                          <span className="ml-2 px-2 py-1 rounded bg-muted text-xs font-semibold align-middle">
                            {assessment.kind === 'EXAM' && t('pages.assessmentsTypeExam')}
                            {assessment.kind === 'QUIZ' && t('pages.assessmentsTypeQuiz')}
                            {assessment.kind === 'PROJECT' && t('pages.assessmentsTypeProject')}
                            {assessment.kind === 'ASSIGNMENT' && t('pages.assessmentsTypeAssignment')}
                          </span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {cohort?.name || t('pages.assessmentsUnknownCohort')} • {t('pages.assessmentsDue')}:{' '}
                          {assessment.due_at ? new Date(assessment.due_at).toLocaleDateString() : t('pages.assessmentsNoDueDate')}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{t('pages.assessmentsMax')}: {typeof assessment.max_score === 'number' && !isNaN(assessment.max_score) ? assessment.max_score : 0}</p>
                        <p className="text-xs text-muted-foreground">{t('pages.assessmentsWeight')}: {assessment.weight}</p>
                      </div>
                    </div>

                  </div>


                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(assessment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(assessment.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {assessments.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t('pages.assessmentsEmpty')}
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAssessment ? t('pages.assessmentsDialogEditTitle') : t('pages.assessmentsDialogCreateTitle')}</DialogTitle>
            <DialogDescription>
              {editingAssessment ? t('pages.assessmentsDialogEditDescription') : t('pages.assessmentsDialogCreateDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cohort">{t('pages.assessmentsDialogFieldCohort')}</Label>
                <Select value={formData.cohort} onValueChange={(value) => setFormData({ ...formData, cohort: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('pages.assessmentsDialogFieldCohortPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {cohorts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">{t('pages.assessmentsDialogFieldTitle')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t('pages.assessmentsDialogFieldType')}</Label>
                <Select
                  value={formData.kind}
                  onValueChange={(value) => setFormData({ ...formData, kind: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXAM">{t('pages.assessmentsTypeExam')}</SelectItem>
                    <SelectItem value="QUIZ">{t('pages.assessmentsTypeQuiz')}</SelectItem>
                    <SelectItem value="PROJECT">{t('pages.assessmentsTypeProject')}</SelectItem>
                    <SelectItem value="ASSIGNMENT">{t('pages.assessmentsTypeAssignment')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_score">{t('pages.assessmentsDialogFieldMaxScore')}</Label>
                  <Input
                    id="max_score"
                    type="number"
                    min="1"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) || 100 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">{t('pages.assessmentsDialogFieldWeight')}</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_at">{t('pages.assessmentsDialogFieldDueDate')}</Label>
                <Input
                  id="due_at"
                  type="datetime-local"
                  value={formData.due_at}
                  onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t('pages.assessmentsDialogFieldDescription')}</Label>
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
                {t('pages.assessmentsDialogCancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingAssessment ? t('pages.assessmentsDialogButtonUpdate') : t('pages.assessmentsDialogButtonCreate')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
