import { useState } from 'react';
import { JalaliCalendar } from '@/utils/jalali';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function PlannerPage() {
  const { state } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('daily');

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
    const today = JalaliCalendar.format(currentDate, 'jYYYY/jMM/jDD');
    return state.tasks.filter(task => 
      task.scheduledDate && JalaliCalendar.format(task.scheduledDate, 'jYYYY/jMM/jDD') === today
    );
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
        <Button size="sm" className="shadow-elegant">
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
                  <Button variant="outline" size="sm" className="mt-3">
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
                          {task.category} • {task.tags.join('، ')}
                        </p>
                      </div>
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
                برنامه‌ریزی و مرور کلی هفته
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>نمای هفتگی در حال توسعه است</p>
              </div>
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
                برنامه‌ریزی بلندمدت و اهداف ماهانه
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>نمای ماهانه در حال توسعه است</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}