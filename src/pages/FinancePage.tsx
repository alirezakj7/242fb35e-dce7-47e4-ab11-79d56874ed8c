import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';

export default function FinancePage() {
  const { state, wheelOfLifeCategories } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const getCurrentMonthRecords = () => {
    const currentMonth = JalaliCalendar.format(new Date(), 'jYYYY/jMM');
    return state.financialRecords.filter(record => 
      JalaliCalendar.format(record.date, 'jYYYY/jMM') === currentMonth
    );
  };

  const calculateMonthlyStats = () => {
    const monthRecords = getCurrentMonthRecords();
    const income = monthRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);
    const expenses = monthRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
    
    return {
      income,
      expenses,
      netFlow: income - expenses,
      transactions: monthRecords.length
    };
  };

  const getCategoryInfo = (categoryKey: string) => {
    return wheelOfLifeCategories.find(cat => cat.key === categoryKey);
  };

  const renderRoutineJobCard = (job: any) => {
    const categoryInfo = getCategoryInfo(job.category);
    const monthlyEarnings = state.financialRecords
      .filter(r => r.routineJobId === job.id && r.type === 'income')
      .filter(r => JalaliCalendar.format(r.date, 'jYYYY/jMM') === JalaliCalendar.format(new Date(), 'jYYYY/jMM'))
      .reduce((sum, r) => sum + r.amount, 0);

    return (
      <Card key={job.id} className="shadow-card hover:shadow-elegant transition-smooth">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">{categoryInfo?.icon}</span>
                {job.name}
              </CardTitle>
              <CardDescription className="mt-1">
                درآمد: {JalaliCalendar.toPersianDigits(job.earnings.toLocaleString())} تومان
              </CardDescription>
            </div>
            <Badge variant={job.active ? 'default' : 'secondary'}>
              {job.active ? 'فعال' : 'غیرفعال'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* Monthly Earnings */}
            <div className="bg-success/10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">درآمد این ماه:</span>
                <span className="font-medium text-success">
                  {JalaliCalendar.toPersianDigits(monthlyEarnings.toLocaleString())} تومان
                </span>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">برنامه کاری:</div>
              <div className="text-sm">
                {job.schedule.frequency === 'daily' && 'روزانه'}
                {job.schedule.frequency === 'weekly' && 'هفتگی'}
                {job.schedule.frequency === 'monthly' && 'ماهانه'}
              </div>
              
              {job.schedule.daysOfWeek && job.schedule.daysOfWeek.length > 0 && (
                <div className="mt-1">
                  <div className="flex flex-wrap gap-1">
                    {job.schedule.daysOfWeek.map((dayIndex: number) => {
                      const days = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
                      return (
                        <Badge key={dayIndex} variant="outline" className="text-xs">
                          {days[dayIndex]}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

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

  const stats = calculateMonthlyStats();

  return (
    <div className="mobile-container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مدیریت مالی</h1>
          <p className="text-muted-foreground text-sm">
            پیگیری درآمد، هزینه‌ها و کارهای ثابت
          </p>
        </div>
        <Button size="sm" className="shadow-elegant">
          <Plus size={16} className="ml-1" />
          تراکنش جدید
        </Button>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingUp className="text-success" size={16} />
              <span className="text-xs text-muted-foreground">درآمد</span>
            </div>
            <div className="text-lg font-bold text-success">
              {JalaliCalendar.toPersianDigits(stats.income.toLocaleString())}
            </div>
            <div className="text-xs text-muted-foreground">تومان</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <TrendingDown className="text-destructive" size={16} />
              <span className="text-xs text-muted-foreground">هزینه</span>
            </div>
            <div className="text-lg font-bold text-destructive">
              {JalaliCalendar.toPersianDigits(stats.expenses.toLocaleString())}
            </div>
            <div className="text-xs text-muted-foreground">تومان</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Wallet className={stats.netFlow >= 0 ? "text-success" : "text-destructive"} size={16} />
              <span className="text-xs text-muted-foreground">خالص</span>
            </div>
            <div className={`text-lg font-bold ${stats.netFlow >= 0 ? "text-success" : "text-destructive"}`}>
              {JalaliCalendar.toPersianDigits(Math.abs(stats.netFlow).toLocaleString())}
            </div>
            <div className="text-xs text-muted-foreground">تومان</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <DollarSign className="text-primary" size={16} />
              <span className="text-xs text-muted-foreground">تراکنش</span>
            </div>
            <div className="text-lg font-bold text-primary">
              {JalaliCalendar.toPersianDigits(stats.transactions)}
            </div>
            <div className="text-xs text-muted-foreground">این ماه</div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="jobs">کارهای ثابت</TabsTrigger>
          <TabsTrigger value="transactions">تراکنش‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📊 خلاصه مالی ماه {JalaliCalendar.formatPersian(new Date(), 'jMMMM')}
              </CardTitle>
              <CardDescription>
                وضعیت مالی فعلی و عملکرد ماهانه
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Month Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-success/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="text-success" size={20} />
                      <span className="font-medium">کل درآمد</span>
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {JalaliCalendar.toPersianDigits(stats.income.toLocaleString())} تومان
                    </div>
                  </div>
                  
                  <div className="bg-destructive/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="text-destructive" size={20} />
                      <span className="font-medium">کل هزینه</span>
                    </div>
                    <div className="text-2xl font-bold text-destructive">
                      {JalaliCalendar.toPersianDigits(stats.expenses.toLocaleString())} تومان
                    </div>
                  </div>
                </div>

                {/* Net Flow */}
                <div className={`rounded-lg p-4 ${stats.netFlow >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className={stats.netFlow >= 0 ? "text-success" : "text-destructive"} size={20} />
                    <span className="font-medium">جریان نقدی خالص</span>
                  </div>
                  <div className={`text-2xl font-bold ${stats.netFlow >= 0 ? "text-success" : "text-destructive"}`}>
                    {stats.netFlow >= 0 ? '+' : '-'}{JalaliCalendar.toPersianDigits(Math.abs(stats.netFlow).toLocaleString())} تومان
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.netFlow >= 0 ? 'عملکرد مثبت این ماه' : 'نیاز به کنترل هزینه‌ها'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="text-primary" size={20} />
              <h2 className="font-semibold">کارهای ثابت</h2>
            </div>
            <Button variant="outline" size="sm">
              <Plus size={14} className="ml-1" />
              کار جدید
            </Button>
          </div>
          
          {state.routineJobs.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="text-center py-8">
                <Briefcase size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">هنوز کار ثابتی تعریف نکرده‌اید</p>
                <Button variant="outline" size="sm">
                  <Plus size={14} className="ml-1" />
                  تعریف کار ثابت
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {state.routineJobs.map(renderRoutineJobCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="text-primary" size={20} />
              <h2 className="font-semibold">تراکنش‌های اخیر</h2>
            </div>
            <Button variant="outline" size="sm">
              <Plus size={14} className="ml-1" />
              تراکنش جدید
            </Button>
          </div>
          
          {getCurrentMonthRecords().length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="text-center py-8">
                <DollarSign size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">هیچ تراکنشی برای این ماه ثبت نشده</p>
                <Button variant="outline" size="sm">
                  <Plus size={14} className="ml-1" />
                  ثبت تراکنش
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {getCurrentMonthRecords()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((record) => {
                  const categoryInfo = getCategoryInfo(record.category);
                  return (
                    <Card key={record.id} className="shadow-card">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              record.type === 'income' ? 'bg-success' : 'bg-destructive'
                            }`} />
                            <div>
                              <div className="font-medium">{record.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {categoryInfo?.icon} {categoryInfo?.label} • {JalaliCalendar.formatPersian(record.date, 'jDD jMMMM')}
                              </div>
                            </div>
                          </div>
                          <div className={`font-bold ${
                            record.type === 'income' ? 'text-success' : 'text-destructive'
                          }`}>
                            {record.type === 'income' ? '+' : '-'}{JalaliCalendar.toPersianDigits(record.amount.toLocaleString())}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}