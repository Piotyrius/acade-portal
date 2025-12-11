import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
}

interface MultiStepFormProps {
  steps: Step[];
  onSubmit: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: any;
  autoSave?: boolean;
  autoSaveKey?: string;
}

export function MultiStepForm({
  steps,
  onSubmit,
  onCancel,
  initialData = {},
  autoSave = false,
  autoSaveKey = 'multistep-form',
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load auto-saved data
  useState(() => {
    if (autoSave) {
      const saved = localStorage.getItem(autoSaveKey);
      if (saved) {
        try {
          setFormData({ ...formData, ...JSON.parse(saved) });
        } catch (e) {
          console.error('Failed to load auto-saved data', e);
        }
      }
    }
  });

  // Auto-save to localStorage
  const updateFormData = (updates: any) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    if (autoSave) {
      localStorage.setItem(autoSaveKey, JSON.stringify(newData));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      if (autoSave) {
        localStorage.removeItem(autoSaveKey);
      }
    } catch (error) {
      console.error('Form submission error', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
        <div className="flex items-center gap-2 mt-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex-1 h-1 rounded-full transition-colors',
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
          {steps[currentStep].description && (
            <p className="text-sm text-muted-foreground mt-1">
              {steps[currentStep].description}
            </p>
          )}
        </div>
        <div>
          {typeof steps[currentStep].content === 'function'
            ? steps[currentStep].content({ formData, updateFormData })
            : steps[currentStep].content}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentStep > 0 && (
            <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep} disabled={isSubmitting}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

