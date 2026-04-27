"use client";

import Link from "next/link";
import { Users, Trash2, Edit, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MajorStudent } from "@/features/student";

interface StudentsListProps {
  students: MajorStudent[];
  isLoading: boolean;
  isMobile: boolean;
  canEdit: boolean;
  onEdit: (student: MajorStudent) => void;
  onDelete: (student: MajorStudent) => void;
}

export function StudentsList({
  students,
  isLoading,
  isMobile,
  canEdit,
  onEdit,
  onDelete,
}: StudentsListProps) {
  if (isMobile) {
    return (
      <div className="p-4 space-y-3 bg-gray-50/30 ">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4">
            <div className="h-10 w-10 border-4 border-info border-t-transparent rounded-full animate-spin" />
            <span className="font-bold text-sm">جاري تحميل الطلاب...</span>
          </div>
        )}
        {!isLoading && students.length > 0
          ? students.map((student) => (
              <div
                key={String(student.studentId)}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm  overflow-hidden group"
              >
                <div className="flex items-center gap-4 ">
                  <div className="h-14 w-14 bg-info-light text-info rounded-full flex items-center justify-center text-xl font-black shadow-sm ring-4 ring-white shrink-0">
                    {student.fullName ? student.fullName.charAt(0) : "?"}
                  </div>
                  <div className="text-right flex-col  overflow-hidden!">
                    <div
                      className="font-bold text-gray-900 text-lg truncate max-w-[150px] leading-tight"
                      title={student.fullName}
                    >
                      {student.fullName}
                    </div>
                    <div
                      className="text-right text-xs text-gray-400 font-medium truncate max-w-[150px] mt-0.5"
                      title={student.username || undefined}
                      dir="ltr"
                    >
                      {student.username || "لا يوجد بريد إلكتروني"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 mt-4 border-t border-gray-50 h-10">
                  <Link
                    href={`/admin/students/${student.studentId}`}
                    target="_blank"
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 border-gray-100 text-info hover:bg-info-light hover:border-info cursor-pointer h-full rounded-lg text-xs font-bold"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      الملف
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canEdit}
                    onClick={() => onEdit(student)}
                    className="flex-1 gap-2 border-gray-100 text-warning hover:bg-warning-light hover:border-warning cursor-pointer h-full rounded-lg text-xs font-bold"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    تعديل
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!canEdit}
                    onClick={() => onDelete(student)}
                    className="h-full w-10 text-danger hover:bg-danger-light rounded-lg shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          : null}
        {!isLoading && students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 opacity-20" />
            </div>
            <p className="font-medium text-center">
              لا يوجد طلاب مسجلين في هذه السنة
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Table dir="rtl">
      <TableHeader className="bg-gray-50/80">
        <TableRow>
          <TableHead className="text-right font-bold text-gray-700 h-12">
            اسم الطالب
          </TableHead>
          <TableHead className="text-center font-bold text-gray-700 h-12">
            البريد الإلكتروني
          </TableHead>
          <TableHead className="text-center font-bold text-gray-700 h-12">
            الإجراءات
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={4} className="h-40 text-center text-gray-400">
              جاري تحميل الطلاب...
            </TableCell>
          </TableRow>
        )}
        {!isLoading &&
          students.map((student) => (
            <TableRow
              key={student.studentId}
              className="hover:bg-gray-50/50 transition-colors"
            >
              <TableCell className="py-4 font-semibold text-gray-900 overflow-hidden max-w-[250px]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-info-light text-info rounded-full flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
                    {student.fullName ? student.fullName.charAt(0) : "?"}
                  </div>
                  <span className="truncate" title={student.fullName}>
                    {student.fullName}
                  </span>
                </div>
              </TableCell>

              <TableCell className="py-4 text-gray-500 text-sm overflow-hidden max-w-[200px]">
                <div
                  className="truncate text-center"
                  title={student.username || undefined}
                  dir="ltr"
                >
                  {student.username || (
                    <span className="text-gray-300 italic">لا يوجد</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href={`/admin/students/${student.studentId}`}
                    target="_blank"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-4 gap-2 text-info hover:bg-info-light rounded-lg cursor-pointer transition-all"
                    >
                      <FileText className="h-4 w-4" />
                      ملف الطالب
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!canEdit}
                    onClick={() => onEdit(student)}
                    className="h-9 w-9 text-warning hover:bg-warning-light rounded-lg cursor-pointer transition-all focus-visible:ring-warning"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!canEdit}
                    onClick={() => onDelete(student)}
                    className="h-9 w-9 text-danger hover:bg-danger-light rounded-lg cursor-pointer transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        {!isLoading && students.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="h-40 text-center">
              <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                <Users className="h-8 w-8 opacity-20" />
                <p>لا يوجد طلاب مسجلين في هذه السنة</p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
