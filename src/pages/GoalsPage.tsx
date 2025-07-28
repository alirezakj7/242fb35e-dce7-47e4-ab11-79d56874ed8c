import { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Trophy, TrendingUp } from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';
import { wheelOfLifeCategories } from '@/constants/categories';
import { GoalModal } from '@/components/modals/GoalModal';

export default function GoalsPage() {
  const { goals, loading } = useGoals();
  const [activeTab, setActiveTab] = useState('annual');
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalModalType, setGoalModalType] = useState<'annual' | 'quarterly' | 'financial'>('annual');

  const getGoalsByType = (type: 'annual' | 'quarterly' | 'financial') => {
    return goals.filter(goal => goal.type === type);
  };

  const calculateProgress = (goal: any) => {
    if (goal.type === 'financial' && goal.target_amount && goal.current_amount) {
      return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    }
    return goal.completed ? 100 : 0;
  };

  const getCategoryInfo = (categoryKey: string) => {
    return wheelOfLifeCategories.find(cat => cat.key === categoryKey);
  };

  const openGoalModal = (type: 'annual' | 'quarterly' | 'financial') => {
    setGoalModalType(type);
    setGoalModalOpen(true);
  };

  const renderGoalCard = (goal: any) => {
    const progress = calculateProgress(goal);
    const categoryInfo = getCategoryInfo(goal.category);
    const isOverdue = new Date(goal.deadline) < new Date() && !goal.completed;

    return (
      <Card key={goal.id} className="shadow-card hover:shadow-elegant transition-smooth">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">{categoryInfo?.icon}</span>
                {goal.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {goal.description}
              </CardDescription>
            </div>
            <Badge variant={goal.completed ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
              {goal.completed ? 'تکمیل شده' : isOverdue ? 'عقب‌افتاده' : 'در حال انجام'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>پیشرفت</span>
                <span>{JalaliCalendar.toPersianDigits(Math.round(progress))}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Financial Details */}
            {goal.type === 'financial' && goal.target_amount && (
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>هدف مالی:</span>
                  <span className="font-medium">
                    {JalaliCalendar.toPersianDigits(goal.target_amount.toLocaleString())} تومان
                  </span>
                </div>
                {goal.current_amount && (
                  <div className="flex justify-between text-sm mt-1">
                    <span>مبلغ فعلی:</span>
                    <span className="font-medium text-success">
                      {JalaliCalendar.toPersianDigits(goal.current_amount.toLocaleString())} تومان
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Deadline */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>مهلت انجام:</span>
              <span>{JalaliCalendar.formatPersian(goal.deadline, 'jDD jMMMM jYYYY')}</span>
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

  if (loading) {
    return <div className="mobile-container py-6">در حال بارگذاری...</div>;
  }

  return (
    <div className="mobile-container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">اهداف</h1>
          <p className="text-muted-foreground text-sm">
            تعیین و پیگیری اهداف شخصی و حرفه‌ای
          </p>
        </div>
        <Button 
          size="sm" 
          className="shadow-elegant"
          onClick={() => openGoalModal('annual')}
        >
          <Plus size={16} className="ml-1" />
          هدف جدید
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {JalaliCalendar.toPersianDigits(goals.length)}
            </div>
            <div className="text-xs text-muted-foreground">کل اهداف</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1">
              {JalaliCalendar.toPersianDigits(goals.filter(g => g.completed).length)}
            </div>
            <div className="text-xs text-muted-foreground">تکمیل شده</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent mb-1">
              {JalaliCalendar.toPersianDigits(goals.filter(g => g.type === 'financial').length)}
            </div>
            <div className="text-xs text-muted-foreground">اهداف مالی</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-glow mb-1">
              {JalaliCalendar.toPersianDigits(
                Math.round(
                  goals.length > 0 
                    ? (goals.filter(g => g.completed).length / goals.length) * 100 
                    : 0
                )
              )}%
            </div>
            <div className="text-xs text-muted-foreground">نرخ موفقیت</div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="annual">ساليانه</TabsTrigger>
          <TabsTrigger value="quarterly">فصلی</TabsTrigger>
          <TabsTrigger value="financial">مالی</TabsTrigger>
        </TabsList>

        <TabsContent value="annual" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-primary" size={20} />
            <h2 className="font-semibold">اهداف ساليانه</h2>
          </div>
          
          {getGoalsByType('annual').length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="text-center py-8">
                <Target size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">هنوز هدف ساليانه‌ای تعریف نکرده‌اید</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openGoalModal('annual')}
                >
                  <Plus size={14} className="ml-1" />
                  تعریف هدف ساليانه
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {getGoalsByType('annual').map(renderGoalCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary" size={20} />
            <h2 className="font-semibold">اهداف فصلی</h2>
          </div>
          
          {getGoalsByType('quarterly').length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="text-center py-8">
                <Target size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">هنوز هدف فصلی‌ای تعریف نکرده‌اید</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openGoalModal('quarterly')}
                >
                  <Plus size={14} className="ml-1" />
                  تعریف هدف فصلی
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {getGoalsByType('quarterly').map(renderGoalCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💰</span>
            <h2 className="font-semibold">اهداف مالی</h2>
          </div>
          
          {getGoalsByType('financial').length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="text-center py-8">
                <Target size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">هنوز هدف مالی‌ای تعریف نکرده‌اید</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openGoalModal('financial')}
                >
                  <Plus size={14} className="ml-1" />
                  تعریف هدف مالی
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {getGoalsByType('financial').map(renderGoalCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <GoalModal 
        open={goalModalOpen} 
        onOpenChange={setGoalModalOpen}
        defaultType={goalModalType}
      />
    </div>
  );
}