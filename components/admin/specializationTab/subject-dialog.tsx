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
import { TeacherSearchSelect } from "./teacher-search-select";
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
  teacherId: string;
  teacherName: string;
  numberOfHours: number;
};

const emptyRow = (): SubjectRow => ({
  name: "",
  teacherId: "",
  teacherName: "",
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
    teacherId: "",
    teacherName: "",
    numberOfHours: 3,
  });

  const hasChanges = useMemo(() => {
    if (!editingSubject) return false;
    return (
      subjectForm.name !== editingSubject.name ||
      subjectForm.teacherId !== (editingSubject.teacherId || "") ||
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
        teacherId: editingSubject.teacherId || "",
        teacherName: editingSubject.teacherName || "",
        numberOfHours: editingSubject.numberOfHours,
      });
    } else {
      setSubjectRows([emptyRow()]);
    }
  }, [editingSubject, isOpen]);

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

  const handleSaveSubject = async () => {
    if (!editingSubject) {
      // Batch add mode
      const invalidRow = subjectRows.find(
        (r) => !r.name.trim() || !r.teacherId,
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
              teacherId: r.teacherId,
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
      if (!subjectForm.name.trim() || !subjectForm.teacherId) {
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
              teacherId: subjectForm.teacherId,
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
          <div className="grid gap-4 py-4" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-right text-sm">اسم المادة</Label>
                <Input
                  value={subjectForm.name}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, name: e.target.value })
                  }
                  className="text-right h-10"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-right text-sm">المعلم</Label>
                <TeacherSearchSelect
                  value={subjectForm.teacherId}
                  initialName={subjectForm.teacherName}
                  onValueChange={(id, name) => {
                    setSubjectForm({
                      ...subjectForm,
                      teacherId: id,
                      teacherName: name,
                    });
                  }}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-right text-sm">عدد الحصص</Label>
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
            <div className="hidden md:grid grid-cols-[1fr_1fr_100px_36px] gap-2 mb-2 px-1">
              <span className="text-sm font-bold text-gray-600">
                اسم المادة <span className="text-danger">*</span>
              </span>
              <span className="text-sm font-bold text-gray-600">
                المعلم <span className="text-danger">*</span>
              </span>
              <span className="text-sm font-bold text-gray-600">عدد الحصص</span>
              <span />
            </div>

            <div className="overflow-y-auto max-h-[50vh] space-y-2 pr-1">
              {subjectRows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_36px] gap-2 items-center bg-gray-50/60 rounded-lg p-2 border border-gray-100"
                >
                  <div className="md:hidden font-bold text-sm text-gray-600 mb-1">
                    المادة {index + 1}
                  </div>
                  <Input
                    placeholder="اسم المادة"
                    value={row.name}
                    onChange={(e) =>
                      updateSubjectRow(index, "name", e.target.value)
                    }
                    className="text-right h-9 bg-white"
                  />
                  <TeacherSearchSelect
                    value={row.teacherId}
                    initialName={row.teacherName}
                    onValueChange={(id, name) => {
                      updateSubjectRow(index, "teacherId", id);
                      updateSubjectRow(index, "teacherName", name);
                    }}
                  />
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
                    className="text-right h-9 bg-white"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={subjectRows.length === 1}
                    onClick={() => removeSubjectRow(index)}
                    className="h-9 w-9 text-danger hover:text-danger-foreground hover:bg-danger-light rounded-lg disabled:opacity-30 self-end md:self-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
