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
import { AdminStatsCards } from "@/components/admin/stats-cards";
import {
  fetchTeachers,
  fetchDepartments,
  openUpdateDialog,
  closeUpdateDialog,
  openDeleteDialog,
  closeDeleteDialog,
} from "@/features/admin";
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
  } = useAppSelector((state) => state.admin);

  const [teacherSearch, setTeacherSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    setSidebarItems(sidebarItems);
    dispatch(fetchTeachers());
    dispatch(fetchDepartments());
  }, [dispatch, setSidebarItems]);

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.username.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      teacher.fullName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      teacher.departmentName
        .toLowerCase()
        .includes(teacherSearch.toLowerCase());

    const matchesRole =
      roleFilter === "all" || teacher.roleId.toString() === roleFilter;

    const matchesDepartment =
      departmentFilter === "all" || teacher.departmentName === departmentFilter;

    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleEditTeacher = (teacher: TeacherResponse) => {
    dispatch(openUpdateDialog(teacher));
  };

  const handleDeleteTeacher = (teacher: TeacherResponse) => {
    dispatch(openDeleteDialog(teacher));
  };

  const handleTeacherSuccess = () => {
    dispatch(fetchTeachers());
  };

  return (
    <div className="space-y-6">
      {/* <AdminStatsCards
        totalStudents={totalStudents}
        totalTeachers={totalTeachers}
        avgAttendance={avgAttendance}
        atRiskStudents={atRiskStudents}
      /> */}

      <div className="space-y-4">
        {fetchTeachersState.isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Spinner className="h-10 w-10 text-blue-600" />
            <p className="text-gray-500 mt-4 font-medium">
              جاري تحميل البيانات...
            </p>
          </div>
        ) : (
          <TeachersTable
            teachers={filteredTeachers as any}
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
        )}
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
