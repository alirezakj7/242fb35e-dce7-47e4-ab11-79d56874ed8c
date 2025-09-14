import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JalaliCalendar } from '@/utils/jalali';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Plus, Home } from 'lucide-react';
import { TaskModal } from '@/components/modals/TaskModal';
import { useToast } from '@/hooks/use-toast';
import { MonthlyCalendarGrid } from '@/components/MonthlyCalendarGrid';

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

  // Handle day selection
  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    handleDayTap(date);
  };

  if (loading) {
    return (
      <div className="mobile-container py-6 flex items-center justify-center">
        <div className="text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

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

      {/* Monthly Calendar Grid */}
      <MonthlyCalendarGrid 
        currentDate={currentDate}
        tasks={tasks}
        onDayTap={handleDaySelect}
      />

      {/* Floating Action Button (FAB) */}
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