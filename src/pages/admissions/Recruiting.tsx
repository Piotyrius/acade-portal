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
import './Recruiting.css';
import { IoMdClose } from 'react-icons/io';
import { GoPlus } from 'react-icons/go';
import { FaArrowLeft } from 'react-icons/fa6';

type PhoneEntry = {
  name: string;
  phone: string;
};

export default function Recruiting() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phones: [{ name: '', phone: '' }] as PhoneEntry[],
    program: '',
    notes: '',
    status: 'NEW' as 'NEW',
  });

  const [fullscreen, setFullscreen] = useState(true);

  const { data: programs = [] } = useQuery({
    queryKey: ['programs', 'active'],
    queryFn: async () => {
      const allPrograms = await getPrograms({ active: true });
      // Sort programs: "Thinking" first, then alphabetically by name
      return allPrograms.sort((a, b) => {
        if (a.name.toLowerCase().includes('thinking')) return -1;
        if (b.name.toLowerCase().includes('thinking')) return 1;
        return a.name.localeCompare(b.name);
      });
    },
  });

  const mutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Student recruited successfully' });
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phones: [{ name: '', phone: '' }],
        program: '',
        notes: '',
        status: 'NEW',
      });
      qc.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean phones: remove empty ones, trim, and keep shape { name, phone }
    const cleanedPhones: PhoneEntry[] = form.phones
      .map((p) => ({
        name: p.name.trim(),
        phone: p.phone.trim(),
      }))
      .filter((p) => p.phone !== '');

    if (cleanedPhones.length === 0) {
      toast({
        title: 'Phone required',
        description: 'Please enter at least one phone number.',
        variant: 'destructive',
      });
      return;
    }

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    const payload = {
      ...form,
      name: fullName,
      phones: cleanedPhones,
      phone: cleanedPhones[0].phone, // backend "phone": main phone
    };

    mutation.mutate(payload);
  };

  const removePhone = (i: number) => {
    const updated = form.phones.filter((_, index) => index !== i);
    setForm({ ...form, phones: updated });
  };

  return (
    <section className={`recruiting_section ${fullscreen ? 'fullscreen_recruit' : ''}`}>
      <div className="recruiting_container">
        <div className="recruiting_wrapper">
          {fullscreen && (
            <button className="recruit_back_btn" onClick={() => setFullscreen(false)}>
              <FaArrowLeft />
            </button>
          )}

          <CardHeader className="recruiting_card_header">
            <CardTitle className="recruit_student_title">Recruit Student</CardTitle>
          </CardHeader>

          <CardContent>
            <form className="recruiting_form" onSubmit={handleSubmit}>
              <div className="name-fields-wrapper">
                <div className="name-field">
                  <label> First Name * </label>
                  <Input
                    className="recruiting_input_name__lastname"
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="name-field">
                  <label> Last Name * </label>
                  <Input
                    className="recruiting_input_name__lastname"
                    placeholder="Enter last name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label> Email * </label>
                <Input
                  type="email"
                  className="recruiting_input"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  inputMode="email"
                />
              </div>

              <div>
                <label> Phone * </label>

                {form.phones.map((p, index) => (
                  <div className="recruiting_phone_wrapper" key={index}>
                    {/* Phone number */}
                    <input
                      className="recruiting_phone_input"
                      placeholder="Enter phone"
                      value={p.phone}
                      inputMode="numeric"
                      maxLength={9}
                      onChange={(e) => {
                        const updated = [...form.phones];
                        updated[index] = {
                          ...updated[index],
                          phone: e.target.value.replace(/\D/g, ''),
                        };
                        setForm({ ...form, phones: updated });
                      }}
                      required={index === 0}
                    />

                    {/* Phone name */}
                    <Input
                      type="text"
                      placeholder="Phone name (e.g. Mom, Work)"
                      value={p.name}
                      onChange={(e) => {
                        const updated = [...form.phones];
                        updated[index] = {
                          ...updated[index],
                          name: e.target.value,
                        };
                        setForm({ ...form, phones: updated });
                      }}
                      className="phone__name"
                    />

                    {/* Add / remove buttons */}
                    {index === 0 && (
                      <div className="add_another_phone_field">
                        <button
                          type="button"
                          className="h-10"
                          onClick={() =>
                            setForm({
                              ...form,
                              phones: [...form.phones, { name: '', phone: '' }],
                            })
                          }
                        >
                          <GoPlus className="recruiting_plus_icon" />
                        </button>
                      </div>
                    )}

                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePhone(index)}
                        className="input_delete_btn_wrapper"
                      >
                        <IoMdClose className="input_delete_btn" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label> Program * </label>
                <Select
                  value={form.program}
                  onValueChange={(val) => setForm({ ...form, program: val })}
                >
                  <SelectTrigger className="recruiting_select">
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {(programs as any[]).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label> Additional info </label>
                <Input
                  className="recruiting_input"
                  placeholder="Enter additional info"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <Button className="recruiting_btn" type="submit" disabled={mutation.isPending}>
                Recruit
              </Button>
            </form>
          </CardContent>
        </div>
      </div>
    </section>
  );
}
