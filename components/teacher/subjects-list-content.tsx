"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { DetailedSubjectResponse } from "@/features/subject";
import { getActiveademicYears, fetchTeacherSubjects } from "@/features/teacher";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Book } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "teacher" | "department-head";

interface SubjectsListContentProps {
  role: Role;
}

export function SubjectsListContent({ role }: SubjectsListContentProps) {
  const isDH = role === "department-head";
  const dispatch = useAppDispatch();
  const {
    activeAcademicYears: academicYears,
    subjects,
    fetchSubjectsState,
  } = useAppSelector((state) => state.teacher);

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<
    number | null
  >(null);

  // Load academic years on mount
  useEffect(() => {
    dispatch(getActiveademicYears());
  }, [dispatch]);

  // Set initial academic year when years load
  useEffect(() => {
    if (academicYears.length > 0 && selectedAcademicYearId === null) {
      setSelectedAcademicYearId(academicYears[0].academicYearId);
    }
  }, [academicYears, selectedAcademicYearId]);

  // Load subjects when academic year is selected
  useEffect(() => {
    if (selectedAcademicYearId !== null) {
      dispatch(fetchTeacherSubjects(selectedAcademicYearId));
    }
  }, [selectedAcademicYearId, dispatch]);

  const linkPrefix = isDH ? "/department-head/subjects" : "/teacher/subjects";

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="text-right">
        <h1
          className={cn(
            "text-md md:text-3xl font-bold text-gray-900 mb-2",
            isDH && "font-black",
          )}
        >
          المواد الدراسية - السنة الأكاديمية{" "}
          {selectedAcademicYearId && (
            <span className={cn("text-info-foreground")}>
              ({" "}
              {
                academicYears.find(
                  (y) => y.academicYearId === selectedAcademicYearId,
                )?.year
              }{" "}
              -{" "}
              {Number(
                academicYears.find(
                  (y) => y.academicYearId === selectedAcademicYearId,
                )?.year,
              ) + 1}{" "}
              )
            </span>
          )}
        </h1>
        <p
          className={cn(
            "text-sm md:text-base text-gray-600",
            isDH && "font-medium italic",
          )}
        >
          قائمة المواد الدراسية والشعب المسجلة لك
        </p>
      </div>

      {/* Subjects Grid */}
      {fetchSubjectsState.isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <div className="h-16 w-16 border-4 border-info border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium">جاري تحميل المواد...</p>
        </div>
      ) : subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {subjects.map((subject: DetailedSubjectResponse) => (
            <Link
              key={subject.subjectId}
              href={`${linkPrefix}/${subject.subjectId}`}
              className="block group"
            >
              <Card
                className={cn(
                  "h-full cursor-pointer transition-all duration-200 group-hover:shadow-lg border-2 border-gray-100 group-hover:border-info",
                  isDH && "rounded-2xl",
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-info-light text-info group-hover:bg-info group-hover:text-white transition-colors">
                      <Book className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <h3
                        className={cn(
                          "text-base font-bold text-gray-900 group-hover:text-info-foreground transition-colors mb-0.5 truncate",
                          isDH && "font-black",
                        )}
                      >
                        {subject.name} - {subject.specializationName}
                      </h3>
                      <p
                        className={cn(
                          "text-xs text-gray-500",
                          isDH && "font-medium",
                        )}
                      >
                        {subject.numberOfHours} حصص معتمدة
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-warning-light border border-warning rounded-xl p-8 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-warning-light flex items-center justify-center">
              <Book className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p
                className={cn(
                  "text-warning-foreground font-bold text-lg mb-1",
                  isDH && "font-black",
                )}
              >
                لا توجد مواد دراسية
              </p>
              <p
                className={cn("text-warning text-sm", isDH && "font-medium")}
              >
                لا توجد مواد دراسية مسجلة لهذه السنة الأكاديمية
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
