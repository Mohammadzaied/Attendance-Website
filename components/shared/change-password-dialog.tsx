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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { changePassword } from "@/features/auth";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const dispatch = useAppDispatch();
  const { changePasswordState } = useAppSelector((state) => state.AuthSlice);
  const isLoading = changePasswordState.isLoading;

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [resultDialog, setResultDialog] = useState({
    open: false,
    title: "",
    message: "",
    variant: "default" as "default" | "destructive",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setResultDialog({
        open: true,
        title: "خطأ",
        message: "كلمة المرور الجديدة غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(changePassword(formData)).unwrap();
      setResultDialog({
        open: true,
        title: "تم بنجاح",
        message: "تم تغيير كلمة المرور بنجاح",
        variant: "default",
      });
      onOpenChange(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setResultDialog({
        open: true,
        title: "خطأ",
        message: typeof error === "string" ? error : "فشل في تغيير كلمة المرور",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">تغيير كلمة المرور</DialogTitle>
            <DialogDescription className="text-right">
              أدخل كلمة المرور القديمة والجديدة لتغييرها
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword" className="text-right">
                  كلمة المرور القديمة
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="text-right"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword" className="text-right">
                  كلمة المرور الجديدة
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="text-right"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-right">
                  تأكيد كلمة المرور الجديدة
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="text-right"
                  required
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="cursor-pointer"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer bg-info hover:bg-info-foreground"
              >
                {isLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog
        open={resultDialog.open}
        onOpenChange={(open) => setResultDialog({ ...resultDialog, open })}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle
              className={`text-right ${
                resultDialog.variant === "destructive"
                  ? "text-danger"
                  : "text-success"
              }`}
            >
              {resultDialog.title}
            </DialogTitle>
            <DialogDescription className="text-right">
              {resultDialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setResultDialog({ ...resultDialog, open: false })}
              className="w-full cursor-pointer"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
