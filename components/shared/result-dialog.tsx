"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  variant?: "default" | "destructive";
  onClose?: () => void;
}

export function ResultDialog({
  open,
  onOpenChange,
  title,
  message,
  variant = "default",
  onClose,
}: ResultDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
    if (onClose) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl" dir="rtl">
        <div className="flex flex-col items-center text-center py-4 space-y-4">
          <div
            className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center",
              variant === "destructive"
                ? "bg-danger-light text-danger"
                : "bg-success-light text-success",
            )}
          >
            {variant === "destructive" ? (
              <AlertCircle className="h-10 w-10" />
            ) : (
              <CheckCircle className="h-10 w-10" />
            )}
          </div>

          <DialogHeader className="text-center w-full">
            <DialogTitle
              className={cn(
                "text-2xl font-black text-center w-full",
                variant === "destructive"
                  ? "text-danger"
                  : "text-success",
              )}
            >
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="text-gray-600 font-bold text-lg px-2">{message}</div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleClose}
            className="w-full rounded-xl font-bold bg-gray-900 hover:bg-gray-800 cursor-pointer"
          >
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
