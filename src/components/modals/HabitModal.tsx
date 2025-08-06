import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HabitWizard } from '@/components/forms/HabitWizard';

interface HabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HabitModal({ open, onOpenChange }: HabitModalProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">عادت جدید</DialogTitle>
          <DialogDescription className="text-right">
            عادت جدیدی را به برنامه خود اضافه کنید
          </DialogDescription>
        </DialogHeader>
        <HabitWizard onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}