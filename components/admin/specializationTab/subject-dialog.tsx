"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createSubjectsBatchThunk,
  updateSubjectThunk,
} from "@/features/specialization";
import { MultiTeacherSearchSelect } from "./multi-teacher-search-select";
import { Major } from "@/features/specialization";
import { StudyYear, DetailedSubjectResponse } from "@/features/subject";
import { StatusType } from "./status-dialog";

interface SubjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  major: Major;
  year: StudyYear;
  editingSubject: DetailedSubjectResponse | null;
  onSuccess: (status: {
    title: string;
    message: string;
    type: StatusType;
  }) => void;
}

type SubjectRow = {
  name: string;
  teachers: { userId: string; fullName: string }[];
  numberOfHours: number;
};

const emptyRow = (): SubjectRow => ({
  name: "",
  teachers: [],
  numberOfHours: 3,
});

export function SubjectDialog({
  isOpen,
  onOpenChange,
  major,
  year,
  editingSubject,
  onSuccess,
}: SubjectDialogProps) {
  const dispatch = useAppDispatch();
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    teachers: [] as { userId: string; fullName: string }[],
    numberOfHours: 3,
  });

  const hasChanges = useMemo(() => {
    if (!editingSubject) return false;
    
    const currentTeacherIds = subjectForm.teachers.map((t) => t.userId).sort().join(",");
    const originalTeacherIds = (editingSubject.teachers || []).map((t) => t.userId).sort().join(",");

    return (
      subjectForm.name !== editingSubject.name ||
      currentTeacherIds !== originalTeacherIds ||
      subjectForm.numberOfHours !== editingSubject.numberOfHours
    );
  }, [subjectForm, editingSubject]);
  const [subjectRows, setSubjectRows] = useState<SubjectRow[]>([emptyRow()]);

  const {
    createSubjectState = { isLoading: false },
    updateSubjectState = { isLoading: false },
  } = useAppSelector((state) => state.specializations);

  useEffect(() => {
    if (editingSubject) {
      setSubjectForm({
        name: editingSubject.name,
        teachers: editingSubject.teachers || [],
        numberOfHours: editingSubject.numberOfHours,
      });
    } else {
      setSubjectRows([emptyRow()]);
    }
  }, [editingSubject, isOpen]);

  const updateSubjectRow = (
    index: number,
    field: keyof SubjectRow,
    value: string | number | { userId: string; fullName: string }[],
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

  const handleSaveSubject = async () => {
    if (!editingSubject) {
      // Batch add mode
      const invalidRow = subjectRows.find(
        (r) => !r.name.trim() || r.teachers.length === 0,
      );
      if (invalidRow) {
        onSuccess({
          title: "تنبيه التحقق",
          message: "يرجى إدخال اسم المادة واختيار المعلم لجميع الصفوف",
          type: "warning",
        });
        return;
      }

      try {
        await dispatch(
          createSubjectsBatchThunk(
            subjectRows.map((r) => ({
              name: r.name,
              specializationId: Number(major.id),
              semesterId: year.semesterId,
              studyYear: year.studyYear,
              teacherIds: r.teachers.map((t) => t.userId),
              numberOfHours: r.numberOfHours,
            })),
          ),
        ).unwrap();

        onOpenChange(false);
        onSuccess({
          title: "تمت العملية بنجاح",
          message: `تم إضافة ${subjectRows.length} مادة بنجاح`,
          type: "success",
        });
      } catch (error: any) {
        onSuccess({
          title: "خطأ في إضافة المواد",
          message: error || "حدث خطأ غير متوقع أثناء معالجة طلبك",
          type: "error",
        });
      }
    } else {
      // Edit single subject
      if (!subjectForm.name.trim() || subjectForm.teachers.length === 0) {
        onSuccess({
          title: "تنبيه التحقق",
          message: "يرجى إدخال اسم المادة واختيار المعلم",
          type: "warning",
        });
        return;
      }

      try {
        await dispatch(
          updateSubjectThunk({
            id: editingSubject.subjectId,
            data: {
              name: subjectForm.name,
              teacherIds: subjectForm.teachers.map((t) => t.userId),
              numberOfHours: subjectForm.numberOfHours,
            },
          }),
        ).unwrap();

        onOpenChange(false);
        onSuccess({
          title: "تمت العملية بنجاح",
          message: "تم تعديل المادة بنجاح",
          type: "success",
        });
      } catch (error: any) {
        onSuccess({
          title: "خطأ في تعديل المادة",
          message: error || "حدث خطأ غير متوقع أثناء معالجة طلبك",
          type: "error",
        });
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogContent
        className="sm:max-w-[900px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2 shrink-0">
            {editingSubject ? "تفاصيل المادة" : "إضافة مواد جديدة"}
          </DialogTitle>
        </DialogHeader>

        {editingSubject && (
          <div className="py-4" dir="rtl">
            <div className="flex flex-col gap-4 bg-gray-50/60 rounded-xl p-5 border border-gray-100">
              <div className="grid gap-1.5">
                <Label className="text-right text-sm text-gray-700 font-medium">اسم المادة</Label>
                <Input
                  value={subjectForm.name}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, name: e.target.value })
                  }
                  className="text-right h-10"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-right text-sm text-gray-700 font-medium">المعلمين</Label>
                <MultiTeacherSearchSelect
                  selectedTeachers={subjectForm.teachers}
                  onTeachersChange={(teachers) => {
                    setSubjectForm({
                      ...subjectForm,
                      teachers,
                    });
                  }}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-right text-sm text-gray-700 font-medium">عدد الحصص</Label>
                <Input
                  type="number"
                  value={subjectForm.numberOfHours}
                  onChange={(e) =>
                    setSubjectForm({
                      ...subjectForm,
                      numberOfHours: Number(e.target.value),
                    })
                  }
                  className="text-right h-10"
                />
              </div>
            </div>
          </div>
        )}

        {!editingSubject && (
          <div className="py-4 flex-1 flex flex-col overflow-hidden" dir="rtl">
            <div className="overflow-y-auto max-h-[60vh] space-y-4 pr-1">
              {subjectRows.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 bg-gray-50/60 rounded-xl p-4 border border-gray-100 relative"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-sm text-gray-700">
                      المادة {index + 1}
                    </div>
                    {subjectRows.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSubjectRow(index)}
                        className="h-8 w-8 text-danger hover:text-danger-foreground hover:bg-danger-light rounded-lg absolute top-2 left-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-1.5">
                    <Label className="text-right text-sm text-gray-600">
                      اسم المادة <span className="text-danger">*</span>
                    </Label>
                    <Input
                      placeholder="أدخل اسم المادة..."
                      value={row.name}
                      onChange={(e) =>
                        updateSubjectRow(index, "name", e.target.value)
                      }
                      className="text-right h-10 bg-white"
                    />
                  </div>
                  
                  <div className="grid gap-1.5">
                    <Label className="text-right text-sm text-gray-600">
                      المعلمين <span className="text-danger">*</span>
                    </Label>
                    <MultiTeacherSearchSelect
                      selectedTeachers={row.teachers}
                      onTeachersChange={(teachers) => {
                        updateSubjectRow(index, "teachers", teachers);
                      }}
                    />
                  </div>
                  
                  <div className="grid gap-1.5">
                    <Label className="text-right text-sm text-gray-600">عدد الحصص</Label>
                    <Input
                      type="number"
                      min={1}
                      value={row.numberOfHours}
                      onChange={(e) =>
                        updateSubjectRow(
                          index,
                          "numberOfHours",
                          Number(e.target.value),
                        )
                      }
                      className="text-right h-10 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={addSubjectRow}
              className="mt-3 w-full border-dashed border-info text-info hover:bg-info-light hover:border-info gap-2 h-10 font-bold"
            >
              <Plus className="h-4 w-4" />
              إضافة مادة أخرى
            </Button>
          </div>
        )}

        <DialogFooter className="flex flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSaveSubject}
            disabled={
              createSubjectState.isLoading ||
              updateSubjectState.isLoading ||
              (editingSubject ? !hasChanges : false)
            }
            className="flex-1 bg-info hover:bg-info-foreground cursor-pointer"
          >
            {createSubjectState.isLoading || updateSubjectState.isLoading
              ? "جاري الحفظ..."
              : editingSubject
                ? "حفظ التعديلات"
                : `حفظ ${subjectRows.length > 1 ? subjectRows.length + " مواد" : "المادة"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
