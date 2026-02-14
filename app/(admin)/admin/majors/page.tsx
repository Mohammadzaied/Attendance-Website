"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDepartments } from "@/features/admin";
import { DepartmentsList } from "@/components/admin/specializationTab/departments-list";
import type { Department } from "@/features/specialization";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAdminSidebarItems } from "@/lib/utils/sidebar-items";

export default function MajorsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { departments: reduxDepartments } = useAppSelector(
    (state) => state.admin,
  );

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const departments: Department[] = reduxDepartments.map((d) => ({
    id: d.departmentId.toString(),
    name: d.name,
    headId: d.headOfDepartmentId || undefined,
    headName: d.headOfDepartmentName || undefined,
    majors: [],
  }));

  const handleSelectDepartment = (dept: Department) => {
    router.push(`/admin/majors/${dept.id}`);
  };

  const { setSidebarItems } = useSidebar();
  const sidebarItems = useAdminSidebarItems("majors");

  useEffect(() => {
    setSidebarItems(sidebarItems);
  }, [setSidebarItems]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          أقسام وتخصصات الكلية
        </h1>
      </div>

      <DepartmentsList
        departments={departments}
        onSelectDepartment={handleSelectDepartment}
      />
    </div>
  );
}
