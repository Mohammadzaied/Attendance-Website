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
import {
  Edit,
  Trash2,
  Search,
  Calendar,
  BookPlus,
  ArrowRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTeacherLastActiveSemester,
  clearTeacherLastActiveSemester,
} from "@/features/admin/adminSlice";
import {
  updateSubjectThunk,
  deleteSubjectThunk,
} from "@/features/specialization/specializationsSlice";
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
import { DeleteConfirmDialog } from "@/components/admin/specializationTab/delete-confirm-dialog";
import { useState, useMemo, useEffect } from "react";
import { DetailedSubjectResponse } from "@/features/subject";
import { AddSubjectToTeacherDialog } from "./add-subject-to-teacher-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type TeachersTableProps = {
  teachers: TeacherResponse[];
  totalCount?: number;
  isLoading?: boolean;
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
  totalCount,
  isLoading,
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
  const { teacherLastActiveSemester, fetchTeacherLastActiveSemesterState } =
    useAppSelector((state) => state.admin);
  const { updateSubjectState, deleteSubjectState } = useAppSelector(
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
  const [isDeleteSubjectConfirmOpen, setIsDeleteSubjectConfirmOpen] =
    useState(false);

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    show: boolean;
    shouldCloseSchedule?: boolean;
  }>({
    success: false,
    message: "",
    show: false,
    shouldCloseSchedule: false,
  });

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
      subjectForm.teacherId !== editingSubject.teachers?.[0]?.userId ||
      subjectForm.numberOfHours !== editingSubject.numberOfHours
    );
  }, [subjectForm, editingSubject]);

  const handleOpenSchedule = async (teacher: TeacherResponse) => {
    dispatch(clearTeacherLastActiveSemester());
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
        shouldCloseSchedule: true,
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

  const handleDeleteSubject = async () => {
    if (!editingSubject) return;

    try {
      await dispatch(deleteSubjectThunk(editingSubject.subjectId)).unwrap();

      // Refresh schedule data
      if (activeTeacher) {
        dispatch(fetchTeacherLastActiveSemester(activeTeacher.userId));
      }

      setIsDeleteSubjectConfirmOpen(false);
      setEditingSubject(null);
      setIsEditMode(false);

      setResult({
        success: true,
        message: "تم حذف المادة بنجاح",
        show: true,
        shouldCloseSchedule: false,
      });
    } catch (error) {
      console.error("Failed to delete subject:", error);
      setResult({
        success: false,
        message: typeof error === "string" ? error : "فشل في حذف المادة",
        show: true,
      });
    }
  };

  useEffect(() => {
    if (editingSubject) {
      setSubjectForm({
        name: editingSubject.name || "",
        teacherId: editingSubject.teachers?.[0]?.userId || "",
        teacherName: editingSubject.teachers?.[0]?.fullName || "",
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
              <Badge className="bg-info-light text-info border-none px-2.5 py-0.5 text-xs font-bold leading-none shadow-sm">
                {totalCount ?? teachers.length} معلمين
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
                    <SelectItem
                      key={dept.departmentId}
                      value={dept.departmentId.toString()}
                    >
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
                className="pr-10 text-right h-10 border-gray-200 focus:ring-info/20 bg-gray-50/50 rounded-xl text-xs md:text-sm"
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
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 border-4 border-info border-t-transparent rounded-full animate-spin" />
                  <span className="text-info font-bold text-sm">
                    جاري التحميل...
                  </span>
                </div>
              </div>
            )}
            {teachers.map((teacher, index) =>
              isMobile ? (
                // Mobile Card Layout
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden group space-y-4 w-full"
                >
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-info opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-center gap-4 w-full min-w-0">
                    <div className="h-14 w-14 bg-info-light text-info rounded-2xl flex items-center justify-center text-xl font-black shadow-sm ring-4 ring-white shrink-0">
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
                      <p
                        dir="ltr"
                        className="text-xs text-info font-mono font-medium mt-1 line-clamp-1 break-all"
                      >
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
                      className="px-2.5 py-0.5 font-bold border-info text-info bg-info-light/30 rounded-lg text-[10px]"
                    >
                      {teacher.departmentName}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-4 mt-2 border-t border-gray-50 h-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSchedule(teacher)}
                      className="flex-1 gap-2 text-info hover:bg-info-light rounded-xl text-xs font-black transition-all"
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
                      className="flex-1 gap-2 text-info hover:bg-info-light rounded-xl text-xs font-black transition-all"
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
                        className="h-full w-10 text-warning hover:bg-warning-light rounded-xl shrink-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(teacher)}
                        className="h-full w-10 text-danger hover:bg-danger-light rounded-xl shrink-0"
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
                  className="group grid grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)] px-6 py-4 hover:bg-info-light/30 transition-all duration-200 items-center"
                >
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">
                      {teacher.fullName}
                    </div>
                  </div>

                  <div className="text-right min-w-0 overflow-hidden w-full max-w-full">
                    <div
                      dir="ltr"
                      className="text-gray-500 truncate font-mono text-xs font-medium w-full max-w-full block"
                    >
                      {teacher.username}
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge
                      variant="secondary"
                      className="px-2.5 py-0.5 font-bold bg-gray-100 text-gray-700 border-none rounded-lg text-xs"
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
                      className="h-9 w-9 text-info hover:bg-info-light/50 rounded-xl transition-all"
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
                      className="h-9 w-9 text-info hover:bg-info-light/50 rounded-xl transition-all"
                      title="إضافة مادة"
                    >
                      <BookPlus className="h-4 w-4" />
                    </Button>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(teacher)}
                        className="h-9 w-9 text-warning hover:bg-warning-light/50 rounded-xl transition-all"
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
                        className="h-9 w-9 text-danger hover:bg-danger-light/50 rounded-xl transition-all"
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
            <ShadcnDialogTitle className="text-right flex items-center gap-2 w-full">
              <Calendar className="h-5 w-5 text-info shrink-0" />
              <span className="truncate">
                الجدول الدراسي - {activeTeacher?.fullName}
              </span>
              {teacherLastActiveSemester.length > 0 &&
                !fetchTeacherLastActiveSemesterState.isLoading && (
                  <Badge className="mr-auto bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 ml-6 font-bold shrink-0">
                    {teacherLastActiveSemester.reduce(
                      (acc, s) => acc + (s.numberOfHours || 0),
                      0,
                    )}{" "}
                    حصة
                  </Badge>
                )}
            </ShadcnDialogTitle>
          </ShadcnDialogHeader>

          {fetchTeacherLastActiveSemesterState.isLoading ? (
            <div className="py-12 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : teacherLastActiveSemester.length > 0 ? (
            <div className="space-y-4">
              {!editingSubject ? (
                <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1 pb-2">
                  {teacherLastActiveSemester.map((subject) => (
                    <div
                      key={subject.subjectId}
                      className="group flex flex-col p-4 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-info/30 transition-all rounded-xl"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col items-start gap-1.5 flex-1 pr-3">
                          <h3 className="font-bold text-gray-800 text-lg text-right leading-tight">
                            {subject.name}
                          </h3>
                          <div
                            className="flex flex-wrap items-center gap-2 justify-start"
                            dir="rtl"
                          >
                            <Badge
                              variant="outline"
                              className="bg-info-light/30 text-info border-info/20 text-xs py-0"
                            >
                              {subject.specializationName}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-gray-600 border-gray-200 text-xs py-0"
                            >
                              {subject.studyYear === 1
                                ? "سنة أولى"
                                : subject.studyYear === 2
                                  ? "سنة ثانية"
                                  : ""}
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-2 text-primary font-bold flex flex-col items-center justify-center min-w-[50px] shrink-0">
                          <span className="text-xl leading-none">
                            {subject.numberOfHours || 1}
                          </span>
                          <span className="text-[10px] text-primary/70 mt-1">
                            حصص
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-gray-50">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSubject(subject);
                            setIsEditMode(false);
                          }}
                          className="h-8 text-info hover:text-info hover:bg-info-light gap-2 font-medium"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          تعديل تفاصيل المادة
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSubject(null)}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
                    >
                      <ArrowRight className="h-4 w-4 ml-2" />
                      العودة للقائمة
                    </Button>
                    <Badge className="bg-info text-white text-sm py-1 px-3">
                      {editingSubject.name}
                    </Badge>
                  </div>

                  <div className="grid gap-4 text-right" dir="rtl">
                    <div className="grid gap-2">
                      <Label className="text-right">اسم المادة</Label>
                      <Input
                        value={subjectForm.name}
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

                    <div className="grid gap-2 text-right">
                      <Label className="text-right">عدد الحصص</Label>
                      <Input
                        type="number"
                        value={subjectForm.numberOfHours}
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

                  <div className="pt-2 flex flex-col gap-3">
                    <Button
                      onClick={handleSaveSubject}
                      disabled={updateSubjectState.isLoading || !hasChanges}
                      className="w-full bg-info hover:bg-info-foreground h-11 font-bold text-white shadow-lg shadow-info/20 rounded-xl"
                    >
                      {updateSubjectState.isLoading
                        ? "جاري الحفظ..."
                        : "حفظ التعديلات"}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setIsDeleteSubjectConfirmOpen(true)}
                      disabled={deleteSubjectState.isLoading}
                      className="w-full text-danger hover:text-danger hover:bg-danger-light h-11 font-bold rounded-xl border border-dashed border-danger"
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      {deleteSubjectState.isLoading
                        ? "جاري الحذف..."
                        : "حذف المادة نهائياً"}
                    </Button>
                  </div>
                </div>
              )}
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
        }}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteSubjectConfirmOpen}
        onOpenChange={setIsDeleteSubjectConfirmOpen}
        onConfirm={handleDeleteSubject}
        title="تأكيد حذف المادة"
        description="هل أنت متأكد من رغبتك في حذف هذه المادة؟ سيؤدي هذا إلى حذف المادة وجميع البيانات المتعلقة بها."
        confirmText="نعم، حذف المادة"
      />

      <ShadcnDialog
        open={result.show}
        onOpenChange={(show) => {
          setResult({ ...result, show });
          if (
            !show &&
            result.success &&
            result.shouldCloseSchedule &&
            !isAddSubjectOpen
          ) {
            handleCloseSchedule();
          }
        }}
      >
        <ShadcnDialogContent className="sm:max-w-[400px]" dir="rtl">
          <ShadcnDialogHeader>
            <ShadcnDialogTitle
              className={`text-right ${
                result.success ? "text-success" : "text-danger"
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
                if (
                  result.success &&
                  result.shouldCloseSchedule &&
                  !isAddSubjectOpen
                ) {
                  handleCloseSchedule();
                }
              }}
              className="w-full bg-info hover:bg-info-foreground text-white font-bold h-11"
            >
              موافق
            </Button>
          </ShadcnDialogFooter>
        </ShadcnDialogContent>
      </ShadcnDialog>
    </Card>
  );
}
