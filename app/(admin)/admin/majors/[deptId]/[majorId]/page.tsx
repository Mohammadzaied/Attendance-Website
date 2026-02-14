"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDepartments } from "@/features/admin";
import {
  fetchSpecializations,
  specializationService,
} from "@/features/specialization";
import { semesterService } from "@/features/semester";
import { MajorDetail } from "@/components/admin/specializationTab/major-detail";
import type {
  Major,
  Department,
} from "@/features/specialization/specializationTypes";
import type { StudyYear } from "@/features/subject/subjectTypes";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAdminSidebarItems } from "@/lib/utils/sidebar-items";

export default function MajorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const deptId = params.deptId as string;
  const majorId = params.majorId as string;

  const { departments: reduxDepartments } = useAppSelector(
    (state) => state.admin,
  );
  const { specializations } = useAppSelector((state) => state.specializations);

  const [department, setDepartment] = useState<Department | null>(null);
  const [major, setMajor] = useState<Major | null>(null);

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
    const loadMajorData = async () => {
      if (specializations.length > 0 && majorId) {
        const specData = specializations.find(
          (s) => s.specializationId.toString() === majorId,
        );

        if (specData) {
          try {
            const semesters = await semesterService.getAllSemesters();

            const years: StudyYear[] = semesters.map((sem) => ({
              id: sem.semesterId.toString(),
              semesterId: sem.semesterId,
              yearName: sem.name,
              subjects: [],
              students: [],
              academicYearId: sem.academicYearId,
              studyYear: 1,
            }));

            setMajor({
              id: specData.specializationId.toString(),
              name: specData.name,
              departmentId: specData.departmentId,
              yearsCount: years.length,
              studentCount: 0,

              years: years,
            });
          } catch (error) {
            console.error("Failed to load semesters:", error);
          }
        }
      }
    };

    loadMajorData();
  }, [specializations, majorId]);

  const handleSelectYear = (year: StudyYear) => {
    router.push(
      `/admin/majors/${deptId}/${majorId}/${year.id}?studyYear=${year.studyYear}`,
    );
  };

  const handleUpdateMajor = (updatedMajor: Major) => {
    setMajor(updatedMajor);
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
            <Button
              variant="ghost"
              size="sm"
              className="h-7 md:h-8 gap-1 hover:text-blue-600 cursor-pointer px-2 md:px-3 max-w-[120px] sm:max-w-none"
              onClick={() => router.push(`/admin/majors/${deptId}`)}
            >
              <span className="text-sm md:text-lg truncate">
                {department.name}
              </span>
            </Button>
          </div>
        )}

        {major && (
          <div className="flex items-center gap-1 md:gap-2">
            <ChevronLeft className="h-3 md:h-4 w-3 md:w-4 shrink-0" />
            <span className="font-medium text-blue-600 px-1 md:px-2 text-sm md:text-lg truncate max-w-[150px] sm:max-w-none">
              {major.name}
            </span>
          </div>
        )}
      </div>

      {/* Major Detail */}
      {major && (
        <MajorDetail
          major={major}
          onSelectYear={handleSelectYear}
          onUpdateMajor={handleUpdateMajor}
        />
      )}
    </div>
  );
}
