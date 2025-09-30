import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, DollarSign, TrendingUp, TrendingDown, Edit, Trash2, CheckCircle2, Link2 } from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';
import { useFinancialRecords } from '@/hooks/useFinancialRecords';
import { FinancialRecordModal } from '@/components/modals/FinancialRecordModal';
import { wheelOfLifeCategories } from '@/constants/categories';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function FinancePage() {
  const { records, loading, deleteRecord } = useFinancialRecords();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'task' | 'manual'>('all');

  // Filter records based on selected type
  const filteredRecords = records.filter(record => {
    if (filterType === 'task') return record.task_id !== null;
    if (filterType === 'manual') return record.task_id === null && record.routine_job_id === null;
    return true;
  });

  // Calculate totals
  const totalIncome = filteredRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + Number(r.amount), 0);
  
  const totalExpense = filteredRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + Number(r.amount), 0);
  
  const balance = totalIncome - totalExpense;

  const getCategoryLabel = (categoryKey: string) => {
    const category = wheelOfLifeCategories.find(cat => cat.key === categoryKey);
    return category ? `${category.icon} ${category.label}` : categoryKey;
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteRecord(id);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  return (
    <div className="mobile-container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مدیریت مالی</h1>
          <p className="text-muted-foreground text-sm">
            پیگیری درآمد، هزینه‌ها و کارهای ثابت
          </p>
        </div>
        <Button 
          size="sm" 
          className="shadow-elegant"
          onClick={() => {
            setEditingRecord(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} className="ml-1" />
          تراکنش جدید
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">درآمد</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatAmount(totalIncome)} تومان
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">هزینه</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatAmount(totalExpense)} تومان
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">موجودی</p>
                <p className={`text-lg font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatAmount(balance)} تومان
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Records List */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>تراکنش‌ها</CardTitle>
              <CardDescription>
                لیست کامل درآمدها و هزینه‌ها
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
              >
                همه
              </Button>
              <Button 
                size="sm" 
                variant={filterType === 'task' ? 'default' : 'outline'}
                onClick={() => setFilterType('task')}
              >
                از وظایف
              </Button>
              <Button 
                size="sm" 
                variant={filterType === 'manual' ? 'default' : 'outline'}
                onClick={() => setFilterType('manual')}
              >
                دستی
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">در حال بارگذاری...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Wallet size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {filterType === 'all' 
                  ? 'هنوز تراکنشی ثبت نشده است'
                  : filterType === 'task'
                  ? 'هیچ تراکنش مرتبط با وظایفی یافت نشد'
                  : 'هیچ تراکنش دستی یافت نشد'}
              </p>
              <Button 
                onClick={() => {
                  setEditingRecord(null);
                  setModalOpen(true);
                }}
                variant="outline"
              >
                <Plus size={16} className="ml-1" />
                اولین تراکنش را اضافه کنید
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant={record.type === 'income' ? 'default' : 'destructive'}>
                        {record.type === 'income' ? 'درآمد' : 'هزینه'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getCategoryLabel(record.category)}
                      </span>
                      {record.task_id && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>از وظیفه</span>
                        </Badge>
                      )}
                      {record.routine_job_id && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Link2 size={12} />
                          <span>کار روتین</span>
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium">{record.description}</p>
                    {record.tasks && (
                      <p className="text-xs text-muted-foreground">
                        وظیفه: {record.tasks.title}
                      </p>
                    )}
                    {record.routine_jobs && (
                      <p className="text-xs text-muted-foreground">
                        کار روتین: {record.routine_jobs.name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {JalaliCalendar.format(new Date(record.date))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${
                      record.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.type === 'expense' ? '-' : '+'}{formatAmount(Number(record.amount))} تومان
                    </p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit size={14} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>حذف تراکنش</AlertDialogTitle>
                            <AlertDialogDescription>
                              آیا مطمئن هستید که می‌خواهید این تراکنش را حذف کنید؟ این عمل قابل بازگشت نیست.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>انصراف</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(record.id)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FinancialRecordModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingRecord(null);
        }}
        record={editingRecord}
      />
    </div>
  );
}