"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatsCardsProps = {
  studentCount: number;
  todayAbsenceCount: number;
  selectedCount: number;
};

export function TeacherStatsCards({
  studentCount,
  todayAbsenceCount,
  selectedCount,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardDescription className="text-right">الطلاب في الشعبة</CardDescription>
          <CardTitle className="text-2xl font-bold text-blue-600">{studentCount}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardDescription className="text-right">غيابات اليوم</CardDescription>
          <CardTitle className="text-2xl font-bold text-amber-600">{todayAbsenceCount}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardDescription className="text-right">تم التحديد للغياب</CardDescription>
          <CardTitle className="text-2xl font-bold text-red-600">{selectedCount}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
