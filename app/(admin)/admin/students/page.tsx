"use client";
import { useEffect, useState, useCallback } from "react";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAdminSidebarItems } from "@/lib/utils/sidebar-items";
import { GraduationStudentsTable } from "@/components/admin/specializationTab/graduation-students-table";
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
} from "@/components/ui/pagination";
import {
  Search,
  GraduationCap,
  UserCheck,
  Trash2,
  AlertTriangle,
} from "lucide-react";
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

export default function StudentsPage() {
  const dispatch = useAppDispatch();
  const { setSidebarItems } = useSidebar();
  const sidebarItems = useAdminSidebarItems("students");
  const { graduationStudents, fetchGraduationStudentsState } = useAppSelector(
    (state) => state.student,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isGraduated, setIsGraduated] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Edit/Delete state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentGraduationDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setSidebarItems(sidebarItems);
  }, [setSidebarItems]);

  const loadStudents = useCallback(() => {
    dispatch(
      fetchStudentsByGraduationStatus({
        isGraduated,
        pageNumber: page,
        pageSize,
        searchTerm: searchTerm || null,
      }),
    );
  }, [dispatch, isGraduated, page, searchTerm]);

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

  const [isEditLoading, setIsEditLoading] = useState<number | null>(null);

  const handleEdit = async (student: StudentGraduationDto) => {
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
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;
    setIsDeleting(true);
    try {
      await studentService.deleteStudent(selectedStudent.studentId);
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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
          <Tabs
            defaultValue="active"
            onValueChange={handleTabChange}
            className="w-full md:w-auto"
            dir="rtl"
          >
            <TabsList className="grid grid-cols-2 h-10 w-full md:w-[300px]">
              <TabsTrigger
                value="active"
                className="flex items-center gap-2  cursor-pointer"
              >
                <UserCheck className="h-4 w-4" />
                نشطون
              </TabsTrigger>
              <TabsTrigger
                value="graduated"
                className="flex items-center gap-2  cursor-pointer"
              >
                <GraduationCap className="h-4 w-4 " />
                متخرجون
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            النتائج : {graduationStudents?.totalCount} طالب
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث باسم الطالب..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-10 text-right h-10 border-gray-200 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <GraduationStudentsTable
          students={graduationStudents?.students || []}
          isLoading={fetchGraduationStudentsState.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {graduationStudents && graduationStudents.totalPages > 1 && (
          <div className="flex justify-center mt-6 ">
            <Pagination dir="rtl">
              <PaginationContent>
                {graduationStudents.hasPreviousPage && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(page - 1)}
                      className="cursor-pointer"
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
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {graduationStudents.hasNextPage && (
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
      </div>

      {/* Edit Student Dialog */}
      {selectedStudent && (
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

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
}
