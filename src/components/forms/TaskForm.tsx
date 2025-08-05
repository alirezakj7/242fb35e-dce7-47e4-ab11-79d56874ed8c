import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { TaskFormStep1 } from './TaskFormStep1';
import { TaskFormStep2 } from './TaskFormStep2';
import { TaskFormStep3 } from './TaskFormStep3';

const taskSchema = z.object({
  title: z.string().min(1, 'عنوان وظیفه الزامی است'),
  description: z.string().optional(),
  category: z.string().min(1, 'انتخاب دسته‌بندی الزامی است'),
  scheduled_date: z.date().optional(),
  tags: z.string().optional(),
  financial_type: z.enum(['spend', 'earn_once']).optional(),
  earnings: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSuccess?: () => void;
  defaultDate?: Date;
  task?: any; // For editing existing tasks
}

export function TaskForm({ onSuccess, defaultDate, task }: TaskFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask } = useTasks();
  const { toast } = useToast();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      scheduled_date: defaultDate,
      tags: '',
      financial_type: undefined,
      earnings: '',
    },
  });

  const stepTitles = [
    'نام و اطلاعات',
    'دسته‌بندی و تاریخ', 
    'برچسب و مالی'
  ];

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!form.watch('title')?.trim();
      case 2:
        return !!form.watch('category');
      case 3:
        return true; // Step 3 is always valid as all fields are optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const taskData = {
        title: data.title,
        description: data.description || null,
        category: data.category as any,
        scheduled_date: null, // Don't set scheduled_date by default - let user drag to schedule
        tags: data.tags ? data.tags.split('،').map(tag => tag.trim()).filter(Boolean) : [],
        status: 'not_started' as const,
        financial_type: data.financial_type || null,
      };

      await addTask(taskData);
      
      toast({
        title: 'وظیفه جدید اضافه شد',
        description: 'وظیفه با موفقیت به برنامه شما اضافه شد',
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در افزودن وظیفه پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-6">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep ? 'bg-primary text-primary-foreground' :
              step < currentStep ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-0.5 mx-2 ${
                step < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">{stepTitles[currentStep - 1]}</h3>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Step content */}
        <div className="min-h-[200px]">
          {currentStep === 1 && <TaskFormStep1 form={form} />}
          {currentStep === 2 && <TaskFormStep2 form={form} />}
          {currentStep === 3 && <TaskFormStep3 form={form} />}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2 pt-4">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              <ChevronRight size={16} className="ml-1" />
              قبلی
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button 
              type="button" 
              onClick={handleNext} 
              disabled={!isStepValid(currentStep)}
              className="flex-1"
            >
              بعدی
              <ChevronLeft size={16} className="mr-1" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                'در حال افزودن...'
              ) : (
                <>
                  <Plus size={16} className="ml-1" />
                  افزودن وظیفه
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}