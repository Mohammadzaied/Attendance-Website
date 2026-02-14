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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateTeacher } from "@/features/admin";
import { ROLE_OPTIONS } from "@/Config/roles";
import { TeacherResponse } from "@/features/admin";

interface UpdateTeacherDialogProps {
  teacher: TeacherResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UpdateTeacherDialog({
  teacher,
  open,
  onOpenChange,
  onSuccess,
}: UpdateTeacherDialogProps) {
  const dispatch = useAppDispatch();
  const { departments, updateTeacherState } = useAppSelector(
    (state) => state.admin,
  );
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

  const [formData, setFormData] = useState<{
    username: string;
    fullName: string;
    password: string;
    roleId: number;
    departmentId: number;
  }>({
    username: "",
    fullName: "",
    password: "",
    roleId: 2,
    departmentId: 0,
  });

  const [initialData, setInitialData] = useState({
    username: "",
    fullName: "",
    password: "",
    roleId: 2,
    departmentId: 0,
  });

  useEffect(() => {
    if (teacher) {
      const matchedRole = ROLE_OPTIONS.find((r) => r.id === teacher.roleId);
      const initialRoleId = matchedRole ? matchedRole.id : 2;

      // Map departmentName to departmentId
      const matchedDept = departments.find(
        (d) => d.name === teacher.departmentName,
      );
      const initialDeptId = matchedDept ? matchedDept.departmentId : 0;

      const data = {
        username: teacher.username,
        fullName: teacher.fullName,
        password: "",
        roleId: initialRoleId,
        departmentId: initialDeptId,
      };

      setFormData(data);
      setInitialData(data);
    }
  }, [teacher, departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    try {
      const updateData: any = {
        id: teacher.userId,
        username: formData.username,
        fullName: formData.fullName,
        roleId: formData.roleId,
        departmentId: formData.departmentId,
        password: formData.password,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }
      await dispatch(updateTeacher(updateData)).unwrap();
      setResult({
        success: true,
        message: "تم تحديث بيانات المستخدم بنجاح",
        show: true,
      });
      onSuccess?.();
    } catch (error) {
      setResult({
        success: false,
        message:
          typeof error === "string" ? error : "فشل في تحديث بيانات المستخدم",
        show: true,
      });
    }
  };

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-right">
              تحديث بيانات المستخدم
            </DialogTitle>
            <DialogDescription className="text-right">
              قم بتعديل بيانات المستخدم
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="update-username" className="text-right">
                  اسم المستخدم
                </Label>
                <Input
                  id="update-username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="text-right"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="update-fullName" className="text-right">
                  الاسم الكامل
                </Label>
                <Input
                  id="update-fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="text-right"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="update-password" className="text-right">
                  كلمة المرور (اتركها فارغة إذا لم ترد التغيير)
                </Label>
                <Input
                  id="update-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="text-right"
                  placeholder="اتركها فارغة للإبقاء على كلمة المرور الحالية"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="update-role" className="text-right">
                  الدور
                </Label>
                <Select
                  value={formData.roleId.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, roleId: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="items-start">
                    {ROLE_OPTIONS.slice(0, -1).map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="update-department" className="text-right">
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
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="cursor-pointer"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={loading || !isDirty}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "جاري التحديث..." : "تحديث"}
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
