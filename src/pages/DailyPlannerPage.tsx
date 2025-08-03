import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { JalaliCalendar } from '@/utils/jalali';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, Plus, Clock } from 'lucide-react';
import { TaskModal } from '@/components/modals/TaskModal';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { TaskProgress } from '@/components/TaskProgress';
import { TimeBlockSchedule } from '@/components/TimeBlockSchedule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DailyPlannerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const [currentDate, setCurrentDate] = useState(() => {
    if (dateParam) {
      // Convert Persian digits to English and create date
      const englishDateParam = JalaliCalendar.toEnglishDigits(decodeURIComponent(dateParam));
      const parsedDate = new Date(englishDateParam);
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }
    return new Date();
  });
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const { tasks, loading, completeTask, refetch } = useTasks();
  const { toast } = useToast();

  // Navigate to previous/next day
  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = JalaliCalendar.addDays(currentDate, direction === 'next' ? 1 : -1).toDate();
    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get tasks for the current day
  const getDayTasks = () => {
    const dateStr = JalaliCalendar.format(currentDate, 'YYYY-MM-DD');
    return tasks.filter(task => 
      task.scheduled_date === dateStr || 
      (!task.scheduled_date && !task.scheduled_time) // Include unscheduled tasks
    );
  };

  // Get category color for tasks
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

  const handleTaskComplete = async (taskId: string) => {
    try {
      await completeTask(taskId);
      toast({
        title: 'وظیفه تکمیل شد',
        description: 'وظیفه با موفقیت تکمیل شد',
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در تکمیل وظیفه',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="mobile-container py-6 flex items-center justify-center">
        <div className="text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  const dayTasks = getDayTasks();
  const completedTasks = dayTasks.filter(task => task.status === 'done');
  const inProgressTasks = dayTasks.filter(task => task.status === 'in_progress');
  const postponedTasks = dayTasks.filter(task => task.status === 'postponed');
  const pendingTasks = dayTasks.filter(task => task.status !== 'done');

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
            className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            onClick={goToToday}
          >
            {JalaliCalendar.formatPersian(currentDate, 'jDD jMMMM jYYYY')}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/planner/weekly')}
          >
            هفتگی
          </Button>
        </div>
      </div>

      {/* Day Navigation */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateDay('prev')}
          className="flex items-center gap-2"
        >
          <ArrowRight size={16} />
          روز قبل
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateDay('next')}
          className="flex items-center gap-2"
        >
          روز بعد
          <ArrowLeft size={16} />
        </Button>
      </div>

      {/* Task Summary */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {JalaliCalendar.toPersianDigits(pendingTasks.length.toString())}
              </div>
              <div className="text-sm text-muted-foreground">باقی مانده</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {JalaliCalendar.toPersianDigits(completedTasks.length.toString())}
              </div>
              <div className="text-sm text-muted-foreground">تکمیل شده</div>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2"
          >
            <Calendar size={16} />
            لیست
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
            className="flex items-center gap-2"
          >
            <Clock size={16} />
            زمان‌بندی
          </Button>
        </div>

        {/* Daily Progress */}
        {dayTasks.length > 0 && (
          <TaskProgress
            totalTasks={dayTasks.length}
            completedTasks={completedTasks.length}
            inProgressTasks={inProgressTasks.length}
            postponedTasks={postponedTasks.length}
          />
        )}

        {/* Tasks Content */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'timeline')}>
          <TabsContent value="list" className="space-y-4">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">وظایف امروز</h3>
                <div className="space-y-2">
                  {pendingTasks.map(task => (
                    <Card key={task.id} className={`border-l-4 ${getCategoryColor(task.category)}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-muted px-2 py-1 rounded">{task.category}</span>
                              {task.scheduled_time && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {JalaliCalendar.toPersianDigits(task.scheduled_time)}
                                </span>
                              )}
                              {task.tags && task.tags.length > 0 && task.tags.map(tag => (
                                <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">تکمیل شده</h3>
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <Card key={task.id} className="opacity-60">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <h4 className="font-medium line-through">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-muted px-2 py-1 rounded">{task.category}</span>
                              {task.scheduled_time && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {JalaliCalendar.toPersianDigits(task.scheduled_time)}
                                </span>
                              )}
                              {task.tags && task.tags.length > 0 && task.tags.map(tag => (
                                <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {dayTasks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">هیچ وظیفه‌ای برای امروز وجود ندارد</div>
                <Button onClick={() => setTaskModalOpen(true)}>
                  <Plus size={16} className="ml-2" />
                  افزودن وظیفه
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <TimeBlockSchedule 
              tasks={dayTasks}
              currentDate={currentDate}
              onRefetch={refetch}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
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
        defaultDate={currentDate}
      />
    </div>
  );
}