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
import { BookOpen, Plus, Loader2, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSpecializations,
  createSubjectsToTeacherBatchThunk,
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

  type SubjectRow = {
    name: string;
    specializationId: number | "";
    studyYear: string;
    numberOfHours: number;
  };
  const emptyRow = (): SubjectRow => ({
    name: "",
    specializationId: "",
    studyYear: "1",
    numberOfHours: 3,
  });

  const [subjectRows, setSubjectRows] = useState<SubjectRow[]>([emptyRow()]);
  const [error, setError] = useState<string | null>(null);

  const updateSubjectRow = (
    index: number,
    field: keyof SubjectRow,
    value: string | number,
  ) => {
    setSubjectRows((rows) =>
      rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const addSubjectRow = () => {
    setSubjectRows((rows) => [...rows, emptyRow()]);
  };

  const removeSubjectRow = (index: number) => {
    setSubjectRows((rows) => rows.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (open) {
      dispatch(fetchSpecializations());
      // Reset form
      setSubjectRows([emptyRow()]);
      setError(null);
    }
  }, [open, dispatch]);

  const handleSubmit = async () => {
    if (!teacher) return;

    // Validate all rows
    const invalidRow = subjectRows.find(
      (r) =>
        !r.name.trim() ||
        r.specializationId === "" ||
        !r.studyYear ||
        !r.numberOfHours,
    );

    if (invalidRow) {
      setError("يرجى إدخال اسم المادة والتخصص لجميع الصفوف");
      return;
    }

    try {
      await dispatch(
        createSubjectsToTeacherBatchThunk(
          subjectRows.map((r) => ({
            name: r.name,
            specializationId: Number(r.specializationId),
            studyYear: Number(r.studyYear),
            teacherId: teacher.userId,
            numberOfHours: Number(r.numberOfHours),
          })),
        ),
      ).unwrap();

      // Reset form to allow adding more subjects
      setSubjectRows([emptyRow()]);
      setError(null);

      onSuccess?.();
      onOpenChange(false); // Close dialog on success
    } catch (err: any) {
      setError(err || "فشل في إضافة المواد للمعلم");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2 text-xl font-bold shrink-0">
            <BookOpen className="h-5 w-5 text-info" />
            <span>إضافة مادة جديدة للمعلم: {teacher?.fullName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 flex-1 flex flex-col overflow-hidden">
          {error && (
            <div className="bg-danger-light text-danger p-3 rounded-lg text-sm text-right font-medium border border-danger">
              {error}
            </div>
          )}

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_2fr_100px_80px_36px] gap-2 mb-2 px-1 text-right">
            <span className="text-sm font-bold text-gray-600">
              التخصص <span className="text-danger">*</span>
            </span>
            <span className="text-sm font-bold text-gray-600">
              اسم المادة <span className="text-danger">*</span>
            </span>
            <span className="text-sm font-bold text-gray-600">السنة</span>
            <span className="text-sm font-bold text-gray-600">عدد الحصص</span>
            <span />
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {subjectRows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_2fr_100px_80px_36px] gap-2 items-center bg-gray-50/60 rounded-lg p-2 border border-gray-100 text-right"
              >
                <div className="w-[180px]">
                  <SpecializationSearchSelect
                    specializations={specializations}
                    value={row.specializationId}
                    onValueChange={(val) => {
                      const spec = specializations.find(
                        (s) => s.specializationId === val,
                      );
                      const updates: Partial<SubjectRow> = {
                        specializationId: val,
                      };
                      if (spec?.yearsNumber === 1 && row.studyYear === "2") {
                        updates.studyYear = "1";
                      }
                      setSubjectRows((rows) =>
                        rows.map((r, i) =>
                          i === index ? { ...r, ...updates } : r,
                        ),
                      );
                    }}
                  />
                </div>

                <Input
                  id="name"
                  placeholder="مثال: برمجة الويب"
                  value={row.name}
                  onChange={(e) => {
                    updateSubjectRow(index, "name", e.target.value);
                  }}
                  className="h-9! bg-white border-gray-200 text-right w-full"
                  dir="rtl"
                />

                <Select
                  dir="rtl"
                  value={row.studyYear}
                  onValueChange={(val) => {
                    updateSubjectRow(index, "studyYear", val);
                  }}
                >
                  <SelectTrigger className="h-11 bg-white border-gray-200">
                    <SelectValue placeholder="سنة" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="1">سنة أولى</SelectItem>
                    {(specializations.find(
                      (s) => s.specializationId === row.specializationId,
                    )?.yearsNumber ?? 2) > 1 && (
                      <SelectItem value="2">سنة ثانية</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <Input
                  id="numberOfHours"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="3"
                  value={row.numberOfHours}
                  onChange={(e) => {
                    updateSubjectRow(
                      index,
                      "numberOfHours",
                      Number(e.target.value),
                    );
                  }}
                  className="h-9! bg-white border-gray-200 text-right w-full"
                  dir="rtl"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={subjectRows.length === 1}
                  onClick={() => removeSubjectRow(index)}
                  className="h-9 w-9 text-danger hover:text-danger-foreground hover:bg-danger-light rounded-lg disabled:opacity-30"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add another row button */}
          <Button
            type="button"
            variant="outline"
            onClick={addSubjectRow}
            className="mt-3 w-full border-dashed border-info text-info hover:bg-info-light hover:border-info gap-2 h-10 font-bold"
          >
            <Plus className="h-4 w-4" />
            إضافة مادة أخرى
          </Button>
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
            className="w-full sm:w-1/2 bg-info hover:bg-info-foreground text-white font-bold h-11 rounded-xl shadow-lg shadow-info/20"
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
                حفظ{" "}
                {subjectRows.length > 1
                  ? subjectRows.length + " مواد"
                  : "المادة"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
