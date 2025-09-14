import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';

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

interface RoutineJobFormStep2Props {
  form: UseFormReturn<any>;
  selectedDays: string[];
  onToggleDay: (day: string) => void;
}

export function RoutineJobFormStep2({ form, selectedDays, onToggleDay }: RoutineJobFormStep2Props) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="frequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تکرار *</FormLabel>
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

      <div className="space-y-3">
        <FormLabel>روزهای کاری</FormLabel>
        <div className="grid grid-cols-2 gap-2">
          {daysOfWeek.map((day) => (
            <Button
              key={day.key}
              type="button"
              variant={selectedDays.includes(day.key) ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleDay(day.key)}
              className="justify-start"
            >
              {day.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}