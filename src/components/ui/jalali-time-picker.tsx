import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock } from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';
import { cn } from '@/lib/utils';

interface JalaliTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function JalaliTimePicker({
  value = '',
  onChange,
  placeholder = 'انتخاب زمان',
  className,
  disabled = false,
  id
}: JalaliTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(
    value ? parseInt(value.split(':')[0]) : 12
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(
    value ? parseInt(value.split(':')[1] || '0') : 0
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const displayTime = (time: string) => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const persianHour = JalaliCalendar.toPersianDigits(hour);
    const persianMinute = JalaliCalendar.toPersianDigits(minute || '00');
    return `${persianHour}:${persianMinute}`;
  };

  const handleTimeSelect = () => {
    const timeString = formatTime(selectedHour, selectedMinute);
    onChange?.(timeString);
    setIsOpen(false);
  };

  const handleQuickTime = (hour: number, minute: number = 0) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    const timeString = formatTime(hour, minute);
    onChange?.(timeString);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-right font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          id={id}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? displayTime(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="text-center">
            <Label className="text-sm font-medium">انتخاب زمان</Label>
          </div>
          
          {/* Quick time buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTime(6, 0)}
              className="text-xs"
            >
              ۶:۰۰
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTime(8, 0)}
              className="text-xs"
            >
              ۸:۰۰
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTime(12, 0)}
              className="text-xs"
            >
              ۱۲:۰۰
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTime(18, 0)}
              className="text-xs"
            >
              ۱۸:۰۰
            </Button>
          </div>

          {/* Time selectors */}
          <div className="flex gap-4 items-center justify-center">
            {/* Hour selector */}
            <div className="space-y-2">
              <Label className="text-xs">ساعت</Label>
              <div className="h-32 w-16 overflow-y-auto border rounded-md">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    className={cn(
                      "w-full py-1 text-xs hover:bg-muted transition-colors",
                      selectedHour === hour && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setSelectedHour(hour)}
                  >
                    {JalaliCalendar.toPersianDigits(hour.toString().padStart(2, '0'))}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xl font-bold">:</div>

            {/* Minute selector */}
            <div className="space-y-2">
              <Label className="text-xs">دقیقه</Label>
              <div className="h-32 w-16 overflow-y-auto border rounded-md">
                {minutes.filter(m => m % 5 === 0).map((minute) => (
                  <button
                    key={minute}
                    className={cn(
                      "w-full py-1 text-xs hover:bg-muted transition-colors",
                      selectedMinute === minute && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setSelectedMinute(minute)}
                  >
                    {JalaliCalendar.toPersianDigits(minute.toString().padStart(2, '0'))}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected time display */}
          <div className="text-center py-2 border-t">
            <div className="text-lg font-semibold">
              {JalaliCalendar.toPersianDigits(formatTime(selectedHour, selectedMinute))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              انصراف
            </Button>
            <Button
              size="sm"
              onClick={handleTimeSelect}
              className="flex-1"
            >
              تأیید
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}