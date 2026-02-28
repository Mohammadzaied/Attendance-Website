"use client";

import Link from "next/link";
import { User, Clock, CheckCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WarningDesktopRowProps {
  student: any;
  translateType: (type: number) => string;
  translateStatus: (status: number | string) => string;
  onReview: (alertId: number) => void;
  onApprove: (alertId: number) => void;
  isApproving: boolean;
  isReadOnly?: boolean;
  userRole?: string;
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
}: WarningDesktopRowProps) {
  return (
    <tr className="hover:bg-blue-50/5 transition-colors">
      {/* Student Info Cell */}
      <td className="p-4 align-top">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
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
                  <span className="text-[8px] font-bold text-rose-500">
                    غياب: {subject.absenceCounts.absent}
                  </span>
                  <span className="text-[8px] font-bold text-amber-500">
                    تأخير: {subject.absenceCounts.late}
                  </span>
                  <span className="text-[8px] font-bold text-emerald-500">
                    بعذر: {subject.absenceCounts.excusedAbsence}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {subject.alerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm text-[9px] group cursor-default"
                  >
                    <span
                      className={cn(
                        "font-black px-1.5 py-0.5 rounded-md",
                        Number(alert.type) === 1
                          ? "bg-blue-50 text-blue-600"
                          : Number(alert.type) === 2
                            ? "bg-amber-50 text-amber-600"
                            : "bg-rose-50 text-rose-600",
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
                          className="h-5 px-1.5 text-[8px] font-bold border-rose-200 text-rose-600 hover:bg-rose-50"
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
                        className="h-5 px-1.5 text-[8px] font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      >
                        {isApproving ? (
                          <Spinner className="h-2.5 w-2.5 " />
                        ) : (
                          <CheckCircle className="h-2.5 w-2.5 mr-1" />
                        )}
                        تأكيد
                      </Button>
                    )}
                    <span className="text-rose-500 tabular-nums">
                      {alert.limitAtIssue} غياب
                    </span>
                    <span
                      className={cn(
                        "font-bold",
                        alert.status === 1
                          ? "text-gray-400"
                          : alert.status === 2
                            ? "text-emerald-500"
                            : "text-rose-500",
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
                ))}
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
            className="h-9 px-3 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
          >
            بيانات الطالب
          </Button>
        </Link>
      </td>
    </tr>
  );
}
