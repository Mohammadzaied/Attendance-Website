"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createAndEnrollStudentThunk,
  clearError as clearSpecializationErrors,
} from "@/features/specialization";
import { clearError as clearAdminErrors } from "@/features/admin/adminSlice";
import { Major } from "@/features/specialization";
import { StudyYear } from "@/features/subject";

interface StudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  major: Major;
  year: StudyYear;
  onSuccess: () => void;
}

export function StudentDialog({
  isOpen,
  onOpenChange,
  major,
  year,
  onSuccess,
}: StudentDialogProps) {
  const dispatch = useAppDispatch();
  const [studentForm, setStudentForm] = useState({
    name: "",
    username: "",
  });

  const { createAndEnrollStudentState = { isLoading: false, error: null } } =
    useAppSelector((state) => state.specializations);

  const handleAddStudent = async () => {
    if (!studentForm.name.trim()) return;

    try {
      await dispatch(
        createAndEnrollStudentThunk({
          fullName: studentForm.name,
          departmentId: major.departmentId,
          specializationId: Number(major.id),
          studyYear: year.studyYear,
          username: studentForm.username || undefined,
          semesterId: year.semesterId,
        }),
      ).unwrap();

      onSuccess();
      onOpenChange(false);
      setStudentForm({ name: "", username: "" });
    } catch (error: any) {
      console.error("Failed to add student:", error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) {
          dispatch(clearSpecializationErrors());
          dispatch(clearAdminErrors());
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">
            إضافة طالب جديد للسنة الدراسية
          </DialogTitle>
          <DialogDescription className="text-right text-sm text-gray-500">
            البريد الإلكتروني اختياري
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="st-name" className="text-right">
              اسم الطالب <span className="text-red-500">*</span>
            </Label>
            <Input
              id="st-name"
              value={studentForm.name}
              onChange={(e) =>
                setStudentForm({ ...studentForm, name: e.target.value })
              }
              className="text-right"
              placeholder="أدخل اسم الطالب"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="st-username" className="text-right">
              البريد الإلكتروني (اختياري)
            </Label>
            <Input
              id="st-username"
              type="text"
              value={studentForm.username}
              onChange={(e) =>
                setStudentForm({ ...studentForm, username: e.target.value })
              }
              className="text-right"
              placeholder="example@email.com"
            />
          </div>
          {createAndEnrollStudentState.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm text-right">
              {createAndEnrollStudentState.error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleAddStudent}
            disabled={
              createAndEnrollStudentState.isLoading || !studentForm.name.trim()
            }
            className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            {createAndEnrollStudentState.isLoading
              ? "جاري الإضافة..."
              : "إضافة الطالب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
