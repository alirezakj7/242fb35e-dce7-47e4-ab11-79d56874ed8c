import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FinancialRecordForm } from "@/components/forms/FinancialRecordForm";
import { useFinancialRecords } from "@/hooks/useFinancialRecords";

type CategoryType = 'career' | 'finance' | 'health' | 'family' | 'personal' | 'spiritual' | 'social' | 'education';

interface FinancialRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: CategoryType;
    date: string;
  };
}

export function FinancialRecordModal({ open, onOpenChange, record }: FinancialRecordModalProps) {
  const { addRecord, updateRecord } = useFinancialRecords();

  const handleSubmit = async (data: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: CategoryType;
    date: string;
  }) => {
    if (record) {
      await updateRecord(record.id, data);
    } else {
      await addRecord(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {record ? "ویرایش تراکنش" : "تراکنش جدید"}
          </DialogTitle>
        </DialogHeader>
        <FinancialRecordForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={record}
        />
      </DialogContent>
    </Dialog>
  );
}