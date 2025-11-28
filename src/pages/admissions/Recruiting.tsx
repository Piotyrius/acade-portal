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
import './Recruiting.css'
import { IoMdClose } from "react-icons/io";
import { GoPlus } from "react-icons/go";

export default function Recruiting() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: [''],
    program: '',
    notes: '',
    phoneName: '',
    status: "NEW" as "NEW",
  });

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
      setForm({ name: '', email: '', phone: [''], program: '', notes: '', status: "NEW" as "NEW", phoneName: '' });
      qc.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...form,
      phone: form.phone
        .map(p => p.trim())
        .filter(p => p !== '')
        .join(', '),
    };

    mutation.mutate(payload)
  }

  const removePhone = (i: number) => {
    const updated = form.phone.filter((_, index) => index !== i)
    setForm({ ...form, phone: updated })
  }


  return (
    <section className='recruiting_section'>

      <div className='recruiting_container'>
        <div className='recruiting_wrapper'>


          <CardHeader className='recruiting_card_header'>
            <CardTitle className='recruit_student_title'>Recruit Student</CardTitle>
          </CardHeader>
          <CardContent>


            <form className="recruiting_form" onSubmit={handleSubmit}>
              <div>
                <label> Full Name * </label>
                <Input
                  className='recruiting_input'
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label> Email * </label>
                <Input
                  className='recruiting_input'
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  inputMode="email"
                />
              </div>

              <div>
                <label> Phone * </label>

                {form.phone.map((p, index) => (
                  
                  <div className='recruiting_phone_wrapper' key={index}>
                    <div className='delete_btn__recruiting_phone'>


                      <input
                        className="recruiting_phone_input"
                        placeholder="Enter your phone"
                        value={p}
                        inputMode="numeric"
                        maxLength={9}
                        onChange={e => {
                          const newPhones = [...form.phone];
                          newPhones[index] = e.target.value.replace(/\D/g, "");
                          setForm({ ...form, phone: newPhones });
                        }}
                        required={index === 0}
                      />

                    </div>


                    <Input 
                      type='text'
                      placeholder='Phone name'
                      value={form.phoneName}
                      onChange={e => setForm({ ...form, phoneName: e.target.value })}
                      className='phone__name'
                    />

                    {index === 0 && (
                      <div className='add_another_phone_field'>
                        <button 
                          type='button'
                          className='h-10'
                          onClick={() => setForm({ ...form, phone: [...form.phone, ""] })}
                        >
                          <GoPlus className='recruiting_plus_icon' />
                        </button>
                      </div>
                    )}


                    {index > 0 && (
                      <button onClick={() => removePhone(index)} className='input_delete_btn_wrapper'>
                        <IoMdClose
                          className='input_delete_btn'
                          
                        />
                      </button>
                    )}
                    
                  </div>
                ))}
              </div>

              <div>
                <label> Program * </label>
                <Select
                  value={form.program}
                  onValueChange={val => setForm({ ...form, program: val })}
                  required
                >
                  <SelectTrigger className='recruiting_select'>
                    <SelectValue className='text-gray-400' placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {(programs as any[]).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label> Additional info </label>
                <Input
                  className='recruiting_input'
                  placeholder="Enter additional info"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <Button className='recruiting_btn' type="submit" disabled={mutation.isPending}>
                Recruit
              </Button>
            </form>


          </CardContent>
        </div>
      </div>
    </section>
  );
}
