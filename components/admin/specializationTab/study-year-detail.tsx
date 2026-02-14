"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Book,
  Users,
  UserPlus,
  MoveRight,
  FileText,
  User,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  Major,
  specializationService as specializationsService,
} from "@/features/specialization";
import {
  StudyYear,
  Subject,
  DetailedSubjectResponse,
  SubjectLessonDto,
} from "@/features/subject";
import {
  LessonResponse,
  WeekDayResponse,
  lessonService,
} from "@/features/lesson";
import { Badge } from "@/components/ui/badge";
import { ImportStudentsDialog } from "./import-students-dialog";
import { EmailImportDialog } from "./email-import-dialog";
import { EditStudentDialog } from "./edit-student-dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Link from "next/link";
import {
  fetchDepartments,
  clearError as clearAdminErrors,
} from "@/features/admin/adminSlice";
import {
  fetchEnrollmentsBySemester,
  createAndEnrollStudentThunk,
  deleteStudentThunk,
  clearError as clearSpecializationErrors,
  fetchAcademicYears,
  fetchSpecializations,
  fetchSubjectsBySpecializationThunk,
  createSubjectThunk,
  updateSubjectThunk,
  deleteSubjectThunk,
  clearSubjects,
  clearEnrollments,
} from "@/features/specialization";
// specializationsService imported above
import { fetchTeachersList } from "@/features/admin/adminSlice";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  MajorStudent,
  StudentEnrollmentItem,
  SemesterEnrollmentsResponse,
} from "@/features/student";
import { TeacherSearchSelect } from "./teacher-search-select";

// toast removed

interface StudyYearDetailProps {
  major: Major;
  year: StudyYear;
  onUpdateYear: (year: StudyYear) => void;
}

