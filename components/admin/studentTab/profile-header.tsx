"use client";

import { User, Mail, BookOpen, Calendar, Book } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentProfileResponse } from "@/features/student";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface StudentProfileHeaderProps {
  profile: StudentProfileResponse;
  selectedYearId: string;
  setSelectedYearId: (id: string) => void;
  selectedSemesterId: string;
  setSelectedSemesterId: (id: string) => void;
}

export function StudentProfileHeader({
  profile,
  selectedYearId,
  setSelectedYearId,
  selectedSemesterId,
  setSelectedSemesterId,
}: StudentProfileHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Student Profile Badge Row */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8 bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-nowrap md:flex-wrap items-center gap-3 md:gap-6 overflow-hidden">
        <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-info-light flex items-center justify-center shrink-0 shadow-inner">
          <User className="h-6 w-6 md:h-8 md:w-8 text-info" />
        </div>
        <div className="flex-1 min-w-0">
          <h2
            className="text-lg md:text-2xl font-black text-gray-900 truncate leading-tight"
            title={profile.fullName}
          >
            {profile.fullName}
          </h2>
          <div className="flex flex-wrap gap-1.5 md:gap-3 mt-1 md:mt-2">
            <Badge
              variant="outline"
              className="gap-1.5 py-1 px-2 md:px-4 border-gray-100 text-gray-500 md:text-gray-600 bg-gray-50/50 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs max-w-[180px] md:max-w-[350px]"
              title={profile.username}
            >
              <Mail className="h-3 w-3 md:h-3.5 md:w-full opacity-60 shrink-0" />
              <span className="truncate" dir="ltr">
                {profile.username}
              </span>
            </Badge>
            <Badge
              variant="outline"
              className="gap-1.5 py-1 px-2 md:px-4 border-gray-100 text-gray-500 md:text-gray-600 bg-gray-50/50 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs max-w-[200px] md:max-w-xs"
              title={`${profile.specializationName} ${profile.isGraduated ? "- متخرج" : profile.studyYear === 1 ? "سنة - أولى" : "سنة - ثانية"}`}
            >
              <BookOpen className="h-3 w-3 md:h-3.5 md:w-3.5 opacity-60 shrink-0" />
              <span className="truncate">
                {profile.specializationName}{" "}
                {profile.isGraduated
                  ? " - متخرج"
                  : profile.studyYear === 1
                    ? "سنة - أولى"
                    : "سنة - ثانية"}
              </span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Top Navigation - Filters */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8 bg-white/50 md:bg-transparent p-3 md:p-0 rounded-2xl md:rounded-none border md:border-transparent border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-initial">
            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm md:hidden">
              <Calendar className="h-4 w-4 text-info" />
            </div>
            <span className="text-xs md:text-sm font-bold text-gray-500 whitespace-nowrap hidden md:inline">
              السنة الأكاديمية:
            </span>
            <Select
              value={selectedYearId}
              onValueChange={(yearId) => {
                // Find current semester name
                const currentSemester = profile.semesters.find(
                  (s) => s.semesterId.toString() === selectedSemesterId,
                );

                if (currentSemester) {
                  // Find matching semester in the new year
                  const matchingSemester = profile.semesters.find(
                    (s) =>
                      s.academicYearId === Number(yearId) &&
                      s.name === currentSemester.name,
                  );

                  if (matchingSemester) {
                    setSelectedSemesterId(
                      matchingSemester.semesterId.toString(),
                    );
                  } else {
                    // If no match, find any semester in the new year to avoid empty selection
                    const anyNewYearSemester = profile.semesters.find(
                      (s) => s.academicYearId === Number(yearId),
                    );
                    if (anyNewYearSemester) {
                      setSelectedSemesterId(
                        anyNewYearSemester.semesterId.toString(),
                      );
                    }
                  }
                }
                setSelectedYearId(yearId);
              }}
              dir="rtl"
            >
              <SelectTrigger className="w-full md:w-[180px] bg-white h-10 md:h-11 rounded-xl border-gray-200">
                <SelectValue placeholder="اختر السنة" />
              </SelectTrigger>
              <SelectContent>
                {profile.academicYears.map((year) => (
                  <SelectItem
                    key={year.academicYearId}
                    value={year.academicYearId.toString()}
                  >
                    {year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-initial">
            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm md:hidden">
              <Book className="h-4 w-4 text-info" />
            </div>
            <span className="text-xs md:text-sm font-bold text-gray-500 whitespace-nowrap hidden md:inline">
              الفصل الدراسي:
            </span>
            <Select
              value={selectedSemesterId}
              onValueChange={setSelectedSemesterId}
              dir="rtl"
            >
              <SelectTrigger className="w-full md:w-[180px] bg-white h-10 md:h-11 rounded-xl border-gray-200">
                <SelectValue placeholder="اختر الفصل" />
              </SelectTrigger>
              <SelectContent>
                {profile.semesters
                  .filter((s) => s.academicYearId === Number(selectedYearId))
                  .map((semester) => (
                    <SelectItem
                      key={semester.semesterId}
                      value={semester.semesterId.toString()}
                    >
                      {semester.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
}
