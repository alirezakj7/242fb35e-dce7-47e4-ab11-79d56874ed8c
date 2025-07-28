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
import { useGoals } from '@/hooks/useGoals';
import { useToast } from '@/hooks/use-toast';

const goalSchema = z.object({
  title: z.string().min(1, 'عنوان هدف الزامی است'),
  description: z.string().optional(),
  type: z.enum(['annual', 'quarterly', 'financial'], {
    required_error: 'انتخاب نوع هدف الزامی است',
  }),
  category: z.string().min(1, 'انتخاب دسته‌بندی الزامی است'),
  deadline: z.date({
    required_error: 'تاریخ پایان الزامی است',
  }),
  target_amount: z.string().optional(),
  current_amount: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  onSuccess?: () => void;
  defaultType?: 'annual' | 'quarterly' | 'financial';
}

export function GoalForm({ onSuccess, defaultType }: GoalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addGoal } = useGoals();
  const { toast } = useToast();

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      type: defaultType,
      category: '',
      target_amount: '',
      current_amount: '0',
    },
  });

  const goalType = form.watch('type');
  const isFinancialGoal = goalType === 'financial';

  const onSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true);
    try {
      const goalData = {
        title: data.title,
        description: data.description || null,
        type: data.type,
        category: data.category as any,
        deadline: data.deadline.toISOString().split('T')[0],
        target_amount: isFinancialGoal && data.target_amount ? Number(data.target_amount) : null,
        current_amount: isFinancialGoal && data.current_amount ? Number(data.current_amount) : null,
        completed: false,
      };

      await addGoal(goalData);
      
      toast({
        title: 'هدف جدید اضافه شد',
        description: 'هدف با موفقیت به برنامه شما اضافه شد',
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در افزودن هدف پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان هدف *</Label>
        <Input
          id="title"
          placeholder="مثال: کاهش ۱۰ کیلو وزن"
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
          placeholder="جزئیات بیشتر در مورد هدف..."
          {...form.register('description')}
          className="text-right resize-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>نوع هدف *</Label>
          <Select value={form.watch('type')} onValueChange={(value) => form.setValue('type', value as any)}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="انتخاب نوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="annual">ساليانه</SelectItem>
              <SelectItem value="quarterly">فصلی</SelectItem>
              <SelectItem value="financial">مالی</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.type && (
            <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>دسته‌بندی *</Label>
          <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value)}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="انتخاب دسته" />
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
      </div>

      <div className="space-y-2">
        <Label>تاریخ پایان *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-right font-normal",
                !form.watch('deadline') && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="ml-2 h-4 w-4" />
              {form.watch('deadline') ? (
                format(form.watch('deadline')!, "PPP")
              ) : (
                <span>انتخاب تاریخ پایان</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={form.watch('deadline')}
              onSelect={(date) => form.setValue('deadline', date!)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
        {form.formState.errors.deadline && (
          <p className="text-sm text-destructive">{form.formState.errors.deadline.message}</p>
        )}
      </div>

      {isFinancialGoal && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target_amount">مبلغ هدف (تومان)</Label>
            <Input
              id="target_amount"
              type="number"
              placeholder="۱۰۰۰۰۰۰"
              {...form.register('target_amount')}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_amount">مبلغ فعلی (تومان)</Label>
            <Input
              id="current_amount"
              type="number"
              placeholder="۰"
              {...form.register('current_amount')}
              className="text-right"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            'در حال افزودن...'
          ) : (
            <>
              <Plus size={16} className="ml-1" />
              افزودن هدف
            </>
          )}
        </Button>
      </div>
    </form>
  );
}