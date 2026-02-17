"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentGraduationDto } from "@/features/student/studentTypes";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GraduationStudentsTableProps {
  students: StudentGraduationDto[];
  isLoading: boolean;
  onEdit?: (student: StudentGraduationDto) => void;
  onDelete?: (student: StudentGraduationDto) => void;
  isReadOnly?: boolean;
  basePath?: string;
}

const getStudyYearLabel = (year: number) => {
  if (year === 1) return "سنة أولى";
  if (year === 2) return "سنة ثانية";
  return `سنة ${year}`;
};

export function GraduationStudentsTable({
  students,
  isLoading,
  onEdit,
  onDelete,
  isReadOnly = false,
  basePath = "/admin",
}: GraduationStudentsTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 font-medium">
        لا يوجد طلاب للعرض
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      {/* Table-like Header using Flex */}
      <div className="hidden md:grid grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)] px-6 py-3 bg-gray-600/40 rounded-t-xl border-x border-t border-gray-100">
        <div className=" text-right font-bold text-gray-900 text-sm ">
          اسم الطالب
        </div>
        <div className=" text-right font-bold text-gray-900 text-sm ">
          اسم المستخدم
        </div>
        <div className=" text-right font-bold text-gray-900 text-sm ">
          التخصص / المستوى
        </div>
        <div className=""></div>
      </div>

      {/* Rows Container */}
      <div className="divide-y divide-gray-300 border rounded-b-xl  bg-white shadow-sm overflow-hidden border-gray-100">
        {students.map((student) => {
          const latestEnrollment = student.enrollments;
          return (
            <Link
              key={student.studentId}
              href={`${basePath}/students/${student.studentId}`}
              target="_blank"
              className="group flex-col items-center md:grid grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)] px-6 py-4 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer relative gap-3 md:gap-0"
            >
              <div className="text-right pt-3 md:pt-0">
                <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-base md:text-sm">
                  {student.fullName}
                </div>
              </div>

              <div className="text-right pt-3 md:pt-0">
                <div className=" text-gray-600 font-mono text-sm bg-gray-50 px-2 py-0.5 rounded inline-block border border-gray-100">
                  {student.username || "—"}
                </div>
              </div>

              <div className="text-right pt-3 md:pt-0">
                {latestEnrollment ? (
                  <div className="text-sm space-y-0.5">
                    <div className="font-bold text-blue-700">
                      {latestEnrollment.specializationName}
                    </div>
                    {latestEnrollment.studyYear !== 0 && (
                      <div className="text-gray-500 font-medium lowercase">
                        {getStudyYearLabel(latestEnrollment.studyYear)} -{" "}
                        {latestEnrollment.semesterName}
                      </div>
                    )}
                  </div>
                ) : (
                  "—"
                )}
              </div>

              {/* Actions */}
              <div className="w-full md:w-32 flex items-center gap-1 justify-end md:justify-end">
                <div
                  className="h-9 w-9 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer rounded-md"
                  title="عرض التفاصيل"
                >
                  <Eye className="h-5 w-5" />
                </div>
                {!isReadOnly && (
                  <>
                    {latestEnrollment.studyYear !== 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-amber-600 hover:text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                        title="تعديل"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onEdit) onEdit(student);
                        }}
                      >
                        <Edit className="h-5 w-5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                      title="حذف"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onDelete) onDelete(student);
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
