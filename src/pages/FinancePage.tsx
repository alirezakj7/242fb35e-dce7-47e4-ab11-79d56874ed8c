import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Plus, DollarSign } from 'lucide-react';
import { JalaliCalendar } from '@/utils/jalali';

export default function FinancePage() {
  return (
    <div className="mobile-container py-6">
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

      <Card className="shadow-card">
        <CardContent className="text-center py-8">
          <Wallet size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">مدیریت مالی در حال توسعه است</p>
        </CardContent>
      </Card>
    </div>
  );
}