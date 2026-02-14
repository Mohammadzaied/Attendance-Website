"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StatsCardsProps = {
  departmentStudents: number;
  avgAttendance: number;
  totalAbsences: number;
  atRiskCount: number;
  warningsCount: number;
};

export function DepartmentStatsCards({
  departmentStudents,
  avgAttendance,
  totalAbsences,
  atRiskCount,
  warningsCount,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-8">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardDescription className="text-right">طلاب القسم</CardDescription>
          <CardTitle className="text-2xl font-bold text-blue-600">
            {departmentStudents}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardDescription className="text-right">متوسط الحضور</CardDescription>
          <CardTitle className="text-2xl font-bold text-green-600">
            {avgAttendance}%
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardDescription className="text-right">إجمالي الغيابات</CardDescription>
          <CardTitle className="text-2xl font-bold text-indigo-600">
            {totalAbsences}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="shadow-sm border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardDescription className="text-right text-amber-800">
            يحتاجون متابعة / إنذارات جديدة
          </CardDescription>
          <CardTitle className="text-2xl font-bold text-amber-600">
            {atRiskCount} / {warningsCount}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
