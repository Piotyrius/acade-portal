import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrograms, createProgram, updateProgram, deleteProgram, getCourses } from '@/api/endpoints/catalog';
import { ProgramDto } from '@/api/types';
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

export default function Programs() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramDto | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '', active: true });
  const [viewOnly, setViewOnly] = useState(false);
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);

const handleOpenView = (program: ProgramDto) => {
  if (expandedProgramId === program.id) {
    setExpandedProgramId(null);
    return;
  }

  setExpandedProgramId(program.id);
};


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
  console.log("COURSES RESPONSE:", courses);

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

                <Button className='w-[100%] my-2' variant="ghost" size="sm" onClick={() => handleOpenView(program)}>
                  <IoIosArrowDown className={expandedProgramId === program.id ? "arrow_rotated" : "arrow_default"} />
                </Button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    expandedProgramId === program.id ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="space-y-2 mt-4">
                    <h3 className="text-lg font-semibold">Courses in this Program</h3>
                
                    {programCourses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No courses assigned</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {programCourses.map((course: any) => (
                          <Badge key={course.id} variant="outline">
                            {course.title}
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
    </div>
  );
}
