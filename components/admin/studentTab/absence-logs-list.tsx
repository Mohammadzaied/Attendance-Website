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
        className: "bg-red-100 text-red-700 border-red-200",
        icon: "❌",
      },
      Late: {
        label: "تأخير",
        className: "bg-blue-100 text-blue-700 border-blue-200",
        icon: "⏰",
      },
      ExcusedAbsence: {
        label: "غياب بعذر",
        className: "bg-blue-100 text-blue-700 border-blue-200",
        icon: "📝",
      },
    };

    const statusInfo = statusMap[status] || statusMap.Absent;
    return (
      <Badge className={`${statusInfo.className} font-medium`}>
        {statusInfo.icon} {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      {filteredLogs.map((dateGroup, idx) => (
        <div
          key={idx}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col group"
        >
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-lg">
                    {new Date(dateGroup.date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({dateGroup.lessons[0].dayName})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dateGroup.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex flex-col p-3 rounded-xl bg-gray-50/50 border border-gray-100/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">
                    {lesson.lessonName}
                  </span>
                  {getStatusBadge(lesson.status)}
                </div>
                {!isReadOnly && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-amber-50 rounded-lg"
                      onClick={() => onEdit?.(lesson)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      onClick={() => onDelete?.(lesson.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {lesson.reason && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-500 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    <span className="truncate">{lesson.reason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
