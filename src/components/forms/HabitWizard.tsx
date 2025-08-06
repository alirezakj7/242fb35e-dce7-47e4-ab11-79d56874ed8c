import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';
import { wheelOfLifeCategories } from '@/constants/categories';
import { useHabits } from '@/hooks/useHabits';
import { useToast } from '@/hooks/use-toast';
import { JalaliCalendar } from '@/utils/jalali';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const habitSchema = z.object({
  name: z.string().min(1, 'نام عادت الزامی است'),
  description: z.string().optional(),
  category: z.string().min(1, 'انتخاب دسته‌بندی الزامی است'),
  days_of_week: z.array(z.number()).min(1, 'انتخاب حداقل یک روز الزامی است'),
  start_date: z.date(),
  duration: z.enum(['1week', '2weeks', '1month', '3months', 'custom']),
  end_date: z.date().optional(),
  reminder_enabled: z.boolean(),
  reminder_time: z.string().optional(),
});

type HabitFormData = z.infer<typeof habitSchema>;

interface HabitWizardProps {
  onSuccess?: () => void;
}

const daysOfWeek = [
  { value: 6, label: 'ش', fullLabel: 'شنبه' },
  { value: 0, label: 'ی', fullLabel: 'یکشنبه' },
  { value: 1, label: 'د', fullLabel: 'دوشنبه' },
  { value: 2, label: 'س', fullLabel: 'سه‌شنبه' },
  { value: 3, label: 'چ', fullLabel: 'چهارشنبه' },
  { value: 4, label: 'پ', fullLabel: 'پنج‌شنبه' },
  { value: 5, label: 'ج', fullLabel: 'جمعه' },
];

const durationOptions = [
  { value: '1week', label: '۱ هفته' },
  { value: '2weeks', label: '۲ هفته' },
  { value: '1month', label: '۱ ماه' },
  { value: '3months', label: '۳ ماه' },
  { value: 'custom', label: 'دلخواه' },
];

