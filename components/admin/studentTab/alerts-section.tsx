"use client";

import { CheckCircle2, AlertCircle, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StudentAlertsBySubjectV2, UnifiedAlertItem } from "@/features/student";

interface AlertsSectionProps {
  unifiedAlerts: StudentAlertsBySubjectV2[];
  subjectsWithAlerts: any[];
  selectedAlertSubjectId: string;
  setSelectedAlertSubjectId: (id: string) => void;
}

export function AlertsSection({
  unifiedAlerts,
  subjectsWithAlerts,
  selectedAlertSubjectId,
  setSelectedAlertSubjectId,
}: AlertsSectionProps) {
  const translateAlertType = (type: string) => {
    const translationMap: Record<string, string> = {
      FirstWarning: "انذار اول",
      SecondWarning: "انذار ثاني",
      Deprivation: "حرمان",
    };
    return translationMap[type] || type;
  };

  const filteredAlerts = (
    selectedAlertSubjectId === "all"
      ? unifiedAlerts.flatMap((s) =>
          s.alertsByType.map((t) => ({
            ...t,
            subjectName: s.subjectName,
            subjectId: s.subjectId,
            numberOfHours: s.numberOfHours,
          })),
        )
      : unifiedAlerts
          .filter((s) => s.subjectId.toString() === selectedAlertSubjectId)
          .flatMap((s) =>
            s.alertsByType.map((t) => ({
              ...t,
              subjectName: s.subjectName,
              subjectId: s.subjectId,
              numberOfHours: s.numberOfHours,
            })),
          )
  ).filter((t) => t.alerts.length > 0);

  return (
    <div className="space-y-4">
      {/* Subject Filter for Alerts */}
      {subjectsWithAlerts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-amber-50/50 rounded-2xl border border-blue-100/50">
          <Button
            variant={selectedAlertSubjectId === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedAlertSubjectId("all")}
            className={cn(
              "rounded-xl font-bold h-9",
              selectedAlertSubjectId === "all"
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-blue-200 text-blue-700 hover:bg-amber-50",
            )}
          >
            الكل
          </Button>
          {subjectsWithAlerts.map((s) => (
            <Button
              key={s.subjectId}
              variant={
                selectedAlertSubjectId === s.subjectId.toString()
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => setSelectedAlertSubjectId(s.subjectId.toString())}
              className={cn(
                "rounded-xl font-bold h-9",
                selectedAlertSubjectId === s.subjectId.toString()
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "border-blue-200 text-blue-700 hover:bg-amber-50",
              )}
            >
              {s.subjectName}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredAlerts.map((typeGroup, idx) => (
          <div
            key={`${typeGroup.subjectId}-${typeGroup.alertType}-${idx}`}
            className="space-y-3"
          >
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-100" />
              {typeGroup.subjectName} - {typeGroup.numberOfHours} ساعات -{" "}
              {translateAlertType(typeGroup.alertType)}
              <div className="h-px flex-1 bg-gray-100" />
            </h4>
            <div className="grid grid-cols-1 gap-4 p-1">
              {typeGroup.alerts.map((alert: UnifiedAlertItem) => (
                <Card
                  key={alert.id}
                  className="border-none shadow-sm bg-white border-r-4 border-blue-500 overflow-hidden"
                >
                  <CardContent className="p-2">
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-12 w-12 rounded-2xl ${
                          alert.status === 2
                            ? "bg-green-500"
                            : alert.status === 3
                              ? "bg-red-500"
                              : "bg-amber-300"
                        } text-white flex items-center justify-center shrink-0`}
                      >
                        {alert.status === 2 ? (
                          <Check className="h-6 w-6" />
                        ) : alert.status === 3 ? (
                          <X className="h-6 w-6" />
                        ) : (
                          <AlertCircle className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold ">
                            {translateAlertType(typeGroup.alertType)}
                            {alert.status === 3 ? (
                              <span className="text-red-500">
                                {" "}
                                {" (مرفوض)"}{" "}
                              </span>
                            ) : alert.status === 2 ? (
                              <span></span>
                            ) : (
                              <span className="text-amber-300">
                                {" (قيد الانتظار)"}
                              </span>
                            )}
                          </h4>
                          <Badge className="bg-blue-200 text-blue-800 border-none">
                            {new Date(alert.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                              },
                            )}
                          </Badge>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          صدر هذا الإنذار لتجاوز الطالب نسبة الغياب المسموح بها
                          :{" "}
                          <span className="font-bold text-red-500">
                            عدد الغيابات {alert.absenceCountAtIssue}
                          </span>
                        </p>
                        {alert.isExtended && (
                          <div className="mt-4 p-3 bg-white/60 rounded-xl border border-blue-200/50">
                            <div className="text-sm text-blue-800 font-bold flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              تم تمديد الحد المسموح بمقدار{" "}
                              {alert.extensionExtraClasses} حصص إضافية.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {unifiedAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-blue-500" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">
              سجل نظيف من الإنذارات
            </h4>
            <p className="text-sm text-gray-500 max-w-xs mt-2">
              لم يتم إصدار أي إنذار للطالب في هذا الفصل.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
