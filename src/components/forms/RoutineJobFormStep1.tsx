import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { wheelOfLifeCategories } from '@/constants/categories';

interface RoutineJobFormStep1Props {
  form: UseFormReturn<any>;
}

export function RoutineJobFormStep1({ form }: RoutineJobFormStep1Props) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نام کار *</FormLabel>
            <FormControl>
              <Input 
                placeholder="مثال: تدریس آنلاین" 
                {...field}
                className="text-right"
              />
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
            <FormLabel>درآمد (تومان) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="مبلغ درآمد"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="text-right"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>دسته‌بندی *</FormLabel>
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
  );
}