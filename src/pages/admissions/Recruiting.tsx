import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createApplication } from '@/api/endpoints/admissions';
import { getPrograms } from '@/api/endpoints/catalog';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/errors';

export default function Recruiting() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    program: '',
    notes: '',
    status: "NEW" as "NEW",
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => getPrograms(),
  });

  const mutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Student recruited successfully' });
      setForm({ name: '', email: '', phone: '', program: '', notes: '', status: "NEW" as "NEW" });
      qc.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruit Student</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            required
          />
          <Select
            value={form.program}
            onValueChange={val => setForm({ ...form, program: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select program or Thinking" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thinking">Thinking</SelectItem>
              {(programs as any[]).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Additional Info"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
          <Button type="submit" disabled={mutation.isPending}>
            Recruit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
