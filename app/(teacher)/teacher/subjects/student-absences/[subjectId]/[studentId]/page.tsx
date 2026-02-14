"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStudentAbsenceDetails } from "@/features/student";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Book, Calendar, AlertCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{
    subjectId: string;
    studentId: string;
  }>;
}

export default function StudentAbsencesPage({ params }: PageProps) {
  const router = useRouter();
  const { subjectId, studentId } = use(params);
  const dispatch = useAppDispatch();

  const absenceData = useAppSelector((state) => state.student.absenceDetails);
  const loading = useAppSelector(
    (state) => state.student.fetchAbsenceDetailsState.isLoading,
  );
  const error = useAppSelector(
    (state) => state.student.fetchAbsenceDetailsState.error,
  );
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  useEffect(() => {
    dispatch(
      fetchStudentAbsenceDetails({
        studentAcademicInfoId: Number(studentId),
        subjectId: Number(subjectId),
      }),
    ).then(() => {
      // Ensure page starts at top when data is loaded
      window.scrollTo(0, 0);
    });
  }, [studentId, subjectId, dispatch]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; className: string; icon: string }
    > = {
      Absent: {
        label: "غياب",
        className: "bg-red-100 text-red-700 border-red-200",
        icon: "❌",
      },
      Late: {
        label: "تأخير",
        className: "bg-amber-100 text-amber-700 border-amber-200",
        icon: "⏰",
      },
      ExcusedAbsence: {
        label: "غياب بعذر",
        className: "bg-blue-100 text-blue-700 border-blue-200",
        icon: "📝",
      },
    };

    const statusInfo = statusMap[status] || statusMap.Absent;
    return (
      <Badge className={`${statusInfo.className} font-medium`}>
        {statusInfo.icon} {statusInfo.label}
      </Badge>
    );
  };

  const filteredAbsences = useMemo(() => {
    if (!absenceData) return [];
    return absenceData.absencesByDate.filter((absence) => {
      const absenceDate = new Date(absence.date);
      const d = new Date(
        absenceDate.getFullYear(),
        absenceDate.getMonth(),
        absenceDate.getDate(),
      );

      if (dateFrom) {
        const from = new Date(
          dateFrom.getFullYear(),
          dateFrom.getMonth(),
          dateFrom.getDate(),
        );
        if (d < from) return false;
      }
      if (dateTo) {
        const to = new Date(
          dateTo.getFullYear(),
          dateTo.getMonth(),
          dateTo.getDate(),
        );
        if (d > to) return false;
      }
      return true;
    });
  }, [absenceData, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-4">
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium text-lg">جاري تحميل سجل الغياب...</p>
      </div>
    );
  }

  if (error || !absenceData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center shadow-sm">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500" />
          <p className="text-red-700 font-bold text-lg mb-4">
            {error || "بيانات غير متوفرة"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6 md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto pb-10"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="gap-2"
            >
              للخلف <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            سجل غياب {absenceData.studentName}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            سجل الغياب الخاص بمادة: {absenceData.subjectName}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] justify-center md:justify-start gap-4 ">
        <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm justify-center">
          <CardContent className="p-1 text-center">
            <p className="text-3xl font-bold text-blue-700">
              {absenceData.adjustedTotalAbsences}
            </p>
            <p className="text-sm text-blue-600 mt-1 font-medium">الإجمالي</p>
          </CardContent>
        </Card>
        {Object.entries(absenceData.absencesByStatus).map(([status, count]) => {
          const isAbsent = status === "Absent";
          const isLate = status === "Late";
          return (
            <Card
              key={status}
              className={`${
                isAbsent
                  ? "bg-linear-to-br from-red-50 to-red-100 border-red-200 "
                  : isLate
                    ? "bg-linear-to-br from-amber-50 to-amber-100 border-amber-200"
                    : "bg-linear-to-br from-blue-50 to-blue-100 border-blue-200"
              } shadow-sm  justify-center`}
            >
              <CardContent className="p-1 text-center">
                <p
                  className={`text-2xl font-bold ${
                    isAbsent
                      ? "text-red-700"
                      : isLate
                        ? "text-amber-700"
                        : "text-blue-700"
                  }`}
                >
                  {count}
                </p>
                <p
                  className={`text-sm mt-1 font-medium ${
                    isAbsent
                      ? "text-red-600"
                      : isLate
                        ? "text-amber-600"
                        : "text-blue-600"
                  }`}
                >
                  {status === "Absent"
                    ? "غياب"
                    : status === "Late"
                      ? "تأخير"
                      : "غياب بعذر"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">
                خيارات التصفية
              </h3>
              <DatePicker
                date={dateFrom}
                setDate={setDateFrom}
                label="من تاريخ"
              />
              <DatePicker date={dateTo} setDate={setDateTo} label="إلى تاريخ" />
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom(undefined);
                    setDateTo(undefined);
                  }}
                  className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                >
                  إعادة تعيين الفلاتر
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Absences List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-xs mb-2">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              سجل الغيابات التفصيلي
            </h3>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredAbsences.length} سجل متاح
            </Badge>
          </div>

          {filteredAbsences.length > 0 ? (
            <div className="space-y-4">
              {filteredAbsences.map((absence, idx) => (
                <Card
                  key={idx}
                  className="border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-5 flex-1 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 leading-none mb-1">
                                {new Date(absence.date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {absence.lessons[0].dayName}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className="px-3 py-1">
                              {absence.totalAbsencesOnDate} سجلات
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                            <Clock className="h-4 w-4" />
                            الحصص المسجلة ({absence.totalAbsencesOnDate})
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {absence.lessons.map((lesson, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-50 hover:bg-white hover:border-blue-200 transition-colors rounded-xl p-4 border border-gray-100"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-bold text-gray-900">
                                    {lesson.lessonName}
                                  </span>
                                  {getStatusBadge(lesson.status)}
                                </div>
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] font-bold"
                                  >
                                    {lesson.dayName}
                                  </Badge>
                                </div>
                                {lesson.reason && (
                                  <div className="mt-3 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 w-full overflow-hidden break-all">
                                    <p className="text-xs text-blue-700 leading-relaxed whitespace-pre-wrap">
                                      <span className="font-bold block mb-0.5 underline">
                                        السبب المذكور:
                                      </span>
                                      {lesson.reason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-200" />
              <p className="font-bold text-xl text-gray-400">
                {absenceData.absencesByDate.length > 0
                  ? "لا توجد سجلات غياب ضمن الفترة المحددة"
                  : "لا توجد سجلات غياب لهذا الطالب"}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                جرب تعديل تواريخ البحث
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
