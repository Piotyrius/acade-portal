import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createEnrollment } from '@/api/endpoints/admissions';
import { getUsers } from '@/api/endpoints/users';
import { getCohorts } from '@/api/endpoints/catalog';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';

type EnrollmentForm = {
  student: string;
  cohort: string;
  notes?: string;
};

export default function ManualEnrollment({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState<EnrollmentForm>({
    student: '',
    cohort: '',
    notes: '',
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  const students = users.filter((u: any) => u.role?.toUpperCase() === 'STUDENT');

  
  const { data: cohortsData } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(),
  });
  const cohorts = Array.isArray(cohortsData) ? cohortsData : [];


  const mutation = useMutation({
    mutationFn: createEnrollment,
    onSuccess: () => {
      toast({
        title: t('success'),
        description: t('pages.enrollmentsManualEnrollSuccess'),
      });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      onSuccess();
    },
    onError: (err) =>
      toast({
        title: t('error'),
        description: getErrorMessage(err),
        variant: 'destructive',
      }),
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Select value={form.student} onValueChange={(v) => setForm({ ...form, student: v })}>
        <SelectTrigger>
          <SelectValue placeholder={t('pages.enrollmentsManualSelectStudent')} />
        </SelectTrigger>
        <SelectContent>
          {students.map((s: any) => (
            <SelectItem key={s.id} value={s.id}>
              {s.first_name} {s.last_name} ({s.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={form.cohort} onValueChange={(v) => setForm({ ...form, cohort: v })}>
        <SelectTrigger>
          <SelectValue placeholder={t('pages.enrollmentsManualSelectCohort')} />
        </SelectTrigger>
        <SelectContent>
          {cohorts.map((c: any) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder={t('pages.enrollmentsManualNotesPlaceholder')}
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? t('creating') : t('pages.enrollmentsManualEnrollButton')}
      </Button>
    </form>
  );
}
