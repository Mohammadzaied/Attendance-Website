"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AbsenceTableRow } from "./absence-table-row";
import {
  type AbsenceType,
  type AbsenceTypeMap,
  type ReasonMap,
  type LessonIdMap,
} from "./types";
import { LessonMultiSelect, type LessonOption } from "./lesson-multi-select";
import { useIsMobile } from "@/hooks/use-mobile";
import { type AcademicYear } from "@/features/academicYear";
import { Student } from "@/features/student";

type AbsenceEntrySectionProps = {
  academicYears: AcademicYear[];
  selectedAcademicYearId: number | null;
  onAcademicYearChange: (yearId: number) => void;
  isLoadingAcademicYears?: boolean;
  isLoadingSubjects?: boolean;
  sections: { value: string; label: string }[];
  availableLessons: LessonOption[];
  canRecordAttendance?: boolean;
  selectedSection: string;
  onSectionChange: (value: string) => void;
  students: Student[];
  isLoadingStudents?: boolean;
  absentStudents: Set<string>;
  selectedLessonIds: LessonIdMap;
  absenceType: AbsenceTypeMap;
  absentReason: ReasonMap;
  onToggleStudent: (id: string) => void;
  onTypeChange: (id: string, type: AbsenceType) => void;
  onReasonChange: (id: string, reason: string) => void;
  onReset: () => void;
  onSubmit: () => void;
  onLessonIdsChange: (id: string, lessonIds: number[]) => void;
  defaultLessonIds: number[];
  onDefaultLessonIdsChange: (lessonIds: number[]) => void;
  isSubmitting?: boolean;
  /** Shown under subject dropdown when no subjects or fetch error */
  subjectHelperText?: string | null;
  /** When true, helper text is styled as error (red); otherwise amber for info */
  subjectHelperIsError?: boolean;
};

