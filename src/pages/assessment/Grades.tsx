import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, GraduationCap, Edit, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import { exampleGrades } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGrades, createGrade, updateGrade, moderateGrade, GradeDto } from '@/api/endpoints/assessment';
import { getAssessments } from '@/api/endpoints/assessment';
import { getUsers } from '@/api/endpoints/auth';
import { getEnrollments } from '@/api/endpoints/admissions';
import { useAuthStore } from '@/store/authStore';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeDto | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('all');
  const [moderationStatusFilter, setModerationStatusFilter] = useState<string>('all');
  const [isModerationDialogOpen, setIsModerationDialogOpen] = useState(false);
  const [selectedGradeForModeration, setSelectedGradeForModeration] = useState<GradeDto | null>(null);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject'>('approve');
  const [moderationComment, setModerationComment] = useState('');
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

  // Get the cohort from the selected assessment in the form
  const selectedAssessmentObj = useMemo(() => 
    assessments.find((a: any) => a.id === formData.assessment),
    [assessments, formData.assessment]
  );
  const cohortId = selectedAssessmentObj?.cohort;

  // Get enrollments for the selected assessment's cohort
  // Only fetch ACTIVE enrollments since backend requires students to be actively enrolled
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', cohortId],
    queryFn: () => getEnrollments(cohortId, 'ACTIVE'),
    enabled: !!(user?.role === 'ADMIN' || user?.role === 'LECTURER') && !!cohortId,
  });

  // Get all students
  const { data: allStudents = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => getUsers('STUDENT'),
    enabled: user?.role === 'ADMIN' || user?.role === 'LECTURER',
  });

  // Filter students to only show enrolled students when an assessment is selected
  const availableStudents = useMemo(() => {
    if (!cohortId) {
      return []; // No students until assessment is selected
    }
    
    if (enrollments.length === 0) {
      return []; // No enrolled students
    }

    // Get the student IDs from enrollments
    const enrolledStudentIds = new Set(
      enrollments.map((enrollment: any) => enrollment.student)
    );

    // Filter students to only those enrolled in the cohort
    return allStudents.filter((student: any) => 
      enrolledStudentIds.has(student.id)
    );
  }, [cohortId, enrollments, allStudents]);

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
    mutationFn: ({ id, approved, comment }: { id: string; approved: boolean; comment?: string }) =>
      moderateGrade(id, approved, comment),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['grades'] });
      toast({
        title: 'Success',
        description: `Grade ${variables.approved ? 'approved' : 'rejected'} successfully`,
      });
      setIsModerationDialogOpen(false);
      setSelectedGradeForModeration(null);
      setModerationComment('');
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleOpenModerationDialog = (grade: GradeDto, action: 'approve' | 'reject') => {
    setSelectedGradeForModeration(grade);
    setModerationAction(action);
    setModerationComment('');
    setIsModerationDialogOpen(true);
  };

  const handleModerate = () => {
    if (!selectedGradeForModeration) return;
    moderateMutation.mutate({
      id: selectedGradeForModeration.id,
      approved: moderationAction === 'approve',
      comment: moderationComment.trim() || undefined,
    });
  };

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
  const filteredGrades = displayGrades.filter((g: any) => {
    const matchesAssessment = !selectedAssessment || selectedAssessment === 'all' || g.assessment === selectedAssessment;
    // Note: Moderation status filter would work if API returns moderation_status field
    // For now, we'll filter based on is_moderated if available
    const matchesModeration = moderationStatusFilter === 'all' ||
      (moderationStatusFilter === 'pending' && !g.is_moderated) ||
      (moderationStatusFilter === 'approved' && g.is_moderated && g.moderation_status === 'APPROVED') ||
      (moderationStatusFilter === 'rejected' && g.is_moderated && g.moderation_status === 'REJECTED');
    return matchesAssessment && matchesModeration;
  });

  const getModerationStatusBadge = (grade: any) => {
    if (!grade.is_moderated) {
      return <Badge variant="secondary">Pending</Badge>;
    }
    if (grade.moderation_status === 'APPROVED') {
      return <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Approved
      </Badge>;
    }
    if (grade.moderation_status === 'REJECTED') {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Rejected
      </Badge>;
    }
    return null;
  };

  if (user?.role === 'STUDENT') {
    const studentGrades = grades.filter((g: any) => g.student === user.id);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.gradesMyTitle') || t('gradesMyTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.gradesMySubtitle') || t('gradesMySubtitle')}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentGrades.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('pages.gradesNoGrades') || t('gradesNoGrades')}</p>
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
      <div className="flex items-center justify-between grade_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.gradesTitle') || t('gradesTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.gradesSubtitle') || t('gradesSubtitle')}</p>
        </div>
        <div className="flex gap-2 grade_btn_wrapper">
          <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
            <SelectTrigger className="grade_select">
              <SelectValue placeholder={t('pages.gradesFilterPlaceholder') || t('gradesFilterPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('pages.assessmentSubmissionsAllAssessments') || t('assessmentSubmissionsAllAssessments')}</SelectItem>
              {assessments.map((assessment: any) => (
                <SelectItem key={assessment.id} value={assessment.id}>
                  {assessment.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {user?.role === 'ADMIN' && (
            <Select value={moderationStatusFilter} onValueChange={setModerationStatusFilter}>
              <SelectTrigger className="grade_select">
                <SelectValue placeholder="Moderation status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
          <div className="flex gap-2 add_grade_btn_wrapper">
            <Button onClick={() => handleOpenDialog()} className='add_grade_btn'>
              <Plus className="mr-2 h-4 w-4" />
              {t('pages.gradesAddButton') || t('gradesAddButton')}
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
              <p className="text-muted-foreground text-center py-8">{t('pages.gradesNoGrades') || t('gradesNoGrades')}</p>
            ) : (
              filteredGrades.map((grade: any) => {
                const assessment = assessments.find((a: any) => a.id === grade.assessment);
                const student = allStudents.find((s: any) => s.id === grade.student);
                const percentage = parseFloat(grade.percentage);
                return (
                  <div key={grade.id} className="flex items-center justify-between p-4 border border-border rounded-lg grades_item">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 grade_icon">
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
                        {user?.role === 'ADMIN' && (
                          <div className="mt-2">
                            {getModerationStatusBadge(grade)}
                            {grade.moderated_by_name && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Moderated by {grade.moderated_by_name}
                                {grade.moderated_at && ` on ${new Date(grade.moderated_at).toLocaleDateString()}`}
                              </p>
                            )}
                            {grade.moderation_comment && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                Comment: {grade.moderation_comment}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 grades_right_wrapper">
                      <div className="text-right grade_date__precent">
                        <p className="font-medium text-lg">{percentage.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">
                          {grade.graded_at ? new Date(grade.graded_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(grade)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user?.role === 'ADMIN' && (
                        <>
                          {(!grade.is_moderated || grade.moderation_status !== 'APPROVED') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModerationDialog(grade, 'approve')}
                              title="Approve grade"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {(!grade.is_moderated || grade.moderation_status !== 'REJECTED') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModerationDialog(grade, 'reject')}
                              title="Reject grade"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </>
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
            <DialogTitle>{editingGrade ? (t('pages.gradesDialogEditTitle') || t('gradesDialogEditTitle')) : (t('pages.gradesDialogCreateTitle') || t('gradesDialogCreateTitle'))}</DialogTitle>
            <DialogDescription>
              {editingGrade ? (t('pages.gradesDialogEditDescription') || t('gradesDialogEditDescription')) : (t('pages.gradesDialogCreateDescription') || t('gradesDialogCreateDescription'))}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assessment">Assessment *</Label>
                <Select
                  value={formData.assessment}
                  onValueChange={(value) => {
                    // Clear student selection when assessment changes
                    setFormData({ ...formData, assessment: value, student: '' });
                  }}
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
                {!formData.assessment ? (
                  <div className="text-sm text-muted-foreground p-2 border rounded-md">
                    Please select an assessment first to see enrolled students
                  </div>
                ) : enrollmentsLoading ? (
                  <div className="text-sm text-muted-foreground p-2 border rounded-md">
                    Loading enrolled students...
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2 border rounded-md">
                    No enrolled students found for this assessment's cohort
                  </div>
                ) : (
                  <Select
                    value={formData.student}
                    onValueChange={(value) => setFormData({ ...formData, student: value })}
                    disabled={!!editingGrade}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((student: any) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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

      {/* Moderation Dialog */}
      <Dialog open={isModerationDialogOpen} onOpenChange={setIsModerationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderationAction === 'approve' ? 'Approve Grade' : 'Reject Grade'}
            </DialogTitle>
            <DialogDescription>
              {moderationAction === 'approve'
                ? 'Approve this grade for the student'
                : 'Reject this grade and require review'}
            </DialogDescription>
          </DialogHeader>
          {selectedGradeForModeration && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Assessment: {assessments.find((a: any) => a.id === selectedGradeForModeration.assessment)?.title || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Student: {allStudents.find((s: any) => s.id === selectedGradeForModeration.student) 
                    ? `${allStudents.find((s: any) => s.id === selectedGradeForModeration.student)?.first_name} ${allStudents.find((s: any) => s.id === selectedGradeForModeration.student)?.last_name}`
                    : selectedGradeForModeration.student_name || selectedGradeForModeration.student}
                </p>
                <p className="text-sm text-muted-foreground">
                  Score: {selectedGradeForModeration.score} / {selectedGradeForModeration.max_score} ({parseFloat(selectedGradeForModeration.percentage).toFixed(1)}%)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="moderation_comment">Moderation Comment (Optional)</Label>
                <Textarea
                  id="moderation_comment"
                  value={moderationComment}
                  onChange={(e) => setModerationComment(e.target.value)}
                  rows={3}
                  placeholder="Add a comment about this moderation decision..."
                />
                <p className="text-xs text-muted-foreground">
                  Your comment will be saved with the moderation decision
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModerationDialogOpen(false)}>
              {t('catalogCoursesCancel')}
            </Button>
            <Button
              onClick={handleModerate}
              disabled={moderateMutation.isPending}
              variant={moderationAction === 'reject' ? 'destructive' : 'default'}
            >
              {moderateMutation.isPending
                ? (t('pages.gradesModerationProcessing') || t('gradesModerationProcessing'))
                : moderationAction === 'approve'
                ? (t('pages.gradesModerationApprove') || t('gradesModerationApprove'))
                : (t('pages.gradesModerationReject') || t('gradesModerationReject'))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

