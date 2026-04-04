"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSidebar } from "@/contexts/sidebar-context";
import {
  useAdminSidebarItems,
  useDepartmentHeadSidebarItems,
} from "@/lib/utils/sidebar-items";
import { GraduationStudentsTable } from "@/components/admin/studentTab/graduation-students-table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStudentsByGraduationStatus } from "@/features/student";
import { fetchSpecializations } from "@/features/specialization";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Search, GraduationCap, UserCheck, Trash2 } from "lucide-react";
import { EditStudentDialog } from "@/components/admin/specializationTab/edit-student-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { studentService } from "@/features/student/studentService";
import { StudentGraduationDto } from "@/features/student/studentTypes";
import { cn } from "@/lib/utils";

type Role = "admin" | "department-head";

interface StudentsListContentProps {
  role?: Role;
}

export function StudentsListContent({
  role = "admin",
}: StudentsListContentProps) {
  const isDH = role === "department-head";
  const dispatch = useAppDispatch();
  const { setSidebarItems } = useSidebar();

  const adminSidebarItems = useAdminSidebarItems("students");
  const dhSidebarItems = useDepartmentHeadSidebarItems("students");
  const sidebarItems = isDH ? dhSidebarItems : adminSidebarItems;

  const { graduationStudents, fetchGraduationStudentsState } = useAppSelector(
    (state) => state.student,
  );
  const { user } = useAppSelector((state) => state.AuthSlice);

  const [searchTerm, setSearchTerm] = useState("");
  const [isGraduated, setIsGraduated] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 30;

  // Edit/Delete state (Admin only)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentGraduationDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState<number | null>(null);

  useEffect(() => {
    setSidebarItems(sidebarItems);
  }, [setSidebarItems, sidebarItems]);

  const loadStudents = useCallback(() => {
    dispatch(
      fetchStudentsByGraduationStatus({
        isGraduated,
        pageNumber: page,
        pageSize,
        searchTerm: searchTerm || null,
        departmentId: isDH ? user?.departmentId || null : null,
      }),
    );
  }, [dispatch, isGraduated, page, searchTerm, isDH, user?.departmentId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleTabChange = (value: string) => {
    setIsGraduated(value === "graduated");
    setPage(1);
  };

  const handleEdit = async (student: StudentGraduationDto) => {
    if (isDH) return;
    setIsEditLoading(student.studentId);
    try {
      await dispatch(fetchSpecializations()).unwrap();
      setSelectedStudent(student);
      setIsEditDialogOpen(true);
    } catch (error) {
      toast.error("فشل تحميل التخصصات");
      console.error(error);
    } finally {
      setIsEditLoading(null);
    }
  };

  const handleDelete = (student: StudentGraduationDto) => {
    if (isDH) return;
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent || isDH) return;
    setIsDeleting(true);
    try {
      await studentService.deleteStudents([selectedStudent.studentId]);
      toast.success("تم حذف الطالب بنجاح");
      setIsDeleteDialogOpen(false);
      loadStudents();
    } catch (error) {
      toast.error("فشل حذف الطالب");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        "space-y-6",
        isDH && "md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto pb-10",
      )}
      dir={isDH ? "rtl" : undefined}
    >
      {isDH && (
        <div className="text-right">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            إدارة الطلاب
          </h1>
          <p className="text-sm md:text-base text-gray-600 font-medium italic">
            عرض وإدارة قائمة طلاب القسم
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div
          className={cn(
            "flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border shadow-sm",
            isDH ? "rounded-2xl" : "rounded-xl",
          )}
        >
          <Tabs
            defaultValue="active"
            onValueChange={handleTabChange}
            className="w-full md:w-auto"
            dir="rtl"
          >
            <TabsList
              className={cn(
                "grid grid-cols-2 h-10 w-full md:w-[300px]",
                isDH && "h-11 rounded-xl bg-gray-100 p-1",
              )}
            >
              <TabsTrigger
                value="active"
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  isDH &&
                    "rounded-lg font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm",
                )}
              >
                <UserCheck className="h-4 w-4" />
                نشطون
              </TabsTrigger>
              <TabsTrigger
                value="graduated"
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  isDH &&
                    "rounded-lg font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm",
                )}
              >
                <GraduationCap className="h-4 w-4" />
                متخرجون
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div
            className={cn(
              "px-4 py-2 text-sm font-medium text-blue-700",
              isDH
                ? "bg-blue-50 rounded-xl font-black"
                : "bg-blue-50 rounded-lg",
            )}
          >
            النتائج : {graduationStudents?.totalCount} طالب
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث باسم الطالب..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={cn(
                "pr-10 text-right h-10 border-gray-200 focus:ring-blue-500/20",
                isDH && "h-11 rounded-xl font-bold",
              )}
            />
          </div>
        </div>

        <GraduationStudentsTable
          students={graduationStudents?.students || []}
          isLoading={fetchGraduationStudentsState.isLoading}
          onEdit={!isDH ? handleEdit : undefined}
          onDelete={!isDH ? handleDelete : undefined}
          isReadOnly={isDH}
          basePath={isDH ? "/department-head" : "/admin"}
        />

        {graduationStudents && graduationStudents.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination dir="rtl">
              <PaginationContent className={isDH ? "gap-2" : undefined}>
                {graduationStudents.hasPreviousPage && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(page - 1)}
                      className={cn(
                        "cursor-pointer",
                        isDH &&
                          "rounded-xl border-gray-200 font-bold hover:bg-gray-50",
                      )}
                    />
                  </PaginationItem>
                )}

                {(() => {
                  const totalPages = graduationStudents.totalPages;
                  const currentPage = page;
                  const pages: (number | string)[] = [];

                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push("ellipsis-start");

                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);

                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }

                    if (currentPage < totalPages - 2)
                      pages.push("ellipsis-end");
                    pages.push(totalPages);
                  }

                  return pages.map((p, i) => {
                    if (typeof p === "string") {
                      return (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          onClick={() => setPage(p)}
                          isActive={currentPage === p}
                          className={cn(
                            "cursor-pointer",
                            isDH &&
                              cn(
                                "rounded-xl font-bold transition-all",
                                currentPage === p
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-gray-200 hover:bg-gray-50",
                              ),
                          )}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  });
                })()}

                {graduationStudents.hasNextPage && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(page + 1)}
                      className={cn(
                        "cursor-pointer",
                        isDH &&
                          "rounded-xl border-gray-200 font-bold hover:bg-gray-50",
                      )}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Edit Student Dialog (Admin only) */}
      {!isDH && selectedStudent && (
        <EditStudentDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          student={{
            studentId: selectedStudent.studentId,
            fullName: selectedStudent.fullName,
            username: selectedStudent.username,
          }}
          currentMajor={
            {
              id: selectedStudent.enrollments.specializationId.toString(),
              name: selectedStudent.enrollments.specializationName,
              departmentId: selectedStudent.enrollments.departmentId,
              studentCount: 0,
            } as any
          }
          currentYear={
            {
              id: selectedStudent.enrollments.semesterId.toString(),
              studyYear: selectedStudent.enrollments.studyYear,
            } as any
          }
          onSuccess={async () => {
            loadStudents();
          }}
        />
      )}

      {/* Delete Confirmation Dialog (Admin only) */}
      {!isDH && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px] rounded-2xl" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                تأكيد الحذف
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 text-right">
              <p className="text-gray-600">
                هل أنت متأكد من حذف الطالب{" "}
                <span className="font-bold text-gray-900">
                  {selectedStudent?.fullName}
                </span>
                ؟ هذا الإجراء لا يمكن التراجع عنه.
              </p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1 rounded-xl cursor-pointer"
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl cursor-pointer"
              >
                {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
