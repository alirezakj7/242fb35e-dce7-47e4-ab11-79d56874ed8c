import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JalaliCalendar } from '@/utils/jalali';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, Plus } from 'lucide-react';
import { TaskModal } from '@/components/modals/TaskModal';
import { Card, CardContent } from '@/components/ui/card';

export default function WeeklyPlannerPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { tasks, loading, refetch } = useTasks();

  // Navigate to previous/next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = JalaliCalendar.addDays(currentDate, direction === 'next' ? 7 : -7).toDate();
    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get start of current week
  const getWeekStart = () => {
    return JalaliCalendar.startOfWeek(currentDate);
  };

  // Get week days
  const getWeekDays = () => {
    const weekStart = getWeekStart();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = weekStart.clone().add(i, 'days');
      const dateStr = day.format('YYYY-MM-DD');
      const dayTasks = tasks.filter(task => task.scheduled_date === dateStr);
      
      days.push({
        date: day.toDate(),
        dayName: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'][i],
        dayNumber: JalaliCalendar.toPersianDigits(day.format('jDD')),
        isToday: JalaliCalendar.isToday(day.toDate()),
        isWeekend: i >= 5, // Friday & Saturday
        tasks: dayTasks
      });
    }
    
    return days;
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

  const handleDayTap = (date: Date) => {
    navigate(`/planner/daily?date=${JalaliCalendar.format(date, 'YYYY-MM-DD')}`);
  };

  const handleAddTask = (date: Date) => {
    setSelectedDate(date);
    setTaskModalOpen(true);
  };

  if (loading) {
    return (
      <div className="mobile-container py-6 flex items-center justify-center">
        <div className="text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  const weekDays = getWeekDays();
  const weekStart = getWeekStart();
  const weekEnd = weekStart.clone().add(6, 'days');

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/planner')}
            className="flex items-center gap-2"
          >
            <Calendar size={16} />
            ماهانه
          </Button>
          
          <button 
            className="text-lg font-bold text-foreground hover:text-primary transition-colors"
            onClick={goToToday}
          >
            {JalaliCalendar.formatPersian(weekStart.toDate(), 'jDD jMMMM')} - {JalaliCalendar.formatPersian(weekEnd.toDate(), 'jDD jMMMM')}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/planner/daily')}
          >
            روزانه
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateWeek('prev')}
          className="flex items-center gap-2"
        >
          <ArrowRight size={16} />
          هفته قبل
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateWeek('next')}
          className="flex items-center gap-2"
        >
          هفته بعد
          <ArrowLeft size={16} />
        </Button>
      </div>

      {/* Week View */}
      <div className="p-4">
        <div className="space-y-4">
          {weekDays.map((day, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                day.isToday ? 'ring-2 ring-primary' : ''
              } ${
                day.isWeekend ? 'bg-destructive/5' : ''
              }`}
              onClick={() => handleDayTap(day.date)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`text-lg font-bold ${
                      day.isToday ? 'text-primary' : 
                      day.isWeekend ? 'text-destructive' : 
                      'text-foreground'
                    }`}>
                      {day.dayName}
                    </div>
                    <div className={`text-xl font-bold ${
                      day.isToday ? 'text-primary' : 
                      day.isWeekend ? 'text-destructive' : 
                      'text-foreground'
                    }`}>
                      {day.dayNumber}
                    </div>
                    {day.isToday && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {JalaliCalendar.toPersianDigits(day.tasks.length.toString())} وظیفه
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTask(day.date);
                      }}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                {/* Tasks for this day */}
                <div className="space-y-2">
                  {day.tasks.slice(0, 4).map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-2 p-2 rounded border-l-4 ${getCategoryColor(task.category).replace('bg-', 'border-l-')} bg-muted/30`}
                    >
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(task.category)} ${
                        task.status === 'done' ? 'opacity-50' : ''
                      }`}></div>
                      <span className={`text-sm ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  
                  {day.tasks.length > 4 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{JalaliCalendar.toPersianDigits((day.tasks.length - 4).toString())} وظیفه دیگر
                    </div>
                  )}
                  
                  {day.tasks.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      هیچ وظیفه‌ای وجود ندارد
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-6 z-[60] md:bottom-6">
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