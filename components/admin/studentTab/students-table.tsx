"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Student } from "@/features/student";

type StudentsTableProps = {
  students: Student[];
  searchValue: string;
  onSearchChange: (value: string) => void;
};

const getAttendanceColor = (rate: number) => {
  if (rate >= 90) return "text-green-600";
  if (rate >= 85) return "text-amber-600";
  return "text-red-600";
};

export function StudentsTable({
  students,
  searchValue,
  onSearchChange,
}: StudentsTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">قائمة الطلاب</CardTitle>
          <Input
            placeholder="بحث..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-xs text-right"
          />
        </div>
        <CardDescription className="text-right">
          جميع الطلاب المسجلين في النظام
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم الطالب</TableHead>
                <TableHead className="text-right">الرقم الجامعي</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">الشعبة</TableHead>
                <TableHead className="text-right">المستوى</TableHead>
                <TableHead className="text-right">الغيابات</TableHead>
                <TableHead className="text-right">نسبة الحضور</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium text-right">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {student.studentNumber}
                  </TableCell>
                  <TableCell className="text-right">
                    {student.department}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {student.section}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{student.level}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        student.absenceCount > 5 ? "destructive" : "secondary"
                      }
                    >
                      {student.absenceCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span
                        className={`font-medium ${getAttendanceColor(student.attendanceRate)}`}
                      >
                        {student.attendanceRate}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
