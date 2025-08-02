import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { wheelOfLifeCategories } from '@/constants/categories';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

const taskSchema = z.object({
  title: z.string().min(1, 'عنوان وظیفه الزامی است'),
  description: z.string().optional(),
  category: z.string().min(1, 'انتخاب دسته‌بندی الزامی است'),
  scheduled_date: z.date().optional(),
  tags: z.string().optional(),
  financial_type: z.enum(['spend', 'earn_once', 'earn_routine']).optional(),
  earnings: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSuccess?: () => void;
  defaultDate?: Date;
}

export function TaskForm({ onSuccess, defaultDate }: TaskFormProps) {
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

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const taskData = {
        title: data.title,
        description: data.description || null,
        category: data.category as any,
        scheduled_date: data.scheduled_date ? data.scheduled_date.toISOString().split('T')[0] : null,
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان وظیفه *</Label>
        <Input
          id="title"
          placeholder="مثال: مطالعه کتاب جدید"
          {...form.register('title')}
          className="text-right"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">توضیحات</Label>
        <Textarea
          id="description"
          placeholder="جزئیات بیشتر در مورد وظیفه..."
          {...form.register('description')}
          className="text-right resize-none"
          rows={3}
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
        <Label>تاریخ انجام</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-right font-normal",
                !form.watch('scheduled_date') && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="ml-2 h-4 w-4" />
              {form.watch('scheduled_date') ? (
                (() => {
                  const date = form.watch('scheduled_date');
                  return date && !isNaN(date.getTime()) ? format(date, "PPP") : 'تاریخ نامعتبر';
                })()
              ) : (
                <span>انتخاب تاریخ</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={form.watch('scheduled_date')}
              onSelect={(date) => form.setValue('scheduled_date', date)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">برچسب‌ها</Label>
        <Input
          id="tags"
          placeholder="مثال: مهم، فوری، کار (با کاما جدا کنید)"
          {...form.register('tags')}
          className="text-right"
        />
        <p className="text-xs text-muted-foreground">برچسب‌ها را با کاما (،) جدا کنید</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>نوع مالی</Label>
          <Select value={form.watch('financial_type') || ''} onValueChange={(value) => form.setValue('financial_type', value as any)}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="بدون پاداش مالی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="earn_once">درآمد یکباره</SelectItem>
              <SelectItem value="earn_routine">درآمد روتین</SelectItem>
              <SelectItem value="spend">هزینه</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.watch('financial_type') && (
          <div className="space-y-2">
            <Label htmlFor="earnings">مبلغ (تومان)</Label>
            <Input
              id="earnings"
              type="number"
              placeholder="۱۰۰۰۰"
              {...form.register('earnings')}
              className="text-right"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
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
      </div>
    </form>
  );
}