import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Eye, ChevronUp, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrograms, createProgram, updateProgram, deleteProgram, getCourses, getCohorts, createCourse, updateCourse, deleteCourse, createCohort, updateCohort, deleteCohort, generateSessions } from '@/api/endpoints/catalog';
import { ProgramDto } from '@/api/types';
import { CourseDto } from '@/api/types';
import { CohortDto, EnrollmentDto } from '@/api/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ExampleBanner } from '@/components/ExampleBanner';
import { IoIosArrowDown } from "react-icons/io";
import { getEnrollments } from '@/api/endpoints/admissions';


function EnrollmentRow({
  enrollment,
}: {
  enrollment: EnrollmentDto;
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
      <div>
        <p className="font-medium text-sm">{enrollment.student_name}</p>
        <p className="text-xs text-muted-foreground">
          Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
        </p>
      </div>

      <Badge variant="outline">{enrollment.status}</Badge>
    </div>
  );
}


export default function Programs() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramDto | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '', active: true });
  const [courseForm, setCourseForm] = useState({ program: '', title: '', code: '', hours: 1, credits: '', description: '' });
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [cohortsPopup, setCohortsPopup] = useState(false)

  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);
  const [editingCourse, setEditingCourse] = useState<CourseDto | null>(null);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);

  const [selectedCohort, setSelectedCohort] = useState<CohortDto | null>(null);
  const [editingCohort, setEditingCohort] = useState<CohortDto | null>(null);
  const [isCohortDialogOpen, setIsCohortDialogOpen] = useState(false);

  const [cohortForm, setCohortForm] = useState({
    course: '',
    name: '',
    lecturer: '',
    capacity: 20,
    start_date: '',
    end_date: '',
    status: 'PLANNED' as CohortDto['status'],
  }); 

  const [expandedCohortId, setExpandedCohortId] = useState(null)
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({
    pattern: '',
    start_time: '19:00',
    end_time: '21:00',
    exclude_holidays: true,
  });
  const [selectedCohortForSessions, setSelectedCohortForSessions] = useState<CohortDto | null>(null);
  const [isStudentsPopupOpen, setIsStudentsPopupOpen] = useState(false);
  const [studentsPopupCohort, setStudentsPopupCohort] = useState<CohortDto | null>(null);

  // Recruitment planning wizard state
  const [isRecruitmentDialogOpen, setIsRecruitmentDialogOpen] = useState(false);
  const [recruitmentStep, setRecruitmentStep] = useState<1 | 2 | 3>(1);
  const [recruitmentPrograms, setRecruitmentPrograms] = useState<string[]>([]);
  const [recruitmentRange, setRecruitmentRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [recruitmentGoals, setRecruitmentGoals] = useState<{
    applications: string;
    enrollmentsPerCohort: string;
  }>({
    applications: '',
    enrollmentsPerCohort: '',
  });
  const [recruitmentSummary, setRecruitmentSummary] = useState<{
    programIds: string[];
    start: string;
    end: string;
    totalApplications: number;
    applicationsPerMonth: number;
    enrollmentsPerCohort: number;
    months: { label: string; applications: number }[];
  } | null>(null);

  const handleOpenView = (program: ProgramDto) => {
    if (expandedProgramId === program.id) {
      setExpandedProgramId(null);
      return;
    }

    setExpandedProgramId(program.id);
  };

  const { data: cohorts } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const cohortList = Array.isArray(cohorts) ? cohorts : [];


  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const courseList = Array.isArray(courses) ? courses : [];


  const { data: programs = [], isLoading, isError } = useQuery({
    queryKey: ['programs', filter],
    queryFn: async () => {
      if (filter === 'active') {
        return await getPrograms({ active: true });
      } else if (filter === 'inactive') {
        return await getPrograms({ active: false });
      } else {
        return await getPrograms();
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const programList = Array.isArray(programs) ? programs : [];

  const createMutation = useMutation({
    mutationFn: createProgram,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] });
      toast({ title: 'Success', description: 'Program created successfully' });
      setIsDialogOpen(false);
      setFormData({ name: '', code: '', description: '', active: true });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProgramDto> }) => updateProgram(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] });
      toast({ title: 'Success', description: 'Program updated successfully' });
      setIsDialogOpen(false);
      setEditingProgram(null);
      setFormData({ name: '', code: '', description: '', active: true });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] });
      toast({ title: 'Success', description: 'Program deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleOpenEdit = (program: ProgramDto) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      code: program.code,
      description: program.description || '',
      active: program.active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, data: { ...formData, version: '1.0' } });
    } else {
      createMutation.mutate({ ...formData, version: '1.0' });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleRecruitmentProgram = (id: string) => {
    setRecruitmentPrograms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleConfirmRecruitmentPlan = () => {
    if (!recruitmentPrograms.length || !recruitmentRange.start || !recruitmentRange.end) {
      toast({
        title: 'Missing information',
        description: 'Choose at least one program and a date range.',
        variant: 'destructive',
      });
      return;
    }

    const totalApplications = parseInt(recruitmentGoals.applications || '0', 10) || 0;
    const enrollmentsPerCohort = parseInt(recruitmentGoals.enrollmentsPerCohort || '0', 10) || 0;

    const startDate = new Date(recruitmentRange.start);
    const endDate = new Date(recruitmentRange.end);
    const diffMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      1;
    const monthsCount = Math.max(1, diffMonths);
    const applicationsPerMonth = monthsCount > 0 ? Math.round(totalApplications / monthsCount) : 0;

    const months: { label: string; applications: number }[] = [];
    for (let i = 0; i < monthsCount; i++) {
      const d = new Date(startDate);
      d.setMonth(startDate.getMonth() + i);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ label, applications: applicationsPerMonth });
    }

    setRecruitmentSummary({
      programIds: recruitmentPrograms,
      start: recruitmentRange.start,
      end: recruitmentRange.end,
      totalApplications,
      applicationsPerMonth,
      enrollmentsPerCohort,
      months,
    });

    setIsRecruitmentDialogOpen(false);
    setRecruitmentStep(1);

    toast({
      title: 'Recruitment plan created',
      description: 'Targets have been calculated for the selected date range.',
    });
  };

  const displayPrograms = programList || [];
  const filteredPrograms = (displayPrograms || []).filter((p) => {
    if (!p || !p.name || !p.code) return false;
    return !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenCreate = () => {
    setEditingProgram(null);
    setFormData({ name: '', code: '', description: '', active: true });
    setIsDialogOpen(true);
  };


  // new course functionss

  const deleteCourseMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      toast({ title: 'Success', description: 'Course deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Success", description: "Course created successfully" });
      setIsCourseDialogOpen(false);
      setCourseForm({ program: "", title: "", code: "", hours: 1, credits: "", description: "" });
    },
    onError: (e) => toast({ title:"Error", description:getErrorMessage(e), variant:"destructive" })
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCourse(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Success", description: "Course updated successfully" });
      setEditingCourse(null);
      setIsCourseDialogOpen(false);
    },
    onError: (e) => toast({ title:"Error", description:getErrorMessage(e), variant:"destructive" })
  });

  const handleOpenCourseEdit = (course: CourseDto) => {
    setEditingCourse(course);
    setCourseForm({
      program: course.program,
      title: course.title,
      code: course.code,
      hours: course.hours,
      credits: course.credits?.toString() || '',
      description: course.description || '',
    });
    setIsCourseDialogOpen(true);
  };
  
  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...courseForm,
      program: courseForm.program,
      credits: courseForm.credits ? parseInt(courseForm.credits) : null,
    };
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data: payload });
    } else {
      createCourseMutation.mutate(payload);
    }
  };

  const handleOpenCourseCreate = () => {
    setEditingCourse(null);
    setCourseForm({ program: '', title: '', code: '', hours: 1, credits: '', description: '' });
    setIsCourseDialogOpen(true);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      deleteCourseMutation.mutate(id);
    }
  };



  // new cohort functionss


  const deleteCohortMutation = useMutation({
    mutationFn: deleteCohort,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cohorts'] });
      toast({ title: 'Success', description: 'Cohort deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const createCohortMutation = useMutation({
    mutationFn: createCohort,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cohorts"] });
      toast({ title: "Success", description: "Cohort created successfully" });
      setIsCohortDialogOpen(false);
      setCohortForm({  course: '',  name: '',  lecturer: '',  capacity: 20,  start_date: '',  end_date: '',  status: 'PLANNED' as CohortDto['status'],}); 
    },
    onError: (e) => toast({ title:"Error", description:getErrorMessage(e), variant:"destructive" })
  });

  const updateCohortMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCohort(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cohorts"] });
      toast({ title: "Success", description: "Cohort updated successfully" });
      setEditingCohort(null);
      setIsCohortDialogOpen(false);
    },
    onError: (e) => toast({ title:"Error", description:getErrorMessage(e), variant:"destructive" })
  });

  const handleOpenCohortEdit = (cohort: CohortDto) => {
    setEditingCohort(cohort);
    setCohortForm({
      course: cohort.course,
      name: cohort.name,
      lecturer: cohort.lecturer || '',
      capacity: cohort.capacity,
      start_date: cohort.start_date,
      end_date: cohort.end_date,
      status: cohort.status,
    });
    setIsCohortDialogOpen(true);
  };
  
  const handleCohortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...cohortForm,
      lecturer: cohortForm.lecturer || null,
    };
    if (editingCohort) {
      updateCohortMutation.mutate({ id: editingCohort.id, data: payload });
    } else {
      createCohortMutation.mutate(payload);
    }
  };

  const resetForm = () => {
    setCohortForm({
      course: '',
      name: '',
      lecturer: '',
      capacity: 20,
      start_date: '',
      end_date: '',
      status: 'PLANNED',
    });
  };

  const handleOpenCohortCreate = () => {
    setEditingCohort(null);
    resetForm();
    setIsCohortDialogOpen(true);
  };

  const handleDeleteCohort = (id: string) => {
    if (confirm('Are you sure you want to delete this cohort?')) {
      deleteCohortMutation.mutate(id);
    }
  };

  // new generate sessions and students

  const { data: cohortEnrollments = [], isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['enrollments', expandedCohortId],
    queryFn: () => getEnrollments(expandedCohortId!, undefined),
    enabled: !!expandedCohortId,
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
    setSelectedCohortForSessions(null);
  },
  onError: (error) => {
    toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
  },
});




  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-48 bg-muted animate-pulse rounded" />
            <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Programs</h2>
            <p className="text-muted-foreground">Manage your educational programs</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            <p>Failed to load programs. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between programs_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Programs</h2>
          <p className="text-muted-foreground">
            Manage programs and plan upcoming cohorts and recruitment goals.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsRecruitmentDialogOpen(true);
              setRecruitmentStep(1);
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Plan recruitment
          </Button>
          <Button onClick={handleOpenCreate} className="programs_plus_btn">
            <Plus className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm programs_search_input">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
          
        <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | 'active' | 'inactive')}>
          <SelectTrigger className="w-[200px] select_wrapper">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>


      </div>

      {programList.length === 0 && <ExampleBanner />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map((program) => {
            if (!program || !program.id) return null;
            const programCourses = (courseList || []).filter(
              (c: any) => c && c.program && c.program === program.id
          );
          return(
            <Card key={program.id} className="hover:shadow-lg transition-shadow card-no-stretch">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{program.name}</CardTitle>
                  <Badge variant={program.active ? 'default' : 'secondary'}>
                    {program.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>{program.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground line-clamp-2">{program.description || 'No description'}</p>
                  <div className="flex gap-2 ml-2">

                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(program)}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="sm" onClick={() => handleDelete(program.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>

                  </div>
                </div>     
{/*
                <Button className='border-2 border-white-300 w-[100%] mt-2' variant="ghost" size="sm" onClick={() => handleOpenView(program)}>
                  <IoIosArrowDown className={expandedProgramId === program.id ? "arrow_rotated" : "arrow_default"} />
                </Button>

                 <div
                  className={`transition-all duration-300 overflow-hidden ${
                    expandedProgramId === program.id ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-2 mt-4">
                    <div className='flex justify-between my-3'>
                      <h3 className="text-[14px] font-semibold">Courses in this Program</h3>
                      <button onClick={() => handleOpenCourseCreate()}> <Plus className="h-5" /> </button>
                    </div>
                
                    {programCourses.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">No courses assigned</p>
                    ) : (
                      <div className="flex flex-col flex-wrap gap-2 max-h-[500px] overflow-y-auto">
                        {programCourses.map((course: any) => (
                          <Badge key={course.id} variant="outline" className='flex justify-between cursor-pointer' onClick={() => {setSelectedCourse(course); setCohortsPopup(true); }} >
                            <p className='p-3 text-[14px] capitalize'>{course.title} </p>

                            <div onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" onClick={() => handleOpenCourseEdit(course)}>
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course.id)} >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div> */}

              </CardContent>
            </Card>
          )
          
        })}
      </div>

      {recruitmentSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Recruitment plan summary</CardTitle>
            <CardDescription>
              Simple targets for applications and enrollments across your selected programs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              <span className="font-medium">Date range:</span>{' '}
              {recruitmentSummary.start} – {recruitmentSummary.end}
            </p>
            <p className="text-sm">
              <span className="font-medium">Programs:</span>{' '}
              {recruitmentSummary.programIds
                .map((id) => programList.find((p) => p.id === id)?.name || id)
                .join(', ')}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total applications target:</span>{' '}
              {recruitmentSummary.totalApplications}
            </p>
            <p className="text-sm">
              <span className="font-medium">Approx. applications per month:</span>{' '}
              {recruitmentSummary.applicationsPerMonth}
            </p>
            {recruitmentSummary.enrollmentsPerCohort > 0 && (
              <p className="text-sm">
                <span className="font-medium">Target enrollments per cohort:</span>{' '}
                {recruitmentSummary.enrollmentsPerCohort}
              </p>
            )}
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Monthly breakdown
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {recruitmentSummary.months.map((m) => (
                  <span
                    key={m.label}
                    className="rounded-full border px-2 py-1 bg-muted text-muted-foreground"
                  >
                    {m.label}: {m.applications} apps
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPrograms.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {searchTerm
              ? 'No programs found matching your search'
              : filter === 'active'
                ? 'No active programs found.'
                : filter === 'inactive'
                  ? 'No inactive programs found.'
                  : 'No programs yet. Create your first program!'}
          </CardContent>
        </Card>
      )}

      <Dialog open={isRecruitmentDialogOpen} onOpenChange={setIsRecruitmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plan recruitment</DialogTitle>
            <DialogDescription>
              Choose programs, a date range, and simple goals to generate a lightweight recruitment
              plan.
            </DialogDescription>
          </DialogHeader>

          {recruitmentStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Programs</Label>
                <div className="max-h-48 overflow-auto rounded-md border p-2 space-y-2">
                  {programList.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No programs yet. Create a program first.
                    </p>
                  )}
                  {programList.map((program) => (
                    <label
                      key={program.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={recruitmentPrograms.includes(program.id)}
                        onCheckedChange={() => toggleRecruitmentProgram(program.id)}
                      />
                      <span>{program.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target start (month)</Label>
                  <Input
                    type="month"
                    value={recruitmentRange.start}
                    onChange={(e) =>
                      setRecruitmentRange((prev) => ({ ...prev, start: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target end (month)</Label>
                  <Input
                    type="month"
                    value={recruitmentRange.end}
                    onChange={(e) =>
                      setRecruitmentRange((prev) => ({ ...prev, end: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRecruitmentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setRecruitmentStep(2)}
                  disabled={!recruitmentPrograms.length || !recruitmentRange.start || !recruitmentRange.end}
                >
                  Next: Set goals
                </Button>
              </DialogFooter>
            </div>
          )}

          {recruitmentStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Total applications target</Label>
                <Input
                  type="number"
                  min={0}
                  value={recruitmentGoals.applications}
                  onChange={(e) =>
                    setRecruitmentGoals((prev) => ({ ...prev, applications: e.target.value }))
                  }
                  placeholder="e.g. 30"
                />
              </div>
              <div className="space-y-2">
                <Label>Target enrollments per cohort (optional)</Label>
                <Input
                  type="number"
                  min={0}
                  value={recruitmentGoals.enrollmentsPerCohort}
                  onChange={(e) =>
                    setRecruitmentGoals((prev) => ({
                      ...prev,
                      enrollmentsPerCohort: e.target.value,
                    }))
                  }
                  placeholder="e.g. 15"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We&apos;ll calculate an approximate applications-per-month target for this period.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRecruitmentStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setRecruitmentStep(3)} disabled={!recruitmentGoals.applications}>
                  Review plan
                </Button>
              </DialogFooter>
            </div>
          )}

          {recruitmentStep === 3 && (
            <div className="space-y-4 py-4">
              <p className="text-sm">
                You&apos;re planning recruitment for{' '}
                <span className="font-medium">{recruitmentPrograms.length}</span> program
                {recruitmentPrograms.length === 1 ? '' : 's'} between{' '}
                <span className="font-medium">{recruitmentRange.start}</span> and{' '}
                <span className="font-medium">{recruitmentRange.end}</span>.
              </p>
              <p className="text-sm">
                Total applications target:{' '}
                <span className="font-medium">{recruitmentGoals.applications || 0}</span>
              </p>
              {recruitmentGoals.enrollmentsPerCohort && (
                <p className="text-sm">
                  Target enrollments per cohort:{' '}
                  <span className="font-medium">
                    {parseInt(recruitmentGoals.enrollmentsPerCohort || '0', 10)}
                  </span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                When you confirm, we&apos;ll generate a simple monthly breakdown you can refer to on
                this page. This doesn&apos;t change any backend data yet.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRecruitmentStep(2)}>
                  Back
                </Button>
                <Button onClick={handleConfirmRecruitmentPlan}>Confirm plan</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Edit Program' : 'Create Program'}</DialogTitle>
            <DialogDescription>
              {editingProgram ? 'Update program details' : 'Add a new educational program'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProgram ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  
  
  {/* 

      <Dialog open={cohortsPopup} onOpenChange={setCohortsPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? selectedCourse.title : "Course Cohorts"}
            </DialogTitle>
            <DialogDescription className='flex items-center justify-start gap-4'>

              {selectedCourse ? "Cohorts assigned to this course" : ""}
              <button onClick={() => handleOpenCohortCreate()} className=''> <Plus className="text-[#fff] h-5" /> </button>

            </DialogDescription>
          </DialogHeader>

          {(() => {
            const cohortsOfCourse = selectedCourse
              ? (cohortList || []).filter((c: any) => c.course === selectedCourse.id)
              : [];
          
            if (!selectedCourse) {
              return (
                <p className="text-muted-foreground">
                  No course selected.
                </p>
              );
            }
          
            if (cohortsOfCourse.length === 0) {
              return (
                <p className="text-sm text-muted-foreground py-3">
                  No cohorts are using this course.
                </p>
              );
            }
          
            return (
              <div className="space-y-3 mt-2">
                {cohortsOfCourse.map((cohort: any) => (
                  <div
                    key={cohort.id}
                    className="flex flex-col border rounded-lg"
                  >
                    <div className='flex justify-between items-center p-3 '>

                      <div>
                        <p className="font-semibold">{cohort.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {cohort.id}
                        </p>
                      </div>
                  
                      <Badge variant={cohort.active ? "default" : "secondary"}>
                        {cohort.active ? "Active" : "Inactive"}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStudentsPopupCohort(cohort);
                          setExpandedCohortId(cohort.id);
                          setIsStudentsPopupOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCohortForSessions(cohort);
                          setIsSessionDialogOpen(true);
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>

                    
                    </div>

                    <div className='flex justify-center mb-2'>

                      <div>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenCohortEdit(cohort)}> 
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCohort(cohort.id)} >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      
                    </div>

                  </div>


                ))}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Create Course'}</DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Update course details' : 'Add a new course'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCourseSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="program">Program *</Label>
                <Select value={courseForm.program} onValueChange={(value) => setCourseForm({ ...courseForm, program: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programList.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours *</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    value={courseForm.hours}
                    onChange={(e) => setCourseForm({ ...courseForm, hours: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCourseDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCourseMutation.isPending || updateCourseMutation.isPending}>
                {editingCourse ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      <Dialog open={isCohortDialogOpen} onOpenChange={setIsCohortDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCohort ? 'Edit Cohort' : 'Create Cohort'}</DialogTitle>
            <DialogDescription>
              {editingCohort ? 'Update cohort details' : 'Add a new student cohort'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCohortSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={cohortForm.course}
                  onValueChange={(value) => setCohortForm({ ...cohortForm, course: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseList.map((c) => (
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
                  value={cohortForm.name}
                  onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={cohortForm.start_date}
                    onChange={(e) => setCohortForm({ ...cohortForm, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={cohortForm.end_date}
                    onChange={(e) => setCohortForm({ ...cohortForm, end_date: e.target.value })}
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
                    value={cohortForm.capacity}
                    onChange={(e) => setCohortForm({ ...cohortForm, capacity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={cohortForm.status}
                    onValueChange={(value) => setCohortForm({ ...cohortForm, status: value as CohortDto['status'] })}
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
              <Button type="button" variant="outline" onClick={() => setIsCohortDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCohortMutation.isPending || updateCohortMutation.isPending}>
                {editingCohort ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Sessions</DialogTitle>
            <DialogDescription>
              Generate recurring sessions for {selectedCohortForSessions?.name}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              generateSessionsMutation.mutate({
                cohortId: selectedCohortForSessions!.id,
                payload: sessionFormData,
              });
            }}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pattern *</Label>
                <Input
                  value={sessionFormData.pattern}
                  onChange={(e) =>
                    setSessionFormData({ ...sessionFormData, pattern: e.target.value.toUpperCase() })
                  }
                  placeholder="MON,WED,FRI"
                  required
                />
              </div>
                
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  value={sessionFormData.start_time}
                  onChange={(e) =>
                    setSessionFormData({ ...sessionFormData, start_time: e.target.value })
                  }
                />
                <Input
                  type="time"
                  value={sessionFormData.end_time}
                  onChange={(e) =>
                    setSessionFormData({ ...sessionFormData, end_time: e.target.value })
                  }
                />
              </div>
            </div>
                
            <DialogFooter>
              <Button type="submit" disabled={generateSessionsMutation.isPending}>
                Generate Sessions
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
                
      <Dialog open={isStudentsPopupOpen} onOpenChange={setIsStudentsPopupOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Students in {studentsPopupCohort?.name}
            </DialogTitle>
            <DialogDescription>
              Enrolled students for this cohort.
            </DialogDescription>
          </DialogHeader>
                
          {isLoadingEnrollments ? (
            <p>Loading...</p>
          ) : cohortEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3">
              No students enrolled yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {cohortEnrollments.map((enrollment: EnrollmentDto) => (
                <EnrollmentRow key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsStudentsPopupOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}



    </div>
  );
}
