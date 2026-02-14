"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface WarningManagementDialogsProps {
  isReviewDialogOpen: boolean;
  setIsReviewDialogOpen: (open: boolean) => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  extensionClasses: number;
  setExtensionClasses: (classes: number) => void;
  isRejecting: boolean;
  onConfirmReview: () => void;
  isApproveDialogOpen: boolean;
  setIsApproveDialogOpen: (open: boolean) => void;
  onConfirmApprove: () => void;
  isApproving: boolean;
  resultDialog: {
    open: boolean;
    title: string;
    message: string;
    variant: "default" | "destructive";
  };
  setResultDialog: (dialog: any) => void;
}

export function WarningManagementDialogs({
  isReviewDialogOpen,
  setIsReviewDialogOpen,
  rejectionReason,
  setRejectionReason,
  extensionClasses,
  setExtensionClasses,
  isRejecting,
  onConfirmReview,
  isApproveDialogOpen,
  setIsApproveDialogOpen,
  onConfirmApprove,
  isApproving,
  resultDialog,
  setResultDialog,
}: WarningManagementDialogsProps) {
  return (
    <>
      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black text-gray-900 text-right">
              مراجعة حالة الحرمان
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">
                سبب المراجعة (السبب)
              </Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="أدخل سبب تمديد فترة الغياب..."
                className="h-24 bg-gray-50/50 border-gray-100 rounded-xl focus:ring-blue-500/20 text-right"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">
                فترة التمديد (عدد الحصص الإضافية)
              </Label>
              <Input
                type="number"
                value={extensionClasses}
                onChange={(e) =>
                  setExtensionClasses(parseInt(e.target.value) || 0)
                }
                className="h-11 bg-gray-50/50 border-gray-100 rounded-xl focus:ring-blue-500/20 text-right"
                placeholder="0"
                min={0}
                dir="rtl"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setIsReviewDialogOpen(false)}
              className="rounded-xl font-bold"
            >
              إلغاء
            </Button>
            <Button
              onClick={onConfirmReview}
              disabled={isRejecting}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold px-8"
            >
              {isRejecting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  جاري الإرسال...
                </>
              ) : (
                "رفض"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black text-gray-900 text-right">
              تأكيد الإنذار
            </DialogTitle>
          </DialogHeader>

          <div className="py-8 text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10" />
            </div>
            <p className="text-gray-600 font-bold text-lg">
              هل أنت متأكد من رغبتك في تأكيد هذا الإنذار؟
            </p>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              className="rounded-xl font-bold"
            >
              إلغاء
            </Button>
            <Button
              onClick={onConfirmApprove}
              disabled={isApproving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-8"
            >
              {isApproving ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  جاري التأكيد...
                </>
              ) : (
                "تأكيد"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog
        open={resultDialog.open}
        onOpenChange={(isOpen) =>
          setResultDialog({ ...resultDialog, open: isOpen })
        }
      >
        <DialogContent className="sm:max-w-[400px] rounded-3xl" dir="rtl">
          <div className="flex flex-col items-center text-center py-4 space-y-4">
            <div
              className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center",
                resultDialog.variant === "destructive"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600",
              )}
            >
              {resultDialog.variant === "destructive" ? (
                <AlertCircle className="h-10 w-10" />
              ) : (
                <CheckCircle className="h-10 w-10" />
              )}
            </div>

            <DialogHeader className="text-center w-full">
              <DialogTitle
                className={cn(
                  "text-2xl font-black text-center w-full",
                  resultDialog.variant === "destructive"
                    ? "text-rose-600"
                    : "text-emerald-600",
                )}
              >
                {resultDialog.title}
              </DialogTitle>
            </DialogHeader>

            <div className="text-gray-600 font-bold text-lg px-2">
              {resultDialog.message}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setResultDialog({ ...resultDialog, open: false })}
              className="w-full rounded-xl font-bold bg-gray-900 hover:bg-gray-800"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
