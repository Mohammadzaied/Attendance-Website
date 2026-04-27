"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteTeacher } from "@/features/admin/adminSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import type { TeacherResponse } from "@/features/admin/adminTypes";

interface DeleteTeacherDialogProps {
  teacher: TeacherResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteTeacherDialog({
  teacher,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTeacherDialogProps) {
  const dispatch = useAppDispatch();
  const { deleteTeacherState } = useAppSelector((state) => state.admin);
  const loading = deleteTeacherState.isLoading;

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    show: boolean;
  }>({
    success: false,
    message: "",
    show: false,
  });

  const handleDelete = async () => {
    if (!teacher) return;

    try {
      await dispatch(deleteTeacher(String(teacher.userId))).unwrap();
      setResult({
        success: true,
        message: "تم حذف المعلم بنجاح",
        show: true,
      });
      onSuccess?.();
    } catch (error: any) {
      setResult({
        success: false,
        message: error || "فشل في حذف المعلم",
        show: true,
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف المعلم؟
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-right text-sm text-gray-600">
              سيتم حذف المعلم:{" "}
              <span className="font-semibold">{teacher?.fullName}</span>
            </p>
            <p className="text-right text-sm text-danger mt-2">
              هذا الإجراء لا يمكن التراجع عنه
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="cursor-pointer"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="cursor-pointer bg-danger hover:bg-danger-foreground text-white font-bold"
            >
              {loading ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={result.show}
        onOpenChange={(show) => {
          setResult({ ...result, show });
          if (!show && result.success) {
            onOpenChange(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle
              className={`text-right ${
                result.success ? "text-success" : "text-danger"
              }`}
            >
              {result.success ? "تم بنجاح" : "خطأ"}
            </DialogTitle>
            <DialogDescription className="text-right">
              {result.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setResult({ ...result, show: false });
                if (result.success) {
                  onOpenChange(false);
                }
              }}
              className="w-full cursor-pointer"
            >
              موافق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
