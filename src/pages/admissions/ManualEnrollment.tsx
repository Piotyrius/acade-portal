import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { createEnrollment } from '../../api/endpoints/admissions';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';
import { getUsers } from '../../api/endpoints/users';
import { getCohorts } from '../../api/endpoints/catalog';
import { UserDto, CohortDto } from '../../api/types';

type EnrollmentForm = {
  student: string;
  cohort: string;
  notes?: string;
};

export default function ManualEnrollment() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<EnrollmentForm>({
    student: '',
    cohort: '',
    notes: '',
  });


  // Fetch all users
  const {
    data: usersResponse,
    isLoading: usersLoading,
    isError: usersError,
    error: usersErrorObj,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  // Normalize users array
  const usersArr: UserDto[] = Array.isArray(usersResponse)
    ? usersResponse
    : [];
  const students = usersArr.filter(
    (u) => u.role?.toUpperCase() === 'STUDENT'
  );

  // Fetch all cohorts
  const {
    data: cohortsResponse,
    isLoading: cohortsLoading,
    isError: cohortsError,
    error: cohortsErrorObj,
  } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
  });

  const cohortsArr: CohortDto[] = Array.isArray(cohortsResponse)
    ? cohortsResponse
    : [];

  // Mutation for enrollment
  const mutation = useMutation({
    mutationFn: (data: EnrollmentForm) => createEnrollment(data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Student enrolled successfully' });
      setForm({ student: '', cohort: '', notes: '' });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  // Loading and error states
  if (usersLoading || cohortsLoading) {
    return <div>Loading users and cohorts...</div>;
  }
  if (usersError) {
    return <div>Error loading users: {String(usersErrorObj)}</div>;
  }
  if (cohortsError) {
    return <div>Error loading cohorts: {String(cohortsErrorObj)}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Enrollment</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Student Select */}
          <Select
            value={form.student}
            onValueChange={(val) => setForm({ ...form, student: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.length === 0 ? (
                <div className="px-4 py-2 text-muted-foreground">
                  No students found
                </div>
              ) : (
                students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} ({s.email})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Cohort Select */}
          <Select
            value={form.cohort}
            onValueChange={(val) => setForm({ ...form, cohort: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select cohort" />
            </SelectTrigger>
            <SelectContent>
              {cohortsArr.length === 0 ? (
                <div className="px-4 py-2 text-muted-foreground">
                  No cohorts found
                </div>
              ) : (
                cohortsArr.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Notes Input */}
          <Input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          {/* Submit Button */}
          <Button type="submit" disabled={mutation.isPending}>
            Enroll Student
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
