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
import { Plus } from 'lucide-react';
import { wheelOfLifeCategories } from '@/constants/categories';
import { useHabits } from '@/hooks/useHabits';
import { useToast } from '@/hooks/use-toast';

const habitSchema = z.object({
  name: z.string().min(1, 'نام عادت الزامی است'),
  description: z.string().optional(),
  category: z.string().min(1, 'انتخاب دسته‌بندی الزامی است'),
  days_of_week: z.array(z.number()).min(1, 'انتخاب حداقل یک روز الزامی است'),
  reminder_time: z.string().optional(),
});

type HabitFormData = z.infer<typeof habitSchema>;

interface HabitFormProps {
  onSuccess?: () => void;
}

const daysOfWeek = [
  { value: 6, label: 'شنبه' },
  { value: 0, label: 'یکشنبه' },
  { value: 1, label: 'دوشنبه' },
  { value: 2, label: 'سه‌شنبه' },
  { value: 3, label: 'چهارشنبه' },
  { value: 4, label: 'پنج‌شنبه' },
  { value: 5, label: 'جمعه' },
];

export function HabitForm({ onSuccess }: HabitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const { addHabit } = useHabits();
  const { toast } = useToast();

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      days_of_week: [],
      reminder_time: '',
    },
  });

  const handleDayToggle = (dayValue: number, checked: boolean) => {
    let newSelectedDays;
    if (checked) {
      newSelectedDays = [...selectedDays, dayValue];
    } else {
      newSelectedDays = selectedDays.filter(day => day !== dayValue);
    }
    setSelectedDays(newSelectedDays);
    form.setValue('days_of_week', newSelectedDays);
  };

  const onSubmit = async (data: HabitFormData) => {
    setIsSubmitting(true);
    try {
      const habitData = {
        name: data.name,
        description: data.description || null,
        category: data.category as any,
        days_of_week: data.days_of_week,
        reminder_time: data.reminder_time || null,
        completions: [],
        streak: 0,
      };

      await addHabit(habitData);
      
      toast({
        title: 'عادت جدید اضافه شد',
        description: 'عادت با موفقیت به برنامه شما اضافه شد',
      });

      form.reset();
      setSelectedDays([]);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در افزودن عادت پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">نام عادت *</Label>
        <Input
          id="name"
          placeholder="مثال: ورزش صبحگاهی"
          {...form.register('name')}
          className="text-right"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">توضیحات</Label>
        <Textarea
          id="description"
          placeholder="جزئیات بیشتر در مورد عادت..."
          {...form.register('description')}
          className="text-right resize-none"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>دسته‌بندی *</Label>
        <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value)}>
          <SelectTrigger className="text-right">
            <SelectValue placeholder="انتخاب دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            {wheelOfLifeCategories.map((category) => (
              <SelectItem key={category.key} value={category.key}>
                <div className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.category && (
          <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>روزهای هفته *</Label>
        <div className="grid grid-cols-2 gap-2">
          {daysOfWeek.map((day) => (
            <div key={day.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`day-${day.value}`}
                checked={selectedDays.includes(day.value)}
                onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
              />
              <Label
                htmlFor={`day-${day.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {day.label}
              </Label>
            </div>
          ))}
        </div>
        {form.formState.errors.days_of_week && (
          <p className="text-sm text-destructive">{form.formState.errors.days_of_week.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminder_time">زمان یادآوری</Label>
        <Input
          id="reminder_time"
          type="time"
          {...form.register('reminder_time')}
          className="text-right"
        />
        <p className="text-xs text-muted-foreground">
          اختیاری - زمان یادآوری روزانه برای این عادت
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            'در حال افزودن...'
          ) : (
            <>
              <Plus size={16} className="ml-1" />
              افزودن عادت
            </>
          )}
        </Button>
      </div>
    </form>
  );
}