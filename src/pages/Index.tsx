import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';
import { useFinancialRecords } from '@/hooks/useFinancialRecords';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  Wallet,
  Plus,
  ArrowLeft,
  Flame,
  Clock
} from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';
import { wheelOfLifeCategories } from '@/constants/categories';
import { TaskModal } from '@/components/modals/TaskModal';
import { UserProfile } from '@/components/UserProfile';

const Index = () => {
  const { tasks, loading: tasksLoading } = useTasks();
  const { goals, loading: goalsLoading } = useGoals();
  const { habits, loading: habitsLoading } = useHabits();
  const { records: financialRecords } = useFinancialRecords();
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Get this month's financial summary
  const thisMonth = new Date();
  const monthlyRecords = financialRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === thisMonth.getMonth() && 
           recordDate.getFullYear() === thisMonth.getFullYear();
  });

  const monthlyIncome = monthlyRecords
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + Number(record.amount), 0);

  const monthlyExpense = monthlyRecords
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + Number(record.amount), 0);

  const netCashFlow = monthlyIncome - monthlyExpense;

  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => 
      task.scheduled_date === today
    );
  };

  const getTodayHabits = () => {
    const today = new Date().getDay();
    return habits.filter(habit => 
      habit.days_of_week.includes(today)
    );
  };

  const getActiveGoals = () => {
    return goals.filter(goal => !goal.completed).slice(0, 3);
  };

  const getCategoryInfo = (categoryKey: string) => {
    return wheelOfLifeCategories.find(cat => cat.key === categoryKey);
  };

  const todayTasks = getTodayTasks();
  const todayHabits = getTodayHabits();
  const activeGoals = getActiveGoals();
  
  if (tasksLoading || goalsLoading || habitsLoading) {
    return <div className="mobile-container py-6">در حال بارگذاری...</div>;
  }

  return (
    <div className="mobile-container py-6">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground shadow-glow">
          <h1 className="text-2xl font-bold mb-2">
            سلام! امروز {JalaliCalendar.formatPersian(new Date(), 'dddd')} است
          </h1>
          <p className="opacity-90 text-sm">
            {JalaliCalendar.formatPersian(new Date(), 'jDD jMMMM jYYYY')}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0">
              {JalaliCalendar.toPersianDigits(todayTasks.length)} وظیفه امروز
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0">
              {JalaliCalendar.toPersianDigits(todayHabits.length)} عادت فعال
            </Badge>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <UserProfile />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-4 text-center">
            <Calendar className="mx-auto mb-2 text-primary" size={24} />
            <div className="text-xl font-bold text-primary">
              {JalaliCalendar.toPersianDigits(todayTasks.length)}
            </div>
            <div className="text-xs text-muted-foreground">وظایف امروز</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-4 text-center">
            <Target className="mx-auto mb-2 text-success" size={24} />
            <div className="text-xl font-bold text-success">
              {JalaliCalendar.toPersianDigits(goals.filter(g => !g.completed).length)}
            </div>
            <div className="text-xs text-muted-foreground">اهداف فعال</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="mx-auto mb-2 text-accent" size={24} />
            <div className="text-xl font-bold text-accent">
              {JalaliCalendar.toPersianDigits(habits.length)}
            </div>
            <div className="text-xs text-muted-foreground">عادت‌ها</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-4 text-center">
            <Wallet className="mx-auto mb-2 text-primary" size={24} />
            <div className={`text-xl font-bold ${
              netCashFlow >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {JalaliCalendar.toPersianDigits(Math.abs(netCashFlow).toLocaleString())}
            </div>
            <div className="text-xs text-muted-foreground">جریان نقدی ماه</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card className="mb-6 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                📅 وظایف امروز
              </CardTitle>
              <CardDescription>
                {JalaliCalendar.toPersianDigits(todayTasks.length)} وظیفه برای امروز
              </CardDescription>
            </div>
            <Link to="/planner">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={14} className="ml-1" />
                همه
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayTasks.length === 0 ? (
            <div className="text-center py-6">
              <Calendar size={32} className="mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground text-sm mb-3">هیچ وظیفه‌ای برای امروز تعریف نشده</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTaskModalOpen(true)}
              >
                <Plus size={14} className="ml-1" />
                افزودن وظیفه
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.slice(0, 3).map((task) => {
                const categoryInfo = getCategoryInfo(task.category);
                return (
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{categoryInfo?.icon}</span>
                        <h4 className="font-medium text-sm">{task.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {categoryInfo?.label}
                      </p>
                    </div>
                  </div>
                );
              })}
              {todayTasks.length > 3 && (
                <Link to="/planner">
                  <Button variant="ghost" size="sm" className="w-full">
                    مشاهده {JalaliCalendar.toPersianDigits(todayTasks.length - 3)} وظیفه دیگر
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Habits */}
      <Card className="mb-6 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                🎯 عادت‌های امروز
              </CardTitle>
              <CardDescription>
                {JalaliCalendar.toPersianDigits(todayHabits.length)} عادت برای امروز
              </CardDescription>
            </div>
            <Link to="/habits">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={14} className="ml-1" />
                همه
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayHabits.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 size={32} className="mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground text-sm mb-3">عادتی برای امروز تعریف نشده</p>
              <Link to="/habits">
                <Button variant="outline" size="sm">
                  <Plus size={14} className="ml-1" />
                  ایجاد عادت
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayHabits.map((habit) => {
                const categoryInfo = getCategoryInfo(habit.category);
                const today = new Date().toISOString().split('T')[0];
                const todayCompletion = (habit.completions as any[] || []).find((c: any) => c.date === today);
                const isCompletedToday = todayCompletion?.completed || false;

                return (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-smooth"
                  >
                    <Button
                      size="sm"
                      variant={isCompletedToday ? "default" : "outline"}
                      className="shrink-0 w-8 h-8"
                    >
                      {isCompletedToday ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-current" />
                      )}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{categoryInfo?.icon}</span>
                        <h4 className="font-medium text-sm">{habit.name}</h4>
                        {habit.streak > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                            <Flame size={8} className="text-orange-500" />
                            {JalaliCalendar.toPersianDigits(habit.streak)}
                          </Badge>
                        )}
                      </div>
                      {habit.reminder_time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={10} />
                          {JalaliCalendar.toPersianDigits(habit.reminder_time)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Goals */}
      <Card className="mb-6 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                🎯 اهداف فعال
              </CardTitle>
              <CardDescription>
                اهداف در حال پیگیری
              </CardDescription>
            </div>
            <Link to="/goals">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={14} className="ml-1" />
                همه
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activeGoals.length === 0 ? (
            <div className="text-center py-6">
              <Target size={32} className="mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground text-sm mb-3">هدفی تعریف نشده است</p>
              <Link to="/goals">
                <Button variant="outline" size="sm">
                  <Plus size={14} className="ml-1" />
                  تعریف هدف
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => {
                const categoryInfo = getCategoryInfo(goal.category);
                const progress = goal.type === 'financial' && goal.target_amount && goal.current_amount 
                  ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                  : 0;

                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{categoryInfo?.icon}</span>
                        <h4 className="font-medium text-sm">{goal.title}</h4>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {JalaliCalendar.toPersianDigits(Math.round(progress))}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      مهلت: {JalaliCalendar.formatPersian(goal.deadline, 'jDD jMMMM')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/planner">
          <Card className="shadow-card hover:shadow-elegant transition-smooth cursor-pointer">
            <CardContent className="p-4 text-center">
              <Calendar className="mx-auto mb-2 text-primary" size={32} />
              <div className="font-medium text-sm">برنامه‌ریزی</div>
              <div className="text-xs text-muted-foreground">مدیریت وظایف</div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/analytics">
          <Card className="shadow-card hover:shadow-elegant transition-smooth cursor-pointer">
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 text-accent" size={32} />
              <div className="font-medium text-sm">تحلیل</div>
              <div className="text-xs text-muted-foreground">گزارش عملکرد</div>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <TaskModal 
        open={taskModalOpen} 
        onOpenChange={setTaskModalOpen}
        defaultDate={new Date()}
      />
    </div>
  );
};

export default Index;
