import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, GraduationCap, Edit, CheckCircle, Eye } from 'lucide-react';
import { exampleGrades } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGrades, createGrade, updateGrade, moderateGrade, GradeDto } from '@/api/endpoints/assessment';
import { getAssessments } from '@/api/endpoints/assessment';
import { getUsers } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Grades() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeDto | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('all');
  const [formData, setFormData] = useState({
    assessment: '',
    student: '',
    score: '',
    max_score: '',
    feedback: '',
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['grades'],
    queryFn: () => getGrades(),
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => getAssessments(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => getUsers('STUDENT'),
    enabled: user?.role === 'ADMIN' || user?.role === 'LECTURER',
  });

  const createMutation = useMutation({
    mutationFn: createGrade,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: 'Success', description: 'Grade created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GradeDto> }) => updateGrade(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: 'Success', description: 'Grade updated successfully' });
      setIsDialogOpen(false);
      setEditingGrade(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) => moderateGrade(id, approved),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: 'Success', description: 'Grade moderated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ assessment: '', student: '', score: '', max_score: '', feedback: '' });
  };

  const handleOpenDialog = (grade?: GradeDto) => {
    if (grade) {
      setEditingGrade(grade);
      setFormData({
        assessment: grade.assessment,
        student: grade.student,
        score: grade.score.toString(),
        max_score: grade.max_score.toString(),
        feedback: grade.feedback || '',
      });
    } else {
      setEditingGrade(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assessment || !formData.student || !formData.score || !formData.max_score) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      assessment: formData.assessment,
      student: formData.student,
      score: parseFloat(formData.score),
      max_score: parseFloat(formData.max_score),
      feedback: formData.feedback || undefined,
    };

    if (editingGrade) {
      updateMutation.mutate({ id: editingGrade.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const displayGrades = grades.length === 0 ? exampleGrades.slice(0, 1) : grades;
  const filteredGrades = selectedAssessment && selectedAssessment !== 'all'
    ? displayGrades.filter((g: any) => g.assessment === selectedAssessment)
    : displayGrades;

  if (user?.role === 'STUDENT') {
    const studentGrades = grades.filter((g: any) => g.student === user.id);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Grades</h2>
          <p className="text-muted-foreground">View your assessment grades</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentGrades.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No grades found</p>
              ) : (
                studentGrades.map((grade: any) => {
                  const assessment = assessments.find((a: any) => a.id === grade.assessment);
                  const percentage = parseFloat(grade.percentage);
                  return (
                    <div key={grade.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{assessment?.title || 'Unknown Assessment'}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {grade.score} / {grade.max_score}
                        </p>
                        {grade.feedback && <p className="text-sm text-muted-foreground mt-1">{grade.feedback}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">{percentage.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">
                          {grade.graded_at ? new Date(grade.graded_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grades</h2>
          <p className="text-muted-foreground">Manage assessment grades</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by assessment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assessments</SelectItem>
              {assessments.map((assessment: any) => (
                <SelectItem key={assessment.id} value={assessment.id}>
                  {assessment.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Grade
            </Button>
          </div>
        </div>
      </div>

      {grades.length === 0 && <ExampleBanner />}
      <Card>
        <CardHeader>
          <CardTitle>Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredGrades.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No grades found</p>
            ) : (
              filteredGrades.map((grade: any) => {
                const assessment = assessments.find((a: any) => a.id === grade.assessment);
                const student = students.find((s: any) => s.id === grade.student);
                const percentage = parseFloat(grade.percentage);
                return (
                  <div key={grade.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{assessment?.title || 'Unknown Assessment'}</p>
                        <p className="text-sm text-muted-foreground">
                          Student: {student ? `${student.first_name} ${student.last_name}` : grade.student_name || grade.student}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Score: {grade.score} / {grade.max_score}
                        </p>
                        {grade.feedback && <p className="text-xs text-muted-foreground mt-1">{grade.feedback}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-medium text-lg">{percentage.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">
                          {grade.graded_at ? new Date(grade.graded_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(grade)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user?.role === 'ADMIN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moderateMutation.mutate({ id: grade.id, approved: true })}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGrade ? 'Edit Grade' : 'Add Grade'}</DialogTitle>
            <DialogDescription>
              {editingGrade ? 'Update the grade details' : 'Create a new grade for a student'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assessment">Assessment *</Label>
                <Select
                  value={formData.assessment}
                  onValueChange={(value) => setFormData({ ...formData, assessment: value })}
                  disabled={!!editingGrade}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments.map((assessment: any) => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        {assessment.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="student">Student *</Label>
                <Select
                  value={formData.student}
                  onValueChange={(value) => setFormData({ ...formData, student: value })}
                  disabled={!!editingGrade}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student: any) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Score *</Label>
                  <Input
                    id="score"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_score">Max Score *</Label>
                  <Input
                    id="max_score"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  rows={3}
                  placeholder="Optional feedback for the student"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingGrade ? (updateMutation.isPending ? 'Updating...' : 'Update') : createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

