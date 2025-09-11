import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { wheelOfLifeCategories } from '@/constants/categories';
import { JalaliCalendar } from '@/utils/jalali';

const daysOfWeek = [
  { key: 'saturday', label: 'شنبه' },
  { key: 'sunday', label: 'یکشنبه' },
  { key: 'monday', label: 'دوشنبه' },
  { key: 'tuesday', label: 'سه‌شنبه' },
  { key: 'wednesday', label: 'چهارشنبه' },
  { key: 'thursday', label: 'پنج‌شنبه' },
  { key: 'friday', label: 'جمعه' }
];

const frequencies = [
  { value: 'daily', label: 'روزانه' },
  { value: 'weekly', label: 'هفتگی' },
  { value: 'monthly', label: 'ماهانه' }
];

const routineJobSchema = z.object({
  name: z.string().min(1, 'نام کار ضروری است'),
  earnings: z.number().min(0, 'درآمد باید مثبت باشد'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  category: z.string().min(1, 'دسته‌بندی ضروری است'),
  days_of_week: z.array(z.string()).optional(),
  time_slots: z.array(z.object({
    start_time: z.string(),
    end_time: z.string()
  })).optional()
});

type RoutineJobFormData = z.infer<typeof routineJobSchema>;

interface RoutineJobFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function RoutineJobForm({ initialData, onSubmit, onCancel }: RoutineJobFormProps) {
  const [timeSlots, setTimeSlots] = useState(initialData?.time_slots || [{ start_time: '', end_time: '' }]);
  const [selectedDays, setSelectedDays] = useState<string[]>(initialData?.days_of_week || []);

  const form = useForm<RoutineJobFormData>({
    resolver: zodResolver(routineJobSchema),
    defaultValues: {
      name: initialData?.name || '',
      earnings: initialData?.earnings || 0,
      frequency: initialData?.frequency || 'weekly',
      category: initialData?.category || '',
      days_of_week: initialData?.days_of_week || [],
      time_slots: initialData?.time_slots || []
    }
  });

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

  const handleSubmit = async (data: RoutineJobFormData) => {
    const formData = {
      ...data,
      days_of_week: selectedDays.length > 0 ? selectedDays : null,
      time_slots: timeSlots.filter(slot => slot.start_time && slot.end_time).length > 0 ? timeSlots : null
    };
    
    await onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات کلی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام کار</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: تدریس آنلاین" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="earnings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>درآمد (تومان)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="مبلغ درآمد"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تکرار</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب تکرار" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencies.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>دسته‌بندی</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب دسته‌بندی" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wheelOfLifeCategories.map((category) => (
                          <SelectItem key={category.key} value={category.key}>
                            <span className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              <span>{category.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>روزهای کاری</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.key}
                  type="button"
                  variant={selectedDays.includes(day.key) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day.key)}
                  className="justify-start"
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              ساعات کاری
              <Button type="button" variant="outline" size="sm" onClick={addTimeSlot}>
                <Plus className="h-4 w-4 ml-1" />
                افزودن
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="time"
                  placeholder="شروع"
                  value={slot.start_time}
                  onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                />
                <span>تا</span>
                <Input
                  type="time"
                  placeholder="پایان"
                  value={slot.end_time}
                  onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                />
                {timeSlots.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTimeSlot(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            {initialData ? 'ویرایش' : 'ایجاد'} کار روتین
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
        </div>
      </form>
    </Form>
  );
}