export function AbsenceEntrySection({
  academicYears,
  selectedAcademicYearId,
  onAcademicYearChange,
  isLoadingAcademicYears,
  isLoadingSubjects,
  sections,
  availableLessons,
  canRecordAttendance = true,
  selectedSection,
  onSectionChange,
  students,
  isLoadingStudents,
  absentStudents,
  selectedLessonIds,
  absenceType,
  absentReason,
  onToggleStudent,
  onTypeChange,
  onReasonChange,
  onReset,
  onSubmit,
  onLessonIdsChange,
  defaultLessonIds,
  onDefaultLessonIdsChange,
  isSubmitting = false,
  subjectHelperText,
  subjectHelperIsError = false,
}: AbsenceEntrySectionProps) {
  const isMobile = useIsMobile();

  const selectedLabel =
    sections.find((s) => s.value === selectedSection)?.label ??
    (isLoadingSubjects
      ? "جاري التحميل..."
      : sections.length === 0
        ? "لا توجد مواد"
        : "اختر المادة...");

  const selectedYearLabel =
    academicYears.find((y) => y.academicYearId === selectedAcademicYearId)
      ?.year || "اختر السنة...";

  return (
    <Card className="shadow-sm border-none md:border md:shadow-xs mb-6 md:mb-8 overflow-hidden rounded-xl">
      <CardHeader className="px-4 md:px-6 pt-2 pb-4 md:pb-6 text-right">
        <CardTitle className="text-lg md:text-xl font-bold text-blue-900 leading-tight">
          تسجيل الغياب اليومي
        </CardTitle>
        <CardDescription className="text-blue-700/70 text-sm mt-1">
          اختر الشعبة والتاريخ ثم حدد الطلاب الغائبين
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label
              htmlFor="academic-year"
              className="text-right block text-sm font-bold text-gray-700"
            >
              السنة الأكاديمية
            </Label>
            <Select
              dir="rtl"
              value={selectedAcademicYearId?.toString() || ""}
              onValueChange={(value) => onAcademicYearChange(Number(value))}
              disabled={isLoadingAcademicYears}
            >
              <SelectTrigger
                id="academic-year"
                className="w-full h-11 bg-white border-gray-200"
              >
                <SelectValue placeholder="اختر السنة">
                  {Number(selectedYearLabel)} - {Number(selectedYearLabel) + 1}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem
                    key={year.academicYearId}
                    value={year.academicYearId.toString()}
                  >
                    {Number(year.year)} - {Number(year.year) + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="section"
              className="text-right block text-sm font-bold text-gray-700"
            >
              المادة / الشعبة الدراسية
            </Label>
            <Select
              dir="rtl"
              value={selectedSection}
              onValueChange={onSectionChange}
              disabled={
                !selectedAcademicYearId ||
                isLoadingSubjects ||
                sections.length === 0
              }
            >
              <SelectTrigger
                id="section"
                className="w-full h-11 bg-white border-gray-200"
              >
                <SelectValue placeholder="اختر المادة">
                  {selectedLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {subjectHelperText && (
              <p
                className={`text-xs text-right mt-1 ${
                  subjectHelperIsError ? "text-red-500" : "text-amber-600"
                }`}
              >
                {subjectHelperText}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="default-lessons"
              className="text-right block text-sm font-bold text-gray-700"
            >
              الحصص الافتراضية
            </Label>
            <LessonMultiSelect
              lessons={availableLessons}
              selectedLessonIds={defaultLessonIds}
              onSelectionChange={onDefaultLessonIdsChange}
              disabled={!selectedSection || !canRecordAttendance}
              placeholder="اختر الحصص"
              className="h-9"
            />
          </div>
        </div>

        {!canRecordAttendance && sections.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="text-right">
              <p className="font-bold">لا يوجد حصص اليوم</p>
              <p className="text-sm opacity-90">
                لا يمكن تسجيل غياب في يوم ليس به حصص مجدولة لهذه المادة.
              </p>
            </div>
          </div>
        )}

        <div
          className={`space-y-3 ${
            !canRecordAttendance
              ? "opacity-50 grayscale pointer-events-none"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <Label className="text-right block text-base font-bold text-gray-800">
              قائمة الطلاب
            </Label>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
              {students.length} طالب
            </span>
          </div>

          <div className="relative min-h-[200px]">
            {isLoadingStudents && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-blue-800">
                    جاري تحميل القائمة...
                  </p>
                </div>
              </div>
            )}

            {isMobile ? (
              <div className="space-y-3 pt-2 pb-2">
                {students.length === 0 && !isLoadingStudents ? (
                  <div className="py-12 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    لا يوجد طلاب مسجلين في هذه المادة.
                  </div>
                ) : (
                  students.map((student) => (
                    <AbsenceTableRow
                      key={student.id}
                      student={student}
                      isSelected={absentStudents.has(student.id)}
                      selectedLessonIds={selectedLessonIds[student.id] || []}
                      availableLessons={availableLessons}
                      absenceType={absenceType[student.id]}
                      reason={absentReason[student.id]}
                      onToggle={() => onToggleStudent(student.id)}
                      onTypeChange={(type) => onTypeChange(student.id, type)}
                      onReasonChange={(reason) =>
                        onReasonChange(student.id, reason)
                      }
                      onLessonIdsChange={(lessonIds) =>
                        onLessonIdsChange(student.id, lessonIds)
                      }
                      isMobile={true}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="hover:bg-transparent border-b-gray-100">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="text-right font-bold text-gray-700">
                        اسم الطالب
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-700">
                        الحصص
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-700 pr-10">
                        النوع
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-700">
                        سبب الغياب (غياب بعذر)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 && !isLoadingStudents ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-32 text-center text-gray-500"
                        >
                          لا يوجد طلاب مسجلين في هذه المادة.
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <AbsenceTableRow
                          key={student.id}
                          student={student}
                          isSelected={absentStudents.has(student.id)}
                          selectedLessonIds={
                            selectedLessonIds[student.id] || []
                          }
                          availableLessons={availableLessons}
                          absenceType={absenceType[student.id]}
                          reason={absentReason[student.id]}
                          onToggle={() => onToggleStudent(student.id)}
                          onTypeChange={(type) =>
                            onTypeChange(student.id, type)
                          }
                          onReasonChange={(reason) =>
                            onReasonChange(student.id, reason)
                          }
                          onLessonIdsChange={(lessonIds) =>
                            onLessonIdsChange(student.id, lessonIds)
                          }
                          isMobile={false}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
          <Button
            onClick={onSubmit}
            disabled={
              !canRecordAttendance || isSubmitting || absentStudents.size === 0
            }
            className="w-full md:w-auto h-12 md:h-11 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 transition-all font-bold active:scale-[0.98]"
          >
            {isSubmitting
              ? "جاري الحفظ..."
              : `حفظ الغياب (${absentStudents.size})`}
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            disabled={absentStudents.size === 0}
            className="w-full md:w-auto h-12 md:h-11 border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
          >
            إلغاء الكل
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
