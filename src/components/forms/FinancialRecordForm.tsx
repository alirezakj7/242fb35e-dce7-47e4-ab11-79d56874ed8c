import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { wheelOfLifeCategories } from '@/constants/categories';
import { Calendar, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { JalaliCalendar } from '@/utils/jalali';
import { JalaliCalendarComponent } from '@/components/ui/jalali-calendar';

type CategoryType = 'career' | 'finance' | 'health' | 'family' | 'personal' | 'spiritual' | 'social' | 'education';

interface FinancialRecordFormProps {
  onSubmit: (data: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: CategoryType;
    date: string;
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: CategoryType;
    date: string;
  };
}

export function FinancialRecordForm({ onSubmit, onCancel, initialData }: FinancialRecordFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<CategoryType>(initialData?.category || 'finance');
  const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای ضروری را پر کنید",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "خطا",
        description: "مبلغ باید یک عدد مثبت باشد",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        type,
        amount: numericAmount,
        description,
        category,
        date: format(date, 'yyyy-MM-dd')
      });
      
      toast({
        title: "موفقیت",
        description: initialData ? "تراکنش ویرایش شد" : "تراکنش جدید اضافه شد",
      });
      onCancel();
    } catch (error) {
      toast({
        title: "خطا",
        description: "مشکلی در ذخیره تراکنش پیش آمد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>نوع تراکنش</Label>
        <RadioGroup value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="income" id="income" />
            <Label htmlFor="income" className="text-green-600">درآمد</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="expense" id="expense" />
            <Label htmlFor="expense" className="text-red-600">هزینه</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">مبلغ (تومان)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="مبلغ را وارد کنید"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">شرح</Label>
        <Textarea
          id="description"
          placeholder="توضیحات تراکنش"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>دسته‌بندی</Label>
        <Select value={category} onValueChange={(value: CategoryType) => setCategory(value)} required>
          <SelectTrigger>
            <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
          </SelectTrigger>
          <SelectContent>
            {wheelOfLifeCategories.map((cat) => (
              <SelectItem key={cat.key} value={cat.key}>
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>تاریخ</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="ml-2 h-4 w-4" />
              {date ? JalaliCalendar.formatPersian(date) : "تاریخ را انتخاب کنید"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <JalaliCalendarComponent
              mode="single"
              selected={date}
              onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "در حال ذخیره..." : initialData ? "ویرایش" : "افزودن"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          انصراف
        </Button>
      </div>
    </form>
  );
}