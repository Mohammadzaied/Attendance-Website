"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StudentAlertsBySubjectV2, UnifiedAlertItem } from "@/features/student";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { rejectAlerts, approveAlerts } from "@/features/alert";
import { WarningManagementDialogs } from "@/components/admin/warningTab/warning-management-dialogs";

interface AlertsSectionProps {
  isReadOnly?: boolean;
  unifiedAlerts: StudentAlertsBySubjectV2[];
  subjectsWithAlerts: any[];
  selectedAlertSubjectId: string;
  setSelectedAlertSubjectId: (id: string) => void;
  onAlertAction?: () => void;
}

export function AlertsSection({
  isReadOnly = false,
  unifiedAlerts,
  subjectsWithAlerts,
  selectedAlertSubjectId,
  setSelectedAlertSubjectId,
  onAlertAction,
}: AlertsSectionProps) {
  const dispatch = useAppDispatch();
  const { rejectAlertsState, approveAlertsState } = useAppSelector(
    (state) => state.alert,
  );
  const { user } = useAppSelector((state) => state.AuthSlice);

  // Dialog state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [extensionClasses, setExtensionClasses] = useState<number>(0);
  const [resultDialog, setResultDialog] = useState({
    open: false,
    title: "",
    message: "",
    variant: "default" as "default" | "destructive",
  });

  const translateAlertType = (type: string) => {
    const translationMap: Record<string, string> = {
      FirstWarning: "انذار اول",
      SecondWarning: "انذار ثاني",
      Deprivation: "حرمان",
    };
    return translationMap[type] || type;
  };

  const handleReviewAlert = (alertId: number) => {
    setSelectedAlertId(alertId);
    setRejectionReason("");
    setExtensionClasses(0);
    setIsReviewDialogOpen(true);
  };

  const handleApproveAlert = (alertId: number) => {
    setSelectedAlertId(alertId);
    setIsApproveDialogOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedAlertId) return;
    if (extensionClasses < 0) {
      setResultDialog({
        open: true,
        title: "خطأ",
        message: "عدد الحصص يجب أن يكون 0 أو أكثر",
        variant: "destructive",
      });
      return;
    }

    try {
      const models = [
        {
          alertId: selectedAlertId,
          rejectionReason: rejectionReason,
          extensionExtraClasses: extensionClasses,
        },
      ];

      const response = await dispatch(rejectAlerts(models)).unwrap();
      setIsReviewDialogOpen(false);
      setSelectedAlertId(null);

      setTimeout(() => {
        setResultDialog({
          open: true,
          title: "تم بنجاح",
          message: response?.message || "تم إرسال الرفض بنجاح",
          variant: "default",
        });
      }, 100);
      onAlertAction?.();
    } catch (error: any) {
      setResultDialog({
        open: true,
        title: "خطأ",
        message: error || "فشل إرسال الرفض",
        variant: "destructive",
      });
    }
  };

  const handleConfirmApprove = async () => {
    if (!selectedAlertId) return;
    if (!user?.userId) {
      setResultDialog({
        open: true,
        title: "خطأ",
        message: "حدث خطأ في تحديد المستخدم المتصل",
        variant: "destructive",
      });
      return;
    }

    try {
      const models = [
        {
          alertId: selectedAlertId,
          approvedBy: user.userId.toString(),
        },
      ];

      const response = await dispatch(approveAlerts(models)).unwrap();
      setIsApproveDialogOpen(false);
      setSelectedAlertId(null);

      setResultDialog({
        open: true,
        title: "تم بنجاح",
        message: response?.message || "تم تأكيد الإنذار بنجاح",
        variant: "default",
      });
      onAlertAction?.();
    } catch (error: any) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "فشل تأكيد الإنذار";
      setResultDialog({
        open: true,
        title: "خطأ",
        message: errorMessage,
        variant: "destructive",
      });
    }
  };

  const filteredSubjects = (
    selectedAlertSubjectId === "all"
      ? unifiedAlerts
      : unifiedAlerts.filter(
          (s) => s.subjectId.toString() === selectedAlertSubjectId,
        )
  ).filter((s) => s.alertsByType.some((t) => t.alerts.length > 0));

  return (
    <div className="space-y-4">
      {/* Subject Filter for Alerts */}
      {subjectsWithAlerts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-2xl border border-info-light/50">
          <Button
            variant={selectedAlertSubjectId === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedAlertSubjectId("all")}
            className={cn(
              "rounded-xl font-bold h-9",
              selectedAlertSubjectId === "all"
                ? "bg-info hover:bg-info-foreground"
                : "border-info text-info hover:bg-info-light",
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
                  ? "bg-info hover:bg-info-foreground"
                  : "border-info text-info hover:bg-info-light",
              )}
            >
              {s.subjectName}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredSubjects.map((subject) => (
          <div
            key={subject.subjectId}
            className="space-y-4 border border-gray-200 rounded-2xl p-5 bg-gray-50/50"
          >
            <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="bg-white px-4 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                {subject.subjectName} - {subject.numberOfHours} حصص
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {subject.alertsByType
                .flatMap((t) =>
                  t.alerts.map((a) => ({ ...a, alertTypeStr: t.alertType })),
                )
                .map((alert: UnifiedAlertItem & { alertTypeStr: string }) => {
                  const isDeprivationPending =
                    alert.alertTypeStr === "Deprivation" && alert.status === 1;

                  return (
                    <Card
                      key={alert.id}
                      className="border-none shadow-sm bg-white border-r-4 border-info overflow-hidden"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-4">
                          <div
                            className={`h-12 w-12 rounded-2xl ${
                              alert.status === 2
                                ? "bg-success"
                                : alert.status === 3
                                  ? "bg-danger"
                                  : "bg-warning"
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
                                {translateAlertType(alert.alertTypeStr)}
                                {alert.status === 3 ? (
                                  <span className="text-danger">
                                    {" (مرفوض)"}
                                  </span>
                                ) : alert.status === 2 ? (
                                  <span className="text-success">
                                    {" (مقبول)"}
                                  </span>
                                ) : (
                                  <span className="text-warning">
                                    {" (قيد الانتظار)"}
                                  </span>
                                )}
                              </h4>
                              <Badge className="bg-info-light text-info border-none">
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
                              صدر هذا الإنذار لتجاوز الطالب نسبة الغياب المسموح
                              بها :{" "}
                              <span className="font-bold text-danger">
                                عدد الغيابات {alert.limitAtIssue}
                              </span>
                            </p>
                            {alert.isExtended && (
                              <div className="mt-4 p-3 bg-info-light/60 rounded-xl border border-info-light/50">
                                <div className="text-sm text-info font-bold flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-info" />
                                  تم تمديد الحد المسموح بمقدار{" "}
                                  {alert.extensionExtraClasses} حصص إضافية.
                                </div>
                              </div>
                            )}

                            {/* Action buttons for Deprivation + Pending */}
                            {isDeprivationPending && !isReadOnly && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReviewAlert(alert.id)}
                                  className="h-8 px-3 text-xs font-bold border-danger text-danger hover:bg-danger-light rounded-xl gap-1.5"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  مراجعة
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveAlert(alert.id)}
                                  disabled={approveAlertsState.isLoading}
                                  className="h-8 px-3 text-xs font-bold border-success text-success hover:bg-success-light rounded-xl gap-1.5"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  تأكيد
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        ))}

        {filteredSubjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <div className="h-20 w-20 rounded-full bg-success-light flex items-center justify-center mb-4 text-info">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">
              سجل نظيف من الإنذارات
            </h4>
            <p className="text-sm text-gray-500 max-w-xs mt-2">
              {selectedAlertSubjectId === "all"
                ? "لم يتم إصدار أي إنذار للطالب في هذا الفصل الدراسي."
                : "لم يتم إصدار أي إنذار للطالب في هذه المادة."}
            </p>
          </div>
        )}
      </div>

      {/* Warning Management Dialogs */}
      <WarningManagementDialogs
        isReviewDialogOpen={isReviewDialogOpen}
        setIsReviewDialogOpen={setIsReviewDialogOpen}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        extensionClasses={extensionClasses}
        setExtensionClasses={setExtensionClasses}
        isRejecting={rejectAlertsState.isLoading}
        onConfirmReview={handleConfirmReview}
        isApproveDialogOpen={isApproveDialogOpen}
        setIsApproveDialogOpen={setIsApproveDialogOpen}
        onConfirmApprove={handleConfirmApprove}
        isApproving={approveAlertsState.isLoading}
        resultDialog={resultDialog}
        setResultDialog={setResultDialog}
      />
    </div>
  );
}