export function HabitWizard({ onSuccess }: HabitWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addHabit } = useHabits();
  const { toast } = useToast();

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      days_of_week: [],
      start_date: new Date(),
      duration: '1month',
      reminder_enabled: false,
      reminder_time: '',
    },
  });

  const watchedFields = form.watch();

  const isStep1Valid = watchedFields.name?.length > 0;
  const isStep2Valid = watchedFields.category?.length > 0;
  const isStep3Valid = watchedFields.days_of_week?.length > 0 && 
    (!watchedFields.reminder_enabled || watchedFields.reminder_time?.length > 0) &&
    (watchedFields.duration !== 'custom' || watchedFields.end_date);

  const calculateEndDate = (startDate: Date, duration: string): Date | null => {
    if (duration === 'custom') return null;
    
    const start = new Date(startDate);
    switch (duration) {
      case '1week':
        return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '2weeks':
        return new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
      case '1month':
        return new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());
      case '3months':
        return new Date(start.getFullYear(), start.getMonth() + 3, start.getDate());
      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: HabitFormData) => {
    setIsSubmitting(true);
    try {
      const endDate = data.duration === 'custom' ? data.end_date : calculateEndDate(data.start_date, data.duration);
      
      const habitData = {
        name: data.name,
        description: data.description || null,
        category: data.category as any,
        days_of_week: data.days_of_week,
        reminder_time: data.reminder_enabled ? data.reminder_time : null,
        completions: [],
        streak: 0,
      };

      await addHabit(habitData);
      
      toast({
        title: 'عادت جدید ایجاد شد! 🎉',
        description: `عادت "${data.name}" با موفقیت به برنامه شما اضافه شد`,
      });

      form.reset();
      setCurrentStep(1);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در ایجاد عادت پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">تعریف عادت</h3>
        <p className="text-sm text-muted-foreground">نام و توضیحات عادت جدید خود را وارد کنید</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">نام عادت *</Label>
          <Input
            id="name"
            placeholder="مثال: مطالعه ۱۵ دقیقه‌ای"
            {...form.register('name')}
            className="text-right"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">توضیحات (اختیاری)</Label>
          <Textarea
            id="description"
            placeholder="جزئیات یا یادداشت‌های شخصی در مورد این عادت..."
            {...form.register('description')}
            className="text-right resize-none"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            مثال: "مطالعه کتاب‌های غیرداستانی برای توسعه دانش"
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">دسته‌بندی</h3>
        <p className="text-sm text-muted-foreground">این عادت به کدام بخش از زندگی شما مربوط است؟</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {wheelOfLifeCategories.map((category) => (
          <Card
            key={category.key}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              watchedFields.category === category.key
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            )}
            onClick={() => form.setValue('category', category.key)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium">{category.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {form.formState.errors.category && (
        <p className="text-sm text-destructive text-center">{form.formState.errors.category.message}</p>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">زمان‌بندی و یادآوری</h3>
        <p className="text-sm text-muted-foreground">برنامه‌ریزی روزانه و تنظیمات یادآوری</p>
      </div>

      <div className="space-y-6">
        {/* Days Selection */}
        <div className="space-y-3">
          <Label>روزهای هفته *</Label>
          <div className="flex gap-2 justify-center">
            {daysOfWeek.map((day) => (
              <Button
                key={day.value}
                type="button"
                variant={watchedFields.days_of_week?.includes(day.value) ? "default" : "outline"}
                size="sm"
                className="w-12 h-12 rounded-full p-0"
                onClick={() => {
                  const currentDays = watchedFields.days_of_week || [];
                  const newDays = currentDays.includes(day.value)
                    ? currentDays.filter(d => d !== day.value)
                    : [...currentDays, day.value];
                  form.setValue('days_of_week', newDays);
                }}
              >
                {day.label}
              </Button>
            ))}
          </div>
          {form.formState.errors.days_of_week && (
            <p className="text-sm text-destructive text-center">{form.formState.errors.days_of_week.message}</p>
          )}
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label>تاریخ شروع</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-right font-normal",
                  !watchedFields.start_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchedFields.start_date ? (
                  JalaliCalendar.formatPersian(watchedFields.start_date)
                ) : (
                  <span>انتخاب تاریخ</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={watchedFields.start_date}
                onSelect={(date) => date && form.setValue('start_date', date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label>مدت زمان</Label>
          <Select value={watchedFields.duration} onValueChange={(value) => form.setValue('duration', value as any)}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="انتخاب مدت زمان" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom End Date */}
        {watchedFields.duration === 'custom' && (
          <div className="space-y-2">
            <Label>تاریخ پایان</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !watchedFields.end_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchedFields.end_date ? (
                    JalaliCalendar.formatPersian(watchedFields.end_date)
                  ) : (
                    <span>انتخاب تاریخ پایان</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchedFields.end_date}
                  onSelect={(date) => date && form.setValue('end_date', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Reminder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="reminder">یادآوری روزانه</Label>
            <Switch
              id="reminder"
              checked={watchedFields.reminder_enabled}
              onCheckedChange={(checked) => form.setValue('reminder_enabled', checked)}
            />
          </div>

          {watchedFields.reminder_enabled && (
            <div className="space-y-2">
              <Label htmlFor="reminder_time">زمان یادآوری</Label>
              <Input
                id="reminder_time"
                type="time"
                {...form.register('reminder_time')}
                className="text-right"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step < currentStep
                  ? "bg-primary text-primary-foreground"
                  : step === currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step < currentStep ? <CheckCircle2 size={16} /> : step}
            </div>
            {step < 3 && (
              <div
                className={cn(
                  "w-16 h-0.5 mx-2 transition-colors",
                  step < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowRight size={16} />
          قبلی
        </Button>

        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={nextStep}
            disabled={
              (currentStep === 1 && !isStep1Valid) ||
              (currentStep === 2 && !isStep2Valid)
            }
            className="flex items-center gap-2"
          >
            بعدی
            <ArrowLeft size={16} />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={!isStep3Valid || isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              'در حال ایجاد...'
            ) : (
              <>
                ایجاد عادت
                <CheckCircle2 size={16} />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}