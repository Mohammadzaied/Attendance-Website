"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentGraduationDto } from "@/features/student/studentTypes";
import {
  Eye,
  Edit,
  Trash2,
  UserCircle,
  Hash,
} from "lucide-react";
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
    <div className="w-full space-y-3 md:space-y-1">
      {/* Table-like Header using Flex (Desktop Only) */}
      <div className="hidden md:grid grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)] px-6 py-3 bg-gray-600/40 rounded-t-xl border-x border-t border-gray-100">
        <div className=" text-right font-bold text-gray-900 text-sm ">
          اسم الطالب
        </div>
        <div className=" text-center font-bold text-gray-900 text-sm ">
          اسم المستخدم
        </div>
        <div className=" text-right font-bold text-gray-900 text-sm ">
          التخصص / المستوى
        </div>
        <div className=""></div>
      </div>

      {/* Rows Container */}
      <div className="grid grid-cols-1 gap-4 md:gap-0 md:divide-y md:divide-gray-300 md:border md:rounded-b-xl bg-transparent md:bg-white md:shadow-sm md:overflow-hidden md:border-gray-100">
        {students.map((student) => {
          const latestEnrollment = student.enrollments;
          return (
            <div
              key={student.studentId}
              className="relative group bg-white border border-gray-100 md:border-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none overflow-hidden transition-all duration-200 hover:bg-blue-50/30 md:hover:bg-blue-50/50"
            >
              <Link
                href={`${basePath}/students/${student.studentId}`}
                target="_blank"
                className="flex flex-col md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)] p-5 md:p-0 md:h-16 gap-4 md:gap-0 cursor-pointer"
              >
                {/* Mobile: Name & Header */}
                <div className="flex items-start justify-between md:hidden">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                      <UserCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 leading-tight">
                        {student.fullName}
                      </h4>
                      {/* <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">
                        اسم الطالب
                      </p> */}
                    </div>
                  </div>
                </div>

                {/* Desktop: Name */}
                <div className="hidden md:flex items-center px-6 text-right overflow-hidden">
                  <div
                    className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-sm truncate"
                    title={student.fullName}
                  >
                    {student.fullName}
                  </div>
                </div>

                {/* Username */}
                <div className="flex flex-col md:flex-row md:items-center md:px-6 gap-1 md:gap-0 text-right overflow-hidden">
                  <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Hash className="h-3 w-3" /> اسم المستخدم
                  </span>
                  <div
                    className="text-gray-600 font-mono text-sm bg-gray-50 md:bg-gray-100 px-3 md:px-2 py-1.5 md:py-0.5 rounded-lg md:rounded inline-block border border-gray-100 md:border-transparent w-full md:w-auto text-center md:text-right truncate"
                    title={student.username || undefined}
                    dir="ltr"
                  >
                    {student.username || "—"}
                  </div>
                </div>

                {/* Specialization / Level */}
                <div className="flex flex-col md:flex-row md:items-center md:px-6 gap-1 md:gap-0 text-right">
                  {/* <span className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <GraduationCap className="h-3 w-3" /> التخصص والمستوى
                  </span> */}
                  {latestEnrollment ? (
                    <div className="text-sm space-y-0.5 w-full md:w-auto p-3 md:p-0 bg-blue-50/30 md:bg-transparent rounded-xl md:rounded-none border border-blue-100/30 md:border-none">
                      <div className="font-black text-blue-700 md:font-bold">
                        {latestEnrollment.specializationName}
                      </div>
                      {latestEnrollment.studyYear !== 0 && (
                        <div className="text-gray-500 font-medium text-xs md:text-sm">
                          {getStudyYearLabel(latestEnrollment.studyYear)} -{" "}
                          {latestEnrollment.semesterName}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>

                {/* Desktop Only Space filler */}
                <div className="hidden md:block"></div>
              </Link>

              {/* Actions - Positioned absolutely on mobile, inline on desktop */}
              <div className="flex items-center gap-2 px-5 py-3 md:p-0 border-t border-gray-50 md:border-0 bg-gray-50/50 md:bg-transparent md:absolute md:left-6 md:top-1/2 md:-translate-y-1/2 w-full md:w-auto justify-end">
                <Link
                  href={`${basePath}/students/${student.studentId}`}
                  target="_blank"
                  className="h-9 w-9 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer rounded-xl md:rounded-md bg-white md:bg-transparent border border-gray-200 md:border-0 shadow-sm md:shadow-none"
                  title="عرض التفاصيل"
                >
                  <Eye className="h-5 w-5" />
                </Link>
                {!isReadOnly && (
                  <>
                    {latestEnrollment.studyYear !== 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-amber-600 hover:text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer rounded-xl md:rounded-md bg-white md:bg-transparent border border-gray-200 md:border-0 shadow-sm md:shadow-none"
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
                      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors cursor-pointer rounded-xl md:rounded-md bg-white md:bg-transparent border border-gray-200 md:border-0 shadow-sm md:shadow-none"
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
