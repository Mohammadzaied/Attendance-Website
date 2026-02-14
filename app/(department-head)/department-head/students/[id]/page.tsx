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
import { useState, use, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchStudentProfile,
  fetchAdminAllSubjects,
  fetchUnifiedAlerts,
  fetchStudentAbsenceDetails,
} from "@/features/student";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// Refactored Components
import { StudentProfileHeader } from "@/components/admin/studentTab/profile-header";
import { SubjectTabsList } from "@/components/admin/studentTab/subject-tabs-list";
import { AbsenceSubjectSummary } from "@/components/admin/studentTab/absence-subject-summary";
import { AbsenceLogsList } from "@/components/admin/studentTab/absence-logs-list";
import { AlertsSection } from "@/components/admin/studentTab/alerts-section";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DHStudentProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const studentId = Number(resolvedParams.id);
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
  } = useAppSelector((state) => state.student);

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

  // Initial Profile Fetch
  useEffect(() => {
    if (studentId) {
      dispatch(fetchStudentProfile(studentId));
    }
  }, [dispatch, studentId]);

  // Set default selection when profile is loaded
  useEffect(() => {
    if (profile && !selectedYearId) {
      setSelectedYearId(profile.academicYearId.toString());
      setSelectedSemesterId(profile.semesterId.toString());
    }
  }, [profile, selectedYearId]);

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
    const activeSubject = allSubjects.find(
      (s) => s.subjectId.toString() === activeSubjectId,
    );
    if (activeSubject) {
      dispatch(
        fetchStudentAbsenceDetails({
          studentAcademicInfoId: activeSubject.studentAcademicInfoId,
          subjectId: activeSubject.subjectId,
        }),
      );
    }
  }, [dispatch, activeSubjectId, allSubjects]);

  // Set or update active subject when subjects are loaded
  useEffect(() => {
    if (allSubjects.length) {
      const exists = allSubjects.some(
        (s) => s.subjectId.toString() === activeSubjectId,
      );
      if (!activeSubjectId || !exists) {
        setActiveSubjectId(allSubjects[0].subjectId.toString());
      }
    }
  }, [allSubjects, activeSubjectId]);

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
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8" dir="rtl">
      <StudentProfileHeader
        profile={profile}
        selectedYearId={selectedYearId}
        setSelectedYearId={setSelectedYearId}
        selectedSemesterId={selectedSemesterId}
        setSelectedSemesterId={setSelectedSemesterId}
      />

      <div className="max-w-7xl mx-auto flex">
        <div className="w-full">
          <Card className="border-none shadow-xl shadow-blue-500/5 bg-white h-full flex flex-col overflow-visible">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between  bg-white z-40 shadow-sm rounded-t-3xl">
              <div className="text-right">
                <h3 className="text-xl font-bold text-gray-900">
                  سجل الطالب التفصيلي
                </h3>
                <div className="flex items-center gap-1 mt-2 bg-gray-100 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setActiveTypeTab("absences")}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer",
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
                      "px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer",
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
              <div className="px-6 py-4 bg-white border-b border-gray-100/80 overflow-x-auto">
                <SubjectTabsList
                  adminSubjects={adminSubjects}
                  activeTypeTab={activeTypeTab}
                />

                {activeTypeTab === "absences" && (
                  <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`gap-2 h-9 border-gray-200 cursor-pointer bg-white ${selectedDate ? "border-blue-200 bg-blue-50 text-blue-600" : ""}`}
                        >
                          <CalendarDays className="h-4 w-4" />
                          {selectedDate
                            ? format(selectedDate, "PPP", { locale: ar })
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
                        className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 gap-1 h-9 font-bold"
                      >
                        <X className="h-4 w-4" />
                        إلغاء الفلتر
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1">
                {allSubjects.map((subject) => (
                  <TabsContent
                    dir="rtl"
                    key={subject.subjectId}
                    value={subject.subjectId.toString()}
                    className="m-0 p-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
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
                                activeSubjectId === subject.subjectId.toString()
                                  ? absenceDetails
                                  : null
                              }
                            />
                            <AbsenceLogsList
                              filteredLogs={
                                activeSubjectId === subject.subjectId.toString()
                                  ? filteredLogs
                                  : []
                              }
                              isReadOnly={true}
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
                ))}
              </ScrollArea>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
