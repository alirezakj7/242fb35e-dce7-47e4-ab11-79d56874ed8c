import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { Plus, Minus } from 'lucide-react';

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
            <Input
              type="time"
              placeholder="شروع"
              value={slot.start_time}
              onChange={(e) => onUpdateTimeSlot(index, 'start_time', e.target.value)}
            />
            <span className="text-muted-foreground">تا</span>
            <Input
              type="time"
              placeholder="پایان"
              value={slot.end_time}
              onChange={(e) => onUpdateTimeSlot(index, 'end_time', e.target.value)}
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