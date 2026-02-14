"use client";

import { BookOpen } from "lucide-react";
import { StudentAbsenceGroupByDateResponse } from "@/features/teacher/teacherTypes";

interface AbsenceSubjectSummaryProps {
  subjectName: string;
  numberOfHours: number;
  teacherName: string;
  targetAbsenceDetails: StudentAbsenceGroupByDateResponse | null;
}

export function AbsenceSubjectSummary({
  subjectName,
  numberOfHours,
  teacherName,
  targetAbsenceDetails,
}: AbsenceSubjectSummaryProps) {
  if (!targetAbsenceDetails) return null;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-6 items-center">
      <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
        <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
          <BookOpen className="h-7 w-7" />
        </div>
        <div className="text-right">
          <h4 className="text-xl font-black text-gray-900">
            {subjectName} ({numberOfHours} ساعات)
          </h4>
          <span className="text-[14px] font-black text-blue-600/40 uppercase tracking-widest block mb-0.5">
            {teacherName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex-1 md:w-28 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100/50 text-center transition-all hover:bg-blue-50 group">
          <p className="text-[11px] font-bold text-blue-600/70 mb-1 group-hover:text-blue-600 transition-colors">
            اجمالي
          </p>
          <p className="text-2xl font-black text-blue-600 leading-none">
            {targetAbsenceDetails.adjustedTotalAbsences}
          </p>
        </div>
        <div className="flex-1 md:w-28 bg-amber-50/50 p-3.5 rounded-2xl border border-blue-100/50 text-center transition-all hover:bg-amber-50 group">
          <p className="text-[11px] font-bold text-blue-600/70 mb-1 group-hover:text-blue-600 transition-colors">
            التأخير
          </p>
          <p className="text-2xl font-black text-blue-600 leading-none">
            {targetAbsenceDetails.absencesByStatus["Late"] || 0}
          </p>
        </div>
        <div className="flex-1 md:w-28 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100/50 text-center transition-all hover:bg-blue-50 group">
          <p className="text-[11px] font-bold text-blue-600/70 mb-1 group-hover:text-blue-600 transition-colors">
            بعذر
          </p>
          <p className="text-2xl font-black text-blue-600 leading-none">
            {targetAbsenceDetails.absencesByStatus["ExcusedAbsence"] || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
