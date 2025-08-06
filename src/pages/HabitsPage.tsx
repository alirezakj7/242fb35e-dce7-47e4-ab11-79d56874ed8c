import { useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Circle, Plus, Flame, Target, Calendar, BarChart3 } from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';
import { wheelOfLifeCategories } from '@/constants/categories';
import { HabitModal } from '@/components/modals/HabitModal';
import { HabitCalendar } from '@/components/habits/HabitCalendar';
import { HabitProgressCard } from '@/components/habits/HabitProgressCard';

export default function HabitsPage() {
  const { habits, loading, toggleHabitCompletion } = useHabits();
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');

  const getCategoryInfo = (categoryKey: string) => {
    return wheelOfLifeCategories.find(cat => cat.key === categoryKey);
  };

  const getDayName = (dayIndex: number) => {
    const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    return days[dayIndex];
  };

  const getMonthlyConsistency = (habit: any) => {
    const currentMonth = JalaliCalendar.format(new Date(), 'jYYYY/jMM');
    const monthCompletions = habit.completions.filter((completion: any) => 
      completion.date.startsWith(currentMonth)
    );
    
    const completedDays = monthCompletions.filter((c: any) => c.completed).length;
    const totalScheduledDays = Math.min(monthCompletions.length, JalaliCalendar.getDaysInMonth());
    
    return totalScheduledDays > 0 ? (completedDays / totalScheduledDays) * 100 : 0;
  };

  const renderHabitCard = (habit: any) => {
    const categoryInfo = getCategoryInfo(habit.category);
    const consistency = getMonthlyConsistency(habit);
    const today = JalaliCalendar.format(new Date(), 'jYYYY/jMM/jDD');
    const todayCompletion = habit.completions.find((c: any) => c.date === today);
    const isCompletedToday = todayCompletion?.completed || false;

    return (
      <Card key={habit.id} className="shadow-card hover:shadow-elegant transition-smooth">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">{categoryInfo?.icon}</span>
                {habit.name}
              </CardTitle>
              {habit.description && (
                <CardDescription className="mt-1">
                  {habit.description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {habit.streak > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Flame size={12} className="text-orange-500" />
                  {JalaliCalendar.toPersianDigits(habit.streak)}
                </Badge>
              )}
        <Button
                size="sm"
                variant={isCompletedToday ? "default" : "outline"}
                onClick={() => toggleHabitCompletion(habit.id, today)}
              >
                {isCompletedToday ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Circle size={16} />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Monthly Consistency */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>ثبات ماهانه</span>
                <span>{JalaliCalendar.toPersianDigits(Math.round(consistency))}%</span>
              </div>
              <Progress value={consistency} className="h-2" />
            </div>

            {/* Schedule */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">روزهای برنامه‌ریزی شده:</div>
              <div className="flex flex-wrap gap-1">
                {habit.days_of_week.map((dayIndex: number) => (
                  <Badge key={dayIndex} variant="outline" className="text-xs">
                    {getDayName(dayIndex)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Reminder Time */}
            {habit.reminder_time && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">زمان یادآوری:</span>
                <span className="font-medium">
                  {JalaliCalendar.toPersianDigits(habit.reminder_time)}
                </span>
              </div>
            )}

            {/* Category */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {categoryInfo?.icon} {categoryInfo?.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mobile-container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">عادت‌ها</h1>
          <p className="text-muted-foreground text-sm">
            ردیابی و تقویت عادت‌های مثبت روزانه
          </p>
        </div>
        <Button 
          size="sm" 
          className="shadow-elegant"
          onClick={() => setHabitModalOpen(true)}
        >
          <Plus size={16} className="ml-1" />
          عادت جدید
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {JalaliCalendar.toPersianDigits(habits.length)}
            </div>
            <div className="text-xs text-muted-foreground">کل عادت‌ها</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1">
              {JalaliCalendar.toPersianDigits(
                habits.filter(h => {
                  const today = new Date().toISOString().split('T')[0];
                  const todayCompletion = (h.completions as any[] || []).find((c: any) => c.date === today);
                  return todayCompletion?.completed;
                }).length
              )}
            </div>
            <div className="text-xs text-muted-foreground">انجام شده امروز</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent mb-1 flex items-center justify-center gap-1">
              <Flame size={20} className="text-orange-500" />
              {JalaliCalendar.toPersianDigits(
                Math.max(...habits.map(h => h.streak), 0)
              )}
            </div>
            <div className="text-xs text-muted-foreground">بهترین استریک</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-glow mb-1">
              {JalaliCalendar.toPersianDigits(
                Math.round(
                  habits.length > 0 
                    ? habits.reduce((acc, habit) => acc + getMonthlyConsistency(habit), 0) / habits.length
                    : 0
                )
              )}%
            </div>
            <div className="text-xs text-muted-foreground">میانگین ثبات</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {habits.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Target size={64} className="mx-auto mb-6 opacity-50 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">شروع سفر تغییر</h3>
            <p className="text-muted-foreground mb-6">با ایجاد اولین عادت مثبت، گام اول را به سوی زندگی بهتر بردارید</p>
            <Button 
              size="lg"
              onClick={() => setHabitModalOpen(true)}
              className="shadow-elegant"
            >
              <Plus size={16} className="ml-2" />
              ایجاد اولین عادت
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              امروز
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar size={16} />
              نقشه عادت
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 size={16} />
              پیشرفت
            </TabsTrigger>
          </TabsList>

          {/* Today's Habits */}
          <TabsContent value="today" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🎯 عادت‌های امروز
                </CardTitle>
                <CardDescription>
                  عادت‌هایی که برای امروز برنامه‌ریزی شده‌اند
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {habits.filter(habit => {
                    const today = new Date().getDay();
                    return habit.days_of_week.includes(today);
                  }).map(habit => {
                    const categoryInfo = getCategoryInfo(habit.category);
                    const today = new Date().toISOString().split('T')[0];
                    const todayCompletion = (habit.completions as any[] || []).find((c: any) => c.date === today);
                    const isCompletedToday = todayCompletion?.completed || false;

                    return (
                      <div
                        key={habit.id}
                        className="flex items-center gap-3 p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-smooth"
                      >
                        <Button
                          size="sm"
                          variant={isCompletedToday ? "default" : "outline"}
                          className="shrink-0"
                          onClick={() => toggleHabitCompletion(habit.id, today)}
                        >
                          {isCompletedToday ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <Circle size={16} />
                          )}
                        </Button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{categoryInfo?.icon}</span>
                            <h4 className="font-medium">{habit.name}</h4>
                            {habit.streak > 0 && (
                              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                <Flame size={10} className="text-orange-500" />
                                {JalaliCalendar.toPersianDigits(habit.streak)}
                              </Badge>
                            )}
                          </div>
                          {habit.reminder_time && (
                            <p className="text-sm text-muted-foreground">
                              یادآوری: {JalaliCalendar.toPersianDigits(habit.reminder_time)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* All Habits List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="text-primary" size={20} />
                  <h2 className="font-semibold">همه عادت‌ها</h2>
                </div>
              </div>
              
              <div className="grid gap-4">
                {habits.map(renderHabitCard)}
              </div>
            </div>
          </TabsContent>

          {/* Habit Calendar */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="flex items-center gap-4">
              <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
                <SelectTrigger className="w-[300px] text-right">
                  <SelectValue placeholder="انتخاب عادت برای مشاهده نقشه" />
                </SelectTrigger>
                <SelectContent>
                  {habits.map((habit) => {
                    const categoryInfo = getCategoryInfo(habit.category);
                    return (
                      <SelectItem key={habit.id} value={habit.id}>
                        <div className="flex items-center gap-2">
                          <span>{categoryInfo?.icon}</span>
                          <span>{habit.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <HabitCalendar selectedHabitId={selectedHabitId || habits[0]?.id} />
          </TabsContent>

          {/* Progress Overview */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6">
              {habits.map((habit) => (
                <HabitProgressCard key={habit.id} habit={habit} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      <HabitModal 
        open={habitModalOpen} 
        onOpenChange={setHabitModalOpen}
      />
    </div>
  );
}