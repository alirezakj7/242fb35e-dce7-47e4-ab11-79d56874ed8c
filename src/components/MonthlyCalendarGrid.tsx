import { JalaliCalendar } from '@/utils/jalali';
import { Card } from '@/components/ui/card';

interface Task {
  id: string;
  title: string;
  category: string;
  status: string;
  scheduled_date?: string;
  end_date?: string;
}

interface MonthlyCalendarGridProps {
  currentDate: Date;
  tasks: Task[];
  onDayTap: (date: Date) => void;
}

export function MonthlyCalendarGrid({ currentDate, tasks, onDayTap }: MonthlyCalendarGridProps) {
  // Get category color for tasks
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'شخصی': 'bg-blue-500',
      'کاری': 'bg-green-500', 
      'خانوادگی': 'bg-orange-500',
      'تفریحی': 'bg-purple-500',
      'ورزشی': 'bg-red-500',
      'مالی': 'bg-yellow-500',
      'آموزشی': 'bg-indigo-500',
      'سلامتی': 'bg-pink-500'
    };
    return categoryColors[category] || 'bg-gray-500';
  };

  // Get tasks for the current month
  const getMonthTasks = () => {
    const startOfMonth = JalaliCalendar.startOfMonth(currentDate);
    const endOfMonth = JalaliCalendar.endOfMonth(currentDate);
    
    return tasks.filter(task => {
      if (!task.scheduled_date) return false;
      const taskDate = new Date(task.scheduled_date);
      return taskDate >= startOfMonth.toDate() && taskDate <= endOfMonth.toDate();
    });
  };

  const monthTasks = getMonthTasks();

  // Build calendar data
  const startOfMonth = JalaliCalendar.startOfMonth(currentDate);
  const endOfMonth = JalaliCalendar.endOfMonth(currentDate);
  const startOfCalendar = JalaliCalendar.startOfWeek(startOfMonth);
  const endOfCalendar = JalaliCalendar.endOfWeek(endOfMonth);

  const weeks = [];
  let currentDay = startOfCalendar.clone();

  while (currentDay.isSameOrBefore(endOfCalendar, 'day')) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const dayTasks = monthTasks.filter(task => 
        task.scheduled_date === currentDay.format('YYYY-MM-DD')
      );
      
      const isToday = JalaliCalendar.isToday(currentDay.toDate());
      const isCurrentMonth = JalaliCalendar.isSameMonth(currentDay.toDate(), currentDate);
      const isWeekend = currentDay.day() === 5 || currentDay.day() === 6; // Friday & Saturday

      // Separate multi-day events from single-day tasks
      const multiDayEvents = dayTasks.filter(task => task.end_date);
      const singleDayTasks = dayTasks.filter(task => !task.end_date).slice(0, 6); // Max 6 dots for cards

      week.push({
        date: currentDay.clone(),
        dayNumber: JalaliCalendar.toPersianDigits(currentDay.format('jDD')),
        dayName: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'][currentDay.day()],
        isToday,
        isCurrentMonth,
        isWeekend,
        singleDayTasks,
        multiDayEvents,
        totalTasks: dayTasks.length
      });

      currentDay.add(1, 'day');
    }
    weeks.push(week);
  }

  return (
    <div className="p-4 space-y-4">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-2">
          {week.map((day, dayIndex) => (
            <div key={dayIndex} className="space-y-1">
              {/* Day Name on Top */}
              <div className={`text-center text-xs font-medium ${
                day.isWeekend ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {day.dayName}
              </div>
              
              {/* Day Card */}
              <Card 
                className={`min-h-[80px] p-2 cursor-pointer transition-all hover:shadow-md ${
                  day.isToday ? 'ring-2 ring-primary bg-primary/5' : ''
                } ${
                  !day.isCurrentMonth ? 'opacity-40' : ''
                } ${
                  day.isWeekend && day.isCurrentMonth ? 'bg-destructive/5' : ''
                }`}
                onClick={() => onDayTap(day.date.toDate())}
              >
                {/* Date Number */}
                <div className={`text-sm font-bold mb-2 ${
                  day.isToday ? 'text-primary' : 
                  day.isWeekend && day.isCurrentMonth ? 'text-destructive' : 
                  'text-foreground'
                }`}>
                  {day.dayNumber}
                </div>

                {/* Multi-Day Event Bars */}
                <div className="space-y-1 mb-2">
                  {day.multiDayEvents.slice(0, 2).map((event, index) => (
                    <div
                      key={`${event.id}-${index}`}
                      className={`h-1.5 rounded-full ${getCategoryColor(event.category)} opacity-80`}
                      title={event.title}
                    />
                  ))}
                </div>

                {/* Single-Day Task Dots */}
                <div className="grid grid-cols-3 gap-1">
                  {day.singleDayTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`w-2 h-2 rounded-full ${getCategoryColor(task.category)} ${
                        task.status === 'done' ? 'opacity-50' : ''
                      }`}
                      title={task.title}
                    />
                  ))}
                </div>

                {/* Task Count Overflow Indicator */}
                {day.totalTasks > 6 && (
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    +{JalaliCalendar.toPersianDigits(day.totalTasks - 6)}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}