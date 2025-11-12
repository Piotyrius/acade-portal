import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getMyEnrollments, getMyAttendance, getMyAssessments, getMyGrades, getMyCertificates } from '@/api/endpoints/studentPortal';
import { BookOpen, ClipboardCheck, FileCheck, Award, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import { exampleEnrollments, exampleAttendance, exampleAssessments, exampleGrades, exampleCertificates } from '@/utils/exampleData';
import { ExampleBanner } from '@/components/ExampleBanner';

export default function StudentPortal() {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: getMyEnrollments,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: getMyAttendance,
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['my-assessments'],
    queryFn: getMyAssessments,
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['my-grades'],
    queryFn: getMyGrades,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: getMyCertificates,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'PRESENT':
      case 'ISSUED':
        return 'default';
      case 'PENDING':
      case 'LATE':
        return 'secondary';
      case 'ABSENT':
      case 'REVOKED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const displayEnrollments = enrollments.length === 0 ? exampleEnrollments.slice(0, 1) : enrollments;
  const displayAttendance = attendance.length === 0 ? exampleAttendance.slice(0, 1) : attendance;
  const displayAssessments = assessments.length === 0 ? exampleAssessments.slice(0, 1) : assessments;
  const displayGrades = grades.length === 0 ? exampleGrades.slice(0, 1) : grades;
  const displayCertificates = certificates.length === 0 ? exampleCertificates.slice(0, 1) : certificates;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Portal</h2>
          <p className="text-muted-foreground">View your enrollments, attendance, assessments, grades, and certificates</p>
        </div>
      </div>

      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">
            <BookOpen className="mr-2 h-4 w-4" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="assessments">
            <FileCheck className="mr-2 h-4 w-4" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="grades">
            <GraduationCap className="mr-2 h-4 w-4" />
            Grades
          </TabsTrigger>
          <TabsTrigger value="certificates">
            <Award className="mr-2 h-4 w-4" />
            Certificates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>My Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayEnrollments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No enrollments found</p>
                ) : (
                  displayEnrollments.map((enrollment: any) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Cohort: {enrollment.cohort_name || enrollment.cohort}</p>
                        <p className="text-sm text-muted-foreground">
                          Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(enrollment.status)}>{enrollment.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>My Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayAttendance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No attendance records found</p>
                ) : (
                  displayAttendance.map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{record.session_cohort || 'Session'}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.session_start ? format(new Date(record.session_start), 'PPp') : 'Date not available'}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(record.status)}>{record.status_display || record.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>My Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayAssessments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No assessments found</p>
                ) : (
                  displayAssessments.map((assessment: any) => (
                    <div key={assessment.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{assessment.title}</p>
                        <Badge variant="outline">{assessment.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{assessment.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Max Score: {assessment.max_score}</span>
                        {assessment.due_date && (
                          <span>Due: {format(new Date(assessment.due_date), 'PPp')}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>My Grades</CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayGrades.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No grades found</p>
                ) : (
                  displayGrades.map((grade: any) => (
                    <div key={grade.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">{grade.assessment_title || 'Assessment'}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {grade.score} / {grade.max_score} ({grade.percentage}%)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">{grade.percentage}%</p>
                        <p className="text-xs text-muted-foreground">
                          {grade.graded_at ? format(new Date(grade.graded_at), 'PP') : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>My Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 && <ExampleBanner />}
              <div className="space-y-4">
                {displayCertificates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No certificates found</p>
                ) : (
                  displayCertificates.map((certificate: any) => (
                    <div key={certificate.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Serial: {certificate.serial}</p>
                        <p className="text-sm text-muted-foreground">
                          Cohort: {certificate.cohort_name || certificate.cohort}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Issued: {certificate.issued_at ? format(new Date(certificate.issued_at), 'PP') : 'N/A'}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(certificate.status)}>{certificate.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

