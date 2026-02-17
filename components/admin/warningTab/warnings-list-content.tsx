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
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
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

  const handleReviewAlert = (alertId: number) => {
    setSelectedAlertId(alertId);
    setRejectionReason("");
    setExtensionClasses(0);
    setIsReviewDialogOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedAlertId) return;
    if (extensionClasses < 0) {
      showResult("خطأ", "عدد الحصص يجب أن يكون 0 أو أكثر", "destructive");
      return;
    }

    try {
      const response = await dispatch(
        rejectAlerts([
          {
            alertId: selectedAlertId,
            rejectionReason: rejectionReason,
            extensionExtraClasses: extensionClasses,
          },
        ]),
      ).unwrap();
      setIsReviewDialogOpen(false);
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

  const handleApproveAlert = (alertId: number) => {
    if (isDH) return;
    setSelectedAlertId(alertId);
    setIsApproveDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedAlertId || isDH) return;
    if (!user?.userId) {
      showResult("خطأ", "حدث خطأ في تحديد المستخدم المتصل", "destructive");
      return;
    }

    try {
      const response = await dispatch(
        approveAlerts([
          {
            alertId: selectedAlertId,
            approvedBy: user.userId.toString(),
          },
        ]),
      ).unwrap();

      setIsApproveDialogOpen(false);
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
        {fetchAlertsByStudentState.isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Spinner className="h-10 w-10 text-blue-600" />
            <p
              className={cn(
                "mt-4 font-medium",
                isDH ? "text-gray-500 font-black" : "text-gray-500",
              )}
            >
              جاري تحميل البيانات...
            </p>
          </div>
        ) : alertsByStudent?.students && alertsByStudent.students.length > 0 ? (
          <>
            {isMobile ? (
              <div className="space-y-4">
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
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
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
        ) : hasAttemptedLoad &&
          !fetchAlertsByStudentState.isLoading &&
          alertsByStudent ? (
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
        ) : null}
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
      />
    </div>
  );
}
