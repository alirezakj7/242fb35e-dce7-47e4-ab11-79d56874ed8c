import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RoutineJobForm } from '@/components/forms/RoutineJobForm';

interface RoutineJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export function RoutineJobModal({ isOpen, onClose, onSubmit, initialData }: RoutineJobModalProps) {
  const handleSubmit = async (data: any) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'ویرایش کار روتین' : 'افزودن کار روتین'}
          </DialogTitle>
        </DialogHeader>
        <RoutineJobForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}