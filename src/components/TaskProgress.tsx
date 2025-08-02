import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { JalaliCalendar } from '@/utils/jalali';

interface TaskProgressProps {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  postponedTasks: number;
}

export function TaskProgress({ totalTasks, completedTasks, inProgressTasks, postponedTasks }: TaskProgressProps) {
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const notStartedTasks = totalTasks - completedTasks - inProgressTasks - postponedTasks;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">پیشرفت کلی</span>
              <span className="text-sm text-muted-foreground">
                {JalaliCalendar.toPersianDigits(Math.round(completionPercentage).toString())}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>

          {/* Task Statistics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {JalaliCalendar.toPersianDigits(completedTasks.toString())}
              </div>
              <div className="text-xs text-muted-foreground">تکمیل شده</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {JalaliCalendar.toPersianDigits(inProgressTasks.toString())}
              </div>
              <div className="text-xs text-muted-foreground">در حال انجام</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">
                {JalaliCalendar.toPersianDigits(notStartedTasks.toString())}
              </div>
              <div className="text-xs text-muted-foreground">شروع نشده</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {JalaliCalendar.toPersianDigits(postponedTasks.toString())}
              </div>
              <div className="text-xs text-muted-foreground">به تعویق افتاده</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}