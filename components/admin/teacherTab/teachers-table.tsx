"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type TeacherResponse,
  type DepartmentResponse,
} from "@/features/admin";
import { ROLE_OPTIONS } from "@/Config/roles";
import { Edit, Trash2, Search, Calendar, BookPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTeacherLastActiveSemester,
  clearTeacherLastActiveSemester,
} from "@/features/admin/adminSlice";
import { updateSubjectThunk } from "@/features/specialization/specializationsSlice";
import { fetchTeachersList } from "@/features/admin/adminSlice";
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogFooter as ShadcnDialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { TeacherSearchSelect } from "@/components/admin/specializationTab/teacher-search-select";
import { useState, useMemo, useEffect } from "react";
import { DetailedSubjectResponse } from "@/features/subject";
import { AddSubjectToTeacherDialog } from "./add-subject-to-teacher-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type TeachersTableProps = {
  teachers: TeacherResponse[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onEdit?: (teacher: TeacherResponse) => void;
  onDelete?: (teacher: TeacherResponse) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  departments: DepartmentResponse[];
  headerAction?: React.ReactNode;
};

export function TeachersTable({
  teachers,
  searchValue,
  onSearchChange,
  onEdit,
  onDelete,
  roleFilter,
  onRoleFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  departments,
  headerAction,
}: TeachersTableProps) {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const {
    teacherLastActiveSemester,
    fetchTeacherLastActiveSemesterState,
    teachersList,
  } = useAppSelector((state) => state.admin);
  const { updateSubjectState } = useAppSelector(
    (state) => state.specializations,
  );

  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [activeTeacher, setActiveTeacher] = useState<TeacherResponse | null>(
    null,
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSubject, setEditingSubject] =
    useState<DetailedSubjectResponse | null>(null);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [teacherForSubject, setTeacherForSubject] =
    useState<TeacherResponse | null>(null);

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    show: boolean;
  }>({
    success: false,
    message: "",
    show: false,
  });

  const [subjectForm, setSubjectForm] = useState({
    name: "",
    teacherId: "",
    teacherName: "",
    numberOfHours: 3,
  });

  const handleOpenSchedule = async (teacher: TeacherResponse) => {
    dispatch(clearTeacherLastActiveSemester());
    dispatch(fetchTeachersList());
    setActiveTeacher(teacher);
    setIsScheduleDialogOpen(true);
    // Optional: clear previous data to avoid showing old data
    dispatch(fetchTeacherLastActiveSemester(teacher.userId));
  };

  const handleCloseSchedule = () => {
    setIsScheduleDialogOpen(false);
    setEditingSubject(null);
    setIsEditMode(false);
    setActiveTeacher(null);
    dispatch(clearTeacherLastActiveSemester());
    setSubjectForm({
      name: "",
      teacherId: "",
      teacherName: "",
      numberOfHours: 3,
    });
  };

  const handleSaveSubject = async () => {
    if (!editingSubject) return;

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

      // Refresh schedule data
      if (activeTeacher) {
        dispatch(fetchTeacherLastActiveSemester(activeTeacher.userId));
      }
      setIsEditMode(false);
      setResult({
        success: true,
        message: "تم تحديث بيانات المادة بنجاح",
        show: true,
      });
    } catch (error) {
      console.error("Failed to update subject:", error);
      setResult({
        success: false,
        message:
          typeof error === "string" ? error : "فشل في تحديث بيانات المادة",
        show: true,
      });
    }
  };

  // Set initial editing subject when data loads
  useEffect(() => {
    if (
      teacherLastActiveSemester &&
      teacherLastActiveSemester.length > 0 &&
      !editingSubject
    ) {
      setEditingSubject(teacherLastActiveSemester[0]);
    }
  }, [teacherLastActiveSemester, editingSubject]);

  useEffect(() => {
    if (editingSubject) {
      setSubjectForm({
        name: editingSubject.name || "",
        teacherId: editingSubject.teacherId || "",
        teacherName: editingSubject.teacherName || "",
        numberOfHours: editingSubject.numberOfHours || 3,
      });
    }
  }, [editingSubject]);

  return (
    <Card className="shadow-sm border-gray-100 overflow-hidden">
      <CardHeader className="p-4 md:p-6 border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-1.5 text-right">
            <CardTitle className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              إدارة المعلمين
            </CardTitle>
            <div className="flex items-center justify-start gap-2 flex-wrap">
              <span className="text-gray-500 text-xs md:text-sm font-medium">
                عرض وإدارة جميع المعلمين في النظام
              </span>
              <div className="hidden md:block h-4 w-px bg-gray-200 mx-1" />
              <Badge className="bg-blue-50 text-blue-700 border-none px-2.5 py-0.5 text-xs font-bold leading-none shadow-sm">
                {teachers.length} معلمين
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row flex-1 items-stretch md:items-center justify-end">
            <div className="grid grid-cols-1 lg:flex items-center gap-2">
              <Select
                value={departmentFilter}
                onValueChange={onDepartmentFilterChange}
              >
                <SelectTrigger
                  className="w-full text-right h-10 border-gray-200 bg-gray-50/50 rounded-xl text-xs md:text-sm font-bold"
                  dir="rtl"
                >
                  <SelectValue placeholder="القسم" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="all">كل الأقسام</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.departmentId} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                <SelectTrigger
                  className="w-full text-right h-10 border-gray-200 bg-gray-50/50 rounded-xl text-xs md:text-sm font-bold"
                  dir="rtl"
                >
                  <SelectValue placeholder="الدور" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="all">كل الأدوار</SelectItem>
                  {ROLE_OPTIONS.slice(0, -1).map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full md:max-w-60">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث عن معلم..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pr-10 text-right h-10 border-gray-200 focus:ring-blue-600/20 bg-gray-50/50 rounded-xl text-xs md:text-sm"
                dir="rtl"
              />
            </div>
            {headerAction && (
              <div className="flex items-center gap-2">{headerAction}</div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="w-full">
          {/* Table Header - Only Desktop */}
          <div className="hidden md:grid grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)] px-6 py-4 bg-gray-50/80 border-b border-gray-100">
            <div className="text-right font-bold text-gray-700 text-xs uppercase tracking-wider">
              الاسم الكامل
            </div>
            <div className="text-right font-bold text-gray-700 text-xs uppercase tracking-wider">
              اسم المستخدم
            </div>
            <div className="text-right font-bold text-gray-700 text-xs uppercase tracking-wider">
              الدور
            </div>
            <div className="text-right font-bold text-gray-700 text-xs uppercase tracking-wider">
              القسم
            </div>
            <div className="text-center font-bold text-gray-700 text-xs uppercase tracking-wider">
              الإجراءات
            </div>
          </div>

          {/* Table Body */}
          <div
            className={cn(
              "divide-y divide-gray-100 bg-white",
              isMobile && "p-4 space-y-3 bg-gray-50/50",
            )}
          >
            {teachers.map((teacher, index) =>
              isMobile ? (
                // Mobile Card Layout
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden group space-y-4 w-full"
                >
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-center gap-4 w-full min-w-0">
                    <div className="h-14 w-14 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm ring-4 ring-white shrink-0">
                      {teacher.fullName ? (
                        teacher.fullName.charAt(0)
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    <div className="text-right flex-1 min-w-0 overflow-hidden">
                      <h4 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1 break-all">
                        {teacher.fullName}
                      </h4>
                      <p dir="ltr" className="text-xs text-blue-600 font-mono font-medium mt-1 line-clamp-1 break-all">
                        {teacher.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end pt-1 w-full overflow-hidden">
                    <Badge
                      variant="secondary"
                      className="px-2.5 py-0.5 font-bold bg-gray-100 text-gray-700 border-none rounded-lg text-[10px]"
                    >
                      {
                        ROLE_OPTIONS.find((role) => role.id === teacher.roleId)
                          ?.label
                      }
                    </Badge>
                    <Badge
                      variant="outline"
                      className="px-2.5 py-0.5 font-bold border-indigo-100 text-indigo-700 bg-indigo-50/30 rounded-lg text-[10px]"
                    >
                      {teacher.departmentName}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-4 mt-2 border-t border-gray-50 h-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSchedule(teacher)}
                      className="flex-1 gap-2 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-black transition-all"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      الجدول
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTeacherForSubject(teacher);
                        setIsAddSubjectOpen(true);
                      }}
                      className="flex-1 gap-2 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-black transition-all"
                    >
                      <BookPlus className="h-3.5 w-3.5" />
                      مادة
                    </Button>
                    <div className="w-px h-full bg-gray-100 mx-1" />
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(teacher)}
                        className="h-full w-10 text-amber-600 hover:bg-amber-50 rounded-xl shrink-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(teacher)}
                        className="h-full w-10 text-red-500 hover:bg-red-50 rounded-xl shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                // Desktop Table Row
                <div
                  key={index}
                  className="group grid grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)] px-6 py-4 hover:bg-blue-50/30 transition-all duration-200 items-center"
                >
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">
                      {teacher.fullName}
                    </div>
                  </div>

                  <div className="text-right min-w-0 overflow-hidden w-full max-w-full">
                    <div dir="ltr" className="text-gray-500 truncate font-mono text-xs font-medium w-full max-w-full block">
                      {teacher.username}
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge
                      variant="secondary"
                      className="px-2.5 py-0.5 font-bold bg-zinc-100 text-zinc-700 border-none rounded-lg text-xs"
                    >
                      {
                        ROLE_OPTIONS.find((role) => role.id === teacher.roleId)
                          ?.label
                      }
                    </Badge>
                  </div>

                  <div className="text-right text-sm text-gray-700 font-medium">
                    {teacher.departmentName}
                  </div>

                  <div className="flex items-center gap-1 justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenSchedule(teacher)}
                      className="h-9 w-9 text-indigo-600 hover:bg-indigo-100/50 rounded-xl transition-all"
                      title="الجدول الدراسي"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setTeacherForSubject(teacher);
                        setIsAddSubjectOpen(true);
                      }}
                      className="h-9 w-9 text-blue-600 hover:bg-blue-100/50 rounded-xl transition-all"
                      title="إضافة مادة"
                    >
                      <BookPlus className="h-4 w-4" />
                    </Button>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(teacher)}
                        className="h-9 w-9 text-amber-600 hover:bg-amber-100/50 rounded-xl transition-all"
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(teacher)}
                        className="h-9 w-9 text-red-600 hover:bg-red-100/50 rounded-xl transition-all"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ),
            )}

            {teachers.length === 0 && (
              <div className="text-center py-20 bg-white">
                <div className="inline-flex items-center justify-center h-16 w-16 bg-gray-50 rounded-full mb-4">
                  <User className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-bold text-lg">
                  لا يوجد مستخدمين مضافين حالياً
                </p>
                <p className="text-gray-400 text-sm mt-1 font-medium">
                  جرب تغيير الفلاتر أو البحث للوصول لنتائج أخرى
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <ShadcnDialog
        open={isScheduleDialogOpen}
        onOpenChange={(open) => !open && handleCloseSchedule()}
      >
        <ShadcnDialogContent
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          <ShadcnDialogHeader>
            <ShadcnDialogTitle className="text-right flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <span>الجدول الدراسي - {activeTeacher?.fullName}</span>
            </ShadcnDialogTitle>
          </ShadcnDialogHeader>

          {fetchTeacherLastActiveSemesterState.isLoading ? (
            <div className="py-12 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : teacherLastActiveSemester.length > 0 ? (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-right text-gray-500 text-xs">
                    اختر المادة
                  </Label>
                  <Select
                    dir="rtl"
                    value={editingSubject?.subjectId.toString()}
                    onValueChange={(val) => {
                      const sub = teacherLastActiveSemester.find(
                        (s) => s.subjectId.toString() === val,
                      );
                      setEditingSubject(sub || null);
                      setIsEditMode(false);
                    }}
                  >
                    <SelectTrigger className="w-full h-12 text-right bg-gray-50 border-gray-100 rounded-xl font-medium">
                      <SelectValue placeholder="اختر مادة" />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      {teacherLastActiveSemester.map((subject) => (
                        <SelectItem
                          key={subject.subjectId}
                          value={subject.subjectId.toString()}
                        >
                          {subject.name} - {subject.specializationName} -{" "}
                          {subject.studyYear === 1
                            ? "سنة أولى"
                            : subject.studyYear === 2
                              ? "سنة ثانية"
                              : null}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editingSubject && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div
                      dir="rtl"
                      className="flex items-center justify-between bg-amber-50/50 p-4 rounded-xl border border-amber-100"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`edit-mode-${editingSubject.subjectId}`}
                          checked={isEditMode}
                          onCheckedChange={(val) => {
                            setIsEditMode(!!val);
                            if (!!val) {
                              dispatch(fetchTeachersList());
                            }
                          }}
                          className="h-5 w-5 border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                        />
                        <div className="flex flex-col gap-0.5">
                          <Label
                            htmlFor={`edit-mode-${editingSubject.subjectId}`}
                            className="text-amber-800 font-bold cursor-pointer"
                          >
                            تعديل البيانات
                          </Label>
                          <span className="text-amber-600/70 text-[10px]">
                            تفعيل وضع التعديل للمادة المحددة
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 text-right" dir="rtl">
                      <div className="grid gap-2">
                        <Label className="text-right">اسم المادة</Label>
                        <Input
                          value={subjectForm.name}
                          disabled={!isEditMode}
                          onChange={(e) =>
                            setSubjectForm({
                              ...subjectForm,
                              name: e.target.value,
                            })
                          }
                          className="text-right h-11 bg-gray-50/30"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label className="text-right">المعلم</Label>
                        <TeacherSearchSelect
                          teachers={teachersList}
                          value={subjectForm.teacherId}
                          disabled={!isEditMode}
                          onValueChange={(val) => {
                            const t = teachersList.find((x) => x.id === val);
                            setSubjectForm({
                              ...subjectForm,
                              teacherId: val,
                              teacherName: t?.name || "",
                            });
                          }}
                        />
                      </div>

                      <div className="grid gap-2 text-right">
                        <Label className="text-right">عدد الساعات</Label>
                        <Input
                          type="number"
                          value={subjectForm.numberOfHours}
                          disabled={!isEditMode}
                          onChange={(e) =>
                            setSubjectForm({
                              ...subjectForm,
                              numberOfHours: Number(e.target.value),
                            })
                          }
                          className="text-right h-11 bg-gray-50/30"
                          min={1}
                          max={10}
                        />
                      </div>
                    </div>

                    {isEditMode && (
                      <div className="pt-2">
                        <Button
                          onClick={handleSaveSubject}
                          disabled={updateSubjectState.isLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-bold text-white shadow-lg shadow-blue-600/20 rounded-xl"
                        >
                          {updateSubjectState.isLoading
                            ? "جاري الحفظ..."
                            : "حفظ التعديلات"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              لا توجد مواد مضافة لهذا المعلم في آخر فصل دراسي نشط.
            </div>
          )}
        </ShadcnDialogContent>
      </ShadcnDialog>

      <AddSubjectToTeacherDialog
        teacher={teacherForSubject}
        open={isAddSubjectOpen}
        onOpenChange={setIsAddSubjectOpen}
        onSuccess={() => {
          setResult({
            success: true,
            message: "تم إضافة المادة للمعلم بنجاح",
            show: true,
          });
          dispatch(fetchTeachersList());
        }}
      />

      <ShadcnDialog
        open={result.show}
        onOpenChange={(show) => {
          setResult({ ...result, show });
          if (!show && result.success && !isAddSubjectOpen) {
            handleCloseSchedule();
          }
        }}
      >
        <ShadcnDialogContent className="sm:max-w-[400px]" dir="rtl">
          <ShadcnDialogHeader>
            <ShadcnDialogTitle
              className={`text-right ${
                result.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {result.success ? "تم بنجاح" : "خطأ"}
            </ShadcnDialogTitle>
          </ShadcnDialogHeader>
          <div className="text-right py-4 text-gray-600">{result.message}</div>
          <ShadcnDialogFooter>
            <Button
              onClick={() => {
                setResult({ ...result, show: false });
                if (result.success && !isAddSubjectOpen) {
                  handleCloseSchedule();
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
            >
              موافق
            </Button>
          </ShadcnDialogFooter>
        </ShadcnDialogContent>
      </ShadcnDialog>
    </Card>
  );
}
