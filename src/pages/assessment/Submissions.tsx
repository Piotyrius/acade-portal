import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, FileText, Download, Eye, X, File } from 'lucide-react';
import { exampleSubmissions } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubmissions, createSubmission, updateSubmission, SubmissionDto } from '@/api/endpoints/assessment';
import { getAssessments } from '@/api/endpoints/assessment';
import { useAuthStore } from '@/store/authStore';
import { useState, useRef } from 'react';
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

export default function Submissions() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('all');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    assessment: '',
    text: '',
    file: null as File | null,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions'],
    queryFn: getSubmissions,
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: getAssessments,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { assessment: string; text?: string; file?: File }) =>
      createSubmission(payload.assessment, { text: payload.text, file: payload.file }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['submissions'] });
      toast({ title: 'Success', description: 'Submission created successfully' });
      setIsDialogOpen(false);
      setFormData({ assessment: '', text: '', file: null });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubmissionDto> }) => updateSubmission(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['submissions'] });
      toast({ title: 'Success', description: 'Submission updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assessment) {
      toast({
        title: 'Error',
        description: 'Assessment is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.text && !formData.file) {
      toast({
        title: 'Error',
        description: 'Either text or file is required',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate({
      assessment: formData.assessment,
      text: formData.text || undefined,
      file: formData.file || undefined,
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, file: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displaySubmissions = submissions.length === 0 ? exampleSubmissions.slice(0, 1) : submissions;
  const filteredSubmissions = selectedAssessment && selectedAssessment !== 'all'
    ? displaySubmissions.filter((s: any) => s.assessment === selectedAssessment)
    : displaySubmissions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
          <p className="text-muted-foreground">View and manage assessment submissions</p>
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
            {user?.role === 'STUDENT' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>

      {submissions.length === 0 && <ExampleBanner />}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No submissions found</p>
            ) : (
              filteredSubmissions.map((submission: any) => {
                const assessment = assessments.find((a: any) => a.id === submission.assessment);
                return (
                  <div key={submission.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{assessment?.title || 'Unknown Assessment'}</p>
                        <p className="text-sm text-muted-foreground">
                          Student: {submission.student_name || submission.student}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                        {submission.text && (
                          <p className="text-sm text-muted-foreground mt-1">{submission.text.substring(0, 100)}...</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.late_flag && <Badge variant="destructive">Late</Badge>}
                      {submission.file && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={submission.file} download target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
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

      {user?.role === 'STUDENT' && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Assessment</DialogTitle>
              <DialogDescription>Submit your work for an assessment</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="assessment">Assessment *</Label>
                  <Select
                    value={formData.assessment}
                    onValueChange={(value) => setFormData({ ...formData, assessment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessments
                        .filter((a: any) => a.published)
                        .map((assessment: any) => (
                          <SelectItem key={assessment.id} value={assessment.id}>
                            {assessment.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text">Text Response</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    rows={5}
                    placeholder="Enter your submission text..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File Upload</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                      dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      id="file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {formData.file ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <File className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{formData.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(formData.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Drag and drop your file here, or{' '}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-primary hover:underline"
                            >
                              browse
                            </button>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supports PDF, DOC, DOCX, and other common file types
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Submitting...' : 'Submit'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

