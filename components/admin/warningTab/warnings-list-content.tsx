"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSidebar } from "@/contexts/sidebar-context";
import {
  useAdminSidebarItems,
  useDepartmentHeadSidebarItems,
} from "@/lib/utils/sidebar-items";
import { useDebounce } from "@/hooks/use-debounce";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchSemesters } from "@/features/specialization";
import {
  rejectAlerts,
  approveAlerts,
  fetchAlertsByStudent,
} from "@/features/alert";
import { alertService } from "@/features/alert/alertService";
import { fetchDepartments } from "@/features/admin";
import { getAllAcademicYears } from "@/features/teacher";
import { exportWarningsToExcel } from "@/lib/utils/warnings-excel-export";
import { Button } from "@/components/ui/button";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  X,
  CheckSquare,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

// Refactored Components
import { WarningFilters } from "@/components/admin/warningTab/warning-filters";
import { WarningMobileCard } from "@/components/admin/warningTab/warning-mobile-card";
import { WarningDesktopRow } from "@/components/admin/warningTab/warning-desktop-row";
import { WarningManagementDialogs } from "@/components/admin/warningTab/warning-management-dialogs";

type Role = "admin" | "department-head";

interface WarningsListContentProps {
  role?: Role;
}

export function WarningsListContent({
  role = "admin",
}: WarningsListContentProps) {
  const isDH = role === "department-head";
  const dispatch = useAppDispatch();
  const { setSidebarItems } = useSidebar();
  const adminSidebarItems = useAdminSidebarItems("warnings");
  const dhSidebarItems = useDepartmentHeadSidebarItems("warnings");
  const sidebarItems = isDH ? dhSidebarItems : adminSidebarItems;
  const isMobile = useIsMobile();

  const { alertsByStudent, fetchAlertsByStudentState } = useAppSelector(
    (state) => state.alert,
  );
  const { allAcademicYears: academicYears } = useAppSelector(
    (state) => state.teacher,
  );
  const { semestersBySpecialization: semesters } = useAppSelector(
    (state) => state.specializations,
  );
  const { departments, fetchDepartmentsState } = useAppSelector(
    (state) => state.admin,
  );
  const { rejectAlertsState, approveAlertsState } = useAppSelector(
    (state) => state.alert,
  );
  const { user } = useAppSelector((state) => state.AuthSlice);

  // Selection state
  const [selectedAlertIds, setSelectedAlertIds] = useState<number[]>([]);

  // Filter state
  const [studentName, setStudentName] = useState("");
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [semesterId, setSemesterId] = useState<string>("");
  const [alertType, setAlertType] = useState<string>("all");
  const [alertStatus, setAlertStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [departmentName, setDepartmentName] = useState<string>("all");

  // Review Dialog state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [extensionClasses, setExtensionClasses] = useState<number>(0);
  const [isExporting, setIsExporting] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  const [resultDialog, setResultDialog] = useState({
    open: false,
    title: "",
    message: "",
    variant: "default" as "default" | "destructive",
  });

  const showResult = (
    title: string,
    message: string,
    variant: "default" | "destructive" = "default",
  ) => {
    setResultDialog({ open: true, title, message, variant });
  };

  const debouncedStudentName = useDebounce(studentName, 500);

  // Reset selection on filter or page change
  useEffect(() => {
    setSelectedAlertIds([]);
  }, [
    debouncedStudentName,
    academicYearId,
    semesterId,
    alertType,
    alertStatus,
    departmentName,
    page,
  ]);

  useEffect(() => {
    setSidebarItems(sidebarItems);
    dispatch(getAllAcademicYears());
    dispatch(fetchSemesters());
    dispatch(fetchDepartments());
  }, [setSidebarItems, sidebarItems, dispatch]);

  useEffect(() => {
    if (
      isDH &&
      user?.departmentId &&
      departments.length > 0 &&
      departmentName === "all"
    ) {
      const userDept = departments.find(
        (d) => d.departmentId === user.departmentId,
      );
      if (userDept) {
        setDepartmentName(userDept.name);
      }
    }
  }, [isDH, departments, user, departmentName]);

  useEffect(() => {
    if (!semesterId && semesters?.length > 0) {
      const activeSemester = semesters.find((s) => s.status === 1);
      if (activeSemester) {
        setSemesterId(activeSemester.semesterId.toString());
        setAcademicYearId(activeSemester.academicYearId.toString());
      } else {
        setSemesterId(semesters[0].semesterId.toString());
        if (!academicYearId && academicYears?.length > 0) {
          setAcademicYearId(academicYears[0].academicYearId.toString());
        }
      }
    }
  }, [semesters, academicYears, semesterId, academicYearId]);

  const loadAlerts = useCallback(() => {
    if (academicYearId === "" || semesterId === "") return;

    if (
      academicYearId !== "all" &&
      semesterId !== "all" &&
      semesters.length > 0
    ) {
      const selectedSemester = semesters.find(
        (s) => s.semesterId.toString() === semesterId,
      );
      if (
        selectedSemester &&
        selectedSemester.academicYearId.toString() !== academicYearId
      ) {
        return;
      }
    }

    setHasAttemptedLoad(true);
    dispatch(
      fetchAlertsByStudent({
        studentName: studentName || undefined,
        academicYearId:
          academicYearId === "all" ? undefined : parseInt(academicYearId),
        semesterId: semesterId === "all" ? undefined : parseInt(semesterId),
        type: alertType === "all" ? undefined : parseInt(alertType),
        status: alertStatus === "all" ? undefined : parseInt(alertStatus),
        departmentName: departmentName === "all" ? undefined : departmentName,
        pageNumber: page,
        pageSize: 20,
      }),
    );
  }, [
    dispatch,
    studentName,
    academicYearId,
    semesterId,
    alertType,
    alertStatus,
    departmentName,
    page,
    semesters,
  ]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts, debouncedStudentName]);

  useEffect(() => {
    setPage(1);
  }, [debouncedStudentName]);

  useEffect(() => {
    if (academicYearId !== "all" && academicYearId !== "") {
      const yearSemesters = semesters.filter(
        (s) => s.academicYearId.toString() === academicYearId,
      );
      if (yearSemesters.length > 0) {
        const currentIsMatch = yearSemesters.some(
          (s) => s.semesterId.toString() === semesterId,
        );
        if (!currentIsMatch) {
          const activeInYear = yearSemesters.find((s) => s.status === 1);
          setSemesterId(
            (activeInYear || yearSemesters[0]).semesterId.toString(),
          );
        }
      }
    }
  }, [academicYearId, semesters, semesterId]);

  const handleReset = () => {
    setStudentName("");
    const activeSemester = semesters.find((s) => s.status === 1);
    if (activeSemester) {
      setSemesterId(activeSemester.semesterId.toString());
      setAcademicYearId(activeSemester.academicYearId.toString());
    } else {
      if (academicYears?.length > 0) {
        const yearId = academicYears[0].academicYearId.toString();
        setAcademicYearId(yearId);
        const yearSems = semesters.filter(
          (s) => s.academicYearId.toString() === yearId,
        );
        if (yearSems.length > 0) {
          setSemesterId(yearSems[0].semesterId.toString());
        }
      } else if (semesters?.length > 0) {
        setSemesterId(semesters[0].semesterId.toString());
      }
    }
    setAlertType("all");
    setAlertStatus("all");
    setDepartmentName("all");
    setPage(1);
  };

  const handleExportToExcel = async () => {
    if (isDH && !user?.departmentName) return;
    if (!isDH && departmentName === "all") return;
    setIsExporting(true);

    const selectedYearName =
      academicYears.find((y) => y.academicYearId.toString() === academicYearId)
        ?.year || "";
    const selectedSemesterName =
      semesters.find((s) => s.semesterId.toString() === semesterId)?.name || "";

    try {
      const response = await alertService.getAlertsByStudent({
        academicYearId:
          academicYearId === "all" ? undefined : parseInt(academicYearId),
        semesterId: semesterId === "all" ? undefined : parseInt(semesterId),
        type: alertType === "all" ? undefined : parseInt(alertType),
        status: alertStatus === "all" ? undefined : parseInt(alertStatus),
        departmentName: departmentName,
        pageSize: 2000,
      });

      if (!response.students || response.students.length === 0) {
        showResult("تنبيه", "لا توجد بيانات لتصديرها", "destructive");
        return;
      }

      exportWarningsToExcel({
        students: response.students,
        alertType: alertType,
        academicYearName: selectedYearName,
        semesterName: selectedSemesterName,
        fileName: departmentName,
      });

      showResult("تم بنجاح", "تم تصدير الملف بنجاح");
    } catch (error) {
      console.error("Failed to export Excel:", error);
      showResult("خطأ", "فشل تصدير الملف", "destructive");
    } finally {
      setIsExporting(false);
    }
  };

  const translateStatus = (status: number | string): string => {
    const s = Number(status);
    switch (s) {
      case 1:
        return "معلق";
      case 2:
        return "موافق عليه";
      case 3:
        return "مرفوض";
      default:
        return String(status);
    }
  };

  // Only show selection UI for Admin + Dismissal type + Pending status
  const canShowSelectionUI = !isDH && alertType === "3";

  const eligibleAlertIds = useMemo(() => {
    if (!canShowSelectionUI || !alertsByStudent?.students) return [];

    const ids: number[] = [];
    alertsByStudent.students.forEach((student: any) => {
      student.studentAlerts.forEach((subject: any) => {
        subject.alerts.forEach((alert: any) => {
          if (Number(alert.type) === 3 && Number(alert.status) === 1) {
            ids.push(alert.id);
          }
        });
      });
    });
    return ids;
  }, [alertsByStudent, canShowSelectionUI]);

  const totalAlerts = useMemo(() => {
    if (!alertsByStudent?.students) return 0;
    let count = 0;
    alertsByStudent.students.forEach((student: any) => {
      student.studentAlerts.forEach((subject: any) => {
        count += subject.alerts.length;
      });
    });
    return count;
  }, [alertsByStudent]);

  const handleToggleSelection = (alertId: number) => {
    setSelectedAlertIds((prev) =>
      prev.includes(alertId)
        ? prev.filter((id) => id !== alertId)
        : [...prev, alertId],
    );
  };

  const handleSelectAll = () => {
    if (selectedAlertIds.length === eligibleAlertIds.length) {
      setSelectedAlertIds([]);
    } else {
      setSelectedAlertIds(eligibleAlertIds);
    }
  };

  const handleBulkApprove = () => {
    if (selectedAlertIds.length === 0 || isDH) return;
    setIsApproveDialogOpen(true);
  };

  const handleBulkReject = () => {
    if (selectedAlertIds.length === 0) return;
    setRejectionReason("");
    setExtensionClasses(0);
    setIsReviewDialogOpen(true);
  };

  const handleConfirmReview = async () => {
    if (selectedAlertIds.length === 0 && !selectedAlertId) return;
    if (extensionClasses < 0) {
      showResult("خطأ", "عدد الحصص يجب أن يكون 0 أو أكثر", "destructive");
      return;
    }

    try {
      const idsToReject =
        selectedAlertIds.length > 0
          ? selectedAlertIds
          : [selectedAlertId as number];
      const models = idsToReject.map((id) => ({
        alertId: id,
        rejectionReason: rejectionReason,
        extensionExtraClasses: extensionClasses,
      }));

      const response = await dispatch(rejectAlerts(models)).unwrap();
      setIsReviewDialogOpen(false);
      setSelectedAlertIds([]);
      setSelectedAlertId(null);

      setTimeout(() => {
        setResultDialog({
          open: true,
          title: "تم بنجاح",
          message: response?.message || "تم إرسال الرفض بنجاح",
          variant: "default",
        });
      }, 100);
      loadAlerts();
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
    if ((selectedAlertIds.length === 0 && !selectedAlertId) || isDH) return;
    if (!user?.userId) {
      showResult("خطأ", "حدث خطأ في تحديد المستخدم المتصل", "destructive");
      return;
    }

    try {
      const idsToApprove =
        selectedAlertIds.length > 0
          ? selectedAlertIds
          : [selectedAlertId as number];
      const models = idsToApprove.map((id) => ({
        alertId: id,
        approvedBy: user.userId.toString(),
      }));

      const response = await dispatch(approveAlerts(models)).unwrap();

      setIsApproveDialogOpen(false);
      setSelectedAlertIds([]);
      setSelectedAlertId(null);

      setResultDialog({
        open: true,
        title: "تم بنجاح",
        message: response?.message || "تم تأكيد الإنذار بنجاح",
        variant: "default",
      });
      loadAlerts();
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

  const handleReviewAlert = (alertId: number) => {
    setSelectedAlertId(alertId);
    setRejectionReason("");
    setExtensionClasses(0);
    setIsReviewDialogOpen(true);
  };

  const handleApproveAlert = (alertId: number) => {
    if (isDH) return;
    setSelectedAlertId(alertId);
    setIsApproveDialogOpen(true);
  };

  const translateType = (type: number) => {
    switch (type) {
      case 1:
        return "إنذار أول";
      case 2:
        return "إنذار ثاني";
      case 3:
        return "حرمان";
      default:
        return `إنذار ${type}`;
    }
  };

  return (
    <div
      className={cn(
        "space-y-6 pb-20",
        isDH && "md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto",
      )}
      dir="rtl"
    >
      {isDH && (
        <div className="text-right">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            إدارة الإنذارات
          </h1>
          <p className="text-sm md:text-base text-gray-600 font-medium italic">
            مراجعة واعتماد إنذارات الطلاب
          </p>
        </div>
      )}

      <WarningFilters
        studentName={studentName}
        setStudentName={setStudentName}
        academicYearId={academicYearId}
        setAcademicYearId={setAcademicYearId}
        academicYears={academicYears}
        semesterId={semesterId}
        setSemesterId={setSemesterId}
        semesters={semesters}
        alertType={alertType}
        setAlertType={setAlertType}
        alertStatus={alertStatus}
        setAlertStatus={setAlertStatus}
        departmentName={departmentName}
        setDepartmentName={setDepartmentName}
        departments={departments}
        isLoadingDepartments={fetchDepartmentsState.isLoading}
        isExporting={isExporting}
        onExport={handleExportToExcel}
        onReset={handleReset}
        isDepartmentHead={isDH}
        hasData={(alertsByStudent?.students?.length ?? 0) > 0}
      />

      <div className="space-y-6">
        {/* Floating Bottom Action Bar */}
        {selectedAlertIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gray-900/90 backdrop-blur-xl text-white px-5 py-3 rounded-2xl shadow-2xl shadow-black/20 border border-white/10 flex items-center gap-3">
              <div className="flex items-center gap-2 pl-3 border-l border-white/15">
                <CheckSquare className="h-4 w-4 text-info" />
                <span className="text-sm font-bold tabular-nums">
                  {selectedAlertIds.length}
                </span>
                <span className="text-xs text-gray-400 hidden md:inline">
                  محدد
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedAlertIds([])}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl h-8 px-2 gap-1 text-xs"
              >
                <X className="h-3.5 w-3.5" />
                إلغاء
              </Button>
              <div className="h-5 w-px bg-white/15" />
              <Button
                size="sm"
                onClick={handleBulkReject}
                className="bg-danger hover:bg-danger-foreground text-white border-none rounded-xl h-8 px-3 gap-1.5 text-xs font-bold shadow-lg shadow-danger/20 transition-all"
              >
                <XCircle className="h-3.5 w-3.5" />
                رفض
              </Button>
              <Button
                size="sm"
                onClick={handleBulkApprove}
                className="bg-success hover:bg-success-foreground text-white border-none rounded-xl h-8 px-3 gap-1.5 text-xs font-bold shadow-lg shadow-success/20 transition-all"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                تأكيد
              </Button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {!fetchAlertsByStudentState.isLoading &&
          alertsByStudent?.students &&
          alertsByStudent.students.length > 0 && (
            <>
              {isMobile ? (
                <div className="space-y-4">
                  {/* Mobile Stats + Select All */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm">
                      <Users className="h-3.5 w-3.5 text-info" />
                      <span className="text-xs font-black text-gray-700">
                        {alertsByStudent.totalCount}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        طالب
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                      <span className="text-xs font-black text-gray-700">
                        {totalAlerts}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        إنذار
                      </span>
                    </div>
                  </div>
                  {canShowSelectionUI && eligibleAlertIds.length > 0 && (
                    <div className="flex items-center justify-between bg-linear-to-l from-info-light to-white p-4 rounded-2xl border border-info/60 shadow-sm">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-info" />
                        <span className="text-sm font-bold text-gray-700">
                          تحديد الكل
                        </span>
                        <span className="text-xs text-gray-400">
                          ({eligibleAlertIds.length})
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-gray-300 text-info focus:ring-info cursor-pointer accent-info"
                        checked={
                          selectedAlertIds.length === eligibleAlertIds.length &&
                          eligibleAlertIds.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </div>
                  )}
                  {alertsByStudent.students.map((student) => (
                    <WarningMobileCard
                      key={student.studentId}
                      student={student}
                      translateType={translateType}
                      translateStatus={translateStatus}
                      onReview={handleReviewAlert}
                      onApprove={handleApproveAlert}
                      isApproving={approveAlertsState.isLoading}
                      isReadOnly={isDH}
                      userRole={user?.roleName}
                      selectedIds={
                        canShowSelectionUI && eligibleAlertIds.length > 0
                          ? selectedAlertIds
                          : []
                      }
                      onToggleSelection={
                        canShowSelectionUI && eligibleAlertIds.length > 0
                          ? handleToggleSelection
                          : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Integrated Stats Toolbar */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/30">
                    {canShowSelectionUI && eligibleAlertIds.length > 0 && (
                      <button
                        onClick={handleSelectAll}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer text-xs font-bold",
                          selectedAlertIds.length === eligibleAlertIds.length &&
                            eligibleAlertIds.length > 0
                            ? "bg-info-light border-info text-info ring-1 ring-info-light"
                            : "bg-white border-gray-200 text-gray-600 hover:border-info hover:bg-info-light/50 hover:text-info",
                        )}
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>تحديد الكل</span>
                        <span className="tabular-nums text-[10px] font-black opacity-60">
                          ({eligibleAlertIds.length})
                        </span>
                      </button>
                    )}
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-info-light flex items-center justify-center">
                          <Users className="h-3.5 w-3.5 text-info" />
                        </div>
                        <span className="text-xs font-bold text-gray-500">
                          عدد الطلاب
                        </span>
                        <span className="text-sm font-black text-gray-900 tabular-nums">
                          {alertsByStudent.totalCount}
                        </span>
                      </div>
                      <div className="h-5 w-px bg-gray-200" />
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-warning-light flex items-center justify-center">
                          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                        </div>
                        <span className="text-xs font-bold text-gray-500">
                          عدد الإنذارات
                        </span>
                        <span className="text-sm font-black text-gray-900 tabular-nums">
                          {totalAlerts}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="p-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider w-64">
                            الطالب
                          </th>
                          <th className="p-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">
                            تفاصيل المواد والإنذارات
                          </th>
                          <th className="p-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider w-32">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {alertsByStudent?.students.map((student) => (
                          <WarningDesktopRow
                            key={student.studentId}
                            student={student}
                            translateType={translateType}
                            translateStatus={translateStatus}
                            onReview={handleReviewAlert}
                            onApprove={handleApproveAlert}
                            isApproving={approveAlertsState.isLoading}
                            isReadOnly={isDH}
                            userRole={user?.roleName}
                            selectedIds={
                              canShowSelectionUI && eligibleAlertIds.length > 0
                                ? selectedAlertIds
                                : []
                            }
                            onToggleSelection={
                              canShowSelectionUI && eligibleAlertIds.length > 0
                                ? handleToggleSelection
                                : undefined
                            }
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {alertsByStudent && alertsByStudent.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination dir="rtl">
                    <PaginationContent>
                      {page > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setPage(page - 1)}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      )}

                      {Array.from(
                        { length: alertsByStudent.totalPages },
                        (_, i) => i + 1,
                      ).map((pageNum) => (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setPage(pageNum)}
                            isActive={page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      {page < alertsByStudent.totalPages && (
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setPage(page + 1)}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}

        {fetchAlertsByStudentState.isLoading && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Spinner className="h-10 w-10 text-info" />
            <p
              className={cn(
                "mt-4 font-medium",
                isDH ? "text-gray-500 font-black" : "text-gray-500",
              )}
            >
              جاري تحميل البيانات...
            </p>
          </div>
        )}

        {hasAttemptedLoad &&
          !fetchAlertsByStudentState.isLoading &&
          alertsByStudent &&
          (!alertsByStudent.students ||
            alertsByStudent.students.length === 0) && (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm opacity-60">
              <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Filter className="h-10 w-10 text-gray-300" />
              </div>
              <h3
                className={cn(
                  "text-xl font-bold text-gray-900",
                  isDH && "font-black",
                )}
              >
                لا توجد نتائج
              </h3>
              <p
                className={cn(
                  "text-sm text-gray-500 mt-2",
                  isDH && "font-medium italic",
                )}
              >
                جرب تعديل فلاتر البحث للعثور على ما تبحث عنه
              </p>
            </div>
          )}
      </div>

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
        isBulk={selectedAlertIds.length > 0}
        selectedCount={selectedAlertIds.length}
      />
    </div>
  );
}
