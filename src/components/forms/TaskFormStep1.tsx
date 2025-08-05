import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';

interface TaskFormStep1Props {
  form: UseFormReturn<any>;
}

export function TaskFormStep1({ form }: TaskFormStep1Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان وظیفه *</Label>
        <Input
          id="title"
          placeholder="مثال: مطالعه کتاب جدید"
          {...form.register('title')}
          className="text-right"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message as string}</p>
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
    </div>
  );
}