"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ShieldCheck, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType = "success" | "error" | "warning";

interface StatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  type: StatusType;
}

export function StatusDialog({
  isOpen,
  onOpenChange,
  title,
  message,
  type,
}: StatusDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[400px]" dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle
            className={cn(
              "text-right font-bold flex items-center gap-2 text-xl",
              type === "error"
                ? "text-danger"
                : type === "success"
                  ? "text-success"
                  : "text-warning",
            )}
          >
            {type === "error" && <Plus className="h-5 w-5 rotate-45" />}
            {type === "success" && <ShieldCheck className="h-5 w-5" />}
            {type === "warning" && (
              <Settings className="h-5 w-5 animate-spin-slow" />
            )}
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-right text-gray-600 mt-3 leading-relaxed">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className={cn(
              "w-full h-11 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-white border-none cursor-pointer",
              type === "error"
                ? "bg-danger hover:bg-danger-foreground shadow-danger/20"
                : type === "success"
                  ? "bg-success hover:bg-success-foreground shadow-success/20"
                  : "bg-warning hover:bg-warning-foreground shadow-warning/20",
            )}
          >
            موافق
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
