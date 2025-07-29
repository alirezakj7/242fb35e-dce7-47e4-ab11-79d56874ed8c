import { useState } from 'react';
import { JalaliCalendar } from '@/utils/jalali';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight, Plus, CheckCircle } from 'lucide-react';
import { TaskModal } from '@/components/modals/TaskModal';
import { useToast } from '@/hooks/use-toast';

export default function PlannerPage() {
  const { tasks, loading, completeTask, updateTask } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('daily');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const { toast } = useToast();

  const navigateDate = (direction: 'prev' | 'next') => {
    if (activeTab === 'daily') {
      setCurrentDate(JalaliCalendar.addDays(currentDate, direction === 'next' ? 1 : -1).toDate());
    } else if (activeTab === 'weekly') {
      setCurrentDate(JalaliCalendar.addDays(currentDate, direction === 'next' ? 7 : -7).toDate());
    } else {
      setCurrentDate(JalaliCalendar.addMonths(currentDate, direction === 'next' ? 1 : -1).toDate());
    }
  };

  const getTodayTasks = () => {
    const today = currentDate.toISOString().split('T')[0];
    return tasks.filter(task => 
      task.scheduled_date === today
    );
  };

  const getWeekTasks = () => {
    const startOfWeek = JalaliCalendar.startOfWeek(currentDate);
    const endOfWeek = JalaliCalendar.endOfWeek(currentDate);
    
    return tasks.filter(task => {
      if (!task.scheduled_date) return false;
      const taskDate = new Date(task.scheduled_date);
      return taskDate >= startOfWeek.toDate() && taskDate <= endOfWeek.toDate();
    });
  };

  const getMonthTasks = () => {
    const startOfMonth = JalaliCalendar.startOfMonth(currentDate);
    const endOfMonth = JalaliCalendar.endOfMonth(currentDate);
    
    return tasks.filter(task => {
      if (!task.scheduled_date) return false;
      const taskDate = new Date(task.scheduled_date);
      return taskDate >= startOfMonth.toDate() && taskDate <= endOfMonth.toDate();
    });
  };

  const getTasksByStatus = (taskList: any[]) => {
    return {
      todo: taskList.filter(t => t.status === 'todo'),
      in_progress: taskList.filter(t => t.status === 'in_progress'),
      done: taskList.filter(t => t.status === 'done'),
      postponed: taskList.filter(t => t.status === 'postponed')
    };
  };

  const formatDisplayDate = () => {
    if (activeTab === 'daily') {
      return JalaliCalendar.formatPersian(currentDate, 'dddd، jDD jMMMM jYYYY');
    } else if (activeTab === 'weekly') {
      const startOfWeek = JalaliCalendar.startOfWeek(currentDate);
      const endOfWeek = JalaliCalendar.endOfWeek(currentDate);
      return `هفته ${JalaliCalendar.format(startOfWeek, 'jDD jMMM')} تا ${JalaliCalendar.format(endOfWeek, 'jDD jMMM')}`;
    } else {
      return JalaliCalendar.formatPersian(currentDate, 'jMMMM jYYYY');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
      toast({
        title: 'وظیفه تکمیل شد',
        description: 'وظیفه با موفقیت تکمیل شد و سوابق مالی ثبت گردید',
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'مشکلی در تکمیل وظیفه پیش آمد',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="mobile-container py-6">در حال بارگذاری...</div>;
  }

  return (
    <div className="mobile-container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">برنامه‌ریزی</h1>
          <p className="text-muted-foreground text-sm">
            مدیریت زمان و برنامه‌ریزی هوشمند
          </p>
        </div>
        <Button 
          size="sm" 
          className="shadow-elegant"
          onClick={() => setTaskModalOpen(true)}
        >
          <Plus size={16} className="ml-1" />
          وظیفه جدید
        </Button>
      </div>

      {/* Date Navigation */}
      <Card className="mb-6 shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronRight size={16} />
            </Button>
            
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                <Calendar size={18} className="text-primary" />
                {formatDisplayDate()}
              </div>
              {JalaliCalendar.isToday(currentDate) && (
                <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                  امروز
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronLeft size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Planner Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">روزانه</TabsTrigger>
          <TabsTrigger value="weekly">هفتگی</TabsTrigger>
          <TabsTrigger value="monthly">ماهانه</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📅 برنامه امروز
              </CardTitle>
              <CardDescription>
                {JalaliCalendar.toPersianDigits(getTodayTasks().length)} وظیفه برای امروز
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getTodayTasks().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>هیچ وظیفه‌ای برای امروز تعریف نشده</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setTaskModalOpen(true)}
                  >
                    <Plus size={14} className="ml-1" />
                    افزودن وظیفه
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getTodayTasks().map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-smooth"
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'done' ? 'bg-success' :
                        task.status === 'in_progress' ? 'bg-accent' :
                        task.status === 'postponed' ? 'bg-destructive' :
                        'bg-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.category} • {task.tags?.join('، ') || ''}
                        </p>
                        {task.financial_type && (
                          <p className="text-xs text-primary mt-1">
                            💰 {task.financial_type === 'earn_once' ? 'درآمد یکباره' : 
                                task.financial_type === 'earn_routine' ? 'درآمد روتین' : 'هزینه'}
                          </p>
                        )}
                      </div>
                      {task.status !== 'done' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-success hover:bg-success/10"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          <CheckCircle size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📊 نمای هفتگی
              </CardTitle>
              <CardDescription>
                {JalaliCalendar.toPersianDigits(getWeekTasks().length)} وظیفه برای این هفته
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const weekTasks = getWeekTasks();
                const tasksByStatus = getTasksByStatus(weekTasks);
                
                return (
                  <div className="space-y-4">
                    {/* Progress Overview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">تکمیل شده</div>
                        <div className="text-lg font-bold text-success">
                          {JalaliCalendar.toPersianDigits(tasksByStatus.done.length)}
                        </div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">باقی مانده</div>
                        <div className="text-lg font-bold text-primary">
                          {JalaliCalendar.toPersianDigits(weekTasks.length - tasksByStatus.done.length)}
                        </div>
                      </div>
                    </div>

                    {/* Tasks by Day */}
                    {(() => {
                      const startOfWeek = JalaliCalendar.startOfWeek(currentDate);
                      const weekDays = Array.from({ length: 7 }, (_, i) => 
                        JalaliCalendar.addDays(startOfWeek, i)
                      );
                      
                      return (
                        <div className="space-y-3">
                          {weekDays.map((day, index) => {
                            const dayTasks = weekTasks.filter(task => 
                              task.scheduled_date === day.format('YYYY-MM-DD')
                            );
                            const dayName = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'][index];
                            
                            return (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-medium">
                                    {dayName} {JalaliCalendar.format(day, 'jDD jMMM')}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {JalaliCalendar.toPersianDigits(dayTasks.length)} وظیفه
                                  </div>
                                </div>
                                {dayTasks.length > 0 ? (
                                  <div className="space-y-2">
                                    {dayTasks.map((task) => (
                                      <div key={task.id} className="flex items-center gap-2 text-sm">
                                        <div className={`w-2 h-2 rounded-full ${
                                          task.status === 'done' ? 'bg-success' :
                                          task.status === 'in_progress' ? 'bg-accent' :
                                          task.status === 'postponed' ? 'bg-destructive' :
                                          'bg-muted-foreground'
                                        }`} />
                                        <span className="flex-1">{task.title}</span>
                                        {task.status !== 'done' && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0 text-success hover:bg-success/10"
                                            onClick={() => handleCompleteTask(task.id)}
                                          >
                                            <CheckCircle size={12} />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">بدون وظیفه</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🗓️ نمای ماهانه
              </CardTitle>
              <CardDescription>
                {JalaliCalendar.toPersianDigits(getMonthTasks().length)} وظیفه برای این ماه
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const monthTasks = getMonthTasks();
                const tasksByStatus = getTasksByStatus(monthTasks);
                
                return (
                  <div className="space-y-4">
                    {/* Monthly Progress */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-success/10 p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground">تکمیل</div>
                        <div className="text-lg font-bold text-success">
                          {JalaliCalendar.toPersianDigits(tasksByStatus.done.length)}
                        </div>
                      </div>
                      <div className="bg-accent/10 p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground">در حال انجام</div>
                        <div className="text-lg font-bold text-accent">
                          {JalaliCalendar.toPersianDigits(tasksByStatus.in_progress.length)}
                        </div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground">منتظر</div>
                        <div className="text-lg font-bold text-muted-foreground">
                          {JalaliCalendar.toPersianDigits(tasksByStatus.todo.length)}
                        </div>
                      </div>
                      <div className="bg-destructive/10 p-3 rounded-lg text-center">
                        <div className="text-xs text-muted-foreground">تأخیر</div>
                        <div className="text-lg font-bold text-destructive">
                          {JalaliCalendar.toPersianDigits(tasksByStatus.postponed.length)}
                        </div>
                      </div>
                    </div>

                    {/* Calendar Grid */}
                    {(() => {
                      const startOfMonth = JalaliCalendar.startOfMonth(currentDate);
                      const endOfMonth = JalaliCalendar.endOfMonth(currentDate);
                      const startOfCalendar = JalaliCalendar.startOfWeek(startOfMonth);
                      const endOfCalendar = JalaliCalendar.endOfWeek(endOfMonth);
                      
                      const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']; // شنبه تا جمعه
                      const calendarDays = [];
                      
                      let currentDay = startOfCalendar.clone();
                      while (currentDay.isSameOrBefore(endOfCalendar, 'day')) {
                        const dayTasks = monthTasks.filter(task => 
                          task.scheduled_date === currentDay.format('YYYY-MM-DD')
                        );
                        
                        const isToday = JalaliCalendar.isToday(currentDay.toDate());
                        const isCurrentMonth = JalaliCalendar.isSameMonth(currentDay.toDate(), currentDate);
                        const isWeekend = currentDay.day() === 5 || currentDay.day() === 6; // جمعه و شنبه
                        
                        calendarDays.push({
                          date: currentDay.clone(),
                          tasks: dayTasks,
                          isToday,
                          isCurrentMonth,
                          isWeekend
                        });
                        
                        currentDay = JalaliCalendar.addDays(currentDay, 1);
                      }
                      
                      // Group by weeks
                      const weeks = [];
                      for (let i = 0; i < calendarDays.length; i += 7) {
                        weeks.push(calendarDays.slice(i, i + 7));
                      }
                      
                      return (
                        <div className="border rounded-lg overflow-hidden">
                          {/* Week Day Headers */}
                          <div className="grid grid-cols-7 bg-muted/30">
                            {weekDays.map((day, index) => (
                              <div 
                                key={index} 
                                className={`p-2 text-center text-sm font-medium ${
                                  index >= 5 ? 'text-destructive' : 'text-foreground'
                                }`}
                              >
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          {/* Calendar Days */}
                          {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="grid grid-cols-7">
                              {week.map((day, dayIndex) => (
                                <div
                                  key={dayIndex}
                                  className={`
                                    relative h-16 p-1 border-r border-b last:border-r-0 transition-smooth
                                    ${day.isCurrentMonth ? 'bg-background hover:bg-muted/20' : 'bg-muted/10'}
                                    ${day.isToday ? 'bg-primary/10 border-primary' : ''}
                                    ${day.isWeekend && day.isCurrentMonth ? 'bg-destructive/5' : ''}
                                  `}
                                >
                                  {/* Day Number */}
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`
                                      text-xs font-medium
                                      ${!day.isCurrentMonth ? 'text-muted-foreground' : 
                                        day.isToday ? 'text-primary font-bold' :
                                        day.isWeekend ? 'text-destructive' : 'text-foreground'}
                                    `}>
                                      {JalaliCalendar.toPersianDigits(day.date.format('jDD'))}
                                    </span>
                                    
                                    {day.isToday && (
                                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    )}
                                  </div>
                                  
                                  {/* Task Indicators */}
                                  {day.tasks.length > 0 && (
                                    <div className="absolute bottom-1 left-1 right-1">
                                      {day.tasks.length <= 3 ? (
                                        <div className="flex gap-1">
                                          {day.tasks.map((task, taskIndex) => (
                                            <div
                                              key={taskIndex}
                                              className={`w-1.5 h-1.5 rounded-full ${
                                                task.status === 'done' ? 'bg-success' :
                                                task.status === 'in_progress' ? 'bg-accent' :
                                                task.status === 'postponed' ? 'bg-destructive' :
                                                'bg-muted-foreground'
                                              }`}
                                              title={task.title}
                                            />
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <div className="flex gap-0.5">
                                            {day.tasks.slice(0, 2).map((task, taskIndex) => (
                                              <div
                                                key={taskIndex}
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                  task.status === 'done' ? 'bg-success' :
                                                  task.status === 'in_progress' ? 'bg-accent' :
                                                  task.status === 'postponed' ? 'bg-destructive' :
                                                  'bg-muted-foreground'
                                                }`}
                                              />
                                            ))}
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            +{JalaliCalendar.toPersianDigits(day.tasks.length - 2)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span>تکمیل شده</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span>در حال انجام</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        <span>منتظر</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-destructive rounded-full"></div>
                        <span>تأخیر/تعطیل</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <TaskModal 
        open={taskModalOpen} 
        onOpenChange={setTaskModalOpen}
        defaultDate={activeTab === 'daily' ? currentDate : undefined}
      />
    </div>
  );
}