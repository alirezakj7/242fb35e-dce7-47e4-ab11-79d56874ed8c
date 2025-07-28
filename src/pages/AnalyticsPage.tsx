import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Target, Calendar, Clock, Trophy } from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';
import { wheelOfLifeCategories } from '@/constants/categories';

export default function AnalyticsPage() {
  const { tasks } = useTasks();
  const { goals } = useGoals();
  const { habits } = useHabits();

  return (
    <div className="mobile-container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">تحلیل و گزارش</h1>
        <p className="text-muted-foreground text-sm">
          بررسی عملکرد و پیشرفت در اهداف زندگی
        </p>
      </div>

      <Card className="shadow-card">
        <CardContent className="text-center py-8">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">تحلیل‌ها در حال توسعه است</p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-lg font-bold text-primary">
                {JalaliCalendar.toPersianDigits(tasks.length)}
              </div>
              <div className="text-xs text-muted-foreground">کل وظایف</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-lg font-bold text-success">
                {JalaliCalendar.toPersianDigits(goals.length)}
              </div>
              <div className="text-xs text-muted-foreground">اهداف</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}