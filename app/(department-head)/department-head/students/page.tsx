"use client";

import { useEffect, useState, useCallback } from "react";
import { useSidebar } from "@/contexts/sidebar-context";
import { useDepartmentHeadSidebarItems } from "@/lib/utils/sidebar-items";
import { GraduationStudentsTable } from "@/components/admin/specializationTab/graduation-students-table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStudentsByGraduationStatus } from "@/features/student";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, GraduationCap, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DHStudentsPage() {
  const dispatch = useAppDispatch();
  const { setSidebarItems } = useSidebar();
  const sidebarItems = useDepartmentHeadSidebarItems("students");
  const { graduationStudents, fetchGraduationStudentsState } = useAppSelector(
    (state) => state.student,
  );
  const { user } = useAppSelector((state) => state.AuthSlice);

  const [searchTerm, setSearchTerm] = useState("");
  const [isGraduated, setIsGraduated] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

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
        departmentId: user?.departmentId || null,
      }),
    );
  }, [dispatch, isGraduated, page, searchTerm, user?.departmentId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search
  };

  const handleTabChange = (value: string) => {
    setIsGraduated(value === "graduated");
    setPage(1); // Reset to first page on tab change
  };

  return (
    <div
      className="space-y-6 md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto pb-10"
      dir="rtl"
    >
      {/* Header */}
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
          إدارة الطلاب
        </h1>
        <p className="text-sm md:text-base text-gray-600 font-medium italic">
          عرض وإدارة قائمة طلاب القسم
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
          <Tabs
            defaultValue="active"
            onValueChange={handleTabChange}
            className="w-full md:w-auto"
            dir="rtl"
          >
            <TabsList className="grid grid-cols-2 h-11 w-full md:w-[300px] rounded-xl bg-gray-100 p-1">
              <TabsTrigger
                value="active"
                className="flex items-center gap-2 rounded-lg font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm cursor-pointer"
              >
                <UserCheck className="h-4 w-4" />
                نشطون
              </TabsTrigger>
              <TabsTrigger
                value="graduated"
                className="flex items-center gap-2 rounded-lg font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm cursor-pointer"
              >
                <GraduationCap className="h-4 w-4" />
                متخرجون
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
            النتائج : {graduationStudents?.totalCount} طالب
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث باسم الطالب..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-10 text-right h-11 border-gray-200 rounded-xl font-bold focus:ring-blue-500/20"
            />
          </div>
        </div>

        <GraduationStudentsTable
          students={graduationStudents?.students || []}
          isLoading={fetchGraduationStudentsState.isLoading}
          isReadOnly={true}
          basePath="/department-head"
        />

        {graduationStudents && graduationStudents.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination dir="rtl">
              <PaginationContent className="gap-2">
                {graduationStudents.hasPreviousPage && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(page - 1)}
                      className="rounded-xl border-gray-200 font-bold cursor-pointer hover:bg-gray-50"
                    />
                  </PaginationItem>
                )}

                {Array.from(
                  { length: graduationStudents.totalPages },
                  (_, i) => i + 1,
                ).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setPage(pageNum)}
                      isActive={page === pageNum}
                      className={cn(
                        "rounded-xl font-bold cursor-pointer transition-all",
                        page === pageNum
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 hover:bg-gray-50",
                      )}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {graduationStudents.hasNextPage && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(page + 1)}
                      className="rounded-xl border-gray-200 font-bold cursor-pointer hover:bg-gray-50"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
