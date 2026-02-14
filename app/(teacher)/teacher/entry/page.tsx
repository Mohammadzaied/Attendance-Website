"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { AbsenceEntrySection } from "@/components/teacher/absence-entry-section";
import { SuccessDialog } from "@/components/teacher/success-dialog";
// import { type Student, type AbsenceRecord } from "@/lib/mock-data";
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
  addAbsences,
  fetchTeacherSubjects,
  fetchSubjectStudents,
  getActiveademicYears,
  fetchServerTime,
  submitBatchAttendance,
  clearError,
} from "@/features/teacher";
import {
  ReasonMap,
  AbsenceType,
  AbsenceTypeMap,
  AbsenceCountMap,
  LessonIdMap,
  AttendanceStatus,
} from "@/components/teacher/types";
import type { LessonOption } from "@/components/teacher/lesson-multi-select";
import {
  AbsenceRecord,
  BatchAttendanceCreateDto,
  StudentAttendanceItem,
} from "@/features/teacher/teacherTypes";
import { Student } from "@/features/student";

export default function AbsenceEntryPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.AuthSlice);
  const {
    activeAcademicYears: academicYears,
    subjects,
    students: enrollments,
    serverTime,
    fetchStudentsState,
    fetchActiveAcademicYearsState: fetchAcademicYearsState,
    fetchSubjectsState,
    submitAttendanceState,
  } = useAppSelector((state) => state.teacher);

  // Initialize selectedSection with an empty string or first subject later
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<
    number | null
  >(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [absentStudents, setAbsentStudents] = useState<Set<string>>(new Set());
  const [absentReason, setAbsentReason] = useState<ReasonMap>({});
  const [absenceType, setAbsenceType] = useState<AbsenceTypeMap>({});
  const [selectedLessonIds, setSelectedLessonIds] = useState<LessonIdMap>({});
  const [defaultLessonIds, setDefaultLessonIds] = useState<number[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submittedAbsentCount, setSubmittedAbsentCount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Get current date (server-synced or local fallback)
  const currentDate = useMemo(() => {
    if (serverTime?.date) {
      // Return date in YYYY-MM-DD format
      return serverTime.date.split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  }, [serverTime]);

  // Get lessons from schedule for the current date
  const availableLessons = useMemo<LessonOption[]>(() => {
    if (!selectedSection) return [];

    const subject = subjects.find(
      (s) => s.subjectId.toString() === selectedSection,
    );
    if (!subject) return [];

    const [year, month, day] = currentDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const scheduleDay = subject.schedule.find(
      (d) => d.nameEnglish.toLowerCase() === dayName.toLowerCase(),
    );

    if (!scheduleDay || scheduleDay.lessons.length === 0) return [];

    return scheduleDay.lessons
      .filter((lesson: any) => lesson.isActive)
      .map((lesson) => ({
        lessonId: lesson.lessonId,
        name: lesson.name,
      }));
  }, [subjects, selectedSection, currentDate]);

  // Determine if recording is allowed
  const canRecordAttendance = availableLessons.length > 0;

  // Reset all absence state when section changes
  useEffect(() => {
    setSelectedLessonIds({});
    setAbsentStudents(new Set());
    setAbsentReason({});
    setAbsenceType({});
  }, [selectedSection]);

  // Update default lesson IDs when available lessons change
  useEffect(() => {
    setDefaultLessonIds(availableLessons.map((l) => l.lessonId));
  }, [availableLessons]);

  // Watch for errors in Redux state and show error dialog
  useEffect(() => {
    if (submitAttendanceState.error) {
      setErrorMessage(submitAttendanceState.error);
      setShowErrorDialog(true);
    }
  }, [submitAttendanceState.error]);

  // Load academic years and server time on mount
  useEffect(() => {
    dispatch(getActiveademicYears());
    dispatch(fetchServerTime());
  }, [dispatch]);

  // Set initial academic year when years load
  useEffect(() => {
    if (academicYears.length > 0 && selectedAcademicYearId === null) {
      setSelectedAcademicYearId(academicYears[0].academicYearId);
    }
  }, [academicYears, selectedAcademicYearId]);

  // Load subjects when academic year is selected
  useEffect(() => {
    if (selectedAcademicYearId !== null) {
      dispatch(fetchTeacherSubjects(selectedAcademicYearId));
      // Reset all state when year changes
      setSelectedSection("");
      setAbsentStudents(new Set());
      setAbsentReason({});
      setAbsenceType({});
      setSelectedLessonIds({});
      setDefaultLessonIds([]);
    }
  }, [selectedAcademicYearId, dispatch]);

  // Derived section options for the dropdown
  const sectionOptions = useMemo(() => {
    return subjects.map((s) => ({
      value: s.subjectId.toString(),
      label: `${s.name} - ${s.specializationName}`,
    }));
  }, [subjects]);

  // Set initial selected section when subjects load
  useEffect(() => {
    if (sectionOptions.length > 0 && !selectedSection) {
      setSelectedSection(sectionOptions[0].value);
    }
  }, [sectionOptions, selectedSection]);

  // Fetch students when selection changes
  useEffect(() => {
    if (selectedSection) {
      const subjectId = Number(selectedSection);
      dispatch(fetchSubjectStudents(subjectId));
    }
  }, [selectedSection, dispatch]);

  // Map enrollments to local Student type
  const students = useMemo<Student[]>(() => {
    return enrollments.map((en) => ({
      id: en.studentId.toString(),
      name: en.fullName,
      studentNumber: en.username || "-",
      department: "", // Not in the new response
      section: selectedSection,
      level: "", // Not directly in this response
      absenceCount: 0,
      attendanceRate: 100,
    }));
  }, [enrollments, selectedSection]);

  const handleAbsenceToggle = (studentId: string) => {
    const newAbsentStudents = new Set(absentStudents);
    if (newAbsentStudents.has(studentId)) {
      newAbsentStudents.delete(studentId);
      const newReasons = { ...absentReason };
      delete newReasons[studentId];
      setAbsentReason(newReasons);
      const newTypes = { ...absenceType };
      delete newTypes[studentId];
      setAbsenceType(newTypes);
      const newLessonIds = { ...selectedLessonIds };
      delete newLessonIds[studentId];
      setSelectedLessonIds(newLessonIds);
    } else {
      newAbsentStudents.add(studentId);
      setAbsenceType({ ...absenceType, [studentId]: "absence" });
      // Set lessons from current default
      setSelectedLessonIds({
        ...selectedLessonIds,
        [studentId]: defaultLessonIds,
      });
    }
    setAbsentStudents(newAbsentStudents);
  };

  const handleDefaultLessonIdsChange = (lessonIds: number[]) => {
    setDefaultLessonIds(lessonIds);

    // Update all currently absent students to the new default
    const newSelectedLessonIds = { ...selectedLessonIds };
    absentStudents.forEach((studentId) => {
      newSelectedLessonIds[studentId] = lessonIds;
    });
    setSelectedLessonIds(newSelectedLessonIds);
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setAbsentReason({ ...absentReason, [studentId]: reason });
  };

  const handleTypeChange = (studentId: string, type: AbsenceType) => {
    setAbsenceType({ ...absenceType, [studentId]: type });
  };

  // Map AbsenceType to AttendanceStatus
  const mapAbsenceTypeToStatus = (type: AbsenceType): AttendanceStatus => {
    switch (type) {
      case "absence":
        return AttendanceStatus.Absent;
      case "excused":
        return AttendanceStatus.ExcusedAbsence;
      case "late":
        return AttendanceStatus.Late;
      default:
        return AttendanceStatus.Absent;
    }
  };

  const handleSubmitClick = () => {
    if (!canRecordAttendance) return;

    // Check if any absent student has no lessons selected
    const studentsMissingLessons = Array.from(absentStudents).filter(
      (studentId) => {
        const lessonIds = selectedLessonIds[studentId] || [];
        return lessonIds.length === 0;
      },
    );

    if (studentsMissingLessons.length > 0 && availableLessons.length > 0) {
      setErrorMessage("يجب اختيار حصة واحدة على الأقل لكل طالب غائب.");
      setShowErrorDialog(true);
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);

    try {
      // Prepare attendance items only for absent students
      const attendanceItems: StudentAttendanceItem[] = Array.from(
        absentStudents,
      ).map((studentId) => {
        const enrollment = enrollments.find(
          (e) => e.studentId.toString() === studentId,
        );
        const lessonIds = selectedLessonIds[studentId] || [];
        const type = absenceType[studentId] || "absence";
        const status = mapAbsenceTypeToStatus(type);
        const reason = type === "excused" ? absentReason[studentId] : undefined;

        return {
          studentAcademicInfoId: enrollment?.studentAcademicInfoId || 0,
          status,
          reason: reason || null,
          ListIdLessons: lessonIds,
        };
      });

      const batchData: BatchAttendanceCreateDto = {
        students: attendanceItems,
        subjectId: Number(selectedSection),
        // date: currentDate,
      };

      await dispatch(submitBatchAttendance(batchData)).unwrap();

      // Also update local state for UI
      const newAbsences: AbsenceRecord[] = Array.from(absentStudents).map(
        (studentId) => {
          const student = students.find((s: Student) => s.id === studentId)!;
          const lessonIds = selectedLessonIds[studentId] || [];
          const count = lessonIds.length;
          const type = absenceType[studentId] || "absence";

          return {
            id: `${Date.now()}-${studentId}`,
            studentId,
            studentName: student.name,
            date: currentDate,
            section: selectedSection,
            count,
            type,
            isExcused: type === "excused",
            reason: absentReason[studentId] || undefined,
            recordedBy: user?.fullName || "المعلم",
          };
        },
      );

      // Save the count before clearing the state
      const absentCount = absentStudents.size;

      dispatch(addAbsences(newAbsences));
      setSubmittedAbsentCount(absentCount);
      setShowSuccessDialog(true);

      setAbsentStudents(new Set());
      setAbsentReason({});
      setAbsenceType({});
      setSelectedLessonIds({});
    } catch (error) {
      // Extract error message
      let errorMsg = "فشل في تسجيل الغياب. يرجى المحاولة مرة أخرى.";

      if (error && typeof error === "object" && "message" in error) {
        errorMsg = error.message as string;
      } else if (typeof error === "string") {
        errorMsg = error;
      } else if (submitAttendanceState.error) {
        errorMsg = submitAttendanceState.error;
      }

      setErrorMessage(errorMsg);
      setShowErrorDialog(true);
      console.error("Failed to submit attendance:", error);
    }
  };

  const currentSectionLabel =
    sectionOptions.find((s) => s.value === selectedSection)?.label || "مبينة";

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto pb-10">
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          تسجيل الغياب
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          قم بتسجيل غياب الطلاب حسب الشعب الدراسية
        </p>
      </div>

      <AbsenceEntrySection
        academicYears={academicYears}
        selectedAcademicYearId={selectedAcademicYearId}
        onAcademicYearChange={setSelectedAcademicYearId}
        isLoadingAcademicYears={fetchAcademicYearsState.isLoading}
        isLoadingSubjects={fetchSubjectsState.isLoading}
        sections={sectionOptions}
        availableLessons={availableLessons}
        canRecordAttendance={canRecordAttendance}
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
        students={students}
        isLoadingStudents={fetchStudentsState.isLoading}
        absentStudents={absentStudents}
        selectedLessonIds={selectedLessonIds}
        absenceType={absenceType}
        absentReason={absentReason}
        onToggleStudent={handleAbsenceToggle}
        onTypeChange={handleTypeChange}
        onReasonChange={handleReasonChange}
        onReset={() => {
          setAbsentStudents(new Set());
          setAbsentReason({});
          setAbsenceType({});
          setSelectedLessonIds({});
          setDefaultLessonIds(availableLessons.map((l) => l.lessonId));
        }}
        onSubmit={handleSubmitClick}
        onLessonIdsChange={(studentId, lessonIds) =>
          setSelectedLessonIds({ ...selectedLessonIds, [studentId]: lessonIds })
        }
        defaultLessonIds={defaultLessonIds}
        onDefaultLessonIdsChange={handleDefaultLessonIdsChange}
        isSubmitting={submitAttendanceState.isLoading}
        subjectHelperText={
          fetchSubjectsState.error
            ? fetchSubjectsState.error
            : sectionOptions.length === 0 &&
                !fetchSubjectsState.isLoading &&
                selectedAcademicYearId !== null
              ? "لا توجد مواد دراسية لهذه السنة الأكاديمية"
              : undefined
        }
        subjectHelperIsError={!!fetchSubjectsState.error}
      />

      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        count={submittedAbsentCount}
        section={currentSectionLabel}
      />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              تأكيد تسجيل الغياب
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {absentStudents.size === 0 ? (
                <>
                  هل أنت متأكد من تسجيل حضور جميع الطلاب ({students.length}{" "}
                  طالب/طالبة) للشعبة {currentSectionLabel}؟
                </>
              ) : (
                <>
                  هل أنت متأكد من تسجيل غياب {absentStudents.size} طالب/طالبة{" "}
                  {currentSectionLabel} .
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              تأكيد وإرسال
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-red-600">
              خطأ في تسجيل الغياب
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              onClick={() => {
                setShowErrorDialog(false);
                setErrorMessage("");
                dispatch(clearError());
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              موافق
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
