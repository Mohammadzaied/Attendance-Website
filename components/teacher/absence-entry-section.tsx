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
import { DatePicker } from "@/components/ui/date-picker";
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
  onAcademicYearChange: (yearId: number | null) => void;
  isLoadingAcademicYears?: boolean;
  isLoadingSubjects?: boolean;
  sections: { value: string; label: string }[];
  availableLessons: LessonOption[];
  canRecordAttendance?: boolean;
  selectedSection: string;
  onSectionChange: (value: string) => void;
  date: Date;
  onDateChange: (date: Date) => void;
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
  isCreatingSession?: boolean;
  /** When lessons are selected but no students are marked absent */
  isAllPresent?: boolean;
  /** Shown under subject dropdown when no subjects or fetch error */
  subjectHelperText?: string | null;
  /** When true, helper text is styled as error (red); otherwise amber for info */
  subjectHelperIsError?: boolean;
};

export function AbsenceEntrySection({
  academicYears,
  selectedAcademicYearId,
  isLoadingSubjects,
  sections,
  availableLessons,
  canRecordAttendance = true,
  selectedSection,
  onSectionChange,
  date,
  onDateChange,
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
  isCreatingSession = false,
  isAllPresent = false,
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
        <CardTitle className="text-sm md:text-xl font-bold text-blue-900 leading-tight">
          تسجيل الغياب اليومي
          {selectedAcademicYearId && (
            <>
              {" "}
              - السنة الأكاديمية ({Number(selectedYearLabel)} -{" "}
              {Number(selectedYearLabel) + 1})
            </>
          )}
        </CardTitle>
        <CardDescription className="text-blue-700/70 text-sm mt-1">
          اختر الشعبة والتاريخ ثم حدد الطلاب الغائبين
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
              الحصص
            </Label>
            <LessonMultiSelect
              lessons={availableLessons}
              selectedLessonIds={defaultLessonIds}
              onSelectionChange={onDefaultLessonIdsChange}
              disabled={!selectedSection}
              placeholder="اختر الحصص"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <DatePicker
              label="تاريخ الغياب"
              date={date}
              setDate={(d) => d && onDateChange(d)}
            />
          </div>
        </div>

        <div className={`space-y-3`}>
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
              !canRecordAttendance ||
              isSubmitting ||
              isCreatingSession ||
              (defaultLessonIds.length === 0 && absentStudents.size === 0)
            }
            className="w-full md:w-auto h-12 md:h-11 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 transition-all font-bold active:scale-[0.98]"
          >
            {isCreatingSession
              ? "جاري الحفظ..."
              : isSubmitting
                ? "جاري الحفظ..."
                : isAllPresent
                  ? "الجميع حضور"
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
