"use client";

import { useState, useEffect } from "react";
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
import { updateTeacher } from "@/features/admin";
import { updateUserInfo } from "@/features/auth";
import {
  User,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface UpdateAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateAdminDialog({
  open,
  onOpenChange,
}: UpdateAdminDialogProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.AuthSlice);
  const { updateTeacherState } = useAppSelector((state) => state.admin);
  const loading = updateTeacherState.isLoading;

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    show: boolean;
  }>({
    success: false,
    message: "",
    show: false,
  });

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    password: "",
  });

  const [initialData, setInitialData] = useState({
    username: "",
    fullName: "",
    password: "",
  });

  useEffect(() => {
    if (user && open) {
      const data = {
        username: (user as any).username || (user as any).userName || "",
        fullName: user.fullName || "",
        password: "",
      };
      setFormData(data);
      setInitialData(data);
      setResult({ ...result, show: false });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updateData: any = {
        id: user.userId,
        username: formData.username,
        fullName: formData.fullName,
        roleId: 1,
        password: formData.password,
      };

      await dispatch(updateTeacher(updateData)).unwrap();

      // Sync AuthSlice state
      dispatch(
        updateUserInfo({
          fullName: formData.fullName,
          username: formData.username,
        }),
      );

      setResult({
        success: true,
        message: "تم بنجاح",
        show: true,
      });

      // Auto close after 0.5 seconds
      setTimeout(() => {
        setResult((prev) => ({ ...prev, show: false }));
        onOpenChange(false);
      }, 500);
    } catch (error) {
      setResult({
        success: false,
        message:
          typeof error === "string"
            ? error
            : "فشل في تحديث بيانات الملف الشخصي",
        show: true,
      });
    }
  };

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              تعديل بيانات الحساب
            </DialogTitle>
            <DialogDescription className="text-right">
              يمكنك تعديل اسمك الكامل واسم المستخدم وكلمة المرور
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="admin-fullName" className="text-right block">
                  الاسم الكامل
                </Label>
                <div className="relative">
                  <Input
                    id="admin-fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="text-right pl-10"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-username" className="text-right block">
                  اسم المستخدم
                </Label>
                <div className="relative">
                  <Input
                    id="admin-username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="text-right pl-10"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-right block">
                  كلمة مرور جديدة
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="text-right pl-10"
                    placeholder="اتركها فارغة للإبقاء على الحالية"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-start">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={loading || !isDirty}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
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
        <DialogContent className="sm:max-w-[400px]" dir="rtl">
          <DialogHeader>
            <DialogTitle
              className={`text-right flex items-center gap-2 ${
                result.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              {result.success ? "تم بنجاح" : "حدث خطأ"}
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
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              موافق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
