"use client";

import { useState, useEffect } from "react";
import { Plus, Users, UserPlus, Settings, Book, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ImportStudentsDialog } from "./import-students-dialog";
import { EmailImportDialog } from "./email-import-dialog";
import { EditStudentDialog } from "./edit-student-dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Major,
  fetchAcademicYears,
  fetchSpecializations,
  fetchSubjectsBySpecializationThunk,
  deleteSubjectThunk,
  clearSubjects,
  clearEnrollments,
  fetchEnrollmentsBySemester,
  deleteStudentsThunk,
} from "@/features/specialization";
import { StudyYear, DetailedSubjectResponse } from "@/features/subject";
import { MajorStudent, StudentEnrollmentItem } from "@/features/student";
import {
  fetchTeachersList,
  fetchDepartments,
} from "@/features/admin/adminSlice";

// New Extracted Components
import { StatusDialog, StatusType } from "./status-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { StudentDialog } from "./student-dialog";
import { SubjectDialog } from "./subject-dialog";
import { SubjectsList } from "./subjects-list";
import { StudentsList } from "./students-list";

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
  const [students, setStudents] = useState<MajorStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  // Dialog States
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] =
    useState<DetailedSubjectResponse | null>(null);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isEditStudentDialogOpen, setIsEditStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<MajorStudent | null>(
    null,
  );
  const [studentToDelete, setStudentToDelete] = useState<MajorStudent | null>(
    null,
  );
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteAllStudentsConfirmOpen, setIsDeleteAllStudentsConfirmOpen] =
    useState(false);
  const [isDeleteSubjectConfirmOpen, setIsDeleteSubjectConfirmOpen] =
    useState(false);
  const [statusDialog, setStatusDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: StatusType;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  });

  const {
    academicYears = [],
    subjectsBySpecialization = [],
    fetchDetailedSubjectsState = { isLoading: false, error: null },
  } = useAppSelector((state) => state.specializations);

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

  const refreshStudents = async () => {
    try {
      setLoadingStudents(true);
      const result = await dispatch(
        fetchEnrollmentsBySemester({
          semesterId: year.semesterId,
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

  const refreshSubjects = async () => {
    try {
      await dispatch(
        fetchSubjectsBySpecializationThunk({
          specializationId: Number(major.id),
          semesterId: year.semesterId,
          studyYear: year.studyYear,
        }),
      ).unwrap();
    } catch (error: any) {
      if (error !== "لم يتم العثور على مواد ") {
        console.error("Failed to refresh subjects:", error);
      }
    }
  };

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    dispatch(fetchTeachersList());
    setIsSubjectDialogOpen(true);
  };

  const handleOpenEditSubject = (subject: DetailedSubjectResponse) => {
    setEditingSubject(subject);
    setIsSubjectDialogOpen(true);
  };

  const handleOpenDeleteSubject = (id: string) => {
    setSubjectToDelete(id);
    setIsDeleteSubjectConfirmOpen(true);
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;
    try {
      await dispatch(deleteSubjectThunk(Number(subjectToDelete))).unwrap();
      await refreshSubjects();
      setIsDeleteSubjectConfirmOpen(false);
      setSubjectToDelete(null);
      setStatusDialog({
        isOpen: true,
        title: "تم الحذف بنجاح",
        message: "تم حذف المادة بنجاح من النظام",
        type: "success",
      });
      onUpdateYear(year);
    } catch (error: any) {
      setStatusDialog({
        isOpen: true,
        title: "خطأ في حذف المادة",
        message: error || "حدث خطأ غير متوقع أثناء حذف المادة",
        type: "error",
      });
    }
  };

  const handleOpenEditStudent = (student: MajorStudent) => {
    setEditingStudent(student);
    setIsEditStudentDialogOpen(true);
  };

  const handleOpenDeleteStudent = (student: MajorStudent) => {
    setStudentToDelete(student);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      await dispatch(
        deleteStudentsThunk([Number(studentToDelete.studentId)]),
      ).unwrap();
      await refreshStudents();
      setIsDeleteConfirmOpen(false);
      setStudentToDelete(null);
    } catch (error: any) {
      setStatusDialog({
        isOpen: true,
        title: "خطأ في حذف الطالب",
        message: error || "حدث خطأ غير متوقع أثناء حذف الطالب",
        type: "error",
      });
    }
  };
  const confirmDeleteAllStudents = async () => {
    const ids = students.map((s) => Number(s.studentId));
    if (ids.length === 0) return;

    try {
      await dispatch(deleteStudentsThunk(ids)).unwrap();
      await refreshStudents();
      setIsDeleteAllStudentsConfirmOpen(false);
      setStatusDialog({
        isOpen: true,
        title: "تم الحذف بنجاح",
        message: "تم حذف جميع الطلاب بنجاح",
        type: "success",
      });
    } catch (error: any) {
      setStatusDialog({
        isOpen: true,
        title: "خطأ في حذف الطلاب",
        message: error || "حدث خطأ غير متوقع أثناء حذف الطلاب",
        type: "error",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
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
              <span className="mx-1.5 md:mx-2 text-info">/</span>
              {year.studyYear === 1 ? "سنة أولى" : "سنة ثانية"}
            </h3>
            <p className="text-sm text-gray-500 font-medium">
              إدارة المواد الدراسية وقائمة الطلاب المسجلين
            </p>
          </div>
          <Badge className="bg-info-light text-info border-info px-3 py-1.5 text-xs md:text-sm font-semibold w-fit shadow-sm">
            {`${major.name} (${students.length} طالب)`}
          </Badge>
        </div>
      </div>

      <Tabs
        defaultValue="students"
        className="w-full"
        onValueChange={setActiveTab}
        dir="rtl"
      >
        {/* Tab Controls and Actions */}
        <div className="px-4 md:px-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between bg-gray-50/50 py-3 lg:py-0 border-b border-gray-100 gap-4">
          <TabsList className="bg-gray-200/50 p-1.5 h-auto w-full lg:w-auto self-center lg:self-auto rounded-xl grid grid-cols-2 gap-1 lg:flex lg:h-12">
            <TabsTrigger
              value="students"
              className="px-4 cursor-pointer md:px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-info data-[state=active]:shadow-sm transition-all duration-200 h-10 md:h-full gap-2 text-gray-600 font-bold"
            >
              <Users className="h-4 w-4" />
              <span className="text-sm md:text-base">الطلاب</span>
            </TabsTrigger>
            <TabsTrigger
              value="subjects"
              className="px-4 cursor-pointer md:px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:text-info data-[state=active]:shadow-sm transition-all duration-200 h-10 md:h-full gap-2 text-gray-600 font-bold"
            >
              <Book className="h-4 w-4" />
              <span className="text-sm md:text-base">المواد</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2 pb-1 lg:pb-0">
            {activeTab === "subjects" ? (
              <Button
                onClick={handleOpenAddSubject}
                size="sm"
                disabled={!canEdit}
                className="bg-info hover:bg-info-foreground gap-2 cursor-pointer shadow-sm rounded-lg flex-1 md:flex-none justify-center h-10 md:h-9 font-bold transition-all active:scale-95 shadow-info/20"
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
                    className="flex-1 sm:flex-none bg-white hover:bg-gray-50 text-info border-info gap-2 cursor-pointer shadow-sm rounded-lg justify-center h-10 md:h-9 font-bold"
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
                  className="bg-info hover:bg-info-foreground gap-2 cursor-pointer shadow-sm rounded-lg w-full sm:w-auto justify-center h-10 md:h-9 font-bold transition-all active:scale-95 shadow-info/20"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="whitespace-nowrap">إضافة طالب</span>
                </Button>
                {students.length > 0 && (
                  <Button
                    onClick={() => setIsDeleteAllStudentsConfirmOpen(true)}
                    variant="destructive"
                    size="sm"
                    disabled={!canEdit || loadingStudents}
                    className="bg-danger hover:bg-danger-foreground gap-2 cursor-pointer shadow-sm rounded-lg w-full sm:w-auto justify-center h-10 md:h-9 font-bold transition-all active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="whitespace-nowrap">حذف الكل</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subjects Tab Content */}
        <TabsContent
          value="subjects"
          className="mt-0 p-0 border-t border-gray-100"
        >
          <SubjectsList
            subjects={subjectsBySpecialization}
            isLoading={fetchDetailedSubjectsState.isLoading}
            isMobile={isMobile}
            canEdit={canEdit}
            onEdit={handleOpenEditSubject}
            onDelete={handleOpenDeleteSubject}
          />
        </TabsContent>

        {/* Students Tab Content */}
        <TabsContent
          value="students"
          className="mt-0 p-0 border-t border-gray-100"
        >
          <StudentsList
            students={students}
            isLoading={loadingStudents}
            isMobile={isMobile}
            canEdit={canEdit}
            onEdit={handleOpenEditStudent}
            onDelete={handleOpenDeleteStudent}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SubjectDialog
        isOpen={isSubjectDialogOpen}
        onOpenChange={setIsSubjectDialogOpen}
        major={major}
        year={year}
        editingSubject={editingSubject}
        onSuccess={(status) => {
          setStatusDialog({ isOpen: true, ...status });
          if (status.type === "success") {
            refreshSubjects();
            onUpdateYear(year);
          }
        }}
      />

      <StudentDialog
        isOpen={isStudentDialogOpen}
        onOpenChange={setIsStudentDialogOpen}
        major={major}
        year={year}
        onSuccess={refreshStudents}
      />

      <EditStudentDialog
        open={isEditStudentDialogOpen}
        onOpenChange={setIsEditStudentDialogOpen}
        student={editingStudent}
        currentMajor={major}
        currentYear={year}
        onSuccess={refreshStudents}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDeleteStudent}
        description={
          <span>
            هل أنت متأكد من رغبتك في حذف الطالب{" "}
            <span className="font-bold underline text-gray-900 mx-1">
              {studentToDelete?.fullName}
            </span>
            ؟ لا يمكن التراجع عن هذا الإجراء.
          </span>
        }
      />

      <DeleteConfirmDialog
        isOpen={isDeleteAllStudentsConfirmOpen}
        onOpenChange={setIsDeleteAllStudentsConfirmOpen}
        onConfirm={confirmDeleteAllStudents}
        title="حذف جميع الطلاب"
        description={`هل أنت متأكد من رغبتك في حذف جميع الطلاب (${students.length} طالب)؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، حذف الكل"
      />

      <DeleteConfirmDialog
        isOpen={isDeleteSubjectConfirmOpen}
        onOpenChange={setIsDeleteSubjectConfirmOpen}
        onConfirm={confirmDeleteSubject}
        title="تأكيد حذف المادة"
        description="هل أنت متأكد من رغبتك في حذف هذه المادة؟ سيؤدي هذا إلى حذف المادة وجميع البيانات المتعلقة بها من هذا الفصل الدراسي."
        confirmText="نعم، أحذف المادة"
      />

      <StatusDialog
        isOpen={statusDialog.isOpen}
        onOpenChange={(open) =>
          setStatusDialog((prev) => ({ ...prev, isOpen: open }))
        }
        title={statusDialog.title}
        message={statusDialog.message}
        type={statusDialog.type}
      />
    </div>
  );
}
