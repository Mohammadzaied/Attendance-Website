"use client";

import { BookOpen } from "lucide-react";
import { StudentAbsenceGroupByDateResponse } from "@/features/teacher/teacherTypes";
import { formatName } from "@/lib/utils";

interface AbsenceSubjectSummaryProps {
  subjectName: string;
  numberOfHours: number;
  teachers: { userId: string; fullName: string }[];
  targetAbsenceDetails: StudentAbsenceGroupByDateResponse | null;
}

export function AbsenceSubjectSummary({
  subjectName,
  numberOfHours,
  teachers,
  targetAbsenceDetails,
}: AbsenceSubjectSummaryProps) {
  if (!targetAbsenceDetails) return null;

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm mb-6 md:mb-8 flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center overflow-hidden">
      <div className="flex items-center gap-3 md:gap-4 flex-1 w-full md:w-auto">
        <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-info-light text-info flex items-center justify-center shrink-0 shadow-inner">
          <BookOpen className="h-5 w-5 md:h-7 md:w-7" />
        </div>
        <div className="text-right min-w-0 flex-1">
          <h4 className="text-base md:text-xl font-black text-gray-900 truncate">
            {subjectName} ({numberOfHours} حصص)
          </h4>
          <span className="text-xs md:text-[14px] font-black text-info/40 uppercase tracking-widest block mb-0.5 truncate max-w-[200px]">
            {teachers.length > 1
              ? teachers
                  ?.map((t) => t.fullName.split(" ").slice(0, 1).join(" "))
                  .join(" , ") || "غير محدد"
              : teachers?.map((t) => formatName(t.fullName)) || "غير محدد"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-3 w-full md:w-auto">
        <div className="bg-info-light/50 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl border border-info-light/50 text-center transition-all hover:bg-info-light group flex flex-col justify-center min-w-0">
          <p className="text-[9px] md:text-[11px] font-bold text-info/70 mb-0.5 md:mb-1 group-hover:text-info transition-colors">
            اجمالي
          </p>
          <p className="text-lg md:text-2xl font-black text-info leading-none">
            {targetAbsenceDetails.adjustedTotalAbsences}
          </p>
        </div>
        <div className="bg-warning-light/50 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl border border-warning-light/50 text-center transition-all hover:bg-warning-light group flex flex-col justify-center min-w-0">
          <p className="text-[9px] md:text-[11px] font-bold text-warning/70 mb-0.5 md:mb-1 group-hover:text-warning transition-colors">
            التأخير
          </p>
          <p className="text-lg md:text-2xl font-black text-warning leading-none">
            {targetAbsenceDetails.absencesByStatus["Late"] || 0}
          </p>
        </div>
        <div className="bg-info-light/50 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl border border-info-light/50 text-center transition-all hover:bg-info-light group flex flex-col justify-center min-w-0">
          <p className="text-[9px] md:text-[11px] font-bold text-info/70 mb-0.5 md:mb-1 group-hover:text-info transition-colors">
            بعذر
          </p>
          <p className="text-lg md:text-2xl font-black text-info leading-none">
            {targetAbsenceDetails.absencesByStatus["ExcusedAbsence"] || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
