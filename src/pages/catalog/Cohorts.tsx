import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Users, Edit, Trash2, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCohorts, createCohort, updateCohort, deleteCohort, generateSessions, getCourses } from '@/api/endpoints/catalog';
import { CohortDto } from '@/api/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function Cohorts() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<CohortDto | null>(null);
  const [editingCohort, setEditingCohort] = useState<CohortDto | null>(null);
  const [formData, setFormData] = useState({
    course: '',
    name: '',
    lecturer: '',
    capacity: 20,
    start_date: '',
    end_date: '',
    status: 'PLANNED' as CohortDto['status'],
  });
  const [sessionFormData, setSessionFormData] = useState({
    pattern: '',
    start_time: '19:00',
    end_time: '21:00',
    exclude_holidays: true,
  });

  const { data: cohorts = [], isLoading } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
  });

  const createMutation = useMutation({
    mutationFn: createCohort,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cohorts'] });
      toast({ title: 'Success', description: 'Cohort created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CohortDto> }) => updateCohort(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cohorts'] });
      toast({ title: 'Success', description: 'Cohort updated successfully' });
      setIsDialogOpen(false);
      setEditingCohort(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCohort,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cohorts'] });
      toast({ title: 'Success', description: 'Cohort deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const generateSessionsMutation = useMutation({
    mutationFn: ({ cohortId, payload }: { cohortId: string; payload: any }) =>
      generateSessions(cohortId, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      toast({
        title: 'Success',
        description: `Generated ${data.created} sessions successfully`,
      });
      setIsSessionDialogOpen(false);
      setSelectedCohort(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      course: '',
      name: '',
      lecturer: '',
      capacity: 20,
      start_date: '',
      end_date: '',
      status: 'PLANNED',
    });
  };

  const filteredCohorts = cohorts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((c as any).course_title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingCohort(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (cohort: CohortDto) => {
    setEditingCohort(cohort);
    setFormData({
      course: cohort.course,
      name: cohort.name,
      lecturer: cohort.lecturer || '',
      capacity: cohort.capacity,
      start_date: cohort.start_date,
      end_date: cohort.end_date,
      status: cohort.status,
    });
    setIsDialogOpen(true);
  };

  const handleOpenGenerateSessions = (cohort: CohortDto) => {
    setSelectedCohort(cohort);
    setSessionFormData({
      pattern: '',
      start_time: '19:00',
      end_time: '21:00',
      exclude_holidays: true,
    });
    setIsSessionDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      lecturer: formData.lecturer || null,
    };
    if (editingCohort) {
      updateMutation.mutate({ id: editingCohort.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleGenerateSessions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCohort) return;
    generateSessionsMutation.mutate({
      cohortId: selectedCohort.id,
      payload: sessionFormData,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this cohort?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: CohortDto['status']): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<CohortDto['status'], "default" | "destructive" | "outline" | "secondary"> = {
      PLANNED: 'secondary',
      ENROLLING: 'default',
      ACTIVE: 'default',
      COMPLETED: 'outline',
      CANCELLED: 'destructive',
    };
    return colors[status] || 'secondary';
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cohorts</h2>
          <p className="text-muted-foreground">Manage student cohorts and groups</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Cohort
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cohorts..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredCohorts.map((cohort) => (
          <Card key={cohort.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{cohort.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {(cohort as any).course_title} • {(cohort as any).lecturer_name || 'No lecturer assigned'}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={getStatusColor(cohort.status)}>{(cohort as any).status_display || cohort.status}</Badge>
                      <Badge variant="outline">
                        {(cohort as any).current_enrollment_count || 0} / {cohort.capacity} students
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(new Date(cohort.start_date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenGenerateSessions(cohort)}
                      title="Generate Sessions"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(cohort)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cohort.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredCohorts.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {searchTerm ? 'No cohorts found matching your search' : 'No cohorts yet. Create your first cohort!'}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Cohort Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCohort ? 'Edit Cohort' : 'Create Cohort'}</DialogTitle>
            <DialogDescription>
              {editingCohort ? 'Update cohort details' : 'Add a new student cohort'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => setFormData({ ...formData, course: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Cohort Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as CohortDto['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="ENROLLING">Enrolling</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingCohort ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate Sessions Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Sessions</DialogTitle>
            <DialogDescription>
              Generate recurring sessions for {selectedCohort?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerateSessions}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pattern">Pattern * (e.g., MON,WED,FRI or TUE,THU)</Label>
                <Input
                  id="pattern"
                  placeholder="MON,WED,FRI"
                  value={sessionFormData.pattern}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, pattern: e.target.value.toUpperCase() })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use day abbreviations: MON, TUE, WED, THU, FRI, SAT, SUN
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={sessionFormData.start_time}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={sessionFormData.end_time}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSessionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={generateSessionsMutation.isPending}>
                Generate Sessions
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

