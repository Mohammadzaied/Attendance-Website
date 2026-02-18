"use client";

import { User, CalendarDays, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchStudentProfile,
  fetchAdminAllSubjects,
  fetchUnifiedAlerts,
  fetchStudentAbsenceDetails,
  editAbsenceStatus,
  deleteAbsenceRecord,
  resetStudentDetails,
} from "@/features/student";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// Refactored Components
import { StudentProfileHeader } from "@/components/admin/studentTab/profile-header";
import { SubjectTabsList } from "@/components/admin/studentTab/subject-tabs-list";
import { AbsenceSubjectSummary } from "@/components/admin/studentTab/absence-subject-summary";
import { AbsenceLogsList } from "@/components/admin/studentTab/absence-logs-list";
import { AlertsSection } from "@/components/admin/studentTab/alerts-section";
import { AbsencesDialogs } from "@/components/admin/studentTab/presence-dialogs";

type Role = "admin" | "department-head";

interface StudentProfileContentProps {
  role?: Role;
  studentId: number;
}

export function StudentProfileContent({
  role = "admin",
  studentId,
}: StudentProfileContentProps) {
  const isDH = role === "department-head";
  const dispatch = useAppDispatch();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [activeSubjectId, setActiveSubjectId] = useState<string>("");
  const [activeTypeTab, setActiveTypeTab] = useState<"absences" | "alerts">(
    "absences",
  );
  const [selectedAlertSubjectId, setSelectedAlertSubjectId] =
    useState<string>("all");

  const {
    profile,
    adminSubjects,
    unifiedAlerts,
    absenceDetails,
    fetchProfileState,
    fetchAdminSubjectsState,
    fetchUnifiedAlertsState,
    fetchAbsenceDetailsState,
    deleteAbsenceState,
    editAbsenceState,
  } = useAppSelector((state) => state.student);

  // Edit/Delete States (Admin only)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [absenceToDelete, setAbsenceToDelete] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [absenceToEdit, setAbsenceToEdit] = useState<{
    id: number;
    status: string;
    reason: string | null;
  } | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editReason, setEditReason] = useState<string>("");

  const subjectsWithAlerts = useMemo(() => {
    if (!unifiedAlerts) return [];
    return unifiedAlerts
      .filter((s) => s.alertsByType.some((t) => t.alerts.length > 0))
      .map((s) => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        numberOfHours: s.numberOfHours,
      }));
  }, [unifiedAlerts]);

  // Initial Profile Fetch & Reset State
  useEffect(() => {
    if (studentId) {
      // 1. Reset everything first
      dispatch(resetStudentDetails());
      setSelectedYearId("");
      setSelectedSemesterId("");
      setActiveSubjectId("");
      setSelectedDate(undefined);
      setSelectedAlertSubjectId("all");

      // 2. Load new profile
      dispatch(fetchStudentProfile(studentId));
    }
  }, [dispatch, studentId]);

  // Set default selection when profile is loaded
  useEffect(() => {
    if (profile && profile.studentId === studentId && !selectedYearId) {
      setSelectedYearId(profile.academicYearId.toString());
      setSelectedSemesterId(profile.semesterId.toString());
    }
  }, [profile, studentId, selectedYearId]);

  // Fetch subjects and alerts when selection changes
  useEffect(() => {
    if (studentId && selectedYearId && selectedSemesterId) {
      const params = {
        academicYearId: Number(selectedYearId),
        semesterId: Number(selectedSemesterId),
        studentId: studentId,
      };
      dispatch(fetchAdminAllSubjects(params));
    }
  }, [dispatch, studentId, selectedYearId, selectedSemesterId]);

  const allSubjects = useMemo(() => {
    return (
      adminSubjects?.specializations.flatMap((spec) =>
        spec.studentAcademicInfos.flatMap((info) =>
          info.subjects.map((s) => ({
            ...s,
            studentAcademicInfoId: info.studentAcademicInfoId,
          })),
        ),
      ) || []
    );
  }, [adminSubjects]);

  // Fetch absence details when active subject changes
  useEffect(() => {
    const activeSubject = allSubjects.find((s) =>
      isDH
        ? s.subjectId.toString() === activeSubjectId
        : `${s.studentAcademicInfoId}-${s.subjectId}` === activeSubjectId,
    );
    if (activeSubject) {
      dispatch(
        fetchStudentAbsenceDetails({
          studentAcademicInfoId: activeSubject.studentAcademicInfoId,
          subjectId: activeSubject.subjectId,
        }),
      );
    }
  }, [dispatch, activeSubjectId, allSubjects, isDH]);

  // Set or update active subject when subjects are loaded
  useEffect(() => {
    if (allSubjects.length) {
      const exists = allSubjects.some((s) =>
        isDH
          ? s.subjectId.toString() === activeSubjectId
          : `${s.studentAcademicInfoId}-${s.subjectId}` === activeSubjectId,
      );
      if (!activeSubjectId || !exists) {
        setActiveSubjectId(
          isDH
            ? allSubjects[0].subjectId.toString()
            : `${allSubjects[0].studentAcademicInfoId}-${allSubjects[0].subjectId}`,
        );
      }
    }
  }, [allSubjects, activeSubjectId, isDH]);

  const handleDeleteAbsence = async () => {
    if (!absenceToDelete || !activeSubjectId || isDH) return;

    const activeSubject = allSubjects.find(
      (s) => `${s.studentAcademicInfoId}-${s.subjectId}` === activeSubjectId,
    );

    if (activeSubject) {
      await dispatch(
        deleteAbsenceRecord({
          absenceId: absenceToDelete,
          studentAcademicInfoId: activeSubject.studentAcademicInfoId,
          subjectId: activeSubject.subjectId,
        }),
      ).unwrap();
      setIsDeleteDialogOpen(false);
      setAbsenceToDelete(null);
    }
  };

  const handleEditAbsence = async () => {
    if (!absenceToEdit || !activeSubjectId || isDH) return;

    const activeSubject = allSubjects.find(
      (s) => `${s.studentAcademicInfoId}-${s.subjectId}` === activeSubjectId,
    );

    if (activeSubject) {
      await dispatch(
        editAbsenceStatus({
          absenceId: absenceToEdit.id,
          status: editStatus === "Absent" ? 1 : editStatus === "Late" ? 3 : 2,
          reason: editStatus === "ExcusedAbsence" ? editReason : null,
          studentAcademicInfoId: activeSubject.studentAcademicInfoId,
          subjectId: activeSubject.subjectId,
        }),
      ).unwrap();
      setIsEditDialogOpen(false);
      setAbsenceToEdit(null);
    }
  };

  const filteredLogs =
    selectedDate && absenceDetails
      ? absenceDetails.absencesByDate.filter(
          (group) =>
            format(new Date(group.date), "yyyy-MM-dd") ===
            format(selectedDate, "yyyy-MM-dd"),
        )
      : absenceDetails?.absencesByDate || [];

  if (
    (fetchProfileState.isLoading && !profile) ||
    fetchAdminSubjectsState.isLoading
  ) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-gray-50/30"
        dir="rtl"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-500/10 border border-gray-100 relative z-10">
            <Spinner className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            جاري تحضير الملف الشخصي
          </h2>
          <p className="text-gray-500 font-medium">
            يرجى الانتظار بينما نقوم بجلب كافة بيانات الطالب...
          </p>
        </div>
      </div>
    );
  }

  if (
    fetchProfileState.error ||
    fetchAdminSubjectsState.error ||
    fetchUnifiedAlertsState.error
  ) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <div className="text-blue-500 mb-4">
          {fetchProfileState.error ||
            fetchAdminSubjectsState.error ||
            fetchUnifiedAlertsState.error}
        </div>
        <Button onClick={() => dispatch(fetchStudentProfile(studentId))}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (!profile || !adminSubjects) return null;

  return (
    <div
      className={cn(
        "min-h-screen bg-gray-50/50",
        isDH ? "p-4 md:p-8" : "p-0 md:p-2", // Removed padding on mobile for non-DH
      )}
      dir="rtl"
    >
      <StudentProfileHeader
        profile={profile}
        selectedYearId={selectedYearId}
        setSelectedYearId={setSelectedYearId}
        selectedSemesterId={selectedSemesterId}
        setSelectedSemesterId={setSelectedSemesterId}
      />

      <div className="max-w-7xl mx-auto flex px-2 md:px-0">
        {" "}
        {/* Added horizontal padding on mobile */}
        <div className="w-full">
          <Card className="border-none shadow-xl shadow-blue-500/5 bg-white h-full flex flex-col overflow-visible rounded-3xl md:rounded-3xl">
            <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between bg-white z-40 shadow-sm rounded-t-3xl gap-4">
              <div className="text-right w-full md:w-auto">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  سجل الطالب التفصيلي
                </h3>
                <div className="flex items-center gap-1 mt-3 md:mt-2 bg-gray-100 p-1 rounded-xl w-full md:w-fit">
                  <button
                    onClick={() => setActiveTypeTab("absences")}
                    className={cn(
                      "flex-1 md:flex-none px-4 py-2 md:py-1.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer",
                      activeTypeTab === "absences"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700",
                    )}
                  >
                    الغيابات
                  </button>
                  <button
                    onClick={() => {
                      setActiveTypeTab("alerts");
                      dispatch(fetchUnifiedAlerts(studentId));
                    }}
                    className={cn(
                      "flex-1 md:flex-none px-4 py-2 md:py-1.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer",
                      activeTypeTab === "alerts"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700",
                    )}
                  >
                    الانذارات
                  </button>
                </div>
              </div>
            </div>

            <Tabs
              value={activeSubjectId}
              onValueChange={setActiveSubjectId}
              dir="rtl"
              className="flex-1 flex flex-col"
            >
              <div className="px-4 md:px-6 py-4 bg-white border-b border-gray-100/80 overflow-x-auto scrollbar-hide">
                <SubjectTabsList
                  adminSubjects={adminSubjects}
                  activeTypeTab={activeTypeTab}
                  isDH={isDH}
                />
              </div>

              <ScrollArea className="flex-1">
                {allSubjects.length > 0 ? (
                  allSubjects.map((subject) => (
                    <TabsContent
                      dir="rtl"
                      key={
                        isDH
                          ? subject.subjectId
                          : `${subject.studentAcademicInfoId}-${subject.subjectId}`
                      }
                      value={
                        isDH
                          ? subject.subjectId.toString()
                          : `${subject.studentAcademicInfoId}-${subject.subjectId}`
                      }
                      className="m-0 p-4 md:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
                    >
                      {activeTypeTab === "absences" ? (
                        <>
                          {fetchAbsenceDetailsState.isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                              <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 animate-bounce">
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                              </div>
                              <p className="text-sm font-bold text-gray-500 mt-2">
                                جاري استرداد سجلات الحضور...
                              </p>
                            </div>
                          ) : (
                            <>
                              <AbsenceSubjectSummary
                                subjectName={subject.subjectName}
                                numberOfHours={subject.numberOfHours}
                                teacherName={subject.teacherName}
                                targetAbsenceDetails={
                                  activeSubjectId ===
                                  (isDH
                                    ? subject.subjectId.toString()
                                    : `${subject.studentAcademicInfoId}-${subject.subjectId}`)
                                    ? absenceDetails
                                    : null
                                }
                              />

                              {activeTypeTab === "absences" && (
                                <div className="px-3 md:px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center gap-2 md:gap-3 rounded-2xl mb-4 overflow-hidden">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className={`gap-2 h-9 border-gray-200 cursor-pointer bg-white text-xs md:text-sm flex-1 md:flex-none ${selectedDate ? "border-blue-200 bg-blue-50 text-blue-600" : ""}`}
                                      >
                                        <CalendarDays className="h-4 w-4" />
                                        {selectedDate
                                          ? format(selectedDate, "PPP", {
                                              locale: ar,
                                            })
                                          : "تصفية بالتاريخ"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-0 border-none shadow-2xl"
                                      align="start"
                                    >
                                      <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        initialFocus
                                        dir="rtl"
                                        locale={ar}
                                        className="bg-white rounded-xl"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  {selectedDate && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedDate(undefined)}
                                      className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 gap-1 h-9 font-bold text-xs md:text-sm"
                                    >
                                      <X className="h-4 w-4" />
                                      إلغاء الفلتر
                                    </Button>
                                  )}
                                </div>
                              )}
                              <AbsenceLogsList
                                filteredLogs={
                                  activeSubjectId ===
                                  (isDH
                                    ? subject.subjectId.toString()
                                    : `${subject.studentAcademicInfoId}-${subject.subjectId}`)
                                    ? filteredLogs
                                    : []
                                }
                                onEdit={
                                  !isDH
                                    ? (lesson) => {
                                        setAbsenceToEdit({
                                          id: lesson.id,
                                          status: lesson.status,
                                          reason: lesson.reason,
                                        });
                                        setEditStatus(lesson.status);
                                        setEditReason(lesson.reason || "");
                                        setIsEditDialogOpen(true);
                                      }
                                    : undefined
                                }
                                onDelete={
                                  !isDH
                                    ? (lessonId) => {
                                        setAbsenceToDelete(lessonId);
                                        setIsDeleteDialogOpen(true);
                                      }
                                    : undefined
                                }
                                isReadOnly={isDH}
                              />
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {fetchUnifiedAlertsState.isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                              <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 animate-bounce">
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                              </div>
                              <p className="text-sm font-bold text-gray-500 mt-2">
                                جاري استرداد بيانات الإنذارات...
                              </p>
                            </div>
                          ) : (
                            <AlertsSection
                              unifiedAlerts={unifiedAlerts || []}
                              subjectsWithAlerts={subjectsWithAlerts}
                              selectedAlertSubjectId={selectedAlertSubjectId}
                              setSelectedAlertSubjectId={
                                setSelectedAlertSubjectId
                              }
                            />
                          )}
                        </>
                      )}
                    </TabsContent>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center px-6">
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
                      <User className="h-10 w-10 md:h-12 md:w-12 text-gray-300" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3">
                      لا توجد مواد مسجلة
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                      يبدو أن الطالب غير مسجل في أي مواد دراسية لهذه الفترة
                      الأكاديمية المحددة.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </Tabs>
          </Card>
        </div>
      </div>

      {!isDH && (
        <AbsencesDialogs
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          editStatus={editStatus}
          setEditStatus={setEditStatus}
          editReason={editReason}
          setEditReason={setEditReason}
          onConfirmEdit={handleEditAbsence}
          onConfirmDelete={handleDeleteAbsence}
          editLoading={editAbsenceState.isLoading}
          deleteLoading={deleteAbsenceState.isLoading}
        />
      )}
    </div>
  );
}
