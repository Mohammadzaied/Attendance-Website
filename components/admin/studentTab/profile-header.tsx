"use client";

import { User, Mail, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentProfileResponse } from "@/features/student";

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
  return (
    <>
      {/* Student Profile Badge Row */}
      <div className="max-w-7xl mx-auto mb-8 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-6">
        <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 shadow-inner">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-black text-gray-900 truncate">
            {profile.fullName}
          </h2>
          <div className="flex flex-wrap gap-3 mt-2">
            <Badge
              variant="outline"
              className="gap-2 py-1.5 px-4 border-gray-200 text-gray-600 bg-gray-50/50 rounded-xl font-bold"
            >
              <Mail className="h-3.5 w-3.5 opacity-60" />
              {profile.username}
            </Badge>
            <Badge
              variant="outline"
              className="gap-2 py-1.5 px-4 border-gray-200 text-gray-600 bg-gray-50/50 rounded-xl font-bold"
            >
              <BookOpen className="h-3.5 w-3.5 opacity-60" />
              {profile.specializationName}
              {profile.isGraduated
                ? " - متخرج"
                : profile.studyYear === 1
                  ? "الأولى - السنة"
                  : "الثانية - السنة"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Top Navigation - Filters */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
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
              <SelectTrigger className="w-full md:w-[180px] bg-white">
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

          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
              الفصل الدراسي:
            </span>
            <Select
              value={selectedSemesterId}
              onValueChange={setSelectedSemesterId}
              dir="rtl"
            >
              <SelectTrigger className="w-full md:w-[180px] bg-white">
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
