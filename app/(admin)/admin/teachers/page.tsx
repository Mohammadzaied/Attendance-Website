"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAdminSidebarItems } from "@/lib/utils/sidebar-items";
import { Spinner } from "@/components/ui/spinner";
import { TeachersTable } from "@/components/admin/teacherTab/teachers-table";
import { AddTeacherDialog } from "@/components/admin/teacherTab/add-teacher-dialog";
import { ImportUsersDialog } from "@/components/admin/teacherTab/import-users-dialog";
import { UpdateTeacherDialog } from "@/components/admin/teacherTab/update-teacher-dialog";
import { DeleteTeacherDialog } from "@/components/admin/teacherTab/delete-teacher-dialog";
import {
  fetchTeachers,
  fetchDepartments,
  openUpdateDialog,
  closeUpdateDialog,
  openDeleteDialog,
  closeDeleteDialog,
  setTeachersPage,
  setTeachersSearchTerm,
} from "@/features/admin";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { TeacherResponse } from "@/features/admin";

export default function TeachersPage() {
  const dispatch = useAppDispatch();
  const { setSidebarItems } = useSidebar();
  const sidebarItems = useAdminSidebarItems("teachers");

  const {
    teachers,
    departments,
    selectedTeacher,
    isUpdateDialogOpen,
    isDeleteDialogOpen,
    fetchTeachersState,
    teachersPagination,
  } = useAppSelector((state) => state.admin);

  const { currentPage, totalPages, searchTerm, pageSize } = teachersPagination;

  const [teacherSearch, setTeacherSearch] = useState(searchTerm || "");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    setSidebarItems(sidebarItems);
    dispatch(fetchDepartments());
  }, [dispatch, setSidebarItems, sidebarItems]);

  useEffect(() => {
    dispatch(
      fetchTeachers({
        pageNumber: currentPage,
        pageSize: pageSize,
        searchTerm: searchTerm,
      }),
    );
  }, [dispatch, currentPage, searchTerm, pageSize]);

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (teacherSearch !== searchTerm) {
        dispatch(setTeachersSearchTerm(teacherSearch || null));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [teacherSearch, dispatch, searchTerm]);

  const handleTeacherSuccess = () => {
    dispatch(
      fetchTeachers({
        pageNumber: currentPage,
        pageSize: pageSize,
        searchTerm: searchTerm,
      }),
    );
  };

  const handlePageChange = (page: number) => {
    dispatch(setTeachersPage(page));
  };

  const handleEditTeacher = (teacher: TeacherResponse) => {
    dispatch(openUpdateDialog(teacher));
  };

  const handleDeleteTeacher = (teacher: TeacherResponse) => {
    dispatch(openDeleteDialog(teacher));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-4">
          <TeachersTable
            teachers={teachers as any}
            totalCount={teachersPagination.totalCount}
            isLoading={fetchTeachersState.isLoading}
            searchValue={teacherSearch}
            onSearchChange={setTeacherSearch}
            onEdit={handleEditTeacher as any}
            onDelete={handleDeleteTeacher as any}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            departmentFilter={departmentFilter}
            onDepartmentFilterChange={setDepartmentFilter}
            departments={departments}
            headerAction={
              <div className="flex gap-2">
                <ImportUsersDialog onSuccess={handleTeacherSuccess} />
                <AddTeacherDialog onSuccess={handleTeacherSuccess} />
              </div>
            }
          />

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination dir="rtl">
                <PaginationContent>
                  {teachersPagination.hasPreviousPage && (
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="cursor-pointer rounded-xl border-gray-200 font-bold hover:bg-gray-50"
                      />
                    </PaginationItem>
                  )}

                  {(() => {
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
                            onClick={() => handlePageChange(p)}
                            isActive={currentPage === p}
                            className={cn(
                              "cursor-pointer rounded-xl font-bold transition-all",
                              currentPage === p
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-200 hover:bg-gray-50",
                            )}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    });
                  })()}

                  {teachersPagination.hasNextPage && (
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="cursor-pointer rounded-xl border-gray-200 font-bold hover:bg-gray-50"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        <UpdateTeacherDialog
          teacher={selectedTeacher}
          open={isUpdateDialogOpen}
          onOpenChange={() => dispatch(closeUpdateDialog())}
          onSuccess={handleTeacherSuccess}
        />
        <DeleteTeacherDialog
          teacher={selectedTeacher}
          open={isDeleteDialogOpen}
          onOpenChange={() => dispatch(closeDeleteDialog())}
          onSuccess={handleTeacherSuccess}
        />
      </div>
    </div>
  );
}
