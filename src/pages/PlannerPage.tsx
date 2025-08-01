import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JalaliCalendar } from '@/utils/jalali';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, Home } from 'lucide-react';
import { TaskModal } from '@/components/modals/TaskModal';
import { useToast } from '@/hooks/use-toast';

export default function PlannerPage() {
  const navigate = useNavigate();
  const { tasks, loading } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  // Navigate to previous/next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(JalaliCalendar.addMonths(currentDate, direction === 'next' ? 1 : -1).toDate());
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Navigate to daily view
  const handleDayTap = (date: Date) => {
    const dateStr = JalaliCalendar.format(date, 'YYYY-MM-DD');
    navigate(`/planner/daily?date=${dateStr}`);
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

  if (loading) {
    return (
      <div className="mobile-container py-6 flex items-center justify-center">
        <div className="text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

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
      const singleDayTasks = dayTasks.filter(task => !task.end_date).slice(0, 12); // Max 12 dots

      week.push({
        date: currentDay.clone(),
        dayNumber: JalaliCalendar.toPersianDigits(currentDay.format('jDD')),
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

  // Calculate dynamic row height based on max content in each week
  const getWeekHeight = (week: any[]) => {
    const maxContent = Math.max(...week.map(day => 
      day.multiDayEvents.length + Math.ceil(day.singleDayTasks.length / 4)
    ));
    return Math.max(80, 60 + (maxContent * 16)); // Base + content height
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Current Month & Year - Tappable for quick navigation */}
          <button 
            className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            onClick={() => {
              // In real app, this would open month/year picker
              toast({
                title: 'انتخاب ماه',
                description: 'قابلیت انتخاب سریع ماه و سال در حال توسعه',
              });
            }}
          >
            {JalaliCalendar.formatPersian(currentDate, 'jMMMM jYYYY')}
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/planner/weekly')}
            >
              هفتگی
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/planner/daily')}
            >
              روزانه
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="flex items-center gap-2"
            >
              <Home size={14} />
              امروز
            </Button>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="text-muted-foreground hover:text-foreground"
        >
          ← ماه قبل
        </Button>
        <Button
          variant="ghost"
          size="sm" 
          onClick={() => navigateMonth('next')}
          className="text-muted-foreground hover:text-foreground"
        >
          ماه بعد →
        </Button>
      </div>

      {/* Dynamic Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 bg-muted/30 border-b sticky top-[73px] z-5">
          {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, index) => (
            <div 
              key={day} 
              className={`p-3 text-center text-sm font-medium ${
                index >= 5 ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Weeks with Dynamic Heights */}
        <div className="divide-y">
          {weeks.map((week, weekIndex) => (
            <div 
              key={weekIndex}
              className="grid grid-cols-7 divide-x"
              style={{ minHeight: getWeekHeight(week) }}
            >
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`relative p-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                    day.isWeekend && day.isCurrentMonth ? 'bg-destructive/5' : ''
                  } ${
                    !day.isCurrentMonth ? 'opacity-40' : ''
                  } ${
                    day.isToday ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => handleDayTap(day.date.toDate())}
                >
                  {/* Date Number (Top-left corner) */}
                  <div className={`text-sm font-medium mb-2 ${
                    day.isToday ? 'text-primary font-bold' : 
                    day.isWeekend && day.isCurrentMonth ? 'text-destructive' : 
                    'text-foreground'
                  }`}>
                    {day.dayNumber}
                  </div>

                  {/* Multi-Day Event Bars */}
                  <div className="space-y-1 mb-2">
                    {day.multiDayEvents.slice(0, 3).map((event, index) => (
                      <div
                        key={`${event.id}-${index}`}
                        className={`h-2 rounded-full ${getCategoryColor(event.category)} opacity-80 text-xs text-white px-1 flex items-center`}
                        title={event.title}
                      >
                        <span className="truncate text-xs">{event.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Single-Day Task Dots (4x3 grid, max 12) */}
                  <div className="grid grid-cols-4 gap-0.5">
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
                  {day.totalTasks > 12 && (
                    <div className="absolute bottom-1 right-1 text-xs text-muted-foreground bg-background/80 px-1 rounded">
                      +{JalaliCalendar.toPersianDigits(day.totalTasks - 12)}
                    </div>
                  )}

                  {/* Today Indicator */}
                  {day.isToday && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setTaskModalOpen(true)}
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* Task Creation Modal */}
      <TaskModal 
        open={taskModalOpen} 
        onOpenChange={setTaskModalOpen}
        defaultDate={selectedDate || undefined}
      />
    </div>
  );
}