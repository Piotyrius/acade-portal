import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Edit, MapPin, Link as LinkIcon, Clock, List, Calendar as Cal } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMySessions, updateSession } from '@/api/endpoints/catalog';
import { SessionDto } from '@/api/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
    format,
    parse: (str: string) => new Date(str),
    startOfWeek: () => startOfWeek(new Date()),
    getDay: (date: Date) => date.getDay(),
    locales: {},
});

export default function MySessions() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [dateFilter, setDateFilter] = useState<'upcoming' | 'thisWeek' | 'thisMonth' | 'all'>('upcoming');
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

    // Get date range based on filter
    const getDateRange = () => {
        const now = new Date();
        switch (dateFilter) {
            case 'upcoming':
                return { date_from: format(now, 'yyyy-MM-dd') };
            case 'thisWeek':
                return {
                    date_from: format(startOfWeek(now), 'yyyy-MM-dd'),
                    date_to: format(endOfWeek(now), 'yyyy-MM-dd'),
                };
            case 'thisMonth':
                return {
                    date_from: format(startOfMonth(now), 'yyyy-MM-dd'),
                    date_to: format(endOfMonth(now), 'yyyy-MM-dd'),
                };
            default:
                return {};
        }
    };

    const { data: sessions = [], isLoading } = useQuery({
        queryKey: ['my-sessions', dateFilter],
        queryFn: () => getMySessions(getDateRange()),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<SessionDto> }) => updateSession(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['my-sessions'] });
            toast({ title: 'Success', description: 'Session updated successfully' });
            setIsDialogOpen(false);
            setEditingSession(null);
            resetForm();
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
        if (!editingSession) return;
        const payload = {
            ...formData,
            start_at: new Date(formData.start_at).toISOString(),
            end_at: new Date(formData.end_at).toISOString(),
        };
        updateMutation.mutate({ id: editingSession.id, data: payload });
    };

    // Transform sessions for calendar
    const calendarEvents = sessions.map((session: any) => ({
        id: session.id,
        title: session.cohort_name || 'Session',
        start: new Date(session.start_at),
        end: new Date(session.end_at),
        resource: session,
    }));

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-9 w-48 bg-muted animate-pulse rounded" />
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
                    <h2 className="text-3xl font-bold tracking-tight">My Sessions</h2>
                    <p className="text-muted-foreground">View and manage your teaching schedule</p>
                </div>
                <div className="flex gap-2">
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
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    variant={dateFilter === 'upcoming' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateFilter('upcoming')}
                >
                    Upcoming
                </Button>
                <Button
                    variant={dateFilter === 'thisWeek' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateFilter('thisWeek')}
                >
                    This Week
                </Button>
                <Button
                    variant={dateFilter === 'thisMonth' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateFilter('thisMonth')}
                >
                    This Month
                </Button>
                <Button
                    variant={dateFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateFilter('all')}
                >
                    All
                </Button>
            </div>

            {viewMode === 'list' ? (
                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No sessions found for the selected period
                            </CardContent>
                        </Card>
                    ) : (
                        sessions.map((session: any) => {
                            const startDate = new Date(session.start_at);
                            const endDate = new Date(session.end_at);
                            return (
                                <Card key={session.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className="rounded-lg bg-primary/10 p-3">
                                                    <CalendarIcon className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle>{session.cohort_name || 'Unknown Cohort'}</CardTitle>
                                                    <CardDescription className="mt-1 flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        {format(startDate, 'PPpp')} - {format(endDate, 'p')}
                                                    </CardDescription>
                                                    <div className="flex gap-2 mt-2">
                                                        {session.location && (
                                                            <Badge variant="outline" className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {session.location}
                                                            </Badge>
                                                        )}
                                                        {session.online_link && (
                                                            <Badge variant="outline" className="flex items-center gap-1">
                                                                <LinkIcon className="h-3 w-3" />
                                                                Online
                                                            </Badge>
                                                        )}
                                                        {session.is_cancelled && (
                                                            <Badge variant="destructive">Cancelled</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(session)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                </Card>
                            );
                        })
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-6">
                        <Calendar
                            localizer={localizer}
                            events={calendarEvents}
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

            {/* Edit Session Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Session</DialogTitle>
                        <DialogDescription>Update session details or cancel the session</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
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
                                <Label htmlFor="is_cancelled">Cancel Session</Label>
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
                            <Button type="submit" disabled={updateMutation.isPending}>
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
