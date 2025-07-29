import { useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';
import { useFinancialRecords } from '@/hooks/useFinancialRecords';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar, 
  Clock, 
  Trophy,
  CheckCircle,
  Circle,
  Wallet,
  Activity,
  PieChart,
  TrendingDown
} from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';
import { wheelOfLifeCategories } from '@/constants/categories';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

export default function AnalyticsPage() {
  const { tasks } = useTasks();
  const { goals } = useGoals();
  const { habits } = useHabits();
  const { records } = useFinancialRecords();

  // Task Analytics
  const taskStats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const notStarted = tasks.filter(t => t.status === 'not_started').length;
    const total = tasks.length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    const categoryData = wheelOfLifeCategories.map(cat => {
      const categoryTasks = tasks.filter(t => t.category === cat.key);
      const categoryCompleted = categoryTasks.filter(t => t.status === 'done').length;
      return {
        category: cat.label,
        icon: cat.icon,
        total: categoryTasks.length,
        completed: categoryCompleted,
        completionRate: categoryTasks.length > 0 ? (categoryCompleted / categoryTasks.length) * 100 : 0
      };
    }).filter(c => c.total > 0);

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionRate,
      categoryData
    };
  }, [tasks]);

  // Goal Analytics
  const goalStats = useMemo(() => {
    const completed = goals.filter(g => g.completed).length;
    const total = goals.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    const typeData = [
      { type: 'سالانه', count: goals.filter(g => g.type === 'annual').length },
      { type: 'فصلی', count: goals.filter(g => g.type === 'quarterly').length },
      { type: 'مالی', count: goals.filter(g => g.type === 'financial').length }
    ].filter(t => t.count > 0);

    const financialGoals = goals.filter(g => g.target_amount && g.target_amount > 0);
    const financialProgress = financialGoals.reduce((total, goal) => {
      return total + (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
    }, 0) / (financialGoals.length || 1);

    return {
      total,
      completed,
      completionRate,
      typeData,
      financialGoals: financialGoals.length,
      financialProgress
    };
  }, [goals]);

  // Habit Analytics
  const habitStats = useMemo(() => {
    const total = habits.length;
    const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0);
    const avgStreak = total > 0 ? totalStreaks / total : 0;
    const maxStreak = Math.max(...habits.map(h => h.streak), 0);
    
    const categoryData = wheelOfLifeCategories.map(cat => {
      const categoryHabits = habits.filter(h => h.category === cat.key);
      const avgCategoryStreak = categoryHabits.length > 0 
        ? categoryHabits.reduce((sum, h) => sum + h.streak, 0) / categoryHabits.length 
        : 0;
      
      return {
        category: cat.label,
        icon: cat.icon,
        count: categoryHabits.length,
        avgStreak: avgCategoryStreak
      };
    }).filter(c => c.count > 0);

    return {
      total,
      avgStreak,
      maxStreak,
      categoryData
    };
  }, [habits]);

  // Financial Analytics
  const financialStats = useMemo(() => {
    const totalIncome = records
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    const totalExpense = records
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + Number(r.amount), 0);
    
    const balance = totalIncome - totalExpense;
    
    const categoryExpenses = wheelOfLifeCategories.map(cat => {
      const amount = records
        .filter(r => r.category === cat.key && r.type === 'expense')
        .reduce((sum, r) => sum + Number(r.amount), 0);
      
      return {
        category: cat.label,
        icon: cat.icon,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      };
    }).filter(c => c.amount > 0);

    // Monthly trend
    const monthlyData = records.reduce((acc, record) => {
      const month = new Date(record.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 };
      }
      if (record.type === 'income') {
        acc[month].income += Number(record.amount);
      } else {
        acc[month].expense += Number(record.amount);
      }
      return acc;
    }, {} as Record<string, { month: string; income: number; expense: number }>);

    const monthlyTrend = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months

    return {
      totalIncome,
      totalExpense,
      balance,
      categoryExpenses,
      monthlyTrend
    };
  }, [records]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  return (
    <div className="mobile-container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">تحلیل و گزارش</h1>
        <p className="text-muted-foreground text-sm">
          بررسی عملکرد و پیشرفت در اهداف زندگی
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">کلی</TabsTrigger>
          <TabsTrigger value="tasks">وظایف</TabsTrigger>
          <TabsTrigger value="goals">اهداف</TabsTrigger>
          <TabsTrigger value="habits">عادت‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      {JalaliCalendar.toPersianDigits(taskStats.completed)}
                    </p>
                    <p className="text-xs text-muted-foreground">وظایف تکمیل شده</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      {JalaliCalendar.toPersianDigits(goalStats.completed)}
                    </p>
                    <p className="text-xs text-muted-foreground">اهداف محقق شده</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      {JalaliCalendar.toPersianDigits(Math.round(habitStats.avgStreak))}
                    </p>
                    <p className="text-xs text-muted-foreground">میانگین عادت</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Wallet className={`h-4 w-4 ${financialStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className={`text-lg font-bold ${financialStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatAmount(financialStats.balance)}
                    </p>
                    <p className="text-xs text-muted-foreground">موجودی</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Chart */}
          {financialStats.monthlyTrend.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>روند مالی ماهانه</CardTitle>
                <CardDescription>درآمد و هزینه در ۶ ماه گذشته</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={financialStats.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [formatAmount(value), '']}
                      labelFormatter={(label) => `ماه: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stackId="1" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name="درآمد"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      stackId="2" 
                      stroke="#ff7c7c" 
                      fill="#ff7c7c" 
                      name="هزینه"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Completion Rate */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>نرخ تکمیل وظایف</CardTitle>
                <CardDescription>
                  {JalaliCalendar.toPersianDigits(Math.round(taskStats.completionRate))}% از وظایف تکمیل شده
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={taskStats.completionRate} className="mb-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>تکمیل شده</span>
                    <span>{JalaliCalendar.toPersianDigits(taskStats.completed)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>در حال انجام</span>
                    <span>{JalaliCalendar.toPersianDigits(taskStats.inProgress)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>شروع نشده</span>
                    <span>{JalaliCalendar.toPersianDigits(taskStats.notStarted)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks by Category */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>وظایف بر اساس دسته‌بندی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taskStats.categoryData.map((category, index) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.category}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {JalaliCalendar.toPersianDigits(category.completed)}/{JalaliCalendar.toPersianDigits(category.total)}
                        </span>
                      </div>
                      <Progress value={category.completionRate} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Goal Completion */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>نرخ دستیابی به اهداف</CardTitle>
                <CardDescription>
                  {JalaliCalendar.toPersianDigits(Math.round(goalStats.completionRate))}% از اهداف محقق شده
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={goalStats.completionRate} className="mb-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>محقق شده</span>
                    <span>{JalaliCalendar.toPersianDigits(goalStats.completed)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>در حال پیگیری</span>
                    <span>{JalaliCalendar.toPersianDigits(goalStats.total - goalStats.completed)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goal Types */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>انواع اهداف</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goalStats.typeData.map((type, index) => (
                    <div key={type.type} className="flex justify-between items-center">
                      <span className="text-sm">{type.type}</span>
                      <Badge variant="outline">
                        {JalaliCalendar.toPersianDigits(type.count)}
                      </Badge>
                    </div>
                  ))}
                  {goalStats.financialGoals > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">اهداف مالی</span>
                        <span className="text-xs text-muted-foreground">
                          {JalaliCalendar.toPersianDigits(Math.round(goalStats.financialProgress))}%
                        </span>
                      </div>
                      <Progress value={goalStats.financialProgress} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Habit Stats */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>آمار عادت‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">تعداد کل عادت‌ها</span>
                    <Badge variant="outline">
                      {JalaliCalendar.toPersianDigits(habitStats.total)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">میانگین پیوستگی</span>
                    <Badge variant="outline">
                      {JalaliCalendar.toPersianDigits(Math.round(habitStats.avgStreak))} روز
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">بهترین پیوستگی</span>
                    <Badge variant="outline">
                      {JalaliCalendar.toPersianDigits(habitStats.maxStreak)} روز
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Habits by Category */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>عادت‌ها بر اساس دسته‌بندی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {habitStats.categoryData.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.category}</span>
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {JalaliCalendar.toPersianDigits(category.count)} عادت
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        میانگین پیوستگی: {JalaliCalendar.toPersianDigits(Math.round(category.avgStreak))} روز
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}