import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, FileSpreadsheet, Loader2, BarChart3, DollarSign, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import {
  exportApplications,
  exportEnrollments,
  exportAttendance,
  exportGrades,
  exportCertificates,
  exportPayroll,
  downloadBlob,
  getCohortAnalytics,
  getFinancialAnalytics,
  getAnalyticsOverview,
  getStudentFinancialReport,
  getTimeseriesAnalytics,
  type CohortAnalyticsDto,
  type FinancialAnalyticsDto,
  type OverviewAnalyticsDto,
  type StudentFinancialDto,
  type TimeseriesDataDto,
} from '@/api/endpoints/reporting';
import { getPrograms, getCohorts } from '@/api/endpoints/catalog';
import { getUsers } from '@/api/endpoints/users';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { format, subDays, startOfMonth, startOfYear, startOfDay, endOfDay, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

const coerceNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const toMinorAmount = (valueMajor: unknown): number | undefined => {
  const major = coerceNumber(valueMajor);
  if (major === undefined) return undefined;
  return Math.round(major * 100);
};

// Helper function to format currency (handles minor-units numbers + safe fallbacks)
const formatCurrency = (amountMinor: unknown, currency: string = 'USD'): string => {
  const minor = coerceNumber(amountMinor);
  if (minor === undefined) return '-';
  const amount = minor / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Helper function to format percentage
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Analytics Dashboard Component
function AnalyticsDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  // Filter state
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [programId, setProgramId] = useState<string>('all');
  const [cohortId, setCohortId] = useState<string>('all');
  const [studentId, setStudentId] = useState<string>('');
  const [lecturerId, setLecturerId] = useState<string>('');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month');

  // Helper to convert date string to ISO datetime
  const toISODateTime = (dateStr: string, isEndOfDay: boolean = false): string => {
    if (!dateStr) return '';
    const date = parseISO(dateStr);
    const dateTime = isEndOfDay ? endOfDay(date) : startOfDay(date);
    return dateTime.toISOString();
  };

  // Build query params
  const buildParams = () => {
    const params: any = {};
    if (dateFrom) params.date_from = toISODateTime(dateFrom, false);
    if (dateTo) params.date_to = toISODateTime(dateTo, true);
    if (programId && programId !== 'all') params.program_id = programId;
    if (cohortId && cohortId !== 'all') params.cohort_id = cohortId;
    if (studentId) params.student_id = studentId;
    if (lecturerId) params.lecturer_id = lecturerId;
    return params;
  };

  // Queries
  const { data: overview, isLoading: overviewLoading } = useQuery<OverviewAnalyticsDto>({
    queryKey: ['analytics-overview', buildParams()],
    queryFn: () => getAnalyticsOverview(buildParams()),
    enabled: user?.role === 'ADMIN',
  });

  const { data: cohortAnalytics, isLoading: cohortLoading } = useQuery<CohortAnalyticsDto[]>({
    queryKey: ['analytics-cohort', { dateFrom, dateTo }],
    queryFn: () => getCohortAnalytics({ 
      date_from: dateFrom ? toISODateTime(dateFrom, false) : undefined, 
      date_to: dateTo ? toISODateTime(dateTo, true) : undefined 
    }),
    enabled: user?.role === 'ADMIN',
  });

  const { data: financialAnalytics, isLoading: financialLoading } = useQuery<FinancialAnalyticsDto>({
    queryKey: ['analytics-financial', { dateFrom, dateTo }],
    queryFn: () => getFinancialAnalytics({ 
      date_from: dateFrom ? toISODateTime(dateFrom, false) : undefined, 
      date_to: dateTo ? toISODateTime(dateTo, true) : undefined 
    }),
    enabled: user?.role === 'ADMIN',
  });

  const { data: timeseriesData, isLoading: timeseriesLoading } = useQuery<TimeseriesDataDto[]>({
    queryKey: ['analytics-timeseries', { dateFrom, dateTo, groupBy }],
    queryFn: () => getTimeseriesAnalytics({ 
      date_from: dateFrom ? toISODateTime(dateFrom, false) : undefined, 
      date_to: dateTo ? toISODateTime(dateTo, true) : undefined,
      group_by: groupBy,
    }),
    enabled: user?.role === 'ADMIN',
  });

  const { data: studentFinancial, isLoading: studentFinancialLoading } = useQuery<StudentFinancialDto[]>({
    queryKey: ['analytics-student-financial', buildParams()],
    queryFn: () => getStudentFinancialReport(buildParams()),
    enabled: user?.role === 'ADMIN',
  });

  const totalsFromStudentFinancial = (() => {
    const rows = Array.isArray(studentFinancial) ? studentFinancial : [];
    const currency = rows[0]?.currency;
    const totalMinor = rows.reduce((sum, row) => sum + (coerceNumber((row as any).total_amount_minor) ?? 0), 0);
    const paidMinor = rows.reduce((sum, row) => sum + (coerceNumber((row as any).paid_amount_minor) ?? 0), 0);
    const outstandingMinor = rows.reduce(
      (sum, row) => sum + (coerceNumber((row as any).outstanding_balance_minor) ?? 0),
      0
    );
    return { currency, totalMinor, paidMinor, outstandingMinor };
  })();

  const currency =
    (overview as any)?.currency ||
    (financialAnalytics as any)?.currency ||
    totalsFromStudentFinancial.currency ||
    'USD';

  const totalRevenueMinor =
    coerceNumber((overview as any)?.total_revenue_minor) ??
    coerceNumber((financialAnalytics as any)?.total_revenue_minor) ??
    toMinorAmount((overview as any)?.total_revenue) ??
    totalsFromStudentFinancial.totalMinor ??
    0;

  const totalPaidMinor =
    coerceNumber((overview as any)?.total_paid_minor) ??
    coerceNumber((financialAnalytics as any)?.total_paid_minor) ??
    toMinorAmount((overview as any)?.total_paid) ??
    totalsFromStudentFinancial.paidMinor ??
    0;

  const totalOutstandingMinor =
    coerceNumber((overview as any)?.total_outstanding_minor) ??
    coerceNumber((financialAnalytics as any)?.total_outstanding_minor) ??
    toMinorAmount((overview as any)?.total_outstanding) ??
    totalsFromStudentFinancial.outstandingMinor ??
    Math.max(0, totalRevenueMinor - totalPaidMinor);

  // Supporting data queries
  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => getPrograms(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
    enabled: user?.role === 'ADMIN',
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
    enabled: user?.role === 'ADMIN',
  });
  
  const lecturers = allUsers.filter((u: any) => u.role === 'LECTURER');

  // Quick date range selectors
  const setQuickDateRange = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    setDateFrom(format(from, 'yyyy-MM-dd'));
    setDateTo(format(to, 'yyyy-MM-dd'));
  };

  const setThisMonth = () => {
    const from = startOfMonth(new Date());
    const to = new Date();
    setDateFrom(format(from, 'yyyy-MM-dd'));
    setDateTo(format(to, 'yyyy-MM-dd'));
  };

  const setThisYear = () => {
    const from = startOfYear(new Date());
    const to = new Date();
    setDateFrom(format(from, 'yyyy-MM-dd'));
    setDateTo(format(to, 'yyyy-MM-dd'));
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Analytics dashboard is only available for administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter analytics data by date range and other criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select value={programId || 'all'} onValueChange={setProgramId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cohort">Cohort</Label>
              <Select value={cohortId || 'all'} onValueChange={setCohortId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cohorts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cohorts</SelectItem>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setQuickDateRange(7)}>
              Last 7 Days
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickDateRange(30)}>
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickDateRange(90)}>
              Last 90 Days
            </Button>
            <Button variant="outline" size="sm" onClick={setThisMonth}>
              This Month
            </Button>
            <Button variant="outline" size="sm" onClick={setThisYear}>
              This Year
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Metrics Cards */}
      {overviewLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : overview ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.total_enrollments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {overview.active_enrollments} active, {overview.completed_enrollments} completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalRevenueMinor, currency)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalPaidMinor, currency)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalOutstandingMinor > 0 ? 'text-destructive' : ''}`}>
                {formatCurrency(totalOutstandingMinor, currency)}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Cohort Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Performance</CardTitle>
          <CardDescription>Student count, attendance rate, and average grade by cohort</CardDescription>
        </CardHeader>
        <CardContent>
          {cohortLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : cohortAnalytics && cohortAnalytics.length > 0 ? (
            <ChartContainer
              config={{
                students: { label: 'Students', color: 'hsl(var(--chart-1))' },
                attendance: { label: 'Attendance Rate (%)', color: 'hsl(var(--chart-2))' },
                grade: { label: 'Average Grade', color: 'hsl(var(--chart-3))' },
              }}
              className="h-[400px]"
            >
              <BarChart data={cohortAnalytics.map(c => ({
                name: c.cohort_name,
                students: c.student_count,
                attendance: c.attendance_rate,
                grade: c.average_grade,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar yAxisId="left" dataKey="students" fill="var(--color-students)" name="Students" />
                <Bar yAxisId="right" dataKey="attendance" fill="var(--color-attendance)" name="Attendance %" />
                <Bar yAxisId="right" dataKey="grade" fill="var(--color-grade)" name="Avg Grade" />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No cohort data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Analytics */}
      {financialAnalytics && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Program Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Program</CardTitle>
              <CardDescription>Total revenue distribution across programs</CardDescription>
            </CardHeader>
            <CardContent>
              {financialLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : financialAnalytics.breakdown_by_program && financialAnalytics.breakdown_by_program.length > 0 ? (
                <ChartContainer
                  config={financialAnalytics.breakdown_by_program.reduce((acc, item, idx) => {
                    acc[`program_${idx}`] = { label: item.program_name, color: COLORS[idx % COLORS.length] };
                    return acc;
                  }, {} as any)}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={financialAnalytics.breakdown_by_program.map(item => ({
                        name: item.program_name,
                        value: item.total_minor / 100,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {financialAnalytics.breakdown_by_program.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">No program data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status Distribution</CardTitle>
              <CardDescription>Breakdown of invoices by status</CardDescription>
            </CardHeader>
            <CardContent>
              {financialLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : financialAnalytics.breakdown_by_status && financialAnalytics.breakdown_by_status.length > 0 ? (
                <ChartContainer
                  config={financialAnalytics.breakdown_by_status.reduce((acc, item, idx) => {
                    acc[`status_${idx}`] = { label: item.status, color: COLORS[idx % COLORS.length] };
                    return acc;
                  }, {} as any)}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={financialAnalytics.breakdown_by_status.map(item => ({
                        name: item.status,
                        value: item.total_minor / 100,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {financialAnalytics.breakdown_by_status.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">No status data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time-Series Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time-Series Analytics</CardTitle>
              <CardDescription>Enrollments and payments over time</CardDescription>
            </div>
            <Select value={groupBy} onValueChange={(v: 'day' | 'week' | 'month') => setGroupBy(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {timeseriesLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : timeseriesData && timeseriesData.length > 0 ? (
            <ChartContainer
              config={{
                enrollments: { label: 'Enrollments', color: 'hsl(var(--chart-1))' },
                payments: { label: 'Payments', color: 'hsl(var(--chart-2))' },
              }}
              className="h-[400px]"
            >
              <AreaChart data={timeseriesData.map(d => ({
                date: format(new Date(d.date), groupBy === 'day' ? 'MMM dd' : groupBy === 'week' ? 'MMM dd' : 'MMM yyyy'),
                enrollments: d.enrollments,
                payments: d.payments_minor / 100,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="enrollments" stackId="1" stroke="var(--color-enrollments)" fill="var(--color-enrollments)" />
                <Area yAxisId="right" type="monotone" dataKey="payments" stackId="2" stroke="var(--color-payments)" fill="var(--color-payments)" />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No time-series data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Financial Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Financial Report</CardTitle>
          <CardDescription>Detailed financial information by student enrollment</CardDescription>
        </CardHeader>
        <CardContent>
          {studentFinancialLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : studentFinancial && studentFinancial.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Cohort</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    {studentFinancial.some(s => s.average_grade !== undefined) && (
                      <TableHead className="text-right">Avg Grade</TableHead>
                    )}
                    {studentFinancial.some(s => s.attendance_rate !== undefined) && (
                      <TableHead className="text-right">Attendance</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentFinancial.map((student) => (
                    <TableRow key={student.enrollment_id}>
                      <TableCell className="font-medium">{student.student_name}</TableCell>
                      <TableCell>{student.cohort_name}</TableCell>
                      <TableCell>{student.program_name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(student.total_amount_minor, student.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(student.paid_amount_minor, student.currency)}
                      </TableCell>
                      <TableCell className={`text-right ${student.outstanding_balance_minor > 0 ? 'text-destructive font-semibold' : ''}`}>
                        {formatCurrency(student.outstanding_balance_minor, student.currency)}
                      </TableCell>
                      {studentFinancial.some(s => s.average_grade !== undefined) && (
                        <TableCell className="text-right">
                          {student.average_grade !== undefined ? student.average_grade.toFixed(1) : '-'}
                        </TableCell>
                      )}
                      {studentFinancial.some(s => s.attendance_rate !== undefined) && (
                        <TableCell className="text-right">
                          {student.attendance_rate !== undefined ? formatPercentage(student.attendance_rate) : '-'}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No student financial data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Reports & Exports Component (existing functionality)
function ReportsExports() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Date range state
  const [applicationsDates, setApplicationsDates] = useState({ from: '', to: '' });
  const [enrollmentsDates, setEnrollmentsDates] = useState({ from: '', to: '' });
  const [attendanceDates, setAttendanceDates] = useState({ from: '', to: '' });
  const [gradesDates, setGradesDates] = useState({ from: '', to: '' });
  const [certificatesDates, setCertificatesDates] = useState({ from: '', to: '' });
  const [payrollDates, setPayrollDates] = useState({ from: '', to: '' });

  const handleExport = async (
    exportFn: (params?: any) => Promise<Blob>,
    filename: string,
    dates: { from: string; to: string },
    reportType: string
  ) => {
    setLoading(reportType);
    try {
      const params: any = {};
      if (dates.from) params.from = dates.from;
      if (dates.to) params.to = dates.to;

      const blob = await exportFn(params);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadBlob(blob, `${filename}_${timestamp}.csv`);

      toast({
        title: 'Export Successful',
        description: `${filename} has been downloaded.`,
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.response?.data?.message || 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports & Exports</h2>
        <p className="text-muted-foreground">
          Export data as CSV files for external analysis and reporting
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Applications Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Applications
            </CardTitle>
            <CardDescription>Export all application records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="app-from">From Date</Label>
              <Input
                id="app-from"
                type="date"
                value={applicationsDates.from}
                onChange={(e) =>
                  setApplicationsDates({ ...applicationsDates, from: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="app-to">To Date</Label>
              <Input
                id="app-to"
                type="date"
                value={applicationsDates.to}
                onChange={(e) =>
                  setApplicationsDates({ ...applicationsDates, to: e.target.value })
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={() =>
                handleExport(exportApplications, 'applications', applicationsDates, 'applications')
              }
              disabled={loading === 'applications'}
            >
              {loading === 'applications' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Enrollments Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Enrollments
            </CardTitle>
            <CardDescription>Export all enrollment records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="enr-from">From Date</Label>
              <Input
                id="enr-from"
                type="date"
                value={enrollmentsDates.from}
                onChange={(e) =>
                  setEnrollmentsDates({ ...enrollmentsDates, from: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="enr-to">To Date</Label>
              <Input
                id="enr-to"
                type="date"
                value={enrollmentsDates.to}
                onChange={(e) =>
                  setEnrollmentsDates({ ...enrollmentsDates, to: e.target.value })
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={() =>
                handleExport(exportEnrollments, 'enrollments', enrollmentsDates, 'enrollments')
              }
              disabled={loading === 'enrollments'}
            >
              {loading === 'enrollments' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Attendance Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Attendance
            </CardTitle>
            <CardDescription>Export attendance records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="att-from">From Date</Label>
              <Input
                id="att-from"
                type="date"
                value={attendanceDates.from}
                onChange={(e) =>
                  setAttendanceDates({ ...attendanceDates, from: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="att-to">To Date</Label>
              <Input
                id="att-to"
                type="date"
                value={attendanceDates.to}
                onChange={(e) =>
                  setAttendanceDates({ ...attendanceDates, to: e.target.value })
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={() =>
                handleExport(exportAttendance, 'attendance', attendanceDates, 'attendance')
              }
              disabled={loading === 'attendance'}
            >
              {loading === 'attendance' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Grades Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Grades
            </CardTitle>
            <CardDescription>Export grade records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="grd-from">From Date</Label>
              <Input
                id="grd-from"
                type="date"
                value={gradesDates.from}
                onChange={(e) => setGradesDates({ ...gradesDates, from: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grd-to">To Date</Label>
              <Input
                id="grd-to"
                type="date"
                value={gradesDates.to}
                onChange={(e) => setGradesDates({ ...gradesDates, to: e.target.value })}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => handleExport(exportGrades, 'grades', gradesDates, 'grades')}
              disabled={loading === 'grades'}
            >
              {loading === 'grades' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Certificates Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Certificates
            </CardTitle>
            <CardDescription>Export certificate records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="cert-from">From Date</Label>
              <Input
                id="cert-from"
                type="date"
                value={certificatesDates.from}
                onChange={(e) =>
                  setCertificatesDates({ ...certificatesDates, from: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cert-to">To Date</Label>
              <Input
                id="cert-to"
                type="date"
                value={certificatesDates.to}
                onChange={(e) =>
                  setCertificatesDates({ ...certificatesDates, to: e.target.value })
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={() =>
                handleExport(exportCertificates, 'certificates', certificatesDates, 'certificates')
              }
              disabled={loading === 'certificates'}
            >
              {loading === 'certificates' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Payroll Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Payroll
            </CardTitle>
            <CardDescription>Export payroll data for lecturers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="pay-from">From Date</Label>
              <Input
                id="pay-from"
                type="date"
                value={payrollDates.from}
                onChange={(e) => setPayrollDates({ ...payrollDates, from: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pay-to">{t("pages.reportingPayrollToDateLabel")}</Label>
              <Input
                id="pay-to"
                type="date"
                value={payrollDates.to}
                onChange={(e) => setPayrollDates({ ...payrollDates, to: e.target.value })}
              />
            </div>
            <Button
              className="w-full"
              aria-label={t("pages.reportingPayrollExportAria")}
              onClick={() => handleExport(exportPayroll, 'payroll', payrollDates, 'payroll')}
              disabled={loading === 'payroll'}
            >
              {loading === 'payroll' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("pages.reportingPayrollExportLoading")}
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {t("pages.reportingPayrollExportCta")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Reporting Component
export default function Reporting() {
  const { t } = useTranslation("common");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("pages.reportingTitle")}
        </h1>
        <p className="text-muted-foreground">
          {t("pages.reportingSubtitle")}
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            {t("pages.reportingTabAnalytics")}
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {t("pages.reportingTabReports")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsExports />
        </TabsContent>
      </Tabs>
    </div>
  );
}
