import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import {
  exportApplications,
  exportEnrollments,
  exportAttendance,
  exportGrades,
  exportCertificates,
  exportPayroll,
  downloadBlob,
} from '@/api/endpoints/reporting';

export default function Reporting() {
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
        <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
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
              <Label htmlFor="pay-to">To Date</Label>
              <Input
                id="pay-to"
                type="date"
                value={payrollDates.to}
                onChange={(e) => setPayrollDates({ ...payrollDates, to: e.target.value })}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => handleExport(exportPayroll, 'payroll', payrollDates, 'payroll')}
              disabled={loading === 'payroll'}
            >
              {loading === 'payroll' ? (
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
      </div>
    </div>
  );
}
