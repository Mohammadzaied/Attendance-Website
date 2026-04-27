"use client";

import Link from "next/link";
import { User, Clock, CheckCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface WarningDesktopRowProps {
  student: any;
  translateType: (type: number) => string;
  translateStatus: (status: number | string) => string;
  onReview: (alertId: number) => void;
  onApprove: (alertId: number) => void;
  isApproving: boolean;
  isReadOnly?: boolean;
  userRole?: string;
  selectedIds?: number[];
  onToggleSelection?: (alertId: number) => void;
}

export function WarningDesktopRow({
  student,
  translateType,
  translateStatus,
  onReview,
  onApprove,
  isApproving,
  isReadOnly,
  userRole,
  selectedIds = [],
  onToggleSelection,
}: WarningDesktopRowProps) {
  // Compute eligible alert IDs for this student
  const studentEligibleIds = useMemo(() => {
    if (!onToggleSelection) return [];
    const ids: number[] = [];
    student.studentAlerts.forEach((subject: any) => {
      subject.alerts.forEach((alert: any) => {
        if (Number(alert.type) === 3 && Number(alert.status) === 1) {
          ids.push(alert.id);
        }
      });
    });
    return ids;
  }, [student, onToggleSelection]);

  const allSelected =
    studentEligibleIds.length > 0 &&
    studentEligibleIds.every((id) => selectedIds.includes(id));
  const someSelected =
    !allSelected &&
    studentEligibleIds.some((id) => selectedIds.includes(id));

  const handleStudentToggle = () => {
    if (!onToggleSelection) return;
    if (allSelected) {
      // Deselect all eligible for this student
      studentEligibleIds.forEach((id) => onToggleSelection(id));
    } else {
      // Select all eligible for this student that aren't already selected
      studentEligibleIds
        .filter((id) => !selectedIds.includes(id))
        .forEach((id) => onToggleSelection(id));
    }
  };

  const showCheckbox = !!onToggleSelection && studentEligibleIds.length > 0;

  return (
    <tr
      className={cn(
        "transition-colors duration-150",
        allSelected
          ? "bg-info-light/40"
          : someSelected
            ? "bg-info-light/20"
            : "hover:bg-gray-50/40",
      )}
    >
      {/* Student Info Cell */}
      <td className="p-4 align-top">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-info-light flex items-center justify-center text-info shrink-0">
            <User className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">
              {student.studentName}
            </p>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
              {student.specializationName} -{" "}
              {student.studyYear == 1 ? "سنة أولى" : "سنة ثانية"}
            </p>
          </div>
        </div>
      </td>

      {/* Alerts/Subjects Cell */}
      <td className="p-4 align-top">
        <div className="space-y-3">
          {student.studentAlerts.map((subject: any) => (
            <div
              key={subject.subjectId}
              className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50/50 p-2 rounded-xl border border-gray-100/50"
            >
              <div className="shrink-0 min-w-[140px]">
                <p className="text-xs font-black text-gray-700">
                  {subject.subjectName} - ({subject.numberOfHours} حصة)
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] font-bold text-danger">
                    غياب: {subject.absenceCounts.absent}
                  </span>
                  <span className="text-[8px] font-bold text-warning">
                    تأخير: {subject.absenceCounts.late}
                  </span>
                  <span className="text-[8px] font-bold text-success">
                    بعذر: {subject.absenceCounts.excusedAbsence}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {subject.alerts.map((alert: any) => {
                  const isEligible =
                    Number(alert.type) === 3 && Number(alert.status) === 1;
                  const isSelected = selectedIds.includes(alert.id);

                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        "flex items-center gap-2 bg-white px-2 py-1 rounded-lg border shadow-sm text-[9px] group cursor-default transition-all duration-200",
                        isSelected
                          ? "border-info bg-info-light/50 ring-1 ring-info/50"
                          : "border-gray-100",
                      )}
                    >
                      {isEligible && onToggleSelection && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelection(alert.id)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-info focus:ring-info focus:ring-offset-0 cursor-pointer accent-info transition-all"
                        />
                      )}
                      <span
                        className={cn(
                          "font-black px-1.5 py-0.5 rounded-md",
                          Number(alert.type) === 1
                            ? "bg-info-light text-info"
                            : Number(alert.type) === 2
                              ? "bg-warning-light text-warning"
                              : "bg-danger-light text-danger",
                        )}
                      >
                        {translateType(Number(alert.type))}
                      </span>
                      {!isReadOnly &&
                        Number(alert.type) === 3 &&
                        Number(alert.status) === 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReview(alert.id)}
                            className="h-5 px-1.5 text-[8px] font-bold border-danger text-danger hover:bg-danger-light"
                          >
                            مراجعة
                          </Button>
                        )}
                      {!isReadOnly && Number(alert.status) === 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onApprove(alert.id)}
                          disabled={isApproving}
                          className="h-5 px-1.5 text-[8px] font-bold border-success text-success hover:bg-success-light"
                        >
                          {isApproving ? (
                            <Spinner className="h-2.5 w-2.5 " />
                          ) : (
                            <CheckCircle className="h-2.5 w-2.5 mr-1" />
                          )}
                          تأكيد
                        </Button>
                      )}
                      <span className="text-danger tabular-nums">
                        {alert.limitAtIssue} غياب
                      </span>
                      <span
                        className={cn(
                          "font-bold",
                          alert.status === 1
                            ? "text-gray-400"
                            : alert.status === 2
                              ? "text-success"
                              : "text-danger",
                        )}
                      >
                        {translateStatus(alert.status)}
                        {alert.status === 3 &&
                          alert.type === 3 &&
                          ` (تمديد ${alert.extensionExtraClasses} حصة)`}
                      </span>
                      <Clock className="h-2.5 w-2.5 text-gray-300" />
                      <span className="text-gray-400">
                        {new Date(alert.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </td>

      {/* Actions Cell */}
      <td className="p-4 align-middle text-center">
        <Link
          href={
            userRole === "department-head"
              ? `/department-head/students/${student.studentId}`
              : `/admin/students/${student.studentId}`
          }
          target="_blank"
        >
          <Button
            size="sm"
            variant="ghost"
            className="h-9 px-3 text-xs font-bold text-info hover:text-info-foreground hover:bg-info-light rounded-xl transition-all duration-200"
          >
            بيانات الطالب
          </Button>
        </Link>
      </td>
    </tr>
  );
}
