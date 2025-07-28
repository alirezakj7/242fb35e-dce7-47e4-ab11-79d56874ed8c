import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm } from '@/components/forms/TaskForm';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}

export function TaskModal({ open, onOpenChange, defaultDate }: TaskModalProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">وظیفه جدید</DialogTitle>
          <DialogDescription className="text-right">
            وظیفه جدیدی را به برنامه خود اضافه کنید
          </DialogDescription>
        </DialogHeader>
        <TaskForm onSuccess={handleSuccess} defaultDate={defaultDate} />
      </DialogContent>
    </Dialog>
  );
}