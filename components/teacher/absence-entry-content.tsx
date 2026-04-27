"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { AbsenceEntrySection } from "@/components/teacher/absence-entry-section";
import { SuccessDialog } from "@/components/teacher/success-dialog";
import { cn, formatDate } from "@/lib/utils";
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
  fetchTeacherSubjects,
  fetchSubjectStudents,
  getActiveademicYears,
  submitBatchAttendance,
  clearError,
  fetchFavoriteLessons,
  createAbsenceSession,
} from "@/features/teacher";
import { fetchLessons } from "@/features/lesson";
import {
  ReasonMap,
  AbsenceType,
  AbsenceTypeMap,
  LessonIdMap,
  AttendanceStatus,
} from "@/components/teacher/types";
import type { LessonOption } from "@/components/teacher/lesson-multi-select";
import {
  BatchAttendanceCreateDto,
  StudentAttendanceItem,
} from "@/features/teacher/teacherTypes";
import { Student } from "@/features/student";

type Role = "teacher" | "department-head";

interface AbsenceEntryContentProps {
  role: Role;
}

export function AbsenceEntryContent({ role }: AbsenceEntryContentProps) {
  const isDH = role === "department-head";
  const dispatch = useAppDispatch();
  const {
    activeAcademicYears: academicYears,
    subjects,
    students: enrollments,
    fetchStudentsState,
    fetchActiveAcademicYearsState,
    fetchSubjectsState,
    submitAttendanceState,
    favoriteLessonIds,
    createAbsenceSessionState,
  } = useAppSelector((state) => state.teacher);

  const { lessons: apiLessons } = useAppSelector((state) => state.lesson);

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<
    number | null
  >(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const today = new Date();
    if (today.getDay() === 5)
      today.setDate(today.getDate() - 1); // If Friday, default to Thursday
    else if (today.getDay() === 6) today.setDate(today.getDate() + 1); // If Saturday, default to Sunday
    return today;
  });
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

  // Lessons list from API
  const availableLessons = useMemo<LessonOption[]>(() => {
    return apiLessons.map((l) => ({
      lessonId: l.lessonId,
      name: l.name,
    }));
  }, [apiLessons]);

  // Determine if recording is allowed
  const canRecordAttendance = useMemo(() => {
    if (!selectedSection) return false;

    if (absentStudents.size > 0) {
      return Array.from(absentStudents).every((studentId) => {
        const lessons =
          selectedLessonIds[studentId] &&
          selectedLessonIds[studentId].length > 0
            ? selectedLessonIds[studentId]
            : defaultLessonIds;
        return lessons && lessons.length > 0;
      });
    }

    return true;
  }, [selectedSection, absentStudents, selectedLessonIds, defaultLessonIds]);

  // True when lessons are picked but no students are marked as absent
  const isAllPresent = defaultLessonIds.length > 0 && absentStudents.size === 0;

  // Load favorite lessons when subject or date changes
  useEffect(() => {
    if (selectedSection && currentDate) {
      const subjectId = parseInt(selectedSection);
      if (!isNaN(subjectId)) {
        dispatch(
          fetchFavoriteLessons({
            subjectId,
            date: formatDate(currentDate),
          }),
        );
      }
    } else {
      setDefaultLessonIds([]);
    }
  }, [selectedSection, currentDate, dispatch]);

  // Update defaultLessonIds when favoriteLessonIds changes
  useEffect(() => {
    setDefaultLessonIds(favoriteLessonIds);
  }, [favoriteLessonIds]);

  // Reset all absence state when section changes
  useEffect(() => {
    setSelectedLessonIds({});
    setAbsentStudents(new Set());
    setAbsentReason({});
    setAbsenceType({});
  }, [selectedSection]);

  // Update default lesson IDs to be empty by default
  useEffect(() => {
    setDefaultLessonIds([]);
  }, []);

  // Watch for errors in Redux state and show error dialog
  useEffect(() => {
    if (submitAttendanceState.error) {
      setErrorMessage(submitAttendanceState.error);
      setShowErrorDialog(true);
    }
  }, [submitAttendanceState.error]);

  // Load academic years and lessons on mount
  useEffect(() => {
    dispatch(getActiveademicYears());
    dispatch(fetchLessons());
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
      label: `${s.name} - ${s.specializationName} - ${s.studyYear === 1 ? "أولى" : "ثانية"}`,
    }));
  }, [subjects, isDH]);

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
      department: "",
      section: selectedSection,
      level: "",
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
      setSelectedLessonIds({
        ...selectedLessonIds,
        [studentId]: defaultLessonIds,
      });
    }
    setAbsentStudents(newAbsentStudents);
  };

  const handleDefaultLessonIdsChange = (lessonIds: number[]) => {
    setDefaultLessonIds(lessonIds);
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

    // "All present" path: lessons selected but no absent students — show confirm first
    if (isAllPresent) {
      setShowConfirmDialog(true);
      return;
    }

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

    // "All present" path: call createAbsenceSession
    if (isAllPresent) {
      try {
        await dispatch(
          createAbsenceSession({
            subjectId: Number(selectedSection),
            date: formatDate(currentDate),
            lessonIds: defaultLessonIds,
          }),
        ).unwrap();
        setSubmittedAbsentCount(0);
        setShowSuccessDialog(true);
      } catch (error: any) {
        let errorMsg = "فشل في تسجيل الحضور. يرجى المحاولة مرة أخرى.";
        if (typeof error === "string") errorMsg = error;
        else if (error?.message) errorMsg = error.message;
        setErrorMessage(errorMsg);
        setShowErrorDialog(true);
      }
      return;
    }

    try {
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
        date: formatDate(currentDate),
      };

      await dispatch(submitBatchAttendance(batchData)).unwrap();

      const absentCount = absentStudents.size;
      setSubmittedAbsentCount(absentCount);
      setShowSuccessDialog(true);

      setAbsentStudents(new Set());
      setAbsentReason({});
      setAbsenceType({});
      setSelectedLessonIds({});
    } catch (error: any) {
      let errorMsg = "فشل في تسجيل الغياب. يرجى المحاولة مرة أخرى.";
      if (typeof error === "string") errorMsg = error;
      else if (error?.message) errorMsg = error.message;
      else if (submitAttendanceState.error)
        errorMsg = submitAttendanceState.error;

      setErrorMessage(errorMsg);
      setShowErrorDialog(true);
    }
  };

  const currentSectionLabel =
    sectionOptions.find((s) => s.value === selectedSection)?.label || "";

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto pb-10">
      <div className="text-right">
        <h1
          className={cn(
            "text-2xl md:text-3xl font-bold text-gray-900 mb-2",
            isDH && "font-black",
          )}
        >
          تسجيل الغياب
        </h1>
        <p
          className={cn(
            "text-sm md:text-base text-gray-600",
            isDH && "font-medium italic",
          )}
        >
          قم بتسجيل غياب الطلاب حسب الشعب الدراسية
        </p>
      </div>

      <AbsenceEntrySection
        academicYears={academicYears}
        selectedAcademicYearId={selectedAcademicYearId}
        onAcademicYearChange={setSelectedAcademicYearId}
        isLoadingAcademicYears={fetchActiveAcademicYearsState.isLoading}
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
        date={currentDate}
        onDateChange={setCurrentDate}
        onReset={() => {
          setAbsentStudents(new Set());
          setAbsentReason({});
          setAbsenceType({});
          setSelectedLessonIds({});
          setDefaultLessonIds([]);
        }}
        onSubmit={handleSubmitClick}
        onLessonIdsChange={(studentId, lessonIds) =>
          setSelectedLessonIds({ ...selectedLessonIds, [studentId]: lessonIds })
        }
        defaultLessonIds={defaultLessonIds}
        onDefaultLessonIdsChange={handleDefaultLessonIdsChange}
        isSubmitting={submitAttendanceState.isLoading}
        isCreatingSession={createAbsenceSessionState.isLoading}
        isAllPresent={isAllPresent}
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
            <AlertDialogTitle
              className={cn("text-right", isDH && "font-black")}
            >
              تأكيد تسجيل الغياب
            </AlertDialogTitle>
            <AlertDialogDescription
              className={cn("text-right", isDH && "font-medium")}
            >
              {absentStudents.size === 0 ? (
                <>
                  هل أنت متأكد من تسجيل حضور جميع الطلاب ({students.length}{" "}
                  طالب/طالبة) للشعبة {currentSectionLabel}؟
                </>
              ) : (
                <>
                  هل أنت متأكد من تسجيل غياب {absentStudents.size} طالب/طالبة{" "}
                  للشعبة {currentSectionLabel} .
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel
              onClick={() => setShowConfirmDialog(false)}
              className={cn(isDH && "rounded-xl font-bold cursor-pointer")}
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              className={cn(
                "bg-info hover:bg-info-foreground",
                isDH && "rounded-xl font-bold cursor-pointer",
              )}
            >
              تأكيد وإرسال
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle
              className={cn("text-right text-danger", isDH && "font-black")}
            >
              خطأ في تسجيل الغياب
            </AlertDialogTitle>
            <AlertDialogDescription
              className={cn("text-right", isDH && "font-medium")}
            >
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
              className={cn(
                "bg-danger hover:bg-danger-foreground",
                isDH && "rounded-xl font-bold cursor-pointer",
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
