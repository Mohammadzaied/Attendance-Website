"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Student, type Warning } from "@/lib/mock-data";
import { type FollowUpNote } from "./types";

type StudentsTableProps = {
  students: Student[];
  getStudentWarnings: (id: string) => Warning[];
  getStudentFollowUps: (id: string) => FollowUpNote[];
  onOpenFollowUp: (student: Student) => void;
};

const getAttendanceColor = (rate: number) => {
  if (rate >= 90) return "text-green-600";
  if (rate >= 85) return "text-amber-600";
  return "text-red-600";
};

export function StudentsTable({
  students,
  getStudentWarnings,
  getStudentFollowUps,
  onOpenFollowUp,
}: StudentsTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">قائمة الطلاب</CardTitle>
        <CardDescription className="text-right">جميع طلاب قسم {students[0]?.department ?? ""}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم الطالب</TableHead>
                <TableHead className="text-right">الرقم الجامعي</TableHead>
                <TableHead className="text-right">الشعبة</TableHead>
                <TableHead className="text-right">المستوى</TableHead>
                <TableHead className="text-right">الغيابات</TableHead>
                <TableHead className="text-right">نسبة الحضور</TableHead>
                <TableHead className="text-right">الإنذارات</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">المتابعة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const followUps = getStudentFollowUps(student.id);
                const studentWarnings = getStudentWarnings(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-right">{student.name}</TableCell>
                    <TableCell className="text-right">{student.studentNumber}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {student.section}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{student.level}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={student.absenceCount > 5 ? "destructive" : "secondary"}>
                        {student.absenceCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium ${getAttendanceColor(student.attendanceRate)}`}>
                        {student.attendanceRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {studentWarnings.length > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {studentWarnings.length} إنذار
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">لا يوجد</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {student.attendanceRate < 85 ? (
                        <Badge variant="destructive" className="text-xs">
                          يحتاج متابعة
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 hover:bg-green-600 text-xs">جيد</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {followUps.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {followUps.length} ملاحظة
                          </Badge>
                        )}
                        <Button size="sm" variant="outline" onClick={() => onOpenFollowUp(student)}>
                          إضافة متابعة
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
