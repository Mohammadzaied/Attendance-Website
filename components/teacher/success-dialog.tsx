"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  section: string;
};

export function SuccessDialog({
  open,
  onOpenChange,
  count,
  section,
}: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-right">
            تم تسجيل الغياب بنجاح
          </DialogTitle>
          <DialogDescription className="text-right">
            تم تسجيل غياب {count} طالب/طالبة بنجاح - {section}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            حسناً
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
