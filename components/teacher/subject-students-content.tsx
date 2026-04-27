"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchSubjectStudents } from "@/features/teacher";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  ChevronRight,
  ArrowRight,
  FileBarChart,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { StudentAbsenceDetailsDialog } from "@/components/teacher/student-absence-details-dialog";
import { fetchSubjectStudentsWithAbsenceData } from "@/features/teacher";
import { cn } from "@/lib/utils";

type Role = "teacher" | "department-head";

interface SubjectStudentsContentProps {
  role: Role;
}

export function SubjectStudentsContent({ role }: SubjectStudentsContentProps) {
  const isDH = role === "department-head";
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId;
  const {
    students,
    subjectName,
    fetchStudentsState,
    subjectAbsenceData,
    audiencePercent,
    fetchSubjectAbsenceDataState,
  } = useAppSelector((state) => state.teacher);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAbsenceDialogOpen, setIsAbsenceDialogOpen] = useState(false);

  useEffect(() => {
    if (subjectId) {
      dispatch(fetchSubjectStudents(Number(subjectId)));
    }
    window.scrollTo(0, 0);
  }, [subjectId, dispatch]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    return students.filter((student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [students, searchQuery]);

  const linkPrefix = isDH
    ? "/department-head/subjects/student-absences"
    : "/teacher/subjects/student-absences";

  return (
    <div
      className="space-y-6 md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto pb-10"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-right">
          <h1
            className={cn(
              "text-2xl md:text-3xl font-bold text-gray-900 mb-1",
              isDH && "font-black",
            )}
          >
            قائمة الطلاب في مادة :{" "}
            {fetchStudentsState.isLoading
              ? "تحميل..."
              : subjectName || "المادة غير موجودة"}
          </h1>
          <p
            className={cn(
              "text-sm md:text-base text-gray-600",
              isDH && "font-medium italic",
            )}
          >
            عرض سجلات الغياب لكل طالب
          </p>
        </div>
      </div>

      {/* Absence Statistics Button */}
      <Card
        className={cn(
          "shadow-sm border-info bg-linear-to-br from-info-light to-white overflow-hidden rounded-xl",
          isDH && "rounded-2xl",
        )}
      >
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-right">
              <h3
                className={cn(
                  "text-lg font-bold text-gray-900 mb-1 flex items-center gap-2",
                  isDH && "font-black",
                )}
              >
                <FileBarChart className="h-5 w-5 text-info" />
                إحصائيات الغياب التفصيلية
              </h3>
              <p className={cn("text-sm text-gray-600", isDH && "font-medium")}>
                عرض إحصائيات الغياب لجميع الطلاب مع إمكانية التصدير إلى Excel
              </p>
            </div>
            <Button
              onClick={() => {
                dispatch(
                  fetchSubjectStudentsWithAbsenceData(Number(subjectId)),
                );
                setIsAbsenceDialogOpen(true);
              }}
              disabled={
                fetchSubjectAbsenceDataState.isLoading || students.length === 0
              }
              className={cn(
                "w-full md:w-auto bg-info hover:bg-info-foreground text-white gap-2 h-11 font-bold shadow-lg shadow-info/20",
                isDH && "font-black rounded-xl cursor-pointer transition-all",
              )}
            >
              <FileBarChart className="h-4 w-4" />
              {fetchSubjectAbsenceDataState.isLoading
                ? "جاري التحميل..."
                : "عرض الإحصائيات"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Stats */}
      <Card
        className={cn(
          "shadow-sm border-gray-100 overflow-hidden rounded-xl bg-white",
          isDH && "rounded-2xl",
        )}
      >
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث عن اسم الطالب..."
                className={cn(
                  "pr-10 text-right h-11",
                  isDH && "rounded-xl font-bold",
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 self-end md:self-center">
              {/* Audience Percentage Circular Progress */}
              <div
                className="flex items-center gap-2 bg-info-light/50 rounded-xl p-2 pr-3"
                title="نسبة الحضور المتوقعة"
              >
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-600">
                    نسبة الحضور
                  </span>
                </div>
                <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
                  <svg
                    className="h-full w-full -rotate-90 transform"
                    viewBox="0 0 36 36"
                  >
                    {/* Background Circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className="stroke-info-light"
                      strokeWidth="3.5"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      className={cn(
                        "transition-all duration-1000 ease-out",
                        fetchStudentsState.isLoading
                          ? "stroke-info"
                          : audiencePercent >= 80
                            ? "stroke-success"
                            : audiencePercent >= 50
                              ? "stroke-warning"
                              : "stroke-danger",
                      )}
                      strokeWidth="3.5"
                      strokeDasharray="100 100"
                      strokeDashoffset={
                        fetchStudentsState.isLoading
                          ? 100
                          : 100 - audiencePercent
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {fetchStudentsState.isLoading ? (
                      <div className="h-3 w-3 border-2 border-info border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span
                        className="text-[10px] font-bold text-slate-700"
                        dir="ltr"
                      >
                        {audiencePercent.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Badge
                className={cn(
                  "bg-info-light text-info-foreground border-info px-4 py-2 h-11 flex items-center text-sm font-bold",
                  isDH && "font-black rounded-xl",
                )}
              >
                <Users className="h-4 w-4 ml-2" />
                {filteredStudents.length} / {students.length} طالب
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      {fetchStudentsState.isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <div className="h-16 w-16 border-4 border-info border-t-transparent rounded-full animate-spin"></div>
          <p className={cn("font-medium text-lg", isDH && "font-bold")}>
            جاري تحميل قائمة الطلاب...
          </p>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Link
              key={student.studentId}
              href={`${linkPrefix}/${subjectId}/${student.studentAcademicInfoId}`}
              className="block group"
            >
              <Card
                className={cn(
                  "h-full border-gray-100 group-hover:border-info group-hover:shadow-md transition-all duration-200",
                  isDH && "rounded-2xl",
                )}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full bg-linear-to-br from-info to-info-foreground flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm group-hover:scale-110 transition-transform",
                      isDH && "font-black",
                    )}
                  >
                    {student.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p
                      className={cn(
                        "font-bold text-gray-900 group-hover:text-info-foreground transition-colors truncate",
                        isDH && "font-black",
                      )}
                    >
                      {student.fullName}
                    </p>
                    <p
                      className={cn(
                        "text-xs text-gray-500 mt-0.5",
                        isDH && "font-medium",
                      )}
                    >
                      اضغط لعرض سجل الغياب
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-info transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center shadow-xs">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-300" />
          </div>
          <h3
            className={cn(
              "text-xl font-bold text-gray-800 mb-2",
              isDH && "font-black",
            )}
          >
            لا يوجد نتائج
          </h3>
          <p
            className={cn(
              "text-gray-500 max-w-sm mx-auto",
              isDH && "font-medium",
            )}
          >
            {searchQuery
              ? "لم يتم العثور على طلاب يطابقون بحثك"
              : "لا يوجد طلاب مسجلين في هذه المادة"}
          </p>
          {searchQuery && (
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className={cn("text-info font-bold mt-2", isDH && "font-black")}
            >
              إلغاء البحث
            </Button>
          )}
        </div>
      )}

      {/* Absence Details Dialog */}
      {subjectAbsenceData && (
        <StudentAbsenceDetailsDialog
          open={isAbsenceDialogOpen}
          onOpenChange={setIsAbsenceDialogOpen}
          students={subjectAbsenceData.students}
          subjectName={subjectAbsenceData.subjectName}
          subjectId={subjectAbsenceData.subjectId}
        />
      )}
    </div>
  );
}
