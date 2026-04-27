import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { AttendanceStatus } from "./types";
import {
  User,
  BookOpen,
  Clock,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

type AbsenceReadOnlyRowProps = {
  studentName: string;
  status: AttendanceStatus;
  lessons: {
    lessonName: string;
    status: AttendanceStatus;
  }[];
  reason: string | null;
};

const getStatusBadge = (status: AttendanceStatus) => {
  switch (status) {
    case AttendanceStatus.Absent:
      return (
        <Badge
          variant="destructive"
          className="bg-danger-light text-danger border-danger hover:bg-danger-light"
        >
          غياب
        </Badge>
      );
    case AttendanceStatus.ExcusedAbsence:
      return (
        <Badge
          variant="secondary"
          className="bg-success-light text-success border-success hover:bg-success-light"
        >
          غياب بعذر
        </Badge>
      );
    case AttendanceStatus.Late:
      return (
        <Badge className="bg-warning-light text-warning border-warning hover:bg-warning-light">
          تأخير
        </Badge>
      );
    default:
      return <Badge variant="outline">غير محدد</Badge>;
  }
};

export function AbsenceReadOnlyRow({
  studentName,
  status,
  lessons,
  reason,
}: AbsenceReadOnlyRowProps) {
  return (
    <TableRow
      dir="rtl"
      className="flex flex-col md:table-row mb-4 md:mb-0 bg-white md:bg-transparent rounded-xl md:rounded-none border md:border-b border-gray-100 md:border-gray-50 shadow-sm md:shadow-none overflow-hidden transition-all hover:bg-gray-50/50 group"
    >
      {/* Student Name */}
      <TableCell className="block md:table-cell p-4 md:p-3 align-middle">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex h-8 w-8 rounded-full bg-slate-100 items-center justify-center text-slate-500 shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col text-right">
            <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              اسم الطالب
            </span>
            <span className="font-extrabold text-slate-900 md:text-sm">
              {studentName}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Lessons */}
      <TableCell className="block md:table-cell px-4 py-3 md:p-3 align-middle text-right md:w-1/3">
        <div className="flex items-start gap-3">
          <div className="md:hidden mt-0.5 text-info">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              الحصص المسجلة
            </span>
            <div className="flex flex-wrap gap-1.5 justify-start">
              {lessons.length > 0 ? (
                lessons.map((lesson, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] md:text-xs font-medium py-0 px-2 h-6 md:h-7"
                  >
                    {lesson.lessonName}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-400 italic font-medium text-right w-full">
                  لا توجد حصص
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="block md:table-cell px-4 py-3 md:p-3 align-middle">
        <div className="flex items-center justify-between md:justify-end gap-3">
          <div className="flex items-center gap-2 md:hidden">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              الحالة
            </span>
          </div>
          <div className="shrink-0">{getStatusBadge(status)}</div>
        </div>
      </TableCell>

      {/* Reason */}
      {reason && (
        <TableCell className="block md:table-cell px-4 py-4 md:p-3 align-middle whitespace-normal md:max-w-[250px]">
          <div className="flex flex-col md:items-end gap-1.5 w-full">
            <div className="flex items-center gap-2 md:hidden mb-1">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                الملاحظات
              </span>
            </div>
            <div className="bg-info-light/80 border border-info rounded-lg p-2.5 md:p-2 text-right w-full overflow-hidden break-all">
              <p className="text-xs text-info font-bold leading-normal whitespace-pre-wrap">
                {reason}
              </p>
            </div>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
