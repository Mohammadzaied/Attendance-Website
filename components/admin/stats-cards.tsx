"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatsCardsProps = {
  totalStudents: number;
  totalTeachers: number;
  avgAttendance: number;
  atRiskStudents: number;
};

export function AdminStatsCards({
  totalStudents,
  totalTeachers,
  avgAttendance,
  atRiskStudents,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardDescription className="text-right">
            إجمالي الطلاب
          </CardDescription>
          <CardTitle className="text-3xl font-bold text-blue-600">
            {totalStudents}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <p className="text-xs text-gray-600">طالب مسجل</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardDescription className="text-right">
            إجمالي المعلمين
          </CardDescription>
          <CardTitle className="text-3xl font-bold text-indigo-600">
            {totalTeachers}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <p className="text-xs text-gray-600">معلم نشط</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardDescription className="text-right">متوسط الحضور</CardDescription>
          <CardTitle className="text-3xl font-bold text-green-600">
            {avgAttendance}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-gray-600">للفصل الحالي</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardDescription className="text-right text-amber-800">
            طلاب في خطر
          </CardDescription>
          <CardTitle className="text-3xl font-bold text-amber-600">
            {atRiskStudents}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-amber-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs text-amber-700">حضور أقل من 85%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
