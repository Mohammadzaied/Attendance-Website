"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { DetailedSubjectResponse } from "@/features/subject";
import {
  getActiveademicYears,
  fetchTeacherSubjects,
  fetchSubjectStudents,
} from "@/features/teacher";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Book, Users } from "lucide-react";

export default function TeacherSubjectsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    activeAcademicYears: academicYears,
    subjects,
    fetchActiveAcademicYearsState: fetchAcademicYearsState,
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

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="text-right">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          المواد الدراسية
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          اختر السنة الأكاديمية والمادة لعرض قائمة الطلاب وسجلات الغياب
        </p>
      </div>

      {/* Academic Year Selector */}
      <Card className="shadow-sm border-none md:border md:shadow-xs overflow-hidden rounded-xl">
        <CardContent className="p-4 md:p-6">
          <div className="space-y-2">
            <Label className="text-right block text-sm font-bold text-gray-700">
              السنة الأكاديمية
            </Label>
            <Select
              dir="rtl"
              value={selectedAcademicYearId?.toString() || ""}
              onValueChange={(value) =>
                setSelectedAcademicYearId(Number(value))
              }
              disabled={fetchAcademicYearsState.isLoading}
            >
              <SelectTrigger className="w-full h-11 bg-white border-gray-200">
                <SelectValue placeholder="اختر السنة" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem
                    key={year.academicYearId}
                    value={year.academicYearId.toString()}
                  >
                    {year.year} - {Number(year.year) + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      {fetchSubjectsState.isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium">جاري تحميل المواد...</p>
        </div>
      ) : subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {subjects.map((subject: DetailedSubjectResponse) => (
            <Link
              key={subject.subjectId}
              href={`/teacher/subjects/${subject.subjectId}`}
              className="block group"
            >
              <Card className="h-full cursor-pointer transition-all duration-200 group-hover:shadow-lg border-2 border-gray-100 group-hover:border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Book className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-0.5 truncate">
                        {subject.name} - {subject.specializationName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {subject.numberOfHours} ساعات معتمدة
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      الجدول الأسبوعي
                    </p>
                    <div className="space-y-1">
                      {subject.schedule.map((day) => (
                        <div
                          key={day.weekDayId}
                          className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 bg-gray-50/50 rounded-md px-2 py-1"
                        >
                          <span className="font-bold text-gray-700">
                            {day.name}:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {day.lessons.map((lesson, idx) => (
                              <span
                                key={lesson.lessonId}
                                className="bg-white px-1.5 py-0.5 rounded border border-gray-100 text-[11px]"
                              >
                                {lesson.name}
                                {idx < day.lessons.length - 1 && ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Book className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-amber-700 font-bold text-lg mb-1">
                لا توجد مواد دراسية
              </p>
              <p className="text-amber-600 text-sm">
                لا توجد مواد دراسية مسجلة لهذه السنة الأكاديمية
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
