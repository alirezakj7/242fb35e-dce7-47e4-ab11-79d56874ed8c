import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy,
  Medal,
  Star,
  Crown,
  Award,
  Target,
  Sparkles,
  Gem,
  Shield,
  Zap
} from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  requirement: number;
  category: 'tasks' | 'goals' | 'habits';
  unlocked: boolean;
  progress: number;
  color: string;
}

export function AchievementSystem() {
  const { tasks } = useTasks();
  const { goals } = useGoals();
  const { habits } = useHabits();

  const achievements = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const completedGoals = goals.filter(g => g.completed).length;
    const totalHabitCompletions = habits.reduce((total, habit) => {
      const completions = Array.isArray(habit.completions) ? habit.completions : [];
      return total + completions.filter((c: any) => c.completed).length;
    }, 0);

    const taskAchievements: Achievement[] = [
      {
        id: 'task_bronze',
        title: 'شروع کننده',
        description: 'اولین وظیفه را تکمیل کنید',
        icon: Medal,
        requirement: 1,
        category: 'tasks',
        unlocked: completedTasks >= 1,
        progress: Math.min(completedTasks, 1),
        color: 'text-amber-600'
      },
      {
        id: 'task_silver_5',
        title: 'کارآمد',
        description: '۵ وظیفه را تکمیل کنید',
        icon: Award,
        requirement: 5,
        category: 'tasks',
        unlocked: completedTasks >= 5,
        progress: Math.min(completedTasks, 5),
        color: 'text-gray-600'
      },
      {
        id: 'task_gold_10',
        title: 'متعهد',
        description: '۱۰ وظیفه را تکمیل کنید',
        icon: Trophy,
        requirement: 10,
        category: 'tasks',
        unlocked: completedTasks >= 10,
        progress: Math.min(completedTasks, 10),
        color: 'text-yellow-600'
      },
      {
        id: 'task_diamond_25',
        title: 'حرفه‌ای',
        description: '۲۵ وظیفه را تکمیل کنید',
        icon: Gem,
        requirement: 25,
        category: 'tasks',
        unlocked: completedTasks >= 25,
        progress: Math.min(completedTasks, 25),
        color: 'text-blue-600'
      },
      {
        id: 'task_master_50',
        title: 'استاد وظایف',
        description: '۵۰ وظیفه را تکمیل کنید',
        icon: Crown,
        requirement: 50,
        category: 'tasks',
        unlocked: completedTasks >= 50,
        progress: Math.min(completedTasks, 50),
        color: 'text-purple-600'
      },
      {
        id: 'task_legendary_100',
        title: 'افسانه‌ای',
        description: '۱۰۰ وظیفه را تکمیل کنید',
        icon: Star,
        requirement: 100,
        category: 'tasks',
        unlocked: completedTasks >= 100,
        progress: Math.min(completedTasks, 100),
        color: 'text-orange-600'
      },
      {
        id: 'task_warrior_200',
        title: 'جنگجوی وظایف',
        description: '۲۰۰ وظیفه را تکمیل کنید',
        icon: Shield,
        requirement: 200,
        category: 'tasks',
        unlocked: completedTasks >= 200,
        progress: Math.min(completedTasks, 200),
        color: 'text-red-600'
      },
      {
        id: 'task_champion_350',
        title: 'قهرمان',
        description: '۳۵۰ وظیفه را تکمیل کنید',
        icon: Zap,
        requirement: 350,
        category: 'tasks',
        unlocked: completedTasks >= 350,
        progress: Math.min(completedTasks, 350),
        color: 'text-yellow-500'
      },
      {
        id: 'task_supreme_500',
        title: 'برتر مطلق',
        description: '۵۰۰ وظیفه را تکمیل کنید',
        icon: Sparkles,
        requirement: 500,
        category: 'tasks',
        unlocked: completedTasks >= 500,
        progress: Math.min(completedTasks, 500),
        color: 'text-pink-600'
      },
      {
        id: 'task_ultimate_1000',
        title: 'نهایی',
        description: '۱۰۰۰ وظیفه را تکمیل کنید',
        icon: Crown,
        requirement: 1000,
        category: 'tasks',
        unlocked: completedTasks >= 1000,
        progress: Math.min(completedTasks, 1000),
        color: 'text-indigo-600'
      }
    ];

    const goalAchievements: Achievement[] = [
      {
        id: 'goal_bronze',
        title: 'هدف‌گذار',
        description: 'اولین هدف را محقق کنید',
        icon: Target,
        requirement: 1,
        category: 'goals',
        unlocked: completedGoals >= 1,
        progress: Math.min(completedGoals, 1),
        color: 'text-amber-600'
      },
      {
        id: 'goal_silver_3',
        title: 'پیگیر',
        description: '۳ هدف را محقق کنید',
        icon: Award,
        requirement: 3,
        category: 'goals',
        unlocked: completedGoals >= 3,
        progress: Math.min(completedGoals, 3),
        color: 'text-gray-600'
      },
      {
        id: 'goal_gold_5',
        title: 'موفق',
        description: '۵ هدف را محقق کنید',
        icon: Trophy,
        requirement: 5,
        category: 'goals',
        unlocked: completedGoals >= 5,
        progress: Math.min(completedGoals, 5),
        color: 'text-yellow-600'
      },
      {
        id: 'goal_diamond_10',
        title: 'استراتژیست',
        description: '۱۰ هدف را محقق کنید',
        icon: Gem,
        requirement: 10,
        category: 'goals',
        unlocked: completedGoals >= 10,
        progress: Math.min(completedGoals, 10),
        color: 'text-blue-600'
      },
      {
        id: 'goal_master_20',
        title: 'استاد اهداف',
        description: '۲۰ هدف را محقق کنید',
        icon: Crown,
        requirement: 20,
        category: 'goals',
        unlocked: completedGoals >= 20,
        progress: Math.min(completedGoals, 20),
        color: 'text-purple-600'
      },
      {
        id: 'goal_legendary_35',
        title: 'افسانه موفقیت',
        description: '۳۵ هدف را محقق کنید',
        icon: Star,
        requirement: 35,
        category: 'goals',
        unlocked: completedGoals >= 35,
        progress: Math.min(completedGoals, 35),
        color: 'text-orange-600'
      },
      {
        id: 'goal_warrior_50',
        title: 'جنگجوی اهداف',
        description: '۵۰ هدف را محقق کنید',
        icon: Shield,
        requirement: 50,
        category: 'goals',
        unlocked: completedGoals >= 50,
        progress: Math.min(completedGoals, 50),
        color: 'text-red-600'
      },
      {
        id: 'goal_champion_75',
        title: 'قهرمان اهداف',
        description: '۷۵ هدف را محقق کنید',
        icon: Zap,
        requirement: 75,
        category: 'goals',
        unlocked: completedGoals >= 75,
        progress: Math.min(completedGoals, 75),
        color: 'text-yellow-500'
      },
      {
        id: 'goal_supreme_100',
        title: 'برتر مطلق اهداف',
        description: '۱۰۰ هدف را محقق کنید',
        icon: Sparkles,
        requirement: 100,
        category: 'goals',
        unlocked: completedGoals >= 100,
        progress: Math.min(completedGoals, 100),
        color: 'text-pink-600'
      },
      {
        id: 'goal_ultimate_150',
        title: 'نهایی اهداف',
        description: '۱۵۰ هدف را محقق کنید',
        icon: Crown,
        requirement: 150,
        category: 'goals',
        unlocked: completedGoals >= 150,
        progress: Math.min(completedGoals, 150),
        color: 'text-indigo-600'
      }
    ];

    const habitAchievements: Achievement[] = [
      {
        id: 'habit_bronze',
        title: 'عادت‌ساز',
        description: '۷ بار عادت انجام دهید',
        icon: Medal,
        requirement: 7,
        category: 'habits',
        unlocked: totalHabitCompletions >= 7,
        progress: Math.min(totalHabitCompletions, 7),
        color: 'text-amber-600'
      },
      {
        id: 'habit_silver_30',
        title: 'مداوم',
        description: '۳۰ بار عادت انجام دهید',
        icon: Award,
        requirement: 30,
        category: 'habits',
        unlocked: totalHabitCompletions >= 30,
        progress: Math.min(totalHabitCompletions, 30),
        color: 'text-gray-600'
      },
      {
        id: 'habit_gold_100',
        title: 'منظم',
        description: '۱۰۰ بار عادت انجام دهید',
        icon: Trophy,
        requirement: 100,
        category: 'habits',
        unlocked: totalHabitCompletions >= 100,
        progress: Math.min(totalHabitCompletions, 100),
        color: 'text-yellow-600'
      },
      {
        id: 'habit_diamond_250',
        title: 'استقامت',
        description: '۲۵۰ بار عادت انجام دهید',
        icon: Gem,
        requirement: 250,
        category: 'habits',
        unlocked: totalHabitCompletions >= 250,
        progress: Math.min(totalHabitCompletions, 250),
        color: 'text-blue-600'
      },
      {
        id: 'habit_master_500',
        title: 'استاد عادت‌ها',
        description: '۵۰۰ بار عادت انجام دهید',
        icon: Crown,
        requirement: 500,
        category: 'habits',
        unlocked: totalHabitCompletions >= 500,
        progress: Math.min(totalHabitCompletions, 500),
        color: 'text-purple-600'
      },
      {
        id: 'habit_legendary_1000',
        title: 'افسانه انضباط',
        description: '۱۰۰۰ بار عادت انجام دهید',
        icon: Star,
        requirement: 1000,
        category: 'habits',
        unlocked: totalHabitCompletions >= 1000,
        progress: Math.min(totalHabitCompletions, 1000),
        color: 'text-orange-600'
      },
      {
        id: 'habit_warrior_2000',
        title: 'جنگجوی عادت‌ها',
        description: '۲۰۰۰ بار عادت انجام دهید',
        icon: Shield,
        requirement: 2000,
        category: 'habits',
        unlocked: totalHabitCompletions >= 2000,
        progress: Math.min(totalHabitCompletions, 2000),
        color: 'text-red-600'
      },
      {
        id: 'habit_champion_3500',
        title: 'قهرمان انضباط',
        description: '۳۵۰۰ بار عادت انجام دهید',
        icon: Zap,
        requirement: 3500,
        category: 'habits',
        unlocked: totalHabitCompletions >= 3500,
        progress: Math.min(totalHabitCompletions, 3500),
        color: 'text-yellow-500'
      },
      {
        id: 'habit_supreme_5000',
        title: 'برتر مطلق عادت‌ها',
        description: '۵۰۰۰ بار عادت انجام دهید',
        icon: Sparkles,
        requirement: 5000,
        category: 'habits',
        unlocked: totalHabitCompletions >= 5000,
        progress: Math.min(totalHabitCompletions, 5000),
        color: 'text-pink-600'
      },
      {
        id: 'habit_ultimate_10000',
        title: 'نهایی عادت‌ها',
        description: '۱۰۰۰۰ بار عادت انجام دهید',
        icon: Crown,
        requirement: 10000,
        category: 'habits',
        unlocked: totalHabitCompletions >= 10000,
        progress: Math.min(totalHabitCompletions, 10000),
        color: 'text-indigo-600'
      }
    ];

    return [...taskAchievements, ...goalAchievements, ...habitAchievements];
  }, [tasks, goals, habits]);

  const achievementsByCategory = {
    tasks: achievements.filter(a => a.category === 'tasks'),
    goals: achievements.filter(a => a.category === 'goals'),
    habits: achievements.filter(a => a.category === 'habits')
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const renderAchievementCard = (achievement: Achievement) => {
    const Icon = achievement.icon;
    const progressPercentage = (achievement.progress / achievement.requirement) * 100;

    return (
      <Card key={achievement.id} className={`shadow-card hover:shadow-elegant transition-smooth ${achievement.unlocked ? 'bg-gradient-to-br from-background to-secondary/20' : 'opacity-60'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${achievement.unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
              <Icon className={`h-6 w-6 ${achievement.unlocked ? achievement.color : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className={`font-medium ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {achievement.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{JalaliCalendar.toPersianDigits(achievement.progress)}</span>
                  <span>{JalaliCalendar.toPersianDigits(achievement.requirement)}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              {achievement.unlocked && (
                <Badge variant="secondary" className="text-xs">
                  🏆 باز شده
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">🏆 دستاوردها</h1>
        <p className="text-muted-foreground text-sm">
          {JalaliCalendar.toPersianDigits(unlockedCount)} از {JalaliCalendar.toPersianDigits(totalCount)} دستاورد باز شده
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>پیشرفت کلی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>دستاوردهای باز شده</span>
              <span>{JalaliCalendar.toPersianDigits(unlockedCount)}/{JalaliCalendar.toPersianDigits(totalCount)}</span>
            </div>
            <Progress value={(unlockedCount / totalCount) * 100} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">وظایف</TabsTrigger>
          <TabsTrigger value="goals">اهداف</TabsTrigger>
          <TabsTrigger value="habits">عادت‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievementsByCategory.tasks.map(renderAchievementCard)}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievementsByCategory.goals.map(renderAchievementCard)}
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievementsByCategory.habits.map(renderAchievementCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}