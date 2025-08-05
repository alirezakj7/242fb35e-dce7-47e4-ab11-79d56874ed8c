import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DraggableTaskCard } from './DraggableTaskCard';
import { JalaliCalendar } from '@/utils/jalali';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TimeBlockScheduleProps {
  tasks: Task[];
  currentDate: Date;
  onRefetch: () => void;
}

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export function TimeBlockSchedule({ tasks, currentDate, onRefetch }: TimeBlockScheduleProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { updateTask } = useTasks();
  const { toast } = useToast();
  
  console.log('TimeBlockSchedule received tasks:', tasks.length, tasks);

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'شخصی': 'border-l-blue-500',
      'کاری': 'border-l-green-500', 
      'خانوادگی': 'border-l-orange-500',
      'تفریحی': 'border-l-purple-500',
      'ورزشی': 'border-l-red-500',
      'مالی': 'border-l-yellow-500',
      'آموزشی': 'border-l-indigo-500',
      'سلامتی': 'border-l-pink-500'
    };
    return categoryColors[category] || 'border-l-gray-500';
  };

  const getTasksForTimeSlot = (timeSlot: string) => {
    const filteredTasks = tasks.filter(task => {
      if (!task.scheduled_time) return false;
      const taskHour = task.scheduled_time.split(':')[0].padStart(2, '0');
      const slotHour = timeSlot.split(':')[0];
      return taskHour === slotHour;
    });
    console.log(`Tasks for time slot ${timeSlot}:`, filteredTasks);
    return filteredTasks;
  };

  const getUnscheduledTasks = () => {
    return tasks.filter(task => !task.scheduled_time);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task;
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const task = active.data.current?.task as Task;
    if (!task) return;

    try {
      if (over.id === 'postpone') {
        // Postpone to next day
        const nextDay = JalaliCalendar.addDays(currentDate, 1);
        const nextDayStr = JalaliCalendar.toEnglishDigits(JalaliCalendar.format(nextDay, 'YYYY-MM-DD'));
        
        console.log('Postponing task:', task.id, 'to:', nextDayStr);
        
        await updateTask(task.id, {
          scheduled_date: nextDayStr,
          status: 'postponed'
        });

        toast({
          title: 'وظیفه به تعویق افتاد',
          description: `وظیفه به ${JalaliCalendar.formatPersian(nextDay, 'jDD jMMMM')} منتقل شد`,
        });
      } else if (typeof over.id === 'string' && over.id.startsWith('time-')) {
        // Move to specific time slot
        const timeSlot = over.id.replace('time-', '');
        const currentDateStr = JalaliCalendar.toEnglishDigits(JalaliCalendar.format(currentDate, 'YYYY-MM-DD'));
        console.log('Scheduling task:', task.id, 'to time slot:', timeSlot, 'on date:', currentDateStr);
        
        await updateTask(task.id, {
          scheduled_time: timeSlot,
          scheduled_date: currentDateStr
        });

        toast({
          title: 'زمان وظیفه تغییر کرد',
          description: `وظیفه به ساعت ${JalaliCalendar.toPersianDigits(timeSlot)} منتقل شد`,
        });
      }

      onRefetch();
    } catch (error) {
      console.error('Error in handleDragEnd:', error);
      toast({
        title: 'خطا',
        description: `خطا در تغییر وظیفه: ${error.message || 'خطای نامشخص'}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {/* Unscheduled Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">وظایف بدون زمان‌بندی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getUnscheduledTasks().map(task => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  categoryColor={getCategoryColor(task.category)}
                  onRefetch={onRefetch}
                />
              ))}
              {getUnscheduledTasks().length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  همه وظایف زمان‌بندی شده‌اند
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <div className="grid gap-2">
          {TIME_SLOTS.map(timeSlot => {
            const slotTasks = getTasksForTimeSlot(timeSlot);
            
            return (
              <TimeSlotDropZone 
                key={timeSlot} 
                timeSlot={timeSlot} 
                slotTasks={slotTasks}
                onRefetch={onRefetch}
                getCategoryColor={getCategoryColor}
              />
            );
          })}
        </div>

        {/* Postpone Drop Zone */}
        <PostponeDropZone />
      </div>

      <DragOverlay>
        {activeTask && (
          <DraggableTaskCard
            task={activeTask}
            categoryColor={getCategoryColor(activeTask.category)}
            onRefetch={onRefetch}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}

// TimeSlot Drop Zone Component
function TimeSlotDropZone({ timeSlot, slotTasks, onRefetch, getCategoryColor }: {
  timeSlot: string;
  slotTasks: any[];
  onRefetch: () => void;
  getCategoryColor: (category: string) => string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `time-${timeSlot}`
  });

  return (
    <Card 
      ref={setNodeRef}
      className={`min-h-[80px] transition-colors ${
        isOver ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {slotTasks.length === 0 && (
            <div className="w-16 text-sm font-medium text-muted-foreground">
              {JalaliCalendar.toPersianDigits(timeSlot)}
            </div>
          )}
          
          <div className="flex-1 space-y-2">
            {slotTasks.map(task => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                categoryColor={getCategoryColor(task.category)}
                onRefetch={onRefetch}
                timeSlot={timeSlot}
              />
            ))}
            
            {slotTasks.length === 0 && (
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isOver 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-muted text-muted-foreground'
              }`}>
                {isOver ? 'رها کنید تا زمان‌بندی شود' : 'وظیفه‌ای برای این ساعت تعریف نشده'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Postpone Drop Zone Component  
function PostponeDropZone() {
  const { isOver, setNodeRef } = useDroppable({
    id: 'postpone'
  });

  return (
    <Card 
      ref={setNodeRef}
      className={`border-2 border-dashed transition-colors ${
        isOver 
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' 
          : 'border-orange-300 bg-orange-50 dark:bg-orange-950/20'
      }`}
    >
      <CardContent className="p-6 text-center">
        <div className={`font-medium transition-colors ${
          isOver ? 'text-orange-700 dark:text-orange-300' : 'text-orange-600 dark:text-orange-400'
        }`}>
          🗓️ به تعویق انداختن تا فردا
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {isOver ? 'رها کنید تا به فردا منتقل شود' : 'وظیفه را اینجا بکشید تا به فردا منتقل شود'}
        </div>
      </CardContent>
    </Card>
  );
}