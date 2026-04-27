"use client";

import Link from "next/link";
import { User, Clock, CheckCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WarningMobileCardProps {
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

export function WarningMobileCard({
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
}: WarningMobileCardProps) {
  return (
    <Card className="border-none shadow-xl shadow-info/5 bg-white rounded-3xl overflow-hidden">
      <CardHeader className="p-4 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-info-light flex items-center justify-center text-info shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base truncate">
              {student.studentName}
            </p>
            <p className="text-xs text-gray-500 font-medium">
              {student.specializationName} -{" "}
              {student.studyYear == 1 ? "سنة أولى" : "سنة ثانية"}
            </p>
          </div>
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
              variant="outline"
              className="h-8 px-3 text-xs font-bold border-info text-info hover:bg-info-light rounded-xl"
            >
              بيانات الطالب
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {student.studentAlerts.map((subject: any) => (
          <div
            key={subject.subjectId}
            className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100/50 space-y-3"
          >
            <div className="flex justify-between items-start gap-2">
              <p className="text-sm font-black text-gray-800 leading-tight">
                {subject.subjectName}
              </p>
              <span className="text-[10px] font-bold text-gray-400 shrink-0">
                ({subject.numberOfHours} حصة)
              </span>
            </div>

            <div className="flex gap-4 py-1">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">
                  غياب
                </span>
                <span className="text-xs font-black text-danger">
                  {subject.absenceCounts.absent}
                </span>
              </div>
              <div className="h-6 w-px bg-gray-200 self-center" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">
                  تأخير
                </span>
                <span className="text-xs font-black text-warning">
                  {subject.absenceCounts.late}
                </span>
              </div>
              <div className="h-6 w-px bg-gray-200 self-center" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">
                  بعذر
                </span>
                <span className="text-xs font-black text-success">
                  {subject.absenceCounts.excusedAbsence}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100 mt-2">
                {subject.alerts.map((alert: any) => {
                  const isEligible =
                    Number(alert.type) === 3 && Number(alert.status) === 1;
                  const isSelected = selectedIds.includes(alert.id);

                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        "flex flex-col gap-1.5 bg-white p-2.5 rounded-xl border shadow-sm w-full transition-all duration-200",
                        isSelected
                          ? "border-info bg-info-light/20 ring-1 ring-info-light"
                          : "border-gray-100",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isEligible && onToggleSelection && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleSelection(alert.id)}
                              className="w-4 h-4 rounded border-gray-300 text-info focus:ring-info cursor-pointer"
                            />
                          )}
                          <span
                            className={cn(
                              "font-black text-[10px] px-2 py-1 rounded-lg",
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
                                className="h-6 px-2 text-[10px] font-bold border-danger text-danger hover:bg-danger-light"
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
                              className="h-6 px-2 text-[10px] font-bold border-success text-success hover:bg-success-light"
                            >
                              {isApproving ? (
                                <Spinner className="h-3 w-3" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              تأكيد
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-medium">
                            {new Date(alert.createdAt).toLocaleDateString(
                              "en-GB",
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-danger tabular-nums">
                          {alert.limitAtIssue} غياب
                        </span>
                        <span
                          className={cn(
                            "text-xs font-bold",
                            alert.status === 1
                              ? "text-gray-400"
                              : alert.status === 2
                                ? "text-success"
                                : "text-danger",
                          )}
                        >
                          {translateStatus(alert.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
