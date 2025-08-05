import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { wheelOfLifeCategories } from '@/constants/categories';
import { UseFormReturn } from 'react-hook-form';

interface TaskFormStep2Props {
  form: UseFormReturn<any>;
}

export function TaskFormStep2({ form }: TaskFormStep2Props) {
  return (
    <div className="space-y-4">
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
          <p className="text-sm text-destructive">{form.formState.errors.category.message as string}</p>
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
    </div>
  );
}