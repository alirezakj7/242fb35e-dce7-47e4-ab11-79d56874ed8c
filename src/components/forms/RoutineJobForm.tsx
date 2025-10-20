import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { RoutineJobFormStep1 } from './RoutineJobFormStep1';
import { RoutineJobFormStep2 } from './RoutineJobFormStep2';
import { RoutineJobFormStep3 } from './RoutineJobFormStep3';


const routineJobSchema = z.object({
  name: z.string().min(1, 'نام کار ضروری است').max(100, 'نام کار نباید بیشتر از 100 کاراکتر باشد'),
  earnings: z.number().min(0, 'درآمد باید مثبت باشد'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  category: z.string().min(1, 'دسته‌بندی ضروری است'),
  days_of_week: z.array(z.string()).optional(),
  time_slots: z.array(z.object({
    start_time: z.string(),
    end_time: z.string()
  })).optional(),
  payment_day: z.number().int().min(0).max(31).optional()
});

type RoutineJobFormData = z.infer<typeof routineJobSchema>;

interface RoutineJobFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function RoutineJobForm({ initialData, onSubmit, onCancel }: RoutineJobFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSlots, setTimeSlots] = useState(initialData?.time_slots || [{ start_time: '', end_time: '' }]);
  
  // Convert integer days from database to string days for form state
  const convertIntegerDaysToStrings = (days: number[]): string[] => {
    const numberToDayString: Record<number, string> = {
      0: 'sunday',
      1: 'monday', 
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    return days?.map(day => numberToDayString[day]).filter(day => day !== undefined) || [];
  };
  
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialData?.days_of_week ? convertIntegerDaysToStrings(initialData.days_of_week) : []
  );

  const form = useForm<RoutineJobFormData>({
    resolver: zodResolver(routineJobSchema),
    defaultValues: {
      name: initialData?.name || '',
      earnings: initialData?.earnings || 0,
      frequency: initialData?.frequency || 'weekly',
      category: initialData?.category || '',
      days_of_week: initialData?.days_of_week ? convertIntegerDaysToStrings(initialData.days_of_week) : [],
      time_slots: initialData?.time_slots || [],
      payment_day: initialData?.payment_day || undefined
    }
  });

  const stepTitles = [
    'اطلاعات کلی',
    'زمان‌بندی و تکرار',
    'ساعات کاری'
  ];

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!form.watch('name')?.trim() && 
               form.watch('earnings') > 0 && 
               !!form.watch('category');
      case 2:
        return !!form.watch('frequency') && form.watch('payment_day') !== undefined;
      case 3:
        return true; // Step 3 is optional
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

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { start_time: '', end_time: '' }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: 'start_time' | 'end_time', value: string) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const toggleDay = (day: string) => {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updated);
  };

  const handleSubmit = async () => {
    if (currentStep !== 3) return;
    
    const isValid = await form.trigger();
    if (!isValid) {
      console.log('Form validation failed:', form.formState.errors);
      return;
    }

    const data = form.getValues();
    console.log('Form data before processing:', data);
    
    // Convert day strings to integers for database storage
    const dayStringToNumber: Record<string, number> = {
      'saturday': 6,
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5
    };
    
    const convertedDays = selectedDays.map(day => dayStringToNumber[day]).filter(day => day !== undefined);
    
    setIsSubmitting(true);
    try {
      const formData = {
        ...data,
        days_of_week: convertedDays.length > 0 ? convertedDays : null,
        time_slots: timeSlots.filter(slot => slot.start_time && slot.end_time).length > 0 ? timeSlots : null
      };
      
      console.log('Final form data being submitted:', formData);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
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

        <div className="space-y-4">
          {/* Step content */}
          <div className="min-h-[200px]">
            {currentStep === 1 && <RoutineJobFormStep1 form={form} />}
            {currentStep === 2 && (
              <RoutineJobFormStep2 
                form={form} 
                selectedDays={selectedDays}
                onToggleDay={toggleDay}
              />
            )}
            {currentStep === 3 && (
              <RoutineJobFormStep3 
                timeSlots={timeSlots}
                onAddTimeSlot={addTimeSlot}
                onRemoveTimeSlot={removeTimeSlot}
                onUpdateTimeSlot={updateTimeSlot}
              />
            )}
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
              <div className="flex gap-2 flex-1">
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={isSubmitting} 
                  className="flex-1"
                >
                  {isSubmitting ? (
                    'در حال ذخیره...'
                  ) : (
                    <>
                      <Plus size={16} className="ml-1" />
                      {initialData ? 'ویرایش' : 'ایجاد'} کار روتین
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  انصراف
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
}