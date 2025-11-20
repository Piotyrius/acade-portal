import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Calendar, Edit, Trash2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSessions, createSession, updateSession, deleteSession, getCohorts } from '@/api/endpoints/catalog';
import { SessionDto } from '@/api/types';
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
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { exampleSessions } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';

export default function Sessions() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionDto | null>(null);
  const [formData, setFormData] = useState({
    cohort: '',
    start_at: '',
    end_at: '',
    location: '',
    online_link: '',
    is_cancelled: false,
    cancellation_reason: '',
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', selectedCohort],
    queryFn: () => getSessions(selectedCohort === 'all' ? undefined : selectedCohort),
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts'],
    queryFn: getCohorts,
  });

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: 'Success', description: 'Session created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SessionDto> }) => updateSession(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: 'Success', description: 'Session updated successfully' });
      setIsDialogOpen(false);
      setEditingSession(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: 'Success', description: 'Session deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      cohort: '',
      start_at: '',
      end_at: '',
      location: '',
      online_link: '',
      is_cancelled: false,
      cancellation_reason: '',
    });
  };

  const displaySessions = sessions.length === 0 ? exampleSessions.slice(0, 1) : sessions;
  const filteredSessions = displaySessions.filter((s: any) => {
    const matchesSearch = !searchTerm || s.cohort_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCohort = selectedCohort === 'all' || s.cohort === selectedCohort;
    return matchesSearch && matchesCohort;
  });

  const handleOpenCreate = () => {
    setEditingSession(null);
    resetForm();
    if (selectedCohort && selectedCohort !== 'all') {
      setFormData({ ...formData, cohort: selectedCohort });
    }
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (session: SessionDto) => {
    setEditingSession(session);
    const startDate = new Date(session.start_at);
    const endDate = new Date(session.end_at);
    setFormData({
      cohort: session.cohort,
      start_at: format(startDate, "yyyy-MM-dd'T'HH:mm"),
      end_at: format(endDate, "yyyy-MM-dd'T'HH:mm"),
      location: session.location || '',
      online_link: session.online_link || '',
      is_cancelled: session.is_cancelled,
      cancellation_reason: session.cancellation_reason || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      start_at: new Date(formData.start_at).toISOString(),
      end_at: new Date(formData.end_at).toISOString(),
    };
    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
          <p className="text-muted-foreground">Manage class sessions and schedules</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCohort} onValueChange={setSelectedCohort}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by cohort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cohorts</SelectItem>
            {cohorts?.map((cohort) => (
              <SelectItem key={cohort.id} value={cohort.id}>
                {cohort.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCohort && selectedCohort !== 'all' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCohort('all')}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {sessions.length === 0 && <ExampleBanner />}
      <div className="space-y-4">
        {filteredSessions.map((session: any) => {
          const startDate = new Date(session.start_at);
          const endDate = new Date(session.end_at);
          return (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{session.cohort_name || 'Unknown Cohort'}</CardTitle>
                      <CardDescription className="mt-1">
                        {format(startDate, 'PPpp')} - {format(endDate, 'p')}
                      </CardDescription>
                      <div className="flex gap-2 mt-2">
                        {session.location && (
                          <Badge variant="outline">📍 {session.location}</Badge>
                        )}
                        {session.online_link && (
                          <Badge variant="outline">🔗 Online</Badge>
                        )}
                        {session.is_cancelled && (
                          <Badge variant="destructive">Cancelled</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(session)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(session.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {filteredSessions.length === 0 && sessions.length > 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {searchTerm || selectedCohort !== 'all'
              ? 'No sessions found matching your filters'
              : 'No sessions yet. Create your first session!'}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Session Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSession ? 'Edit Session' : 'Create Session'}</DialogTitle>
            <DialogDescription>
              {editingSession ? 'Update session details' : 'Add a new class session'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cohort">Cohort *</Label>
                <Select
                  value={formData.cohort}
                  onValueChange={(value) => setFormData({ ...formData, cohort: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cohort" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_at">Start Date & Time *</Label>
                  <Input
                    id="start_at"
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_at">End Date & Time *</Label>
                  <Input
                    id="end_at"
                    type="datetime-local"
                    value={formData.end_at}
                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Room 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="online_link">Online Link</Label>
                  <Input
                    id="online_link"
                    type="url"
                    value={formData.online_link}
                    onChange={(e) => setFormData({ ...formData, online_link: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_cancelled"
                  checked={formData.is_cancelled}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_cancelled: checked })}
                />
                <Label htmlFor="is_cancelled">Cancelled</Label>
              </div>
              {formData.is_cancelled && (
                <div className="space-y-2">
                  <Label htmlFor="cancellation_reason">Cancellation Reason</Label>
                  <Input
                    id="cancellation_reason"
                    value={formData.cancellation_reason}
                    onChange={(e) => setFormData({ ...formData, cancellation_reason: e.target.value })}
                    placeholder="Reason for cancellation"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingSession ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

