"use client";

import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AdminAllSubjectsResponse } from "@/features/student";

interface SubjectTabsListProps {
  adminSubjects: AdminAllSubjectsResponse;
  activeTypeTab: "absences" | "alerts";
}

export function SubjectTabsList({
  adminSubjects,
  activeTypeTab,
}: SubjectTabsListProps) {
  return (
    <TabsList
      className={cn(
        "bg-gray-100/60 p-3 h-auto flex flex-col w-full rounded-2xl gap-4 items-stretch border border-gray-100 transition-all duration-300",
        activeTypeTab === "alerts" &&
          "opacity-0 invisible h-0 overflow-hidden p-0 m-0 border-0",
      )}
    >
      {adminSubjects.specializations.map((spec) => (
        <div
          key={spec.specializationId}
          className="flex flex-col gap-3 p-3 rounded-xl bg-white/60 shadow-sm border border-gray-100/50"
        >
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-[10px] font-black bg-blue-600 text-white border-none px-2 py-0.5"
            >
              {spec.specializationName}
            </Badge>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <div className="flex flex-wrap gap-4">
            {spec.studentAcademicInfos.map((info) => (
              <div
                key={info.studentAcademicInfoId}
                className="flex items-center gap-2 bg-gray-50/50 p-1 rounded-lg border border-gray-100/30"
              >
                <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                  {info.semesterName}
                </span>
                <div className="flex flex-wrap gap-1">
                  {info.subjects.map((subject) => (
                    <TabsTrigger
                      key={subject.subjectId}
                      value={subject.subjectId.toString()}
                      className="rounded-lg h-8 px-3 font-bold text-gray-500 data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-300 cursor-pointer flex items-center gap-2 group whitespace-nowrap border border-transparent text-xs"
                    >
                      {subject.subjectName}
                    </TabsTrigger>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </TabsList>
  );
}
