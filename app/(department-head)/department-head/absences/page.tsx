"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { AbsencesList } from "@/components/teacher/absences-list";
import {
  fetchTeacherSubjects,
  getActiveademicYears,
  fetchAbsenceSession,
} from "@/features/teacher";
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
import { format } from "date-fns";
import type { LessonOption } from "@/components/teacher/lesson-multi-select";

export default function DHRecordedAbsencesPage() {
  const dispatch = useAppDispatch();
  const {
    activeAcademicYears: academicYears,
    subjects,
    absenceSession,
    fetchActiveAcademicYearsState: fetchAcademicYearsState,
    fetchAbsenceSessionState,
    fetchSubjectsState,
  } = useAppSelector((state) => state.teacher);

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<
    number | null
  >(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  useEffect(() => {
    dispatch(getActiveademicYears());
  }, [dispatch]);

  useEffect(() => {
    if (academicYears.length > 0 && selectedAcademicYearId === null) {
      setSelectedAcademicYearId(academicYears[0].academicYearId);
    }
  }, [academicYears, selectedAcademicYearId]);

  useEffect(() => {
    if (selectedAcademicYearId !== null) {
      dispatch(fetchTeacherSubjects(selectedAcademicYearId));
      setSelectedSection("");
    }
  }, [selectedAcademicYearId, dispatch]);

  const sectionOptions = useMemo(() => {
    return subjects.map((s) => ({
      value: s.subjectId.toString(),
      label: `${s.name} - ${s.specializationName} - ${s.studyYear === 1 ? "سنة أولى" : "سنة ثانية"} `,
    }));
  }, [subjects]);

  useEffect(() => {
    if (sectionOptions.length > 0 && !selectedSection) {
      setSelectedSection(sectionOptions[0].value);
    }
  }, [sectionOptions, selectedSection]);

  const availableLessons = useMemo<LessonOption[]>(() => {
    if (!selectedSection || !selectedDate) return [];

    const subject = subjects.find(
      (s) => s.subjectId.toString() === selectedSection,
    );
    if (!subject) return [];

    const date = selectedDate;
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const scheduleDay = subject.schedule.find(
      (d) => d.nameEnglish.toLowerCase() === dayName.toLowerCase(),
    );

    if (!scheduleDay || scheduleDay.lessons.length === 0) return [];

    return scheduleDay.lessons.map((lesson) => ({
      lessonId: lesson.lessonId,
      name: lesson.name,
      isActive: lesson.isActive,
    }));
  }, [subjects, selectedSection, selectedDate]);

  useEffect(() => {
    if (selectedAcademicYearId && selectedSection && selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
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
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
          الغيابات المسجلة
        </h1>
        <p className="text-sm md:text-base text-gray-600 font-medium italic">
          عرض وإدارة سجلات الغياب المسجلة
        </p>
      </div>

      <Card className="shadow-sm border-none md:border md:shadow-xs overflow-hidden rounded-xl">
        <CardContent className="p-4 md:p-6">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-right block text-sm font-bold text-gray-700">
                السنة الأكاديمية
              </Label>
              <Select
                dir="rtl"
                value={selectedAcademicYearId?.toString() || ""}
                onValueChange={(value) =>
                  setSelectedAcademicYearId(Number(value))
                }
                disabled={fetchAcademicYearsState.isLoading}
              >
                <SelectTrigger className="w-full h-11 bg-white border-gray-200 rounded-xl cursor-pointer transition-all hover:bg-gray-50">
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem
                      key={year.academicYearId}
                      value={year.academicYearId.toString()}
                      className="cursor-pointer"
                    >
                      {year.year} - {year.year + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                <SelectTrigger className="w-full h-11 bg-white border-gray-200 rounded-xl cursor-pointer transition-all hover:bg-gray-50">
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
                      className="cursor-pointer"
                    >
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      <AbsencesList
        absenceSession={absenceSession}
        isLoading={fetchAbsenceSessionState.isLoading}
        error={fetchAbsenceSessionState.error}
        availableLessons={availableLessons}
        academicYearId={selectedAcademicYearId || 0}
      />
    </div>
  );
}
