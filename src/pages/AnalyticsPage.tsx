import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Target, Calendar, Clock, Trophy } from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';

export default function AnalyticsPage() {
  const { state, wheelOfLifeCategories } = useApp();

  const calculateWheelOfLifeStats = () => {
    const categoryStats = wheelOfLifeCategories.map(category => {
      const categoryTasks = state.tasks.filter(task => task.category === category.key);
      const completedTasks = categoryTasks.filter(task => task.status === 'done');
      const totalTimeSpent = completedTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
      
      return {
        ...category,
        totalTasks: categoryTasks.length,
        completedTasks: completedTasks.length,
        timeSpent: totalTimeSpent,
        completionRate: categoryTasks.length > 0 ? (completedTasks.length / categoryTasks.length) * 100 : 0
      };
    });

    return categoryStats.sort((a, b) => b.timeSpent - a.timeSpent);
  };

  const calculateMonthlyGoalProgress = () => {
    const currentMonth = JalaliCalendar.format(new Date(), 'jYYYY/jMM');
    const monthlyGoals = state.goals.filter(goal => 
      JalaliCalendar.format(goal.deadline, 'jYYYY/jMM') === currentMonth
    );
    
    const completed = monthlyGoals.filter(goal => goal.completed).length;
    return {
      total: monthlyGoals.length,
      completed,
      percentage: monthlyGoals.length > 0 ? (completed / monthlyGoals.length) * 100 : 0
    };
  };

  const calculateHabitConsistency = () => {
    if (state.habits.length === 0) return 0;
    
    const currentMonth = JalaliCalendar.format(new Date(), 'jYYYY/jMM');
    let totalConsistency = 0;
    
    state.habits.forEach(habit => {
      const monthCompletions = habit.completions.filter((completion: any) => 
        completion.date.startsWith(currentMonth)
      );
      
      const completedDays = monthCompletions.filter((c: any) => c.completed).length;
      const totalDays = monthCompletions.length;
      
      if (totalDays > 0) {
        totalConsistency += (completedDays / totalDays) * 100;
      }
    });
    
    return totalConsistency / state.habits.length;
  };

  const calculateProductivityScore = () => {
    const completedTasks = state.tasks.filter(task => task.status === 'done').length;
    const totalTasks = state.tasks.length;
    const habitConsistency = calculateHabitConsistency();
    const goalProgress = calculateMonthlyGoalProgress().percentage;
    
    // Weighted average: 40% tasks, 30% habits, 30% goals
    return Math.round(
      (completedTasks / Math.max(totalTasks, 1)) * 40 +
      habitConsistency * 0.3 +
      goalProgress * 0.3
    );
  };

  const getFinancialSummary = () => {
    const currentMonth = JalaliCalendar.format(new Date(), 'jYYYY/jMM');
    const monthRecords = state.financialRecords.filter(record => 
      JalaliCalendar.format(record.date, 'jYYYY/jMM') === currentMonth
    );
    
    const income = monthRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);
    const expenses = monthRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
    
    return { income, expenses, netFlow: income - expenses };
  };

  const wheelStats = calculateWheelOfLifeStats();
  const goalProgress = calculateMonthlyGoalProgress();
  const habitConsistency = calculateHabitConsistency();
  const productivityScore = calculateProductivityScore();
  const financialSummary = getFinancialSummary();

  return (
    <div className="mobile-container py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">تحلیل و گزارش</h1>
        <p className="text-muted-foreground text-sm">
          بررسی عملکرد و پیشرفت در اهداف زندگی
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Trophy className="text-primary" size={16} />
            </div>
            <div className="text-2xl font-bold text-primary">
              {JalaliCalendar.toPersianDigits(productivityScore)}
            </div>
            <div className="text-xs text-muted-foreground">امتیاز بهره‌وری</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Target className="text-success" size={16} />
            </div>
            <div className="text-2xl font-bold text-success">
              {JalaliCalendar.toPersianDigits(goalProgress.completed)}/{JalaliCalendar.toPersianDigits(goalProgress.total)}
            </div>
            <div className="text-xs text-muted-foreground">اهداف ماه</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Clock className="text-accent" size={16} />
            </div>
            <div className="text-2xl font-bold text-accent">
              {JalaliCalendar.toPersianDigits(Math.round(habitConsistency))}%
            </div>
            <div className="text-xs text-muted-foreground">ثبات عادت‌ها</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingUp className={financialSummary.netFlow >= 0 ? "text-success" : "text-destructive"} size={16} />
            </div>
            <div className={`text-lg font-bold ${financialSummary.netFlow >= 0 ? "text-success" : "text-destructive"}`}>
              {financialSummary.netFlow >= 0 ? '+' : ''}
              {JalaliCalendar.toPersianDigits(Math.round(financialSummary.netFlow / 1000))}K
            </div>
            <div className="text-xs text-muted-foreground">جریان نقدی</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goal Progress */}
      <Card className="mb-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            🎯 پیشرفت اهداف ماه {JalaliCalendar.formatPersian(new Date(), 'jMMMM')}
          </CardTitle>
          <CardDescription>
            وضعیت تحقق اهداف تعیین شده برای این ماه
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm mb-2">
              <span>پیشرفت کلی</span>
              <span>{JalaliCalendar.toPersianDigits(Math.round(goalProgress.percentage))}%</span>
            </div>
            <Progress value={goalProgress.percentage} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-lg font-bold text-primary">
                  {JalaliCalendar.toPersianDigits(goalProgress.total)}
                </div>
                <div className="text-xs text-muted-foreground">کل اهداف</div>
              </div>
              <div className="bg-success/10 rounded-lg p-3">
                <div className="text-lg font-bold text-success">
                  {JalaliCalendar.toPersianDigits(goalProgress.completed)}
                </div>
                <div className="text-xs text-muted-foreground">تکمیل شده</div>
              </div>
              <div className="bg-accent/10 rounded-lg p-3">
                <div className="text-lg font-bold text-accent">
                  {JalaliCalendar.toPersianDigits(goalProgress.total - goalProgress.completed)}
                </div>
                <div className="text-xs text-muted-foreground">در انتظار</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wheel of Life Analysis */}
      <Card className="mb-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            ⚖️ تحلیل چرخه زندگی
          </CardTitle>
          <CardDescription>
            توزیع زمان و انرژی در حوزه‌های مختلف زندگی
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {wheelStats.map((category) => (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {JalaliCalendar.toPersianDigits(category.timeSpent)} ساعت
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {JalaliCalendar.toPersianDigits(Math.round(category.completionRate))}%
                  </span>
                </div>
                <Progress value={category.completionRate} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {JalaliCalendar.toPersianDigits(category.completedTasks)} از {JalaliCalendar.toPersianDigits(category.totalTasks)} وظیفه انجام شده
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Performance */}
      <Card className="mb-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            💰 عملکرد مالی ماه {JalaliCalendar.formatPersian(new Date(), 'jMMMM')}
          </CardTitle>
          <CardDescription>
            خلاصه وضعیت مالی و جریان نقدی
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-success/10 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-success mb-1">
                {JalaliCalendar.toPersianDigits(financialSummary.income.toLocaleString())}
              </div>
              <div className="text-sm text-muted-foreground">درآمد (تومان)</div>
            </div>
            
            <div className="bg-destructive/10 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-destructive mb-1">
                {JalaliCalendar.toPersianDigits(financialSummary.expenses.toLocaleString())}
              </div>
              <div className="text-sm text-muted-foreground">هزینه (تومان)</div>
            </div>
            
            <div className={`rounded-lg p-4 text-center ${
              financialSummary.netFlow >= 0 ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              <div className={`text-lg font-bold mb-1 ${
                financialSummary.netFlow >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {financialSummary.netFlow >= 0 ? '+' : ''}
                {JalaliCalendar.toPersianDigits(financialSummary.netFlow.toLocaleString())}
              </div>
              <div className="text-sm text-muted-foreground">خالص (تومان)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Productivity Insights */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📊 بینش‌های بهره‌وری
          </CardTitle>
          <CardDescription>
            تحلیل الگوهای کاری و پیشنهادات بهبود
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Productivity Score Breakdown */}
            <div className="bg-gradient-primary rounded-lg p-4 text-primary-foreground">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {JalaliCalendar.toPersianDigits(productivityScore)}
                </div>
                <div className="text-sm opacity-90">امتیاز کلی بهره‌وری</div>
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-3">
              {productivityScore >= 80 && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                  <div className="text-success font-medium mb-1">🎉 عملکرد عالی!</div>
                  <div className="text-sm text-muted-foreground">
                    شما در مسیر درستی قرار دارید. این روند را ادامه دهید.
                  </div>
                </div>
              )}
              
              {productivityScore >= 60 && productivityScore < 80 && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                  <div className="text-accent font-medium mb-1">👍 عملکرد خوب</div>
                  <div className="text-sm text-muted-foreground">
                    با کمی تلاش بیشتر می‌توانید به سطح عالی برسید.
                  </div>
                </div>
              )}
              
              {productivityScore < 60 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="text-destructive font-medium mb-1">⚠️ نیاز به بهبود</div>
                  <div className="text-sm text-muted-foreground">
                    بهتر است برنامه‌ریزی و اهداف خود را بازنگری کنید.
                  </div>
                </div>
              )}
              
              {habitConsistency < 50 && state.habits.length > 0 && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                  <div className="text-accent font-medium mb-1">💡 پیشنهاد</div>
                  <div className="text-sm text-muted-foreground">
                    تمرکز بر تعداد کمتری عادت می‌تواند ثبات بیشتری ایجاد کند.
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}