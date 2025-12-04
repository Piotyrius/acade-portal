import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Calendar as CalendarIcon, Edit, Trash2, X, List, Calendar as Cal } from 'lucide-react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/pages/catalog/calendar.css';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  getCohorts,
  createSessionWithRecurrence,
  SessionWithRecurrencePayload,
} from '@/api/endpoints/catalog';
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
import { format, startOfWeek, isBefore, startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const localizer = dateFnsLocalizer({
  format,
  parse: (str: string) => new Date(str),
  startOfWeek: () => startOfWeek(new Date()),
  getDay: (date: Date) => date.getDay(),
  locales: {},
});
import { exampleSessions } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';

export default function Sessions() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
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
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatWeekdays, setRepeatWeekdays] = useState<number[]>([]);
  const [repeatUntil, setRepeatUntil] = useState<Date | undefined>(undefined);
  const [repeatError, setRepeatError] = useState<string | null>(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', selectedCohort],
    queryFn: () => getSessions(selectedCohort === 'all' ? undefined : selectedCohort),
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
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

  const createWithRecurrenceMutation = useMutation({
    mutationFn: (payload: SessionWithRecurrencePayload) => createSessionWithRecurrence(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      const createdCount = data?.created ?? data?.sessions?.length ?? 0;
      toast({
        title: 'Success',
        description:
          createdCount > 1
            ? `Created ${createdCount} sessions successfully`
            : 'Session created successfully',
      });
      setIsDialogOpen(false);
      setEditingSession(null);
      resetForm();
      resetRepeat();
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

  const resetRepeat = () => {
    setRepeatEnabled(false);
    setRepeatWeekdays([]);
    setRepeatUntil(undefined);
    setRepeatError(null);
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
    resetRepeat();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (session: SessionDto) => {
    setEditingSession(session);
    const startDate = new Date(session.start_at);
    const endDate = new Date(session.end_at);
    setFormData({
      cohort: session.cohort,
      start_at: format(startDate, "yyyy-MM-dd'T'HH:mm"),
      // store only the time portion for the time input
      end_at: format(endDate, 'HH:mm'),
      location: session.location || '',
      online_link: session.online_link || '',
      is_cancelled: session.is_cancelled,
      cancellation_reason: session.cancellation_reason || '',
    });
    resetRepeat();
    setIsDialogOpen(true);
  };

  const buildBasePayload = () => {
    const startDate = new Date(formData.start_at);

    // extract hours + minutes from the time input
    const [hours, minutes] = formData.end_at.split(':').map(Number);

    // build the end datetime
    const endDate = new Date(startDate);
    endDate.setHours(hours);
    endDate.setMinutes(minutes);

    return {
      ...formData,
      start_at: startDate.toISOString(),
      end_at: endDate.toISOString(),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRepeatError(null);

    const payload = buildBasePayload();

    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCreateWithRecurrence = () => {
    setRepeatError(null);

    if (!repeatEnabled || editingSession) {
      return;
    }

    if (!formData.start_at || !formData.end_at) {
      setRepeatError('Please fill in both start and end time before creating repeated sessions.');
      return;
    }

    const basePayload = buildBasePayload();

    if (repeatWeekdays.length === 0) {
      setRepeatError('Select at least one weekday for repeating sessions.');
      return;
    }
    if (!repeatUntil) {
      setRepeatError('Select an end date for repeating sessions.');
      return;
    }

    const startDate = new Date(formData.start_at);
    const repeatUntilStart = startOfDay(repeatUntil);
    if (isBefore(repeatUntilStart, startOfDay(startDate))) {
      setRepeatError('End date must be on or after the session start date.');
      return;
    }

    const recurrencePayload: SessionWithRecurrencePayload = {
      ...basePayload,
      repeat: true,
      weekdays: repeatWeekdays,
      repeat_until: repeatUntilStart.toISOString().slice(0, 10),
    };
    createWithRecurrenceMutation.mutate(recurrencePayload);
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
      <div className="flex items-center justify-between sessions_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
          <p className="text-muted-foreground">Manage class sessions and schedules</p>
        </div>
        <div className="flex gap-2 sessions_calendar_btns">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="mr-2 h-4 w-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Cal className="mr-2 h-4 w-4" />
            Calendar
          </Button>
          <Button onClick={handleOpenCreate} className='create_sessions_btn'>
            <Plus className="mr-2 h-4 w-4" />
            Add Session
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 sessions_search_select_wrapper">
        <div className="relative flex-1  sessions_input">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCohort} onValueChange={setSelectedCohort}>
          <SelectTrigger className="w-[200px] sessions_select">
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

      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredSessions.map((session: any) => {
            const startDate = new Date(session.start_at);
            const endDate = new Date(session.end_at);
            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between sessions_item">
                    <div className="flex gap-4 sessions_top_side_wrapper">
                      
                          <div className="rounded-lg bg-primary/10 p-3 sessions_icon">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className='sessions_top_side'>
                        <div>

                        <CardTitle>{session.cohort_name || 'Unknown Cohort'}</CardTitle>
                        <CardDescription className="mt-1">
                          {format(startDate, 'PPpp')} - {format(endDate, 'p')}
                        </CardDescription>
                        </div>
                        <div className="flex gap-2 mt-2 session_location">
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
      ) : (
        <Card>
          <CardContent className="p-6">
            <BigCalendar
              localizer={localizer}
              events={filteredSessions.map((session: any) => ({
                id: session.id,
                title: session.cohort_name || 'Session',
                start: new Date(session.start_at),
                end: new Date(session.end_at),
                resource: session,
              }))}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              onSelectEvent={(event) => handleOpenEdit(event.resource)}
              views={['month', 'week', 'day']}
              defaultView="week"
            />
          </CardContent>
        </Card>
      )}

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
                    type='time'
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

              {!editingSession && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="repeat-session">Repeat this session</Label>
                      <p className="text-xs text-muted-foreground">
                        Create this session again on selected weekdays at the same time.
                      </p>
                    </div>
                    <Switch
                      id="repeat-session"
                      checked={repeatEnabled}
                      onCheckedChange={(checked) => {
                        setRepeatEnabled(checked);
                        if (!checked) {
                          setRepeatWeekdays([]);
                          setRepeatUntil(undefined);
                          setRepeatError(null);
                        }
                      }}
                    />
                  </div>

                  {repeatEnabled && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Weekdays</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: 'Mon', value: 1 },
                            { label: 'Tue', value: 2 },
                            { label: 'Wed', value: 3 },
                            { label: 'Thu', value: 4 },
                            { label: 'Fri', value: 5 },
                            { label: 'Sat', value: 6 },
                            { label: 'Sun', value: 0 },
                          ].map((day) => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => {
                                setRepeatWeekdays((prev) =>
                                  prev.includes(day.value)
                                    ? prev.filter((d) => d !== day.value)
                                    : [...prev, day.value],
                                );
                              }}
                              className={cn(
                                'inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors',
                                repeatWeekdays.includes(day.value)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background text-foreground hover:bg-accent',
                              )}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label>Repeat until</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !repeatUntil && 'text-muted-foreground',
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {repeatUntil ? format(repeatUntil, 'PPP') : 'Pick end date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={repeatUntil}
                              onSelect={(date) => {
                                setRepeatUntil(date ?? undefined);
                              }}
                              disabled={(date) => {
                                if (!formData.start_at) return false;
                                const start = startOfDay(new Date(formData.start_at));
                                return isBefore(date, start);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">
                          Sessions will be created on these weekdays up to and including this date.
                        </p>
                      </div>

                      {repeatError && (
                        <p className="text-xs text-destructive">{repeatError}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              {editingSession ? (
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  Update
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    Create
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={
                      !repeatEnabled || createWithRecurrenceMutation.isPending
                    }
                    onClick={handleCreateWithRecurrence}
                  >
                    Create &amp; Repeat
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

