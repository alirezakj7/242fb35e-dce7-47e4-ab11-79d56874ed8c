import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Target, TrendingUp } from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';
import { wheelOfLifeCategories } from '@/constants/categories';

interface HabitProgressCardProps {
  habit: any;
}

export function HabitProgressCard({ habit }: HabitProgressCardProps) {
  const getCategoryInfo = (categoryKey: string) => {
    return wheelOfLifeCategories.find(cat => cat.key === categoryKey);
  };

  const getMonthlyProgress = () => {
    const currentMonth = JalaliCalendar.format(new Date(), 'jYYYY/jMM');
    const monthCompletions = (habit.completions as any[] || []).filter((completion: any) => 
      completion.date.startsWith(currentMonth)
    );
    
    const completedDays = monthCompletions.filter((c: any) => c.completed).length;
    const totalScheduledDays = getDaysInCurrentMonth();
    
    return {
      completed: completedDays,
      total: totalScheduledDays,
      percentage: totalScheduledDays > 0 ? (completedDays / totalScheduledDays) * 100 : 0
    };
  };

  const getDaysInCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let scheduledDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (habit.days_of_week.includes(dayOfWeek)) {
        scheduledDays++;
      }
    }
    
    return scheduledDays;
  };

  const getWeeklyProgress = () => {
    const startOfWeek = JalaliCalendar.startOfWeek();
    const endOfWeek = JalaliCalendar.endOfWeek();
    
    const weekCompletions = (habit.completions as any[] || []).filter((completion: any) => {
      const completionDate = new Date(completion.date);
      return completionDate >= startOfWeek.toDate() && completionDate <= endOfWeek.toDate();
    });
    
    const completedDays = weekCompletions.filter((c: any) => c.completed).length;
    const scheduledThisWeek = habit.days_of_week.length; // Assuming weekly schedule
    
    return {
      completed: completedDays,
      total: scheduledThisWeek,
      percentage: scheduledThisWeek > 0 ? (completedDays / scheduledThisWeek) * 100 : 0
    };
  };

  const getLongestStreak = () => {
    const completions = (habit.completions as any[] || []).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (const completion of completions) {
      if (completion.completed) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return longestStreak;
  };

  const getAchievementLevel = () => {
    const monthlyProgress = getMonthlyProgress();
    
    if (monthlyProgress.percentage >= 90) return { level: 'ماستر', color: 'text-yellow-500', icon: Trophy };
    if (monthlyProgress.percentage >= 75) return { level: 'حرفه‌ای', color: 'text-blue-500', icon: Target };
    if (monthlyProgress.percentage >= 50) return { level: 'پیشرفته', color: 'text-green-500', icon: TrendingUp };
    return { level: 'مبتدی', color: 'text-gray-500', icon: Target };
  };

  const categoryInfo = getCategoryInfo(habit.category);
  const monthlyProgress = getMonthlyProgress();
  const weeklyProgress = getWeeklyProgress();
  const longestStreak = getLongestStreak();
  const achievement = getAchievementLevel();
  const AchievementIcon = achievement.icon;

  return (
    <Card className="shadow-card hover:shadow-elegant transition-smooth">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">{categoryInfo?.icon}</span>
            {habit.name}
          </div>
          <Badge variant="outline" className={achievement.color}>
            <AchievementIcon size={12} className="mr-1" />
            {achievement.level}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Monthly Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium flex items-center gap-2">
              📅 پیشرفت ماهانه
            </h4>
            <span className="text-sm text-muted-foreground">
              {JalaliCalendar.toPersianDigits(monthlyProgress.completed)}/{JalaliCalendar.toPersianDigits(monthlyProgress.total)}
            </span>
          </div>
          <Progress value={monthlyProgress.percentage} className="h-3" />
          <div className="text-center">
            <span className="text-2xl font-bold text-primary">
              {JalaliCalendar.toPersianDigits(Math.round(monthlyProgress.percentage))}%
            </span>
            <p className="text-xs text-muted-foreground">ثبات در {JalaliCalendar.formatPersian(new Date(), 'jMMMM')}</p>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium flex items-center gap-2">
              📊 هفته جاری
            </h4>
            <span className="text-sm text-muted-foreground">
              {JalaliCalendar.toPersianDigits(weeklyProgress.completed)}/{JalaliCalendar.toPersianDigits(weeklyProgress.total)}
            </span>
          </div>
          <Progress value={weeklyProgress.percentage} className="h-2" />
        </div>

        {/* Streak & Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
              <Flame size={16} />
              <span className="text-lg font-bold">
                {JalaliCalendar.toPersianDigits(habit.streak)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">استریک فعلی</p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Trophy size={16} />
              <span className="text-lg font-bold">
                {JalaliCalendar.toPersianDigits(longestStreak)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">بهترین استریک</p>
          </div>
        </div>

        {/* Achievement Milestones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">🏆 دستاوردها</h4>
          <div className="flex flex-wrap gap-2">
            {monthlyProgress.percentage >= 30 && (
              <Badge variant="secondary" className="text-xs">🎯 ۳۰ روز+</Badge>
            )}
            {habit.streak >= 7 && (
              <Badge variant="secondary" className="text-xs">🔥 یک هفته</Badge>
            )}
            {habit.streak >= 30 && (
              <Badge variant="secondary" className="text-xs">💪 یک ماه</Badge>
            )}
            {longestStreak >= 60 && (
              <Badge variant="secondary" className="text-xs">🏅 ۲ ماه</Badge>
            )}
          </div>
        </div>

        {/* Schedule Info */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">برنامه‌ریزی:</span>
            <div className="flex gap-1">
              {habit.days_of_week.map((dayIndex: number) => {
                const dayNames = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
                return (
                  <span key={dayIndex} className="w-6 h-6 text-xs bg-primary/20 text-primary rounded-full flex items-center justify-center">
                    {dayNames[dayIndex]}
                  </span>
                );
              })}
            </div>
          </div>
          
          {habit.reminder_time && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">یادآوری:</span>
              <span className="font-medium">
                {JalaliCalendar.toPersianDigits(habit.reminder_time)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}