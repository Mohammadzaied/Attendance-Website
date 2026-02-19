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
import { cn } from "@/lib/utils";
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
} from "@/features/subject";
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
  });

  // No longer needed: availableLessons, availableDays, loadSubjectData useEffect

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

  const [statusDialog, setStatusDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
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
    // Validation for name and teacher
    if (!subjectForm.name.trim() || !subjectForm.teacherId) {
      setStatusDialog({
        isOpen: true,
        title: "تنبيه التحقق",
        message: "يرجى إدخال اسم المادة واختيار المعلم",
        type: "warning",
      });
      return;
    }

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

      setStatusDialog({
        isOpen: true,
        title: editingSubject ? "تمت العملية بنجاح" : "تمت العملية بنجاح",
        message: editingSubject
          ? "تم تعديل المادة بنجاح"
          : "تم إضافة المادة الجديدة بنجاح",
        type: "success",
      });
    } catch (error: any) {
      console.error("Failed to save subject:", error);
      setStatusDialog({
        isOpen: true,
        title: editingSubject ? "خطأ في تعديل المادة" : "خطأ في إضافة المادة",
        message: error || "حدث خطأ غير متوقع أثناء معالجة طلبك",
        type: "error",
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

      // Show success dialog
      setStatusDialog({
        isOpen: true,
        title: "تم الحذف بنجاح",
        message: "تم حذف المادة بنجاح من النظام",
        type: "success",
      });
    } catch (error: any) {
      console.error("Failed to delete subject:", error);
      setStatusDialog({
        isOpen: true,
        title: "خطأ في حذف المادة",
        message: error || "حدث خطأ غير متوقع أثناء حذف المادة",
        type: "error",
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
      setStatusDialog({
        isOpen: true,
        title: "خطأ في حذف الطالب",
        message: error || "حدث خطأ غير متوقع أثناء حذف الطالب",
        type: "error",
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
              {(() => {
                const ay = academicYears.find(
                  (a) => a.academicYearId === year.academicYearId,
                );
                return ay ? `(${ay.year} - ${Number(ay.year) + 1})` : "";
              })()}
              <span className="mx-1.5 md:mx-2">-</span>
              {major.name}
              <span className="mx-1.5 md:mx-2 text-blue-600">/</span>
              {year.studyYear === 1 ? "سنة أولى" : "سنة ثانية"}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              إدارة المواد الدراسية وقائمة الطلاب المسجلين
            </p>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1.5 text-xs md:text-sm font-semibold w-fit shadow-sm">
            {major.name}
          </Badge>
        </div>
      </div>

      <Tabs
        defaultValue="students"
        className="w-full"
        onValueChange={setActiveTab}
        dir="rtl"
      >
        <div className="px-4 md:px-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between bg-gray-50/50 py-3 lg:py-0 border-b border-gray-100 gap-4">
          <TabsList className="bg-gray-200/50 p-1.5 h-auto w-full lg:w-auto self-center lg:self-auto rounded-xl grid grid-cols-2 gap-1 lg:flex lg:h-12">
            <TabsTrigger
              value="students"
              className="px-4 cursor-pointer md:px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200 h-10 md:h-full gap-2 text-gray-600 font-bold"
            >
              <Users className="h-4 w-4" />
              <span className="text-sm md:text-base">الطلاب</span>
            </TabsTrigger>
            <TabsTrigger
              value="subjects"
              className="px-4 cursor-pointer md:px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200 h-10 md:h-full gap-2 text-gray-600 font-bold"
            >
              <Book className="h-4 w-4" />
              <span className="text-sm md:text-base">المواد</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2 pb-1 lg:pb-0">
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
                    });
                    setIsEditMode(false);
                  }
                  dispatch(fetchTeachersList());
                  setIsSubjectDialogOpen(true);
                }}
                size="sm"
                disabled={!canEdit}
                className="bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer shadow-sm rounded-lg flex-1 md:flex-none justify-center h-10 md:h-9 font-bold transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span className="whitespace-nowrap">إضافة مادة جديدة</span>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <div className="flex gap-2 w-full sm:w-auto">
                  <EmailImportDialog
                    open={isEmailDialogOpen}
                    onOpenChange={setIsEmailDialogOpen}
                    onSuccess={refreshStudents}
                    students={students}
                  />
                  <Button
                    onClick={() => setIsEmailDialogOpen(true)}
                    variant="outline"
                    disabled={!canEdit}
                    size="sm"
                    className="flex-1 sm:flex-none bg-white hover:bg-gray-50 text-blue-600 border-blue-200 gap-2 cursor-pointer shadow-sm rounded-lg justify-center h-10 md:h-9 font-bold"
                  >
                    <Settings className="h-4 w-4" />
                    {!isMobile && "ادخال الايميلات"}
                    {isMobile && "الايميلات"}
                  </Button>
                  <div className="flex-1 sm:flex-none">
                    <ImportStudentsDialog
                      departmentId={major.departmentId}
                      academicYearId={year.academicYearId || 0}
                      studyYear={year.studyYear}
                      specializationId={Number(major.id)}
                      semesterId={year.semesterId}
                      onSuccess={refreshStudents}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => setIsStudentDialogOpen(true)}
                  size="sm"
                  disabled={!canEdit}
                  className="bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer shadow-sm rounded-lg w-full sm:w-auto justify-center h-10 md:h-9 font-bold transition-all active:scale-95"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="whitespace-nowrap">إضافة طالب</span>
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
            <div className="p-4 space-y-3 bg-gray-50/30">
              {subjectsBySpecialization.length > 0 ? (
                subjectsBySpecialization.map((subject) => (
                  <div
                    key={subject.subjectId}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 text-right">
                          <h4
                            className="font-bold text-gray-900 text-lg leading-tight truncate"
                            title={subject.name}
                          >
                            {subject.name}
                          </h4>
                          <div className="flex flex-wrap gap-2 justify-end mt-1">
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-[10px] border-none px-2"
                            >
                              {subject.numberOfHours} ساعات
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              handleDeleteSubject(subject.subjectId.toString());
                            }}
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditSubject(subject)}
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50 bg-gray-50/50 -mx-4 px-4 py-2 mt-auto">
                        <div className="flex items-center gap-2">
                          {subject.teacherName ? (
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-black ring-2 ring-white">
                                {subject.teacherName.charAt(0)}
                              </div>
                              <span
                                className="text-gray-700 text-sm font-bold truncate max-w-[150px]"
                                title={subject.teacherName}
                              >
                                {subject.teacherName}
                              </span>

                            </div>
                          ) : (
                            <span className="text-red-500 text-xs font-medium">
                              لم يعين معلم
                            </span>
                          )}
                        </div>
                        {/* <span className="text-[10px] text-gray-400 font-medium">
                          ID: {subject.subjectId}
                        </span> */}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
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
                    <TableCell className="text-right font-bold text-gray-900 border-none overflow-hidden max-w-[250px]">
                      <div className="truncate" title={subject.name}>
                        {subject.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right border-none">
                      {subject.teacherName ? (
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                            {subject.teacherName.charAt(0)}
                          </div>
                          <span
                            className="text-gray-700 font-medium truncate max-w-[150px]"
                            title={subject.teacherName}
                          >
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
            <div className="p-4 space-y-3 bg-gray-50/30 ">
              {loadingStudents && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4">
                  <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="font-bold text-sm">
                    جاري تحميل الطلاب...
                  </span>
                </div>
              )}
              {!loadingStudents && students.length > 0
                ? students.map((student) => (
                    <div
                      key={String(student.studentId)}
                      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm  overflow-hidden group"
                    >
                      <div className="bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-4 ">
                        <div className="h-14 w-14 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center text-xl font-black shadow-sm ring-4 ring-white shrink-0">
                          {student.fullName ? student.fullName.charAt(0) : "?"}
                        </div>
                        <div className="text-right flex-col  overflow-hidden!">
                          <div
                            className="font-bold text-gray-900 text-lg truncate max-w-[150px] leading-tight"
                            title={student.fullName}
                          >
                            {student.fullName}
                          </div>
                          <div
                            className="text-right text-xs text-gray-400 font-medium truncate max-w-[150px] mt-0.5"
                            title={student.username || undefined}
                            dir="ltr"
                          >
                            {student.username || "لا يوجد بريد إلكتروني"}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 mt-4 border-t border-gray-50 h-10">
                        <Link
                          href={`/admin/students/${student.studentId}`}
                          target="_blank"
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 border-gray-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 cursor-pointer h-full rounded-lg text-xs font-bold"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            الملف
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canEdit}
                          onClick={() => handleEditStudent(student)}
                          className="flex-1 gap-2 border-gray-100 text-amber-600 hover:bg-amber-50 hover:border-amber-200 cursor-pointer h-full rounded-lg text-xs font-bold"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!canEdit}
                          onClick={() =>
                            confirmDelete(String(student.studentId))
                          }
                          className="h-full w-10 text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                : null}
              {!loadingStudents && students.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
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
                  <TableHead className="text-center font-bold text-gray-700 h-12">
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
                      <TableCell className="py-4 font-semibold text-gray-900 overflow-hidden max-w-[250px]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
                            {student.fullName
                              ? student.fullName.charAt(0)
                              : "?"}
                          </div>
                          <span className="truncate" title={student.fullName}>
                            {student.fullName}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-gray-500 text-sm overflow-hidden max-w-[200px]">
                        <div
                          className="truncate"
                          title={student.username || undefined}
                          dir="ltr"
                        >
                          {student.username || (
                            <span className="text-gray-300 italic">
                              لا يوجد
                            </span>
                          )}
                        </div>
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
      <Dialog
        open={isSubjectDialogOpen}
        onOpenChange={(open) => {
          setIsSubjectDialogOpen(open);
          if (!open) {
            setTimeout(() => {
              setEditingSubject(null);
              setSubjectForm({
                name: "",
                teacherId: "",
                teacherName: "",
                numberOfHours: 3,
              });
              setIsEditMode(false);
            }, 100);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-right flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {editingSubject ? <div>تفاصيل المادة</div> : "إضافة مادة جديدة"}
              </div>
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

            {/* Scheduling removed per user request */}
          </div>
          <DialogFooter className="flex flex-row gap-2">
            {(!editingSubject || isEditMode) && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsSubjectDialogOpen(false)}
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
                onClick={() => setIsSubjectDialogOpen(false)}
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

      {/* Status Dialog */}
      <AlertDialog
        open={statusDialog.isOpen}
        onOpenChange={(open) =>
          setStatusDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent className="sm:max-w-[400px]" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle
              className={cn(
                "text-right font-bold flex items-center gap-2 text-xl",
                statusDialog.type === "error"
                  ? "text-red-600"
                  : statusDialog.type === "success"
                    ? "text-emerald-600"
                    : "text-amber-600",
              )}
            >
              {statusDialog.type === "error" && (
                <Plus className="h-5 w-5 rotate-45" />
              )}
              {statusDialog.type === "success" && (
                <ShieldCheck className="h-5 w-5" />
              )}
              {statusDialog.type === "warning" && (
                <Settings className="h-5 w-5 animate-spin-slow" />
              )}
              <span>{statusDialog.title}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right text-gray-600 mt-3 leading-relaxed">
              {statusDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction
              onClick={() =>
                setStatusDialog((prev) => ({ ...prev, isOpen: false }))
              }
              className={cn(
                "w-full h-11 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-white border-none cursor-pointer",
                statusDialog.type === "error"
                  ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                  : statusDialog.type === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                    : "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
              )}
            >
              موافق
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
