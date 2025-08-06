import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';
import { useHabits } from '@/hooks/useHabits';
import { wheelOfLifeCategories } from '@/constants/categories';
import { cn } from '@/lib/utils';

interface HabitCalendarProps {
  selectedHabitId?: string;
}

export function HabitCalendar({ selectedHabitId }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { habits, toggleHabitCompletion } = useHabits();

  const selectedHabit = selectedHabitId 
    ? habits.find(h => h.id === selectedHabitId)
    : habits[0]; // Default to first habit if none selected

  const getCategoryInfo = (categoryKey: string) => {
    return wheelOfLifeCategories.find(cat => cat.key === categoryKey);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    return { daysInMonth, startDay };
  };

  const getHabitStatusForDate = (date: string) => {
    if (!selectedHabit) return 'not-scheduled';
    
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    // Check if habit is scheduled for this day
    if (!selectedHabit.days_of_week.includes(dayOfWeek)) {
      return 'not-scheduled';
    }
    
    // Check completion status
    const completion = (selectedHabit.completions as any[] || []).find((c: any) => c.date === date);
    if (completion?.completed) return 'completed';
    
    // Check if it's a past date (missed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    
    if (dateObj < today) return 'missed';
    
    return 'pending';
  };

  const handleDateClick = (date: string) => {
    if (!selectedHabit) return;
    
    const status = getHabitStatusForDate(date);
    if (status === 'not-scheduled') return;
    
    toggleHabitCompletion(selectedHabit.id, date);
  };

  const renderCalendarDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    const status = getHabitStatusForDate(dateString);
    const isToday = JalaliCalendar.isToday(date);
    
    const getStatusColor = () => {
      switch (status) {
        case 'completed':
          return 'bg-success text-success-foreground';
        case 'missed':
          return 'bg-destructive text-destructive-foreground';
        case 'pending':
          return 'bg-primary/20 text-primary border-primary';
        case 'not-scheduled':
        default:
          return 'bg-muted text-muted-foreground';
      }
    };

    const getStatusIcon = () => {
      switch (status) {
        case 'completed':
          return <CheckCircle2 size={12} />;
        case 'missed':
          return <XCircle size={12} />;
        case 'pending':
          return <Circle size={12} />;
        default:
          return null;
      }
    };

    return (
      <Button
        key={day}
        variant="ghost"
        size="sm"
        className={cn(
          "h-10 w-10 p-0 text-sm transition-all hover:scale-105",
          getStatusColor(),
          isToday && "ring-2 ring-primary ring-offset-2",
          status !== 'not-scheduled' && "cursor-pointer"
        )}
        onClick={() => handleDateClick(dateString)}
        disabled={status === 'not-scheduled'}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs">{JalaliCalendar.toPersianDigits(day)}</span>
          {getStatusIcon()}
        </div>
      </Button>
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const { daysInMonth, startDay } = getDaysInMonth();
  const categoryInfo = selectedHabit ? getCategoryInfo(selectedHabit.category) : null;

  // Create calendar grid
  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="h-10 w-10" />
    );
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(renderCalendarDay(day));
  }

  if (!selectedHabit) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">هیچ عادتی برای نمایش وجود ندارد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {categoryInfo && <span className="text-xl">{categoryInfo.icon}</span>}
            نقشه عادت: {selectedHabit.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronRight size={16} />
            </Button>
            <div className="text-sm font-medium min-w-[120px] text-center">
              {JalaliCalendar.formatPersian(currentDate, 'jMMMM jYYYY')}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronLeft size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success"></div>
            <span className="text-xs text-muted-foreground">انجام شده</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive"></div>
            <span className="text-xs text-muted-foreground">از دست رفته</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/20 border border-primary"></div>
            <span className="text-xs text-muted-foreground">برنامه‌ریزی شده</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted"></div>
            <span className="text-xs text-muted-foreground">غیرفعال</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-success">
              {JalaliCalendar.toPersianDigits(
                (selectedHabit.completions as any[] || []).filter((c: any) => 
                  c.completed && c.date.startsWith(JalaliCalendar.format(currentDate, 'jYYYY/jMM'))
                ).length
              )}
            </div>
            <div className="text-xs text-muted-foreground">انجام شده</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {JalaliCalendar.toPersianDigits(selectedHabit.streak)}
            </div>
            <div className="text-xs text-muted-foreground">استریک فعلی</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-accent">
              {JalaliCalendar.toPersianDigits(
                Math.round(
                  (selectedHabit.completions as any[] || []).filter((c: any) => 
                    c.completed && c.date.startsWith(JalaliCalendar.format(currentDate, 'jYYYY/jMM'))
                  ).length / daysInMonth * 100
                ) || 0
              )}%
            </div>
            <div className="text-xs text-muted-foreground">ثبات ماهانه</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}