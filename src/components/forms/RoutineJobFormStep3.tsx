import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { Plus, Minus } from 'lucide-react';
import { JalaliTimePicker } from '@/components/ui/jalali-time-picker';

interface TimeSlot {
  start_time: string;
  end_time: string;
}

interface RoutineJobFormStep3Props {
  timeSlots: TimeSlot[];
  onAddTimeSlot: () => void;
  onRemoveTimeSlot: (index: number) => void;
  onUpdateTimeSlot: (index: number, field: 'start_time' | 'end_time', value: string) => void;
}

export function RoutineJobFormStep3({ 
  timeSlots, 
  onAddTimeSlot, 
  onRemoveTimeSlot, 
  onUpdateTimeSlot 
}: RoutineJobFormStep3Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>ساعات کاری</FormLabel>
        <Button type="button" variant="outline" size="sm" onClick={onAddTimeSlot}>
          <Plus className="h-4 w-4 ml-1" />
          افزودن
        </Button>
      </div>
      
      <div className="space-y-3">
        {timeSlots.map((slot, index) => (
          <div key={index} className="flex items-center gap-2">
            <JalaliTimePicker
              value={slot.start_time}
              onChange={(value) => onUpdateTimeSlot(index, 'start_time', value)}
              placeholder="زمان شروع"
              className="flex-1"
            />
            <span className="text-muted-foreground">تا</span>
            <JalaliTimePicker
              value={slot.end_time}
              onChange={(value) => onUpdateTimeSlot(index, 'end_time', value)}
              placeholder="زمان پایان"
              className="flex-1"
            />
            {timeSlots.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemoveTimeSlot(index)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      {timeSlots.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          هیچ بازه زمانی تعریف نشده است
        </p>
      )}
    </div>
  );
}