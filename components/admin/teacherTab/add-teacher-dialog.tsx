"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createTeacher, fetchDepartments } from "@/features/admin/adminSlice";
import { CreateTeacherDto } from "@/features/admin/adminTypes";

import { ROLE_OPTIONS } from "@/Config/roles";

interface AddTeacherDialogProps {
  onSuccess?: () => void;
}

export function AddTeacherDialog({ onSuccess }: AddTeacherDialogProps) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { departments, createTeacherState } = useAppSelector(
    (state) => state.admin,
  );
  const isLoading = createTeacherState.isLoading;

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    show: boolean;
  }>({
    success: false,
    message: "",
    show: false,
  });

  const [formData, setFormData] = useState<CreateTeacherDto>({
    username: "",
    fullName: "",
    password: "",
    roleId: 2, // Default to teacher
    departmentId: null,
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchDepartments());
    }
  }, [open, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(createTeacher(formData)).unwrap();
      setResult({
        success: true,
        message: "تم إضافة المعلم بنجاح",
        show: true,
      });
      setFormData({
        username: "",
        fullName: "",
        password: "",
        roleId: 2,
        departmentId: null,
      });
      onSuccess?.();
    } catch (error) {
      setResult({
        success: false,
        message: typeof error === "string" ? error : "فشل في إضافة المعلم",
        show: true,
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="cursor-pointer bg-blue-600 hover:bg-blue-700">
            <svg
              className="h-4 w-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            إضافة مستخدم
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="p-3">
            <DialogTitle className="text-right">إضافة معلم جديد</DialogTitle>
            <DialogDescription className="text-right">
              أدخل بيانات المعلم الجديد
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-right">
                  اسم المستخدم
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="text-right [unicode-bidi:plaintext]"
                  required
                 dir="ltr"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-right">
                  الاسم الكامل
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="text-right"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-right">
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="text-right"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-right">
                  الدور
                </Label>
                <Select
                  value={formData.roleId.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, roleId: parseInt(value) })
                  }
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.slice(0, -1).map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department" className="text-right">
                  القسم
                </Label>
                <Select
                  value={
                    formData.departmentId
                      ? formData.departmentId.toString()
                      : ""
                  }
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      departmentId: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem
                        key={dept.departmentId}
                        value={dept.departmentId.toString()}
                      >
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="cursor-pointer "
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "جاري الإضافة..." : "إضافة"}
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
            setOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle
              className={`text-right ${
                result.success ? "text-green-600" : "text-red-600"
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
                  setOpen(false);
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
