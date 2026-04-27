"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Major,
  Department,
  specializationsService,
} from "@/features/specialization";
import { StudyYear } from "@/features/subject";
import { type SemestersResponse, semesterService } from "@/features/semester";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearError as clearAdminErrors } from "@/features/admin";
import {
  updateStudentThunk,
  fetchSemesters,
  clearError as clearSpecializationErrors,
  fetchAcademicYears,
} from "@/features/specialization";
import { MajorStudent } from "@/features/student";

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: MajorStudent | null;
  currentMajor: Major;
  currentYear: StudyYear;
  onSuccess: () => Promise<void>;
}

export function EditStudentDialog({
  open,
  onOpenChange,
  student,
  currentMajor,
  currentYear,
  onSuccess,
}: EditStudentDialogProps) {
  const dispatch = useAppDispatch();
  const [semestersBySpecialization, setSemestersBySpecialization] = useState<
    SemestersResponse[]
  >([]);

  const [editStudentForm, setEditStudentForm] = useState({
    name: "",
    username: "",
    password: "",
    departmentId: currentMajor.departmentId,
    specializationId: Number(currentMajor.id),
    studyYear: currentYear.studyYear,
    semesterId: Number(currentYear.id),
  });

  const { specializations, updateStudentState } = useAppSelector(
    (state) => state.specializations,
  );

  // Group departments from specializations
  const departments = specializations.reduce(
    (acc, spec) => {
      if (!acc.find((d) => d.departmentId === spec.departmentId)) {
        acc.push({
          departmentId: spec.departmentId,
          name: spec.departmentName,
        });
      }
      return acc;
    },
    [] as { departmentId: number; name: string }[],
  );

  // Reset form when student changes or dialog opens
  useEffect(() => {
    if (open && student) {
      setEditStudentForm({
        name: student.fullName,
        username: student.username || "",
        password: "",
        departmentId: currentMajor.departmentId,
        specializationId: Number(currentMajor.id),
        studyYear: currentYear.studyYear,
        semesterId: Number(currentYear.id),
      });
    }
  }, [open, student, currentMajor, currentYear]);

  // Fetch semesters/years when specialization changes in edit form
  useEffect(() => {
    if (open) {
      //dispatch(fetchSemesters());
      loadSemesters();
      dispatch(fetchAcademicYears());
    }
  }, [open, dispatch]);

  const loadSemesters = async () => {
    try {
      const data = await semesterService.getAllSemesters();
      setSemestersBySpecialization(data.filter((s) => s.status === 1));
    } catch (error) {
      console.error("Failed to load semesters:", error);
    }
  };

  // Auto-select first choice when data is received
  useEffect(() => {
    if (semestersBySpecialization.length > 0) {
      const currentSemesterExists = semestersBySpecialization.some(
        (s) => s.semesterId === editStudentForm.semesterId,
      );

      if (!currentSemesterExists) {
        setEditStudentForm((prev) => ({
          ...prev,
          semesterId: semestersBySpecialization[0].semesterId,
        }));
      }
    }
  }, [semestersBySpecialization, editStudentForm.semesterId]);

  // Check if any changes have been made to the student form
  const hasStudentChanges = () => {
    if (!student) return false;

    return (
      editStudentForm.name !== student.fullName ||
      editStudentForm.username !== (student.username || "") ||
      editStudentForm.password !== "" ||
      editStudentForm.departmentId !== currentMajor.departmentId ||
      editStudentForm.specializationId !== Number(currentMajor.id) ||
      editStudentForm.studyYear !== currentYear.studyYear ||
      editStudentForm.semesterId !== Number(currentYear.id)
    );
  };

  const handleUpdateStudent = async () => {
    if (!student) return;

    try {
      await dispatch(
        updateStudentThunk({
          id: Number(student.studentId),
          data: {
            fullName: editStudentForm.name,
            username: editStudentForm.username || undefined,
            password: editStudentForm.password || undefined,
            departmentId: editStudentForm.departmentId,
            specializationId: editStudentForm.specializationId,
            semesterId: editStudentForm.semesterId,
            studyYear: editStudentForm.studyYear,
          },
        }),
      ).unwrap();

      await onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      dispatch(clearSpecializationErrors());
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل بيانات الطالب</DialogTitle>
          <DialogDescription className="text-right text-sm text-gray-500">
            يمكنك تعديل معلومات الطالب أو نقله إلى تخصص آخر
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4" dir="rtl">
          {editStudentForm.username && (
            <div className="grid gap-2 text-right">
              <Label htmlFor="edit-st-password">
                كلمة المرور (اتركها فارغة إذا لم ترد التغيير)
              </Label>
              <Input
                id="edit-st-password"
                type="password"
                value={editStudentForm.password}
                onChange={(e) =>
                  setEditStudentForm({
                    ...editStudentForm,
                    password: e.target.value,
                  })
                }
                className="text-right"
                placeholder="********"
              />
            </div>
          )}
          {/* <div className="flex gap-4"> */}
            <div className="flex-1 grid gap-2 text-right">
              <Label htmlFor="edit-st-name">الاسم الكامل</Label>
              <Input
                id="edit-st-name"
                value={editStudentForm.name}
                onChange={(e) =>
                  setEditStudentForm({
                    ...editStudentForm,
                    name: e.target.value,
                  })
                }
                className="text-right"
              />
            </div>
            <div className="flex-1 grid gap-2 text-right">
              <Label htmlFor="edit-st-username">البريد الإلكتروني</Label>
              <Input
                id="edit-st-username"
                value={editStudentForm.username}
                dir="ltr"
                onChange={(e) =>
                  setEditStudentForm({
                    ...editStudentForm,
                    username: e.target.value,
                  })
                }
                className="text-right"
              />
            </div>
          {/* </div> */}

          <div className="flex gap-4">
            <div className="flex-1 grid gap-2 text-right">
              <Label>القسم</Label>
              <Select
                value={String(editStudentForm.departmentId || "")}
                onValueChange={(val) => {
                  const deptId = Number(val);
                  const firstSpec = specializations.find(
                    (s) => s.departmentId === deptId,
                  );
                  setEditStudentForm({
                    ...editStudentForm,
                    departmentId: deptId,
                    specializationId: firstSpec
                      ? firstSpec.specializationId
                      : 0,
                  });
                }}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem
                      key={dept.departmentId}
                      value={String(dept.departmentId)}
                    >
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 grid gap-2 text-right">
              <Label>التخصص</Label>
              <Select
                value={String(editStudentForm.specializationId || "")}
                onValueChange={(val) =>
                  setEditStudentForm({
                    ...editStudentForm,
                    specializationId: Number(val),
                  })
                }
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر التخصص" />
                </SelectTrigger>
                <SelectContent>
                  {specializations
                    .filter(
                      (spec) =>
                        spec.departmentId === editStudentForm.departmentId,
                    )
                    .map((spec) => (
                      <SelectItem
                        key={spec.specializationId}
                        value={String(spec.specializationId || "")}
                      >
                        {spec.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 grid gap-2 text-right">
              <Label>المستوى الدراسي</Label>
              <Select
                value={String(editStudentForm.studyYear || "")}
                onValueChange={(val) =>
                  setEditStudentForm({
                    ...editStudentForm,
                    studyYear: Number(val),
                  })
                }
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">سنة أولى</SelectItem>
                  <SelectItem value="2">سنة ثانية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 grid gap-2 text-right">
              <Label>الترم/المستوى</Label>
              <Select
                value={String(editStudentForm.semesterId || "")}
                onValueChange={(val) =>
                  setEditStudentForm({
                    ...editStudentForm,
                    semesterId: Number(val),
                  })
                }
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر الترم" />
                </SelectTrigger>
                <SelectContent>
                  {semestersBySpecialization.map((sem) => (
                    <SelectItem
                      key={sem.semesterId}
                      value={String(sem.semesterId || "")}
                    >
                      {sem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {updateStudentState.error && (
          <div className="bg-danger-light text-danger p-3 rounded-lg text-sm text-right mb-4">
            {updateStudentState.error}
          </div>
        )}
        <DialogFooter>
          <Button
            onClick={handleUpdateStudent}
            disabled={
              updateStudentState.isLoading ||
              !editStudentForm.name.trim() ||
              !editStudentForm.departmentId ||
              !editStudentForm.specializationId ||
              !editStudentForm.studyYear ||
              !editStudentForm.semesterId ||
              semestersBySpecialization.length === 0 ||
              !hasStudentChanges()
            }
            className="w-full bg-info hover:bg-info-foreground cursor-pointer"
          >
            {updateStudentState.isLoading ? "جاري التحديث..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
