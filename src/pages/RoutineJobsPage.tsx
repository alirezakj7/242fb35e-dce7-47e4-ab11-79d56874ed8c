import { useState } from 'react';
import { useRoutineJobs } from '@/hooks/useRoutineJobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoutineJobModal } from '@/components/modals/RoutineJobModal';
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { wheelOfLifeCategories } from '@/constants/categories';
import { JalaliCalendar } from '@/utils/jalali';
import { useToast } from '@/hooks/use-toast';

const daysOfWeekMap: Record<string, string> = {
  'saturday': 'ش',
  'sunday': 'ی',
  'monday': 'د',
  'tuesday': 'س',
  'wednesday': 'چ',
  'thursday': 'پ',
  'friday': 'ج'
};

const frequencyMap: Record<string, string> = {
  'daily': 'روزانه',
  'weekly': 'هفتگی',
  'monthly': 'ماهانه'
};

export default function RoutineJobsPage() {
  const { routineJobs, loading, addRoutineJob, updateRoutineJob, deleteRoutineJob, toggleRoutineJobStatus } = useRoutineJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const { toast } = useToast();

  const getCategoryInfo = (categoryKey: string) => {
    return wheelOfLifeCategories.find(cat => cat.key === categoryKey) || {
      icon: '📋',
      label: 'عمومی',
      color: 'gray'
    };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const handleAddJob = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingJob) {
        await updateRoutineJob(editingJob.id, data);
        toast({
          title: 'موفقیت',
          description: 'کار روتین با موفقیت ویرایش شد',
        });
      } else {
        await addRoutineJob(data);
        toast({
          title: 'موفقیت',
          description: 'کار روتین جدید اضافه شد',
        });
      }
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در ذخیره کار روتین',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm('آیا از حذف این کار روتین اطمینان دارید؟')) {
      try {
        await deleteRoutineJob(id);
        toast({
          title: 'موفقیت',
          description: 'کار روتین حذف شد',
        });
      } catch (error) {
        toast({
          title: 'خطا',
          description: 'خطا در حذف کار روتین',
          variant: 'destructive'
        });
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleRoutineJobStatus(id);
      toast({
        title: 'موفقیت',
        description: 'وضعیت کار روتین تغییر کرد',
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در تغییر وضعیت',
        variant: 'destructive'
      });
    }
  };


  const activeJobs = routineJobs.filter(job => job.active);
  const totalMonthlyEarnings = activeJobs.reduce((total, job) => {
    const amount = Number(job.earnings);
    switch (job.frequency) {
      case 'daily':
        return total + (amount * 30);
      case 'weekly':
        return total + (amount * 4);
      case 'monthly':
        return total + amount;
      default:
        return total;
    }
  }, 0);

  if (loading) {
    return (
      <div className="mobile-container py-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">کارهای روتین</h1>
            <p className="text-muted-foreground text-sm">
              مدیریت کارهای تکراری و درآمدزا
            </p>
          </div>
          <Button onClick={handleAddJob} className="gap-2">
            <Plus className="h-4 w-4" />
            افزودن کار
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {JalaliCalendar.toPersianDigits(routineJobs.length)}
                  </p>
                  <p className="text-xs text-muted-foreground">کل کارها</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {JalaliCalendar.toPersianDigits(activeJobs.length)}
                  </p>
                  <p className="text-xs text-muted-foreground">فعال</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {formatAmount(totalMonthlyEarnings)}
                  </p>
                  <p className="text-xs text-muted-foreground">درآمد ماهانه</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Routine Jobs List */}
      <div className="space-y-4">
        {routineJobs.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">کار روتینی ندارید</h3>
              <p className="text-muted-foreground mb-4">
                کارهای تکراری خود را اضافه کنید و درآمدتان را پیگیری کنید
              </p>
              <Button onClick={handleAddJob}>
                <Plus className="h-4 w-4 ml-2" />
                افزودن اولین کار
              </Button>
            </CardContent>
          </Card>
        ) : (
          routineJobs.map((job) => {
            const categoryInfo = getCategoryInfo(job.category);
            const timeSlots = job.time_slots as any[] || [];
            // Convert integer days to string keys for display
            const convertIntegerDaysToStrings = (days: number[]): string[] => {
              const numberToDayString: Record<number, string> = {
                0: 'sunday',
                1: 'monday', 
                2: 'tuesday',
                3: 'wednesday',
                4: 'thursday',
                5: 'friday',
                6: 'saturday'
              };
              return days?.map(day => numberToDayString[day]).filter(day => day !== undefined) || [];
            };
            
            const daysOfWeek = Array.isArray(job.days_of_week) ? convertIntegerDaysToStrings(job.days_of_week) : [];

            return (
              <Card key={job.id} className={`shadow-card hover:shadow-elegant transition-smooth ${!job.active ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <span className="text-xl">{categoryInfo.icon}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{job.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {frequencyMap[job.frequency]}
                          </Badge>
                          <Badge variant={job.active ? "default" : "secondary"} className="text-xs">
                            {job.active ? 'فعال' : 'غیرفعال'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(job.id)}
                      >
                        {job.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">درآمد:</span>
                      <span className="font-medium">
                        {formatAmount(Number(job.earnings))} تومان
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {categoryInfo.label}
                    </span>
                  </div>

                  {daysOfWeek.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-muted-foreground">روزها:</span>
                      <div className="flex gap-1">
                        {daysOfWeek.map(day => (
                          <Badge key={day} variant="outline" className="text-xs px-2">
                            {daysOfWeekMap[day]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {timeSlots.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-muted-foreground">ساعات:</span>
                      <div className="flex gap-2 flex-wrap">
                        {timeSlots.map((slot, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {slot.start_time} - {slot.end_time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <RoutineJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingJob}
      />
    </div>
  );
}