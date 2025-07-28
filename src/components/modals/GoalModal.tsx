import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoalForm } from '@/components/forms/GoalForm';

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'annual' | 'quarterly' | 'financial';
}

export function GoalModal({ open, onOpenChange, defaultType }: GoalModalProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">هدف جدید</DialogTitle>
          <DialogDescription className="text-right">
            هدف جدیدی را به برنامه خود اضافه کنید
          </DialogDescription>
        </DialogHeader>
        <GoalForm onSuccess={handleSuccess} defaultType={defaultType} />
      </DialogContent>
    </Dialog>
  );
}