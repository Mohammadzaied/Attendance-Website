"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { AbsencesList } from "@/components/teacher/absences-list";
import {
  fetchTeacherSubjects,
  getActiveademicYears,
  fetchAbsenceSession,
} from "@/features/teacher";
import { fetchLessons } from "@/features/lesson";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { cn, formatDate } from "@/lib/utils";
import type { LessonOption } from "@/components/teacher/lesson-multi-select";

type Role = "teacher" | "department-head";

interface RecordedAbsencesContentProps {
  role: Role;
}

export function RecordedAbsencesContent({
  role,
}: RecordedAbsencesContentProps) {
  const isDH = role === "department-head";
  const dispatch = useAppDispatch();
  const {
    activeAcademicYears: academicYears,
    subjects,
    absenceSession,
    fetchActiveAcademicYearsState,
    fetchAbsenceSessionState,
    fetchSubjectsState,
  } = useAppSelector((state) => state.teacher);

  const { lessons: apiLessons } = useAppSelector((state) => state.lesson);

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<
    number | null
  >(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

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
      // Reset all state when year changes
      setSelectedSection("");
    }
  }, [selectedAcademicYearId, dispatch]);

  // Derived section options for the dropdown
  const sectionOptions = useMemo(() => {
    return subjects.map((s) => ({
      value: s.subjectId.toString(),
      label: `${s.name} - ${s.specializationName} - ${s.studyYear === 1 ? "سنة أولى" : "سنة ثانية"} `,
    }));
  }, [subjects]);

  // Set initial selected section when subjects load
  useEffect(() => {
    if (sectionOptions.length > 0 && !selectedSection) {
      setSelectedSection(sectionOptions[0].value);
    }
  }, [sectionOptions, selectedSection]);

  // Lessons list from API
  const availableLessons = useMemo<LessonOption[]>(() => {
    return apiLessons.map((l) => ({
      lessonId: l.lessonId,
      name: l.name,
      isActive: l.isActive,
    }));
  }, [apiLessons]);

  useEffect(() => {
    if (selectedAcademicYearId && selectedSection && selectedDate) {
      const formattedDate = formatDate(selectedDate);
      dispatch(
        fetchAbsenceSession({
          subjectId: Number(selectedSection),
          date: formattedDate,
          academicYearId: selectedAcademicYearId,
        }),
      );
    }
  }, [selectedAcademicYearId, selectedSection, selectedDate, dispatch]);

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto pb-10">
      <div className="text-right">
        <h1
          className={cn(
            "text-md md:text-3xl font-bold text-gray-900 mb-2",
            isDH && "font-black",
          )}
        >
          الغيابات المسجلة - السنة الأكاديمية{" "}
          {selectedAcademicYearId && (
            <span className={cn("text-blue-900")}>
              ({" "}
              {
                academicYears.find(
                  (y) => y.academicYearId === selectedAcademicYearId,
                )?.year
              }{" "}
              -{" "}
              {Number(
                academicYears.find(
                  (y) => y.academicYearId === selectedAcademicYearId,
                )?.year,
              ) + 1}{" "}
              )
            </span>
          )}
        </h1>
        <p
          className={cn(
            "text-sm md:text-base text-gray-600",
            isDH && "font-medium italic",
          )}
        >
          عرض وإدارة سجلات الغياب المسجلة
        </p>
      </div>

      <Card
        className={cn(
          "shadow-sm border-none md:border md:shadow-xs overflow-hidden rounded-xl",
        )}
      >
        <CardContent className="p-4 md:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-right block text-sm font-bold text-gray-700">
                المادة / الشعبة الدراسية
              </Label>
              <Select
                dir="rtl"
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={
                  !selectedAcademicYearId || fetchSubjectsState.isLoading
                }
              >
                <SelectTrigger
                  className={cn(
                    "w-full h-11 bg-white border-gray-200",
                    isDH &&
                      "rounded-xl cursor-pointer transition-all hover:bg-gray-50",
                  )}
                >
                  <SelectValue
                    placeholder={
                      fetchSubjectsState.isLoading
                        ? "جاري التحميل..."
                        : sectionOptions.length === 0
                          ? "لا توجد مواد"
                          : "اختر المادة"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map((section) => (
                    <SelectItem
                      key={section.value}
                      value={section.value}
                      className={cn(isDH && "cursor-pointer")}
                    >
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fetchSubjectsState.error && (
                <p className="text-xs text-red-500 text-right mt-1">
                  {fetchSubjectsState.error}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <DatePicker
                date={selectedDate}
                setDate={setSelectedDate}
                label="تاريخ الغياب"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {fetchSubjectsState.error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-red-600 font-bold text-lg mb-1">
                خطأ في تحميل المواد
              </p>
              <p className="text-red-500 text-sm">{fetchSubjectsState.error}</p>
            </div>
          </div>
        </div>
      ) : sectionOptions.length === 0 &&
        !fetchSubjectsState.isLoading &&
        selectedAcademicYearId !== null ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <p
                className={cn(
                  "text-amber-700 font-bold text-lg mb-1",
                  isDH && "font-black",
                )}
              >
                لا توجد مواد دراسية
              </p>
              <p
                className={cn("text-amber-600 text-sm", isDH && "font-medium")}
              >
                لا توجد مواد دراسية مسجلة لهذه السنة الأكاديمية
              </p>
            </div>
          </div>
        </div>
      ) : (
        <AbsencesList
          absenceSession={absenceSession}
          isLoading={fetchAbsenceSessionState.isLoading}
          error={fetchAbsenceSessionState.error}
          availableLessons={availableLessons}
          academicYearId={selectedAcademicYearId || 0}
        />
      )}
    </div>
  );
}
