"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Filter,
  Calendar,
  Settings,
  Plus,
  BookOpen,
  Clock,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTeacherLastActiveSemester } from "@/features/admin/adminSlice";
import { updateSubjectThunk } from "@/features/specialization/specializationsSlice";
import { fetchTeachersList } from "@/features/admin/adminSlice";
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogFooter as ShadcnDialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TeacherSearchSelect } from "@/components/admin/specializationTab/teacher-search-select";
import { useState, useMemo, useEffect } from "react";
import { DetailedSubjectResponse } from "@/features/subject";
import { lessonService, LessonResponse } from "@/features/lesson";

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
    lessons: [] as { lessonId: number; weekDayId: number }[],
  });

  const [allLessons, setAllLessons] = useState<LessonResponse[]>([]);

  const availableDays = [
    { weekDayId: 1, name: "الأحد" },
    { weekDayId: 2, name: "الاثنين" },
    { weekDayId: 3, name: "الثلاثاء" },
    { weekDayId: 4, name: "الأربعاء" },
    { weekDayId: 5, name: "الخميس" },
  ];

  const handleOpenSchedule = async (teacher: TeacherResponse) => {
    setActiveTeacher(teacher);
    setIsScheduleDialogOpen(true);
    // Optional: clear previous data to avoid showing old data
    // dispatch(clearTeacherSchedule()); // If such action exists or just let isLoading handle it
    dispatch(fetchTeacherLastActiveSemester(teacher.userId));

    // Fetch all lessons from system
    try {
      const lessons = await lessonService.getAllLessons();
      setAllLessons(lessons);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    }
  };

  const handleCloseSchedule = () => {
    setIsScheduleDialogOpen(false);
    setEditingSubject(null);
    setIsEditMode(false);
    setActiveTeacher(null);
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
            lessons: subjectForm.lessons,
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
        lessons:
          editingSubject.schedule?.flatMap((day) =>
            day.lessons
              ?.filter((l) => l.isActive)
              .map((l) => ({
                lessonId: l.lessonId,
                weekDayId: day.weekDayId,
              })),
          ) || [],
      });
    }
  }, [editingSubject]);

  return (
    <Card className="shadow-sm border-gray-100 overflow-hidden">
      <CardHeader className="p-6  border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-900 text-right">
              إدارة المعلمين
            </CardTitle>
            <div className="flex items-center justify-end gap-2">
              <span className="text-gray-500 text-sm font-medium">
                عرض وإدارة جميع المعلمين
              </span>
              <div className="h-4 w-px bg-gray-200 mx-1" />
              <span className="text-blue-600 text-sm font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                {teachers.length} معلمين
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row flex-1 items-stretch md:items-center justify-end gap-3">
            <div className="flex flex-wrap items-center gap-2 justify-start">
              <Select
                value={departmentFilter}
                onValueChange={onDepartmentFilterChange}
              >
                <SelectTrigger
                  className="w-full md:w-40 text-right h-10 border-gray-200 bg-gray-50/50"
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
                  className="w-full md:w-40 text-right h-10 border-gray-200 bg-gray-50/50"
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

            <div className="relative md:max-w-xs w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pr-10 text-right h-10 border-gray-200 focus:ring-blue-600/20 bg-gray-50/50"
                dir="rtl"
              />
            </div>
            {headerAction && <div className="flex gap-2">{headerAction}</div>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="w-full">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)] px-6 py-4 bg-gray-600/40 rounded-t-xl border-x border-t border-gray-100">
            <div className="text-right font-bold text-gray-900 text-sm  border-blue-500 rounded-lg align-center justify-items-center justify-center">
              الاسم الكامل
            </div>
            <div className="text-right font-bold text-gray-900 text-sm">
              اسم المستخدم
            </div>
            <div className="text-right font-bold text-gray-900 text-sm">
              الدور
            </div>
            <div className="text-right font-bold text-gray-900 text-sm">
              القسم
            </div>
            <div className=""></div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-300 bg-white">
            {teachers.map((teacher, index) => (
              <div
                key={index}
                // onClick={() => onEdit?.(teacher)}
                className="group flex-col items-center md:grid grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)] px-6 py-4 hover:bg-blue-50/40 transition-all duration-200 cursor-pointer relative gap-3 md:gap-0"
              >
                <div className="text-right pt-3 md:pt-0">
                  <div className="font-bold text-gray-900 text-base md:text-sm">
                    {teacher.fullName}
                  </div>
                </div>

                <div className="text-right pt-3 md:pt-0">
                  <div className="text-gray-600 truncate font-mono text-sm group-hover:text-blue-700 transition-colors">
                    {teacher.username}
                  </div>
                </div>

                <div className="text-right pt-3 md:pt-0">
                  <Badge
                    variant="secondary"
                    className="text-md px-2 py-0.5 font-medium bg-zinc-100 text-zinc-700 border-none rounded-md"
                  >
                    {
                      ROLE_OPTIONS.find((role) => role.id === teacher.roleId)
                        ?.label
                    }
                  </Badge>
                </div>

                <div className="text-right text-md text-gray-900 pt-3 md:pt-0">
                  {teacher.departmentName}
                </div>

                <div className="w-full pt-3 md:pt-0 flex items-center gap-1 justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSchedule(teacher);
                    }}
                    className="h-9 w-9 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100/50 transition-colors"
                    title="الجدول الدراسي"
                  >
                    <Calendar className="h-5 w-5" />
                  </Button>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(teacher);
                      }}
                      className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(teacher);
                      }}
                      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-100/50 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {teachers.length === 0 && (
              <div className="text-center p-12 text-gray-400 font-medium">
                لا يوجد مستخدمين
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
                          {subject.name} - {subject.specializationName}
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

                      <div className="grid gap-4">
                        <Label className="text-right font-bold border-b pb-2 flex items-center justify-between">
                          <span>الحصص الدراسية</span>
                          {!isEditMode && (
                            <span className="text-[10px] font-normal text-gray-400">
                              يتم عرض الأيام التي تحتوي على حصص فقط
                            </span>
                          )}
                        </Label>
                        <div className="grid gap-3">
                          {availableDays
                            .filter((day) => {
                              if (isEditMode) return true;
                              // In preview, only show days that have assigned lessons
                              return subjectForm.lessons.some(
                                (l) => l.weekDayId === day.weekDayId,
                              );
                            })
                            .map((day) => (
                              <div
                                key={day.weekDayId}
                                className="space-y-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100"
                              >
                                <p className="text-xs font-bold text-blue-800 text-right">
                                  {day.name}
                                </p>
                                <div className="flex flex-wrap gap-1.5 justify-start">
                                  {allLessons
                                    .filter((lesson) => {
                                      if (isEditMode) return lesson.isActive;
                                      return subjectForm.lessons.some(
                                        (l) =>
                                          l.lessonId === lesson.lessonId &&
                                          l.weekDayId === day.weekDayId,
                                      );
                                    })
                                    .map((lesson) => {
                                      const isSelected =
                                        subjectForm.lessons.some(
                                          (l) =>
                                            l.lessonId === lesson.lessonId &&
                                            l.weekDayId === day.weekDayId,
                                        );
                                      return (
                                        <ShadcnBadge
                                          key={`${day.weekDayId}-${lesson.lessonId}`}
                                          variant={
                                            isSelected ? "default" : "outline"
                                          }
                                          className={`cursor-pointer transition-all text-[10px] sm:text-xs py-1 px-3 ${
                                            isSelected
                                              ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                                              : "hover:bg-blue-50 text-gray-500 border-gray-200"
                                          } ${!isEditMode ? "opacity-100 cursor-default" : ""}`}
                                          onClick={() => {
                                            if (!isEditMode) return;
                                            if (isSelected) {
                                              setSubjectForm({
                                                ...subjectForm,
                                                lessons:
                                                  subjectForm.lessons.filter(
                                                    (l) =>
                                                      !(
                                                        l.lessonId ===
                                                          lesson.lessonId &&
                                                        l.weekDayId ===
                                                          day.weekDayId
                                                      ),
                                                  ),
                                              });
                                            } else {
                                              setSubjectForm({
                                                ...subjectForm,
                                                lessons: [
                                                  ...subjectForm.lessons,
                                                  {
                                                    lessonId: lesson.lessonId,
                                                    weekDayId: day.weekDayId,
                                                  },
                                                ],
                                              });
                                            }
                                          }}
                                        >
                                          {lesson.name}
                                        </ShadcnBadge>
                                      );
                                    })}
                                </div>
                              </div>
                            ))}
                        </div>
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

      <ShadcnDialog
        open={result.show}
        onOpenChange={(show) => {
          setResult({ ...result, show });
          if (!show && result.success) {
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
                if (result.success) {
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
