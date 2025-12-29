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
import { useTranslation } from 'react-i18next';

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
      toast({ title: t('pages.gradesToastCreateTitle'), description: t('pages.gradesToastCreateDescription') });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: t('pages.gradesToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GradeDto> }) => updateGrade(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] });
      toast({ title: t('pages.gradesToastUpdateTitle'), description: t('pages.gradesToastUpdateDescription') });
      setIsDialogOpen(false);
      setEditingGrade(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: t('pages.gradesToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, approved, comment }: { id: string; approved: boolean; comment?: string }) =>
      moderateGrade(id, approved, comment),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['grades'] });
      toast({
        title: t('pages.gradesToastModerateTitle'),
        description: variables.approved ? t('pages.gradesToastModerateApproved') : t('pages.gradesToastModerateRejected'),
      });
      setIsModerationDialogOpen(false);
      setSelectedGradeForModeration(null);
      setModerationComment('');
    },
    onError: (error) => {
      toast({ title: t('pages.gradesToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
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
        title: t('pages.gradesToastErrorTitle'),
        description: t('pages.gradesErrorAllFieldsRequired'),
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
      return <Badge variant="secondary">{t('pages.gradesModerationPending')}</Badge>;
    }
    if (grade.moderation_status === 'APPROVED') {
      return <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        {t('pages.gradesModerationApproved')}
      </Badge>;
    }
    if (grade.moderation_status === 'REJECTED') {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        {t('pages.gradesModerationRejected')}
      </Badge>;
    }
    return null;
  };

  if (user?.role === 'STUDENT') {
    const studentGrades = grades.filter((g: any) => g.student === user.id);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.gradesMyTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.gradesMySubtitle')}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('pages.gradesTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentGrades.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('pages.gradesNoneFound')}</p>
              ) : (
                studentGrades.map((grade: any) => {
                  const assessment = assessments.find((a: any) => a.id === grade.assessment);
                  const percentage = parseFloat(grade.percentage);
                  return (
                    <div key={grade.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{assessment?.title || t('pages.gradesUnknownAssessment')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('pages.gradesScoreLabel')}: {grade.score} / {grade.max_score}
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
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.gradesTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.gradesSubtitle')}</p>
        </div>
        <div className="flex gap-2 grade_btn_wrapper">
          <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
            <SelectTrigger className="grade_select">
              <SelectValue placeholder={t('pages.gradesFilterAssessment')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('pages.gradesFilterAll')}</SelectItem>
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
                <SelectValue placeholder={t('pages.gradesFilterModeration')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('pages.gradesModerationAll')}</SelectItem>
                <SelectItem value="pending">{t('pages.gradesModerationPending')}</SelectItem>
                <SelectItem value="approved">{t('pages.gradesModerationApproved')}</SelectItem>
                <SelectItem value="rejected">{t('pages.gradesModerationRejected')}</SelectItem>
              </SelectContent>
            </Select>
          )}
          <div className="flex gap-2 add_grade_btn_wrapper">
            <Button onClick={() => handleOpenDialog()} className='add_grade_btn'>
              <Plus className="mr-2 h-4 w-4" />
              {t('pages.gradesButtonAdd')}
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
                const student = allStudents.find((s: any) => s.id === grade.student);
                const percentage = parseFloat(grade.percentage);
                return (
                  <div key={grade.id} className="flex items-center justify-between p-4 border border-border rounded-lg grades_item">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 grade_icon">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{assessment?.title || t('pages.gradesUnknownAssessment')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('pages.gradesStudentLabel')}: {student ? `${student.first_name} ${student.last_name}` : grade.student_name || grade.student}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('pages.gradesScoreLabel')}: {grade.score} / {grade.max_score}
                        </p>
                        {grade.feedback && <p className="text-xs text-muted-foreground mt-1">{grade.feedback}</p>}
                        {user?.role === 'ADMIN' && (
                          <div className="mt-2">
                            {getModerationStatusBadge(grade)}
                            {grade.moderated_by_name && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {t('pages.gradesModeratedBy')} {grade.moderated_by_name}
                                {grade.moderated_at && ` ${t('pages.gradesModeratedOn')} ${new Date(grade.moderated_at).toLocaleDateString()}`}
                              </p>
                            )}
                            {grade.moderation_comment && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {t('pages.gradesModerationComment')}: {grade.moderation_comment}
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
                              title={t('pages.gradesModerationApproveTitle')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {(!grade.is_moderated || grade.moderation_status !== 'REJECTED') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModerationDialog(grade, 'reject')}
                              title={t('pages.gradesModerationRejectTitle')}
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
            <DialogTitle>{editingGrade ? t('pages.gradesDialogEditTitle') : t('pages.gradesDialogCreateTitle')}</DialogTitle>
            <DialogDescription>
              {editingGrade ? t('pages.gradesDialogEditDescription') : t('pages.gradesDialogCreateDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assessment">{t('pages.gradesDialogFieldAssessment')}</Label>
                <Select
                  value={formData.assessment}
                  onValueChange={(value) => {
                    // Clear student selection when assessment changes
                    setFormData({ ...formData, assessment: value, student: '' });
                  }}
                  disabled={!!editingGrade}
                >
                  <SelectTrigger>
                      <SelectValue placeholder={t('pages.gradesDialogFieldAssessmentPlaceholder')} />
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
                <Label htmlFor="student">{t('pages.gradesDialogFieldStudent')}</Label>
                {!formData.assessment ? (
                  <div className="text-sm text-muted-foreground p-2 border rounded-md">
                    {t('pages.gradesDialogSelectAssessmentFirst')}
                  </div>
                ) : enrollmentsLoading ? (
                  <div className="text-sm text-muted-foreground p-2 border rounded-md">
                    {t('pages.gradesDialogLoadingStudents')}
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2 border rounded-md">
                    {t('pages.gradesDialogNoStudents')}
                  </div>
                ) : (
                  <Select
                    value={formData.student}
                    onValueChange={(value) => setFormData({ ...formData, student: value })}
                    disabled={!!editingGrade}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('pages.gradesDialogFieldStudentPlaceholder')} />
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
                  <Label htmlFor="score">{t('pages.gradesDialogFieldScore')}</Label>
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
                  <Label htmlFor="max_score">{t('pages.gradesDialogFieldMaxScore')}</Label>
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
                <Label htmlFor="feedback">{t('pages.gradesDialogFieldFeedback')}</Label>
                <Textarea
                  id="feedback"
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  rows={3}
                  placeholder={t('pages.gradesDialogFieldFeedbackPlaceholder')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('pages.gradesDialogCancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingGrade ? (updateMutation.isPending ? t('pages.gradesDialogButtonUpdating') : t('pages.gradesDialogButtonUpdate')) : createMutation.isPending ? t('pages.gradesDialogButtonCreating') : t('pages.gradesDialogButtonCreate')}
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
              {moderationAction === 'approve' ? t('pages.gradesModerationDialogApproveTitle') : t('pages.gradesModerationDialogRejectTitle')}
            </DialogTitle>
            <DialogDescription>
              {moderationAction === 'approve'
                ? t('pages.gradesModerationDialogApproveDescription')
                : t('pages.gradesModerationDialogRejectDescription')}
            </DialogDescription>
          </DialogHeader>
          {selectedGradeForModeration && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  {t('pages.gradesModerationAssessmentLabel')}: {assessments.find((a: any) => a.id === selectedGradeForModeration.assessment)?.title || t('pages.gradesUnknownAssessment')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('pages.gradesStudentLabel')}: {allStudents.find((s: any) => s.id === selectedGradeForModeration.student) 
                    ? `${allStudents.find((s: any) => s.id === selectedGradeForModeration.student)?.first_name} ${allStudents.find((s: any) => s.id === selectedGradeForModeration.student)?.last_name}`
                    : selectedGradeForModeration.student_name || selectedGradeForModeration.student}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('pages.gradesScoreLabel')}: {selectedGradeForModeration.score} / {selectedGradeForModeration.max_score} ({parseFloat(selectedGradeForModeration.percentage).toFixed(1)}%)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="moderation_comment">{t('pages.gradesModerationCommentLabel')}</Label>
                <Textarea
                  id="moderation_comment"
                  value={moderationComment}
                  onChange={(e) => setModerationComment(e.target.value)}
                  rows={3}
                  placeholder={t('pages.gradesModerationCommentPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('pages.gradesModerationCommentHelper')}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModerationDialogOpen(false)}>
              {t('pages.gradesModerationDialogCancel')}
            </Button>
            <Button
              onClick={handleModerate}
              disabled={moderateMutation.isPending}
              variant={moderationAction === 'reject' ? 'destructive' : 'default'}
            >
              {moderateMutation.isPending
                ? t('pages.gradesModerationDialogButtonProcessing')
                : moderationAction === 'approve'
                ? t('pages.gradesModerationDialogButtonApprove')
                : t('pages.gradesModerationDialogButtonReject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

