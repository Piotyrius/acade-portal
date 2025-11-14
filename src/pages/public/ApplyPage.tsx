import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPrograms } from '@/api/endpoints/catalog';
import { submitPublicApplication } from '@/api/endpoints/admissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, CheckCircle2 } from 'lucide-react';

export default function ApplyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: '',
    schedule_pref: '',
    experience_level: '',
    referral_source: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch programs
  const { data: programs = [], isLoading: loadingPrograms } = useQuery({
    queryKey: ['programs-public'],
    queryFn: () => getPrograms(),
  });

  // Submit application mutation
  const submitMutation = useMutation({
    mutationFn: submitPublicApplication,
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: 'Application Submitted!',
        description: 'Thank you for applying. We will contact you soon.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.program) newErrors.program = 'Please select a program';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    submitMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      program: formData.program,
      schedule_pref: formData.schedule_pref,
      experience_level: formData.experience_level,
      referral_source: formData.referral_source,
      notes: formData.notes,
      status: 'NEW',
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in our academy. We have received your
            application and will review it shortly. You will hear from us within
            2-3 business days.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Application ID:</strong> Confirmation email sent to{' '}
              <span className="font-medium">{formData.email}</span>
            </p>
          </div>
          <Button
            onClick={() => navigate('/')}
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apply to Our Academy
          </h1>
          <p className="text-gray-600">
            Fill out the form below to start your learning journey with us
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+995 555 123 456"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Program */}
          <div>
            <Label htmlFor="program">
              Program <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.program}
              onValueChange={(value) => setFormData({ ...formData, program: value })}
            >
              <SelectTrigger className={errors.program ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                {loadingPrograms ? (
                  <SelectItem value="loading" disabled>
                    Loading programs...
                  </SelectItem>
                ) : (
                  programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.program && (
              <p className="text-sm text-red-500 mt-1">{errors.program}</p>
            )}
          </div>

          {/* Schedule Preference */}
          <div>
            <Label htmlFor="schedule_pref">Preferred Schedule (Optional)</Label>
            <Select
              value={formData.schedule_pref}
              onValueChange={(value) =>
                setFormData({ ...formData, schedule_pref: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select schedule preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (9 AM - 1 PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (2 PM - 6 PM)</SelectItem>
                <SelectItem value="evening">Evening (6 PM - 9 PM)</SelectItem>
                <SelectItem value="weekend">Weekend</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level */}
          <div>
            <Label htmlFor="experience_level">Experience Level (Optional)</Label>
            <Select
              value={formData.experience_level}
              onValueChange={(value) =>
                setFormData({ ...formData, experience_level: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner - No prior experience</SelectItem>
                <SelectItem value="intermediate">
                  Intermediate - Some experience
                </SelectItem>
                <SelectItem value="advanced">Advanced - Extensive experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Referral Source */}
          <div>
            <Label htmlFor="referral_source">How did you hear about us? (Optional)</Label>
            <Select
              value={formData.referral_source}
              onValueChange={(value) =>
                setFormData({ ...formData, referral_source: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select referral source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Search</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="friend">Friend/Family Referral</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Tell us more about your goals and why you want to join..."
              rows={4}
            />
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              By submitting this application, you consent to the processing of your
              personal data in accordance with our Privacy Policy. We will use your
              information to process your application and contact you regarding your
              enrollment.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
