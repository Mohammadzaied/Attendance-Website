"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart3,
  Users,
  ShieldCheck,
  ShieldX,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  SpecializationBarChart,
  SpecializationStat,
} from "@/components/admin/analytics/specialization-bar-chart";
import { DailyAttendanceSummary } from "@/components/admin/analytics/daily-attendance-summary";
import { cn } from "@/lib/utils";
import { analyticsService } from "@/features/analytics/analyticsService";
import {
  AttendancePercentageResponse,
  DepartmentAnalytics,
} from "@/features/analytics/analyticsTypes";

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AttendancePercentageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Which department tab is currently active (by departmentId)
  const [activeDeptId, setActiveDeptId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true);
        // Depending on your API client wrapper, response.data might be the actual object
        // or it might be wrapped in another `data` object. Adjust if needed.
        const responseData =
          await analyticsService.getAttendancePercentageByDepartment();

        // Handle standard axios wrapping with robust extraction
        const actualData = (responseData as any).data || responseData;

        setData(actualData);
        if (actualData?.departments?.length > 0) {
          setActiveDeptId(actualData.departments[0].departmentId);
        }
      } catch (err: any) {
        setError(err.message || "فشل في تحميل الإحصائيات. تأكد من عمل الخادم.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const dept = useMemo(() => {
    if (!data || !activeDeptId) return null;
    return (
      data.departments.find((d) => d.departmentId === activeDeptId) || null
    );
  }, [data, activeDeptId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">جاري جلب إحصائيات الحضور...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-rose-500 space-y-4">
        <AlertCircle className="w-12 h-12" />
        <h2 className="text-xl font-bold">عذراً، حدث خطأ</h2>
        <p className="text-gray-500 text-sm max-w-sm text-center">{error}</p>
      </div>
    );
  }

  const { semesterName, academicYear } = data;
  const yearLabels = ["أولى", "ثانية", "ثالثة", "رابعة", "خامسة", "سادسة"];
  const mappedSpecializations: SpecializationStat[] = [];

  dept?.specializations?.forEach((spec) => {
    if (spec.studyYears && spec.studyYears.length > 1) {
      spec.studyYears.forEach((year: any) => {
        const arYear = yearLabels[year.studyYear - 1] || year.studyYear;
        if (year.totalActiveStudents > 0) {
          mappedSpecializations.push({
            name: spec.specializationName,
            hoverName: `${spec.specializationName} - سنة ${arYear}`,
            attendancePercentage: year.attendancePercentage,
            total: year.totalActiveStudents,
            studyYear: spec.studyYears.length,
          });
        }
      });
    } else if (spec.studyYears[0].totalActiveStudents > 0) {
      mappedSpecializations.push({
        name: spec.specializationName,
        hoverName: spec.specializationName,
        attendancePercentage: spec.studyYears[0].attendancePercentage,
        total: spec.studyYears[0].totalActiveStudents,
        studyYear: spec.studyYears.length,
      });
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            الإحصائيات التحليلية للكلية
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            توضح هذه اللوحة تقرير الحضور الإجمالي لجميع الأقسام (الفصل:{" "}
            {semesterName} - {academicYear})
          </p>
        </div>
      </div>

      {/* ── Main Chart Card ── */}
      <Card className="border-gray-100 shadow-sm rounded-xl overflow-hidden mt-6">
        {/* ── Department Tabs ── */}
        <div className="px-5 py-5 pb-0">
          {data.departments.length === 0 ? (
            <p className="text-sm text-gray-500">
              لا يوجد بيانات للأقسام حالياً.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.departments.map((d: DepartmentAnalytics) => (
                <button
                  key={d.departmentId}
                  onClick={() => setActiveDeptId(d.departmentId)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border cursor-pointer",
                    activeDeptId === d.departmentId
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600",
                  )}
                >
                  {d.departmentName}
                </button>
              ))}
            </div>
          )}
        </div>

        {dept && (
          <>
            <CardHeader className="pb-5 mt-2">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <CardTitle className="text-gray-900 font-bold text-lg">
                    نسبة الحضور والغياب لتخصصات القسم
                  </CardTitle>
                  <CardDescription className="text-gray-500 text-sm mt-1">
                    {dept.departmentName} — حضور: {dept.attendancePercentage}%
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {mappedSpecializations.length > 0 ? (
                <SpecializationBarChart
                  specializations={mappedSpecializations}
                />
              ) : (
                <div className="flex items-center justify-center min-h-[300px] text-gray-400">
                  <p>لا توجد تخصصات أو بيانات لعرضها في هذا القسم.</p>
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>

      {/* ── Daily Summary Module ── */}
      <DailyAttendanceSummary />
    </div>
  );
}
