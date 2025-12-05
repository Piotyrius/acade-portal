import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
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
import { ExampleBanner } from '@/components/ExampleBanner';
import { IoIosArrowDown } from "react-icons/io";
import {  } from '@/api/endpoints/catalog';


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

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);

  const [selectedCohort, setSelectedCohort] = useState(null);
  const [editingCohort, setEditingCohort] = useState(null);
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

  const [sessionFormData, setSessionFormData] = useState({
    pattern: '',
    start_time: '19:00',
    end_time: '21:00',
    exclude_holidays: true,
  });

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
  });

  const cohortList = Array.isArray(cohorts) ? cohorts : [];


  // Mock data for preview
  const mockPrograms = [
    { id: '1', name: 'Cybersecurity Fundamentals', code: 'CS-101', description: 'Learn the basics of cybersecurity, including network security, cryptography, and ethical hacking', active: true, version: '1.0', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
    { id: '2', name: 'Advanced Penetration Testing', code: 'CS-301', description: 'Master advanced penetration testing techniques and tools for enterprise environments', active: true, version: '1.0', created_at: '2024-01-16T00:00:00Z', updated_at: '2024-01-16T00:00:00Z' },
    { id: '3', name: 'Cloud Security Architecture', code: 'CS-201', description: 'Design and implement secure cloud infrastructure on AWS, Azure, and GCP', active: true, version: '1.0', created_at: '2024-01-17T00:00:00Z', updated_at: '2024-01-17T00:00:00Z' },
    { id: '4', name: 'Incident Response & Forensics', code: 'CS-401', description: 'Respond to security incidents and conduct digital forensics investigations', active: false, version: '1.0', created_at: '2024-01-18T00:00:00Z', updated_at: '2024-01-18T00:00:00Z' },
  ];

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCourses(),
  });

  const courseList = Array.isArray(courses) ? courses : [];


  const { data: programs = mockPrograms, isLoading } = useQuery({
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
  });

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

  const displayPrograms = programs;
  const filteredPrograms = displayPrograms.filter((p) =>
    !searchTerm ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between programs_header_wrapper">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Programs</h2>
          <p className="text-muted-foreground">Manage your educational programs</p>
        </div>
        <Button onClick={handleOpenCreate} className='programs_plus_btn'>
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
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

      {programs.length === 0 && <ExampleBanner />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map((program) => {
            const programCourses = courseList.filter(
              (c: any) => c.program === program.id
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
                      <div className="flex flex-col flex-wrap gap-2 max-h-[500px] overflow-y-auto ">
                        {programCourses.map((course: any) => (
                          <Badge key={course.id} variant="outline" className='flex justify-between'>
                            <p className='p-3 text-[14px] cursor-pointer capitalize' onClick={() => {setSelectedCourse(course); setCohortsPopup(true); }}>{course.title} </p>

                            <div>
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
                </div>

              </CardContent>
            </Card>
          )
          
        })}
      </div>

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
              ? cohortList.filter((c: any) => c.course === selectedCourse.id)
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
                    {programs.map((p) => (
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

      {/* Cohort Dialog */}

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

    </div>
  );
}