export function StudyYearDetail({
  major,
  year,
  onUpdateYear,
}: StudyYearDetailProps) {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("students");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  useEffect(() => {
    refreshStudents();
    dispatch(fetchDepartments());
    dispatch(fetchSpecializations());
    dispatch(fetchAcademicYears());

    return () => {
      dispatch(clearSubjects());
      dispatch(clearEnrollments());
    };
  }, [year.semesterId, dispatch]);

  const [students, setStudents] = useState<MajorStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Subject Dialogs State
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] =
    useState<DetailedSubjectResponse | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    teacherId: "",
    teacherName: "",
    numberOfHours: 3,
    lessons: [] as SubjectLessonDto[],
  });

  const [availableLessons, setAvailableLessons] = useState<LessonResponse[]>(
    [],
  );
  const [availableDays, setAvailableDays] = useState<WeekDayResponse[]>([]);

  useEffect(() => {
    const loadSubjectData = async () => {
      try {
        const [lessons, days] = await Promise.all([
          lessonService.getAllLessons(),
          lessonService.getAllDays(),
        ]);
        setAvailableLessons(lessons);
        setAvailableDays(days);
      } catch (error) {
        console.error("Failed to load subject metadata:", error);
      }
    };
    loadSubjectData();
  }, []);

  // Student Dialogs State
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: "",
    username: "",
  });

  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<MajorStudent | null>(
    null,
  );

  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteSubjectConfirmOpen, setIsDeleteSubjectConfirmOpen] =
    useState(false);

  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const {
    createAndEnrollStudentState = { isLoading: false, error: null },
    academicYears = [],
    specializationAcademicYears = [],
    createSubjectState = { isLoading: false, error: null },
    updateSubjectState = { isLoading: false, error: null },
    deleteSubjectState = { isLoading: false, error: null },
    subjectsBySpecialization = [],
    fetchDetailedSubjectsState = { isLoading: false, error: null },
  } = useAppSelector((state) => state.specializations);

  const { departments, teachersList, fetchTeachersListState } = useAppSelector(
    (state) => state.admin,
  );

  useEffect(() => {
    if (activeTab === "subjects") {
      dispatch(
        fetchSubjectsBySpecializationThunk({
          specializationId: Number(major.id),
          semesterId: year.semesterId,
          studyYear: year.studyYear,
        }),
      );
    }
  }, [activeTab, major.id, year.semesterId, year.studyYear, dispatch]);

  const handleSaveSubject = async () => {
    // if (!subjectForm.name.trim() || !subjectForm.teacherId) return;

    // if (subjectForm.lessons.length !== subjectForm.numberOfHours) {
    //   setErrorDialog({
    //     isOpen: true,
    //     title: "تنبيه التحقق",
    //     message: `يجب اختيار ${subjectForm.numberOfHours} حصص دراسية لتتوافق مع عدد الساعات المحدد (المختار حالياً: ${subjectForm.lessons.length} حصص)`,
    //   });
    //   return;
    // }

    try {
      if (!editingSubject) {
        await dispatch(
          createSubjectThunk({
            name: subjectForm.name,
            specializationId: Number(major.id),
            semesterId: year.semesterId,
            studyYear: year.studyYear,
            teacherId: subjectForm.teacherId,
            numberOfHours: subjectForm.numberOfHours,
            lessons: subjectForm.lessons,
          }),
        ).unwrap();
      } else {
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
      }

      setIsSubjectDialogOpen(false);
      setEditingSubject(null);
      setSubjectForm({
        name: "",
        teacherId: "",
        teacherName: "",
        numberOfHours: 3,
        lessons: [],
      });
      // Refresh the subjects list from backend
      dispatch(
        fetchSubjectsBySpecializationThunk({
          specializationId: Number(major.id),
          semesterId: year.semesterId,
          studyYear: year.studyYear,
        }),
      );
      onUpdateYear(year);
    } catch (error: any) {
      console.error("Failed to save subject:", error);
      setErrorDialog({
        isOpen: true,
        title: editingSubject ? "خطأ في تعديل المادة" : "خطأ في إضافة المادة",
        message: error || "حدث خطأ غير متوقع أثناء معالجة طلبك",
      });
    }
  };

  const handleDeleteSubject = (id: string) => {
    setSubjectToDelete(id);
    setIsDeleteSubjectConfirmOpen(true);
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;
    try {
      await dispatch(deleteSubjectThunk(Number(subjectToDelete))).unwrap();
      dispatch(
        fetchSubjectsBySpecializationThunk({
          specializationId: Number(major.id),
          semesterId: year.semesterId,
          studyYear: year.studyYear,
        }),
      );
      setIsDeleteSubjectConfirmOpen(false);
      setSubjectToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete subject:", error);
      setErrorDialog({
        isOpen: true,
        title: "خطأ في حذف المادة",
        message: error || "حدث خطأ غير متوقع أثناء حذف المادة",
      });
    }
  };

  const [canEdit, setCanEdit] = useState(false);
  const refreshStudents = async () => {
    try {
      setLoadingStudents(true);

      const semesterId = year.semesterId;
      const result = await dispatch(
        fetchEnrollmentsBySemester({
          semesterId,
          specializationId: Number(major.id),
          studyYear: year.studyYear,
        }),
      ).unwrap();

      const updatedStudents: MajorStudent[] = result.items.map(
        (en: StudentEnrollmentItem) => ({
          studentId: en.studentId,
          fullName: en.fullName,
          username: en.username,
          canEdit: result.canEdit,
        }),
      );
      setCanEdit(result.canEdit);

      setStudents(updatedStudents);
    } catch (error) {
      console.error("Failed to refresh students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

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

      // Refresh the student list
      await refreshStudents();

      setIsStudentDialogOpen(false);
      setStudentForm({ name: "", username: "" });
    } catch (error: any) {
      console.error("Failed to add student:", error);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await dispatch(deleteStudentThunk(Number(id))).unwrap();
      await refreshStudents();
      setIsDeleteConfirmOpen(false);
      setStudentToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete student:", error);
      setErrorDialog({
        isOpen: true,
        title: "خطأ في حذف الطالب",
        message: error || "حدث خطأ غير متوقع أثناء حذف الطالب",
      });
    }
  };

  const confirmDelete = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const openEditSubject = (subject: DetailedSubjectResponse) => {
    if (editingSubject?.subjectId !== subject.subjectId) {
      setEditingSubject(subject);
      setSubjectForm({
        name: subject.name,
        teacherId: subject.teacherId || "",
        teacherName: subject.teacherName || "",
        numberOfHours: subject.numberOfHours,
        lessons:
          subject.schedule?.flatMap((day) =>
            day.lessons.map((l) => ({
              lessonId: l.lessonId,
              weekDayId: day.weekDayId,
            })),
          ) || [],
      });
      setIsEditMode(false);
    }
    setIsSubjectDialogOpen(true);
  };

  const handleEditStudent = (student: MajorStudent) => {
    setEditingStudent(student);
    setIsEditStudentDialogOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              {(() => {
                const ay = academicYears.find(
                  (a) => a.academicYearId === year.academicYearId,
                );
                return ay ? `(${ay.year} - ${Number(ay.year) + 1})` : "";
              })()}
              - {major.name} - {year.studyYear === 1 ? "سنة أولى" : "سنة ثانية"}
            </h3>
            <p className="text-sm text-gray-500">
              إدارة المواد الدراسية وقائمة الطلاب
            </p>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 text-sm font-medium w-fit">
            {major.name}
          </Badge>
        </div>
      </div>

      <Tabs
        defaultValue="students"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <div className="px-4 md:px-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-gray-50/50 py-3 sm:py-0 border-b border-gray-100">
          <TabsList className="bg-gray-200/50 p-1 h-11 md:h-12 w-full sm:w-auto self-center sm:self-auto rounded-xl">
            <TabsTrigger
              value="subjects"
              className="px-4 cursor-pointer md:px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200 h-full gap-2 text-gray-600 font-medium"
            >
              <Book className="h-4 w-4" />
              <span className="text-sm md:text-base">المواد الدراسية</span>
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="px-4 cursor-pointer md:px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200 h-full gap-2 text-gray-600 font-medium"
            >
              <Users className="h-4 w-4" />
              <span className="text-sm md:text-base">الطلاب</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-3 sm:mt-0 flex gap-2">
            {activeTab === "subjects" ? (
              <Button
                onClick={() => {
                  if (editingSubject !== null) {
                    setEditingSubject(null);
                    setSubjectForm({
                      name: "",
                      teacherId: "",
                      teacherName: "",
                      numberOfHours: 3,
                      lessons: [],
                    });
                    setIsEditMode(false);
                  }
                  dispatch(fetchTeachersList());
                  setIsSubjectDialogOpen(true);
                }}
                size="sm"
                disabled={students.length > 0 && !canEdit}
                className="bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer shadow-sm rounded-lg flex-1 sm:flex-none justify-center"
              >
                <Plus className="h-4 w-4" />
                {!isMobile && "إضافة مادة جديدة"}
                {isMobile && "إضافة مادة"}
              </Button>
            ) : (
              <div className="flex gap-2 w-full">
                <div className="flex-1 sm:flex-none">
                  <EmailImportDialog
                    open={isEmailDialogOpen}
                    onOpenChange={setIsEmailDialogOpen}
                    onSuccess={refreshStudents}
                    students={students}
                  />
                  <Button
                    onClick={() => setIsEmailDialogOpen(true)}
                    variant="outline"
                    disabled={students.length > 0 && !canEdit}
                    size="sm"
                    className="w-full bg-white hover:bg-gray-50 text-blue-600 border-blue-200 gap-2 cursor-pointer shadow-sm rounded-lg justify-center mb-2 sm:mb-0"
                  >
                    <Settings className="h-4 w-4" />
                    {!isMobile && "ادخال الايميلات"}
                    {isMobile && "الايميلات"}
                  </Button>
                </div>
                <div className="flex-1 sm:flex-none">
                  <ImportStudentsDialog
                    departmentId={major.departmentId}
                    academicYearId={year.academicYearId || 0}
                    studyYear={year.studyYear}
                    specializationId={Number(major.id)}
                    semesterId={year.semesterId}
                    onSuccess={refreshStudents}
                    disabled={students.length > 0 && !canEdit}
                  />
                </div>
                <Button
                  onClick={() => setIsStudentDialogOpen(true)}
                  size="sm"
                  disabled={students.length > 0 && !canEdit}
                  className="bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer shadow-sm rounded-lg flex-1 sm:flex-none justify-center"
                >
                  <UserPlus className="h-4 w-4" />
                  {!isMobile && "إضافة طالب جديد"}
                  {isMobile && "إضافة طالب"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <TabsContent
          value="subjects"
          className="mt-0 p-0 border-t border-gray-100"
        >
          {fetchDetailedSubjectsState.isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
              <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-medium">جاري تحميل المواد...</p>
            </div>
          ) : isMobile ? (
            <div className="p-4 space-y-4">
              {subjectsBySpecialization.length > 0 ? (
                subjectsBySpecialization.map((subject) => (
                  <div
                    key={subject.subjectId}
                    className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-right flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">
                          {subject.name}
                        </h4>
                        <div className="mt-2 space-y-2 text-right">
                          {subject.teacherName ? (
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-gray-700 text-sm font-medium">
                                {subject.teacherName}
                              </span>
                              <div className="h-7 w-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                                {subject.teacherName.charAt(0)}
                              </div>
                            </div>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-red-500 border-red-100 bg-red-50/50 font-normal text-xs"
                            >
                              لم يعين معلم
                            </Badge>
                          )}
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Badge
                              variant="secondary"
                              className="bg-gray-100/80 text-gray-600 hover:bg-gray-200 font-medium text-xs border-none"
                            >
                              {subject.numberOfHours} ساعات
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          openEditSubject(subject);
                        }}
                        className="w-full gap-2 border-gray-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 cursor-pointer text-xs h-9 rounded-lg"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        إدارة المادة
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleDeleteSubject(subject.subjectId.toString());
                        }}
                        className="gap-2 border-gray-200 text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer h-9 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center">
                    <Book className="h-8 w-8 opacity-20" />
                  </div>
                  <p className="font-medium">لا توجد مواد مضافة حالياً</p>
                </div>
              )}
            </div>
          ) : (
            <Table dir="rtl">
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="text-right font-bold text-gray-700 h-12">
                    اسم المادة
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-700 h-12">
                    المعلم المعين
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-700 h-12">
                    الساعات / الجدول
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-700 h-12">
                    التحكم
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjectsBySpecialization.map((subject) => (
                  <TableRow
                    key={subject.subjectId}
                    className="hover:bg-blue-50/10 transition-colors border-b border-gray-50"
                  >
                    <TableCell className="text-right font-bold text-gray-900 border-none">
                      {subject.name}
                    </TableCell>
                    <TableCell className="text-right border-none">
                      {subject.teacherName ? (
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                            {subject.teacherName.charAt(0)}
                          </div>
                          <span className="text-gray-700 font-medium">
                            {subject.teacherName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-red-400 text-sm">لم يعين</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right border-none">
                      <Badge
                        variant="secondary"
                        className="w-fit bg-gray-100 text-gray-600 font-medium border-none"
                      >
                        {subject.numberOfHours} ساعات
                      </Badge>
                    </TableCell>
                    <TableCell className="border-none">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            openEditSubject(subject);
                          }}
                          className="h-9 px-4 gap-2 border-gray-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 cursor-pointer transition-all shadow-sm rounded-lg"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          إدارة
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleDeleteSubject(subject.subjectId.toString());
                          }}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-all focus-visible:ring-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {subjectsBySpecialization.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Book className="h-8 w-8 opacity-20" />
                        <p>لا توجد مواد مضافة حالياً</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent
          value="students"
          className="mt-0 p-0 border-t border-gray-100"
        >
          {isMobile ? (
            <div className="p-4 space-y-4">
              {loadingStudents && (
                <div className="flex items-center justify-center py-12 text-gray-400 gap-3">
                  <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">جاري تحميل الطلاب...</span>
                </div>
              )}
              {!loadingStudents && students.length > 0
                ? students.map((student) => (
                    <div
                      key={String(student.studentId)}
                      className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-4 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ring-2 ring-white">
                          {student.fullName ? student.fullName.charAt(0) : "?"}
                        </div>
                        <div className="text-right flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-base truncate">
                            {student.fullName}
                          </h4>
                          <p className="text-sm text-gray-500 truncate">
                            {student.username || (
                              <span className="text-gray-300 italic text-xs">
                                لا يوجد بريد إلكتروني
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                        <Link
                          href={`/admin/students/${student.studentId}`}
                          target="_blank"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 cursor-pointer h-9 rounded-lg text-xs"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            ملف الطالب
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canEdit}
                          onClick={() => handleEditStudent(student)}
                          className="gap-2 border-gray-200 text-amber-600 hover:bg-amber-50 hover:border-amber-200 cursor-pointer h-9 rounded-lg text-xs"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          تعديل
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!canEdit}
                        onClick={() => confirmDelete(String(student.studentId))}
                        className="w-full gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer h-9 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف الطالب
                      </Button>
                    </div>
                  ))
                : null}
              {!loadingStudents && students.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 opacity-20" />
                  </div>
                  <p className="font-medium text-center">
                    لا يوجد طلاب مسجلين في هذه السنة
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Table dir="rtl">
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="text-right font-bold text-gray-700 h-12">
                    اسم الطالب
                  </TableHead>
                  {/* <TableHead className="text-right font-bold text-gray-700 h-12">
                    الرقم الجامعي
                  </TableHead> */}
                  <TableHead className="text-right font-bold text-gray-700 h-12">
                    البريد الإلكتروني
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-700 h-12">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingStudents && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-40 text-center text-gray-400"
                    >
                      جاري تحميل الطلاب...
                    </TableCell>
                  </TableRow>
                )}
                {!loadingStudents &&
                  students.map((student) => (
                    <TableRow
                      key={student.studentId}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="py-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                            {student.fullName
                              ? student.fullName.charAt(0)
                              : "?"}
                          </div>
                          {student.fullName}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-gray-500 text-sm">
                        {student.username || (
                          <span className="text-gray-300 italic">لا يوجد</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/students/${student.studentId}`}
                            target="_blank"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 px-4 gap-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-all"
                            >
                              <FileText className="h-4 w-4" />
                              ملف الطالب
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!canEdit}
                            onClick={() => handleEditStudent(student)}
                            className="h-9 w-9 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer transition-all focus-visible:ring-amber-500"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!canEdit}
                            onClick={() =>
                              confirmDelete(String(student.studentId))
                            }
                            className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {!loadingStudents && students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Users className="h-8 w-8 opacity-20" />
                        <p>لا يوجد طلاب مسجلين في هذه السنة</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* Subject Dialog */}
      <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
        <DialogContent
          className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
          showCloseButton={false}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-right flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {editingSubject ? <div>تفاصيل المادة</div> : "إضافة مادة جديدة"}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-gray-900"
                onClick={() => {
                  setIsSubjectDialogOpen(false);
                  setTimeout(() => {
                    setEditingSubject(null);
                    setSubjectForm({
                      name: "",
                      teacherId: "",
                      teacherName: "",
                      numberOfHours: 3,
                      lessons: [],
                    });
                    setIsEditMode(false);
                  }, 100);
                }}
              >
                <Plus className="h-5 w-5 rotate-45" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4" dir="rtl">
            {editingSubject && (
              <div className="flex items-center justify-between bg-amber-50/50 p-3 rounded-xl border border-amber-100 mb-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-mode"
                    checked={isEditMode}
                    onCheckedChange={(val) => {
                      setIsEditMode(!!val);
                      if (!!val) {
                        dispatch(fetchTeachersList());
                      }
                    }}
                    className="border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <Label
                    htmlFor="edit-mode"
                    className="text-amber-800 font-bold cursor-pointer"
                  >
                    تعديل البيانات
                  </Label>
                </div>
                <p className="text-xs text-amber-700">
                  قم بتفعيل الخيار لتتمكن من تعديل الجدول أو بيانات المادة
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="s-name" className="text-right">
                اسم المادة
              </Label>
              <Input
                id="s-name"
                value={subjectForm.name}
                disabled={!!editingSubject && !isEditMode}
                onChange={(e) =>
                  setSubjectForm({ ...subjectForm, name: e.target.value })
                }
                className="text-right"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-teacher" className="text-right">
                اسم المعلم
              </Label>
              <TeacherSearchSelect
                teachers={teachersList}
                value={subjectForm.teacherId}
                disabled={!!editingSubject && !isEditMode}
                onValueChange={(val) => {
                  const teacher = teachersList.find((t) => t.id === val);
                  setSubjectForm({
                    ...subjectForm,
                    teacherId: val,
                    teacherName: teacher?.name || "",
                  });
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-hours" className="text-right">
                عدد الساعات
              </Label>
              <Input
                id="s-hours"
                type="number"
                value={subjectForm.numberOfHours}
                disabled={!!editingSubject && !isEditMode}
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    numberOfHours: Number(e.target.value),
                  })
                }
                className="text-right"
              />
            </div>

            <div className="grid gap-4">
              <Label className="text-right font-bold border-b pb-2">
                الحصص الدراسية
              </Label>
              {availableDays.map((day) => (
                <div
                  key={day.weekDayId}
                  className="space-y-2 border-b pb-2 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-700 text-right">
                    {day.name}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-start">
                    {availableLessons
                      .filter((lesson) => {
                        // If adding a subject, show only active lessons
                        if (!editingSubject) return lesson.isActive;
                        // If editing and edit mode is active, show only active lessons
                        if (isEditMode) return lesson.isActive;
                        // Otherwise (viewing existing subject), show all lessons
                        return true;
                      })
                      .map((lesson) => {
                        const isSelected = subjectForm.lessons.some(
                          (l) =>
                            l.lessonId === lesson.lessonId &&
                            l.weekDayId === day.weekDayId,
                        );
                        const isDisabled = !!editingSubject && !isEditMode;

                        return (
                          <Badge
                            key={`${day.weekDayId}-${lesson.lessonId}`}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "hover:bg-blue-50"
                            } ${
                              isDisabled ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                            onClick={() => {
                              if (isDisabled) return;
                              if (isSelected) {
                                setSubjectForm({
                                  ...subjectForm,
                                  lessons: subjectForm.lessons.filter(
                                    (l) =>
                                      !(
                                        l.lessonId === lesson.lessonId &&
                                        l.weekDayId === day.weekDayId
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
                          </Badge>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="flex flex-row gap-2">
            {(!editingSubject || isEditMode) && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubjectDialogOpen(false);
                    // Explicitly reset on Cancel
                    setTimeout(() => {
                      setEditingSubject(null);
                      setSubjectForm({
                        name: "",
                        teacherId: "",
                        teacherName: "",
                        numberOfHours: 3,
                        lessons: [],
                      });
                      setIsEditMode(false);
                    }, 100);
                  }}
                  className="flex-1 cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSaveSubject}
                  disabled={
                    createSubjectState.isLoading || updateSubjectState.isLoading
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  {createSubjectState.isLoading || updateSubjectState.isLoading
                    ? "جاري الحفظ..."
                    : editingSubject
                      ? "حفظ التعديلات"
                      : "حفظ المادة"}
                </Button>
              </>
            )}
            {editingSubject && !isEditMode && (
              <Button
                onClick={() => {
                  setIsSubjectDialogOpen(false);
                  // Explicitly reset on Close
                  setTimeout(() => {
                    setEditingSubject(null);
                    setSubjectForm({
                      name: "",
                      teacherId: "",
                      teacherName: "",
                      numberOfHours: 3,
                      lessons: [],
                    });
                    setIsEditMode(false);
                  }, 100);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border-none cursor-pointer h-10 rounded-lg font-medium"
              >
                إغلاق
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Dialog */}
      <Dialog
        open={isStudentDialogOpen}
        onOpenChange={(val) => {
          setIsStudentDialogOpen(val);
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
                createAndEnrollStudentState.isLoading ||
                !studentForm.name.trim()
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

      {/* Edit/Transfer Student Dialog */}
      <EditStudentDialog
        open={isEditStudentDialogOpen}
        onOpenChange={setIsEditStudentDialogOpen}
        student={editingStudent}
        currentMajor={major}
        currentYear={year}
        onSuccess={refreshStudents}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-right text-red-600">
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription className="text-right py-4">
              هل أنت متأكد من رغبتك في حذف هذا الطالب؟ لا يمكن التراجع عن هذا
              الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="flex-1 cursor-pointer"
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                studentToDelete && handleDeleteStudent(studentToDelete)
              }
              className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteSubjectConfirmOpen}
        onOpenChange={setIsDeleteSubjectConfirmOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-right text-red-600 font-bold text-xl">
              تأكيد حذف المادة
            </DialogTitle>
            <DialogDescription className="text-right py-6 text-gray-600">
              هل أنت متأكد من رغبتك في حذف هذه المادة؟ سيؤدي هذا إلى حذف المادة
              وجميع البيانات المتعلقة بها من هذا الفصل الدراسي.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row-reverse gap-3">
            <Button
              variant="destructive"
              onClick={confirmDeleteSubject}
              className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer font-bold h-11 rounded-xl shadow-md transition-all active:scale-95"
            >
              نعم، أحذف المادة
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteSubjectConfirmOpen(false)}
              className="flex-1 cursor-pointer h-11 rounded-xl border-gray-200 hover:bg-gray-50 font-medium transition-all"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <AlertDialog
        open={errorDialog.isOpen}
        onOpenChange={(open) =>
          setErrorDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 text-right font-bold flex items-center gap-2">
              <span>{errorDialog.title}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right text-gray-600 mt-2">
              {errorDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end mt-4">
            <AlertDialogAction
              onClick={() =>
                setErrorDialog((prev) => ({ ...prev, isOpen: false }))
              }
              className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-8 rounded-xl"
            >
              موافق
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
