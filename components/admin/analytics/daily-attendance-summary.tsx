"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, AlertCircle, CalendarDays, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { analyticsService } from "@/features/analytics/analyticsService";
import { DailyAttendanceAnalytics } from "@/features/analytics/analyticsTypes";
import { AttendanceDonutChart } from "./attendance-donut-chart";
import { DatePicker } from "@/components/ui/date-picker";

const arDays: Record<string, string> = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

export function DailyAttendanceSummary() {
  const [date, setDate] = useState<Date | undefined>(() => {
    const today = new Date();
    if (today.getDay() === 5)
      today.setDate(today.getDate() - 1); // Friday -> Thursday
    else if (today.getDay() === 6) today.setDate(today.getDate() - 2); // Saturday -> Thursday
    return today;
  });
  const [data, setData] = useState<DailyAttendanceAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) {
      setData(null);
      return;
    }

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const adjustedDate = new Date(date as Date);
        if (adjustedDate.getDay() === 5) {
          adjustedDate.setDate(adjustedDate.getDate() - 1); // Friday -> Thursday
        } else if (adjustedDate.getDay() === 6) {
          adjustedDate.setDate(adjustedDate.getDate() - 2); // Saturday -> Thursday
        }

        const formattedDate = format(adjustedDate, "yyyy-MM-dd");

        const responseData =
          await analyticsService.getDailyAttendancePercentage(formattedDate);
        const actualData = (responseData as any).data || responseData;
        setData(actualData);
      } catch (err: any) {
        setError(
          err.message ||
            "فشل تحميل ملخص الحضور اليومي. الرجاء المحاولة مرة أخرى.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [date]);

  return (
    <Card
      className="border-gray-100 shadow-sm rounded-xl overflow-hidden mt-6 animate-in fade-in duration-500"
      dir="rtl"
    >
      <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white px-6 py-5 border-b border-gray-100">
        <div className="space-y-1">
          <CardTitle className="text-gray-900 font-bold text-lg">
            ملخص الحضور اليومي
          </CardTitle>
          <CardDescription className="text-gray-500 text-sm">
            النسبة الإحصائية العامة لحضور جميع الطلاب الفعالين في يوم محدد.
          </CardDescription>
        </div>
        <div className="w-full md:w-auto min-w-[200px]">
          <DatePicker date={date} setDate={setDate} />
        </div>
      </CardHeader>

      <CardContent className="p-6 bg-slate-50/30">
        {!date ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
            <CalendarDays className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium">
              الرجاء تحديد التاريخ من الأعلى لعرض التقرير.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-rose-500">
            <AlertCircle className="w-10 h-10 mb-3" />
            <p className="font-bold text-center">{error}</p>
          </div>
        ) : data ? (
          (() => {
            const totalActive =
              data.totalActiveStudents ??
              (data as any).TotalActiveStudents ??
              0;
            const attendancePercent =
              data.attendancePercentage ??
              (data as any).AttendancePercentage ??
              0;
            const dayStr = data.dayOfWeek ?? (data as any).DayOfWeek ?? "";

            const presentCount = Math.round(
              totalActive * (attendancePercent / 100),
            );

            return (
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-4 px-2">
                {/* ── Donut Chart Module ── */}
                <div className="w-full lg:w-1/3 flex justify-center lg:justify-start">
                  <div className="w-full max-w-[320px]">
                    <AttendanceDonutChart
                      attendancePercentage={attendancePercent}
                    />
                  </div>
                </div>

                {/* ── Daily Status Displays ── */}
                <div className="w-full lg:w-2/3 flex flex-col sm:flex-row items-center justify-around gap-12 bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50/80 text-blue-600 flex items-center justify-center mb-4 shadow-inner">
                      <CalendarDays className="w-7 h-7" />
                    </div>
                    <p className="text-gray-400 font-bold mb-2 text-sm">
                      اليوم المحدد للتقرير
                    </p>
                    <h3 className="text-3xl font-black text-gray-900 mb-3">
                      {arDays[dayStr] || dayStr || "غير معروف"}
                    </h3>
                    <span className="text-xs font-black text-blue-700 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                      {format(date as Date, "yyyy-MM-dd")}
                    </span>
                  </div>
                  <div className="hidden sm:block w-px h-32 bg-gray-100/80" />{" "}
                  {/* Divider */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50/80 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
                      <Users className="w-7 h-7" />
                    </div>
                    <p className="text-gray-400 font-bold mb-2 text-sm">
                      إجمالي الطلاب الفعالين
                    </p>
                    <h3
                      className="text-3xl font-black text-gray-900 mb-3"
                      dir="ltr"
                    >
                      {totalActive.toLocaleString()}
                    </h3>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                      طالب وطالبة
                    </span>
                  </div>
                </div>
              </div>
            );
          })()
        ) : null}
      </CardContent>
    </Card>
  );
}
