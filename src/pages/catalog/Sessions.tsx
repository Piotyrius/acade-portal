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
import { useTranslation } from 'react-i18next';

export default function Sessions() {
  const { t } = useTranslation('common');
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
      toast({ title: t('pages.catalogSessionsToastCreateTitle'), description: t('pages.catalogSessionsToastCreateDescription') });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: t('pages.catalogSessionsToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const createWithRecurrenceMutation = useMutation({
    mutationFn: (payload: SessionWithRecurrencePayload) => createSessionWithRecurrence(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      const createdCount = data?.created ?? data?.sessions?.length ?? 0;
      toast({
        title: t('pages.catalogSessionsToastCreateTitle'),
        description:
          createdCount > 1
            ? t('pages.catalogSessionsToastCreateMultipleDescription', { count: createdCount })
            : t('pages.catalogSessionsToastCreateDescription'),
      });
      setIsDialogOpen(false);
      setEditingSession(null);
      resetForm();
      resetRepeat();
    },
    onError: (error) => {
      toast({ title: t('pages.catalogSessionsToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SessionDto> }) => updateSession(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: t('pages.catalogSessionsToastUpdateTitle'), description: t('pages.catalogSessionsToastUpdateDescription') });
      setIsDialogOpen(false);
      setEditingSession(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: t('pages.catalogSessionsToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: t('pages.catalogSessionsToastDeleteTitle'), description: t('pages.catalogSessionsToastDeleteDescription') });
    },
    onError: (error) => {
      toast({ title: t('pages.catalogSessionsToastErrorTitle'), description: getErrorMessage(error), variant: 'destructive' });
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
      setRepeatError(t('pages.catalogSessionsFormRepeatErrorMissingTimes'));
      return;
    }

    const basePayload = buildBasePayload();

    if (repeatWeekdays.length === 0) {
      setRepeatError(t('pages.catalogSessionsFormRepeatErrorNoWeekdays'));
      return;
    }
    if (!repeatUntil) {
      setRepeatError(t('pages.catalogSessionsFormRepeatErrorNoEndDate'));
      return;
    }

    const startDate = new Date(formData.start_at);
    const repeatUntilStart = startOfDay(repeatUntil);
    if (isBefore(repeatUntilStart, startOfDay(startDate))) {
      setRepeatError(t('pages.catalogSessionsFormRepeatErrorInvalidRange'));
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
    if (confirm(t('pages.catalogSessionsDeleteConfirm'))) {
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
          <h2 className="text-3xl font-bold tracking-tight">{t('pages.catalogSessionsTitle')}</h2>
          <p className="text-muted-foreground">{t('pages.catalogSessionsSubtitle')}</p>
        </div>
        <div className="flex gap-2 sessions_calendar_btns">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="mr-2 h-4 w-4" />
            {t('pages.catalogSessionsViewList')}
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Cal className="mr-2 h-4 w-4" />
            {t('pages.catalogSessionsViewCalendar')}
          </Button>
          <Button onClick={handleOpenCreate} className='create_sessions_btn'>
            <Plus className="mr-2 h-4 w-4" />
            {t('pages.catalogSessionsAddSession')}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 sessions_search_select_wrapper">
        <div className="relative flex-1  sessions_input">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('pages.catalogSessionsSearchPlaceholder')}
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCohort} onValueChange={setSelectedCohort}>
          <SelectTrigger className="w-[200px] sessions_select">
            <SelectValue placeholder={t('pages.catalogSessionsFilterCohortPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('pages.catalogSessionsFilterAllCohorts')}</SelectItem>
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

                        <CardTitle>{session.cohort_name || t('pages.catalogSessionsUnknownCohort')}</CardTitle>
                        <CardDescription className="mt-1">
                          {format(startDate, 'PPpp')} - {format(endDate, 'p')}
                        </CardDescription>
                        </div>
                        <div className="flex gap-2 mt-2 session_location">
                          {session.location && (
                            <Badge variant="outline">📍 {session.location}</Badge>
                          )}
                          {session.online_link && (
                            <Badge variant="outline">🔗 {t('pages.catalogSessionsBadgeOnline')}</Badge>
                          )}
                          {session.is_cancelled && (
                            <Badge variant="destructive">{t('pages.catalogSessionsCancelledBadge')}</Badge>
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
                title: session.cohort_name || t('pages.catalogSessionsUnknownCohort'),
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
              ? t('pages.catalogSessionsNoResultsSearch')
              : t('pages.catalogSessionsNoResultsDefault')}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Session Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSession ? t('pages.catalogSessionsEditTitle') : t('pages.catalogSessionsCreateTitle')}</DialogTitle>
            <DialogDescription>
              {editingSession ? t('pages.catalogSessionsEditDescription') : t('pages.catalogSessionsCreateDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cohort">{t('pages.catalogSessionsFormCohort')} *</Label>
                <Select
                  value={formData.cohort}
                  onValueChange={(value) => setFormData({ ...formData, cohort: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('pages.catalogSessionsFormCohortPlaceholder')} />
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
                  <Label htmlFor="start_at">{t('pages.catalogSessionsFormStartAt')} *</Label>
                  <Input
                    id="start_at"
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_at">{t('pages.catalogSessionsFormEndAt')} *</Label>
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
                  <Label htmlFor="location">{t('pages.catalogSessionsFormLocation')}</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={t('pages.catalogSessionsFormLocationPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="online_link">{t('pages.catalogSessionsFormOnlineLink')}</Label>
                  <Input
                    id="online_link"
                    type="url"
                    value={formData.online_link}
                    onChange={(e) => setFormData({ ...formData, online_link: e.target.value })}
                    placeholder={t('pages.catalogSessionsFormOnlineLinkPlaceholder')}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_cancelled"
                  checked={formData.is_cancelled}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_cancelled: checked })}
                />
                <Label htmlFor="is_cancelled">{t('pages.catalogSessionsFormCancelled')}</Label>
              </div>
              {formData.is_cancelled && (
                <div className="space-y-2">
                  <Label htmlFor="cancellation_reason">{t('pages.catalogSessionsFormCancellationReason')}</Label>
                  <Input
                    id="cancellation_reason"
                    value={formData.cancellation_reason}
                    onChange={(e) => setFormData({ ...formData, cancellation_reason: e.target.value })}
                    placeholder={t('pages.catalogSessionsFormCancellationReasonPlaceholder')}
                  />
                </div>
              )}

              {!editingSession && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="repeat-session">{t('pages.catalogSessionsFormRepeatLabel')}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t('pages.catalogSessionsFormRepeatDescription')}
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
                        <p className="text-sm font-medium">{t('pages.catalogSessionsFormWeekdays')}</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: t('pages.catalogSessionsWeekdayMon'), value: 1 },
                            { label: t('pages.catalogSessionsWeekdayTue'), value: 2 },
                            { label: t('pages.catalogSessionsWeekdayWed'), value: 3 },
                            { label: t('pages.catalogSessionsWeekdayThu'), value: 4 },
                            { label: t('pages.catalogSessionsWeekdayFri'), value: 5 },
                            { label: t('pages.catalogSessionsWeekdaySat'), value: 6 },
                            { label: t('pages.catalogSessionsWeekdaySun'), value: 0 },
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
                        <Label>{t('pages.catalogSessionsFormRepeatUntil')}</Label>
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
                              {repeatUntil ? format(repeatUntil, 'PPP') : t('pages.catalogSessionsFormRepeatUntilPlaceholder')}
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
                          {t('pages.catalogSessionsFormRepeatUntilHelper')}
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
                {t('pages.catalogSessionsFormCancel')}
              </Button>
              {editingSession ? (
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? t('pages.catalogSessionsFormButtonUpdating') : t('pages.catalogSessionsFormButtonUpdate')}
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? t('pages.catalogSessionsFormButtonCreating') : t('pages.catalogSessionsFormButtonCreate')}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={
                      !repeatEnabled || createWithRecurrenceMutation.isPending
                    }
                    onClick={handleCreateWithRecurrence}
                  >
                    {createWithRecurrenceMutation.isPending ? t('pages.catalogSessionsFormButtonCreating') : t('pages.catalogSessionsFormSaveAndRepeat')}
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

