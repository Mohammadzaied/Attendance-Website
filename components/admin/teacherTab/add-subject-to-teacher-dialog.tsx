"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { BookOpen, Plus, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSpecializations,
  createSubjectToTeacherThunk,
} from "@/features/specialization/specializationsSlice";
import { SpecializationSearchSelect } from "./specialization-search-select";
import { TeacherResponse } from "@/features/admin";

interface AddSubjectToTeacherDialogProps {
  teacher: TeacherResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddSubjectToTeacherDialog({
  teacher,
  open,
  onOpenChange,
  onSuccess,
}: AddSubjectToTeacherDialogProps) {
  const dispatch = useAppDispatch();
  const { specializations, createSubjectToTeacherState } = useAppSelector(
    (state) => state.specializations,
  );

  const [formData, setFormData] = useState({
    name: "",
    specializationId: "" as number | "",
    studyYear: "1",
    numberOfHours: "3",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      dispatch(fetchSpecializations());
      // Reset form
      setFormData({
        name: "",
        specializationId: "" as number | "",
        studyYear: "1",
        numberOfHours: "3",
      });
      setError(null);
    }
  }, [open, dispatch]);

  const handleSubmit = async () => {
    if (!teacher) return;
    if (!formData.name || !formData.specializationId) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      await dispatch(
        createSubjectToTeacherThunk({
          name: formData.name,
          specializationId: Number(formData.specializationId),
          studyYear: Number(formData.studyYear),
          teacherId: teacher.userId,
          numberOfHours: Number(formData.numberOfHours),
        }),
      ).unwrap();

      // Reset form to allow adding more subjects
      setFormData({
        name: "",
        specializationId: "" as number | "",
        studyYear: "1",
        numberOfHours: "3",
      });
      setError(null);

      onSuccess?.();
      // Removed onOpenChange(false) to keep dialog open
    } catch (err: any) {
      setError(err || "فشل في إضافة المادة للمعلم");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>إضافة مادة جديدة للمعلم: {teacher?.fullName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-right font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="grid gap-2 text-right">
            <Label htmlFor="specialization" className="font-bold text-gray-700">
              التخصص
            </Label>
            <SpecializationSearchSelect
              specializations={specializations}
              value={formData.specializationId}
              onValueChange={(val) => {
                setFormData({ ...formData, specializationId: val });
              }}
            />
          </div>

          <div className="grid gap-2 text-right">
            <Label htmlFor="studyYear" className="font-bold text-gray-700">
              السنة الدراسية
            </Label>
            <Select
              dir="rtl"
              value={formData.studyYear}
              onValueChange={(val) => {
                setFormData({ ...formData, studyYear: val });
              }}
            >
              <SelectTrigger className="h-11 bg-gray-50/30 border-gray-200">
                <SelectValue placeholder="اختر السنة الدراسية" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="1">سنة أولى</SelectItem>
                <SelectItem value="2">سنة ثانية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 text-right">
            <Label htmlFor="name" className="font-bold text-gray-700">
              اسم المادة
            </Label>
            <Input
              id="name"
              placeholder="مثال: برمجة الويب"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
              }}
              className="h-11 bg-gray-50/30 border-gray-200 text-right"
              dir="rtl"
            />
          </div>

          <div className="grid gap-2 text-right">
            <Label htmlFor="numberOfHours" className="font-bold text-gray-700">
              عدد الحصص
            </Label>
            <Input
              id="numberOfHours"
              type="number"
              min="1"
              max="100"
              placeholder="مثال: 3"
              value={formData.numberOfHours}
              onChange={(e) => {
                setFormData({ ...formData, numberOfHours: e.target.value });
              }}
              className="h-11 bg-gray-50/30 border-gray-200 text-right"
              dir="rtl"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-1/2 h-11 rounded-xl font-medium border-gray-200"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-600/20"
            onClick={handleSubmit}
            disabled={createSubjectToTeacherState.isLoading}
          >
            {createSubjectToTeacherState.isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الإضافة...
              </>
            ) : (
              <>
                <Plus className="ml-2 h-4 w-4" />
                إضافة المادة
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
