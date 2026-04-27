"use client";

import {
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AbsenceByDateItem,
  StudentAbsenceLessonItem,
} from "@/features/teacher/teacherTypes";

interface AbsenceLogsListProps {
  filteredLogs: AbsenceByDateItem[];
  onEdit?: (lesson: StudentAbsenceLessonItem) => void;
  onDelete?: (lessonId: number) => void;
  isReadOnly?: boolean;
}

export function AbsenceLogsList({
  filteredLogs,
  onEdit,
  onDelete,
  isReadOnly = false,
}: AbsenceLogsListProps) {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; className: string; icon: string }
    > = {
      Absent: {
        label: "غياب",
        className: "bg-danger-light text-danger border-danger",
        icon: "❌",
      },
      Late: {
        label: "تأخير",
        className: "bg-warning-light text-warning border-warning",
        icon: "⏰",
      },
      ExcusedAbsence: {
        label: "غياب بعذر",
        className: "bg-info-light text-info border-info",
        icon: "📝",
      },
    };

    const statusInfo = statusMap[status] || statusMap.Absent;
    return (
      <Badge
        className={`${statusInfo.className} font-medium text-[10px] md:text-xs py-0 px-1.5 md:px-2.5`}
      >
        {statusInfo.icon} {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:gap-4">
      {filteredLogs.length > 0 ? (
        filteredLogs.map((dateGroup, idx) => (
          <div
            key={idx}
            className="bg-white p-3.5 md:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-info transition-all flex flex-col group overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-info-light group-hover:text-info transition-all">
                  <CalendarIcon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                    <span className="font-bold text-gray-900 text-base md:text-lg">
                      {new Date(dateGroup.date).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-[10px] md:text-sm text-gray-500 font-medium">
                      ({dateGroup.dayOfWeek})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {dateGroup.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex flex-col p-2.5 md:p-3 rounded-xl bg-gray-50/50 border border-gray-100/50 transition-colors hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-xs md:text-sm font-bold text-gray-700 truncate">
                      {lesson.lessonName}
                    </span>
                    {getStatusBadge(lesson.status)}
                  </div>
                  {!isReadOnly && (
                    <div className="flex items-center gap-1.5 mt-2 md:mt-2.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 md:h-8 md:w-8 text-gray-400 hover:text-info hover:bg-info-light rounded-lg bg-white md:bg-transparent shadow-sm md:shadow-none border md:border-0 border-gray-100"
                        onClick={() => onEdit?.(lesson)}
                      >
                        <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 md:h-8 md:w-8 text-gray-400 hover:text-danger hover:bg-danger-light rounded-lg bg-white md:bg-transparent shadow-sm md:shadow-none border md:border-0 border-gray-100"
                        onClick={() => onDelete?.(lesson.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  )}
                  {lesson.reason && (
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-info mt-1.5 opacity-80">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span className="truncate">{lesson.reason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-12 md:py-20 bg-gray-50/30 rounded-3xl border border-dashed border-gray-200">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-info-light flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 md:h-10 md:w-10 text-info opacity-50" />
          </div>
          <h4 className="text-lg md:text-xl font-bold text-gray-900">
            لا توجد غيابات
          </h4>
          <p className="text-xs md:text-sm text-gray-500 max-w-xs mt-2 text-center px-6">
            لم يتم العثور على أي سجلات غياب لهذا الطالب في هذه المادة.
          </p>
        </div>
      )}
    </div>
  );
}
