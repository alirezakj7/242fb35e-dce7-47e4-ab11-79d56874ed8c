import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';

interface TaskFormStep3Props {
  form: UseFormReturn<any>;
}

export function TaskFormStep3({ form }: TaskFormStep3Props) {
  const [hasFinancial, setHasFinancial] = useState(false);

  const handleFinancialToggle = (checked: boolean) => {
    setHasFinancial(checked);
    if (!checked) {
      form.setValue('financial_type', undefined);
      form.setValue('amount', '');
    }
  };

  return (
    <div className="space-y-4">
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="financial-toggle">جنبه مالی دارد</Label>
          <Switch
            id="financial-toggle"
            checked={hasFinancial}
            onCheckedChange={handleFinancialToggle}
          />
        </div>

        {hasFinancial && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>نوع مالی</Label>
              <Select value={form.watch('financial_type') || ''} onValueChange={(value) => form.setValue('financial_type', value as any)}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="انتخاب نوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spend">هزینه</SelectItem>
                  <SelectItem value="earn_once">درآمد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.watch('financial_type') && (
              <div className="space-y-2">
                <Label htmlFor="amount">
                  مبلغ {form.watch('financial_type') === 'spend' ? 'هزینه' : 'درآمد'} (تومان)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="۱۰۰۰۰"
                  {...form.register('amount')}
                  className="text-right"
                />
                <p className="text-xs text-muted-foreground">
                  {form.watch('financial_type') === 'spend' 
                    ? 'مبلغی که برای این کار خرج می‌کنید'
                    : 'مبلغی که از این کار کسب می‌کنید'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}