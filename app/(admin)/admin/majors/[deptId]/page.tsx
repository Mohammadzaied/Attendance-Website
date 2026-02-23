"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDepartments } from "@/features/admin";
import { fetchSpecializations } from "@/features/specialization";
import { MajorsList } from "@/components/admin/specializationTab/majors-list";
import type {
  Major,
  Department,
} from "@/features/specialization/specializationTypes";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAdminSidebarItems } from "@/lib/utils/sidebar-items";

export default function DepartmentMajorsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const deptId = params.deptId as string;

  const { departments: reduxDepartments } = useAppSelector(
    (state) => state.admin,
  );
  const { specializations } = useAppSelector((state) => state.specializations);

  const [department, setDepartment] = useState<Department | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);

  const { setSidebarItems } = useSidebar();
  const sidebarItems = useAdminSidebarItems("majors");

  useEffect(() => {
    setSidebarItems(sidebarItems);
  }, [setSidebarItems]);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchSpecializations());
  }, [dispatch]);

  useEffect(() => {
    if (reduxDepartments.length > 0) {
      const dept = reduxDepartments.find(
        (d) => d.departmentId.toString() === deptId,
      );
      if (dept) {
        setDepartment({
          id: dept.departmentId.toString(),
          name: dept.name,
          headId: dept.headOfDepartmentId || undefined,
          headName: dept.headOfDepartmentName || undefined,
          majors: [],
        });
      }
    }
  }, [reduxDepartments, deptId]);

  useEffect(() => {
    if (specializations.length > 0 && deptId) {
      const deptSpecializations = specializations.filter(
        (s) => s.departmentId.toString() === deptId,
      );

      const mappedMajors: Major[] = deptSpecializations.map((s) => ({
        id: s.specializationId.toString(),
        name: s.name,
        departmentId: s.departmentId,
        yearsNumber: s.yearsNumber || 1,
      }));

      setMajors(mappedMajors);
    }
  }, [specializations, deptId]);

  const handleSelectMajor = (major: Major) => {
    router.push(`/admin/majors/${deptId}/${major.id}`);
  };

  const handleBack = () => {
    router.push("/admin/majors");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-1 md:gap-2 text-sm text-gray-500 bg-white p-2 md:p-3 rounded-lg border border-gray-100 shadow-sm min-h-12">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 md:h-8 gap-1 hover:text-blue-600 cursor-pointer px-2 md:px-3"
          onClick={() => router.push("/admin/majors")}
        >
          <Home className="h-4 md:h-5 w-4 md:w-5" />
          <span className="text-sm md:text-lg hidden sm:inline">الرئيسية</span>
        </Button>

        {department && (
          <div className="flex items-center gap-1 md:gap-2">
            <ChevronLeft className="h-3 md:h-4 w-3 md:w-4 shrink-0" />
            <span className="font-medium text-blue-600 px-1 md:px-2 text-sm md:text-lg truncate max-w-[150px] sm:max-w-none">
              {department.name}
            </span>
          </div>
        )}
      </div>

      {/* Majors List */}
      {department && (
        <MajorsList
          departmentId={deptId}
          majors={majors}
          onSelectMajor={handleSelectMajor}
        />
      )}
    </div>
  );
}
