"use client";

import { useState, useEffect } from "react";
import { BookOpen, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Major } from "@/features/specialization";
import { StudyYear } from "@/features/subject";
import { semesterService, type SemestersResponse } from "@/features/semester";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAcademicYears,
  fetchAcademicStatistics,
} from "@/features/specialization";

interface MajorDetailProps {
  major: Major;
  onSelectYear: (year: StudyYear) => void;
  onUpdateMajor: (major: Major) => void;
}

export function MajorDetail({ major, onSelectYear }: MajorDetailProps) {
  const dispatch = useAppDispatch();
  const { semesterStats, StudentCountSpecialization, yearsNumber } =
    useAppSelector((state) => state.specializations);

  const specializationId = parseInt(major.id);

  const [semesters, setSemesters] = useState<SemestersResponse[]>([]);
  const [selectedAcademicYearFilter, setSelectedAcademicYearFilter] =
    useState<string>("");
  const [selectedSemesterFilter, setSelectedSemesterFilter] =
    useState<string>("");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("1");

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchAcademicYears());
    loadSemesters();
  }, [dispatch, specializationId]);

  const loadSemesters = async () => {
    try {
      const data = await semesterService.getAllSemesters();

      setSemesters(data);
      // .filter((s) => s.status === 1
      // Default to the latest year if nothing is selected
      if (data.length > 0 && selectedAcademicYearFilter === "") {
        const years = data.map((s) => s.year);
        const latestYear = Math.max(...years);
        setSelectedAcademicYearFilter(latestYear.toString());
      }
    } catch (error) {
      console.error("Failed to load semesters:", error);
    }
  };

  // Auto-select active semester when academic year changes
  useEffect(() => {
    if (selectedAcademicYearFilter && semesters.length > 0) {
      const yearSemesters = semesters.filter(
        (s) => s.year.toString() === selectedAcademicYearFilter,
      );

      // Find active semester (Status 1) for the selected year
      const activeSem = yearSemesters.find((s) => Number(s.status) === 1);
      if (activeSem) {
        setSelectedSemesterFilter(activeSem.semesterId.toString());
      } else if (yearSemesters.length > 0) {
        // Fallback to first semester found for that year
        setSelectedSemesterFilter(yearSemesters[0].semesterId.toString());
      }
    }
  }, [selectedAcademicYearFilter, semesters]);

  // Reactive statistics recalculation
  useEffect(() => {
    if (!selectedSemesterFilter) return;

    const selectedSem = semesters.find(
      (s) => s.semesterId.toString() === selectedSemesterFilter,
    );

    if (selectedSem) {
      dispatch(
        fetchAcademicStatistics({
          specializationId: specializationId,
          semesterId: selectedSem.semesterId,
          studyYear: parseInt(selectedLevelFilter),
          academicYearId: selectedSem.academicYearId,
        }),
      );
    }
  }, [
    dispatch,
    semesters,
    specializationId,
    selectedSemesterFilter,
    selectedLevelFilter,
  ]);

  return (
    <div className="space-y-6">
      {/* Major Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4">
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">اسم التخصص</p>
            <p className="text-lg font-bold text-gray-900">{major.name}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">إجمالي الطلاب</p>
            <p className="text-lg font-bold text-gray-900">
              {StudentCountSpecialization} طالب
            </p>
          </div>
        </div>
      </div>

      {/* Study Years Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 text-right">
              السنوات الدراسية
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <div className="min-w-[200px] ">
              <Select
                dir="rtl"
                value={selectedAcademicYearFilter}
                onValueChange={setSelectedAcademicYearFilter}
              >
                <SelectTrigger className="text-right bg-gray-50 border-gray-200 w-full">
                  <SelectValue placeholder="تصفية حسب السنة" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set(semesters.map((s) => s.year)))
                    .sort((a, b) => b - a)
                    .map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        السنة {year}-{year + 1}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className=" min-w-[150px]">
              <Select
                dir="rtl"
                value={selectedLevelFilter}
                onValueChange={setSelectedLevelFilter}
              >
                <SelectTrigger className="text-right bg-gray-50 border-gray-200 w-full">
                  <SelectValue placeholder="تصفية حسب المستوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">سنة أولى</SelectItem>
                  {yearsNumber !== 1 && (
                    <SelectItem value="2">سنة ثانية</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px]">
              <Select
                dir="rtl"
                value={selectedSemesterFilter}
                onValueChange={setSelectedSemesterFilter}
              >
                <SelectTrigger className="text-right bg-gray-50 border-gray-200 w-full">
                  <SelectValue placeholder="تصفية حسب الفصل" />
                </SelectTrigger>
                <SelectContent>
                  {semesters
                    .filter(
                      (s) => s.year.toString() === selectedAcademicYearFilter,
                    )
                    .map((sem) => (
                      <SelectItem
                        key={sem.semesterId}
                        value={sem.semesterId.toString()}
                      >
                        {sem.name} {Number(sem.status) === 2 ? "(منتهي)" : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const selectedSem = semesters.find(
              (s) => s.semesterId.toString() === selectedSemesterFilter,
            );

            const filteredSemesters = selectedSem ? [selectedSem] : [];

            return filteredSemesters.length > 0 ? (
              filteredSemesters.map((sem) => (
                <div
                  key={sem.semesterId}
                  className="group border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all relative overflow-hidden bg-white"
                >
                  <div className="absolute top-0 right-0 h-1 w-full bg-blue-500/10 group-hover:bg-blue-500 transition-colors" />

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        السنة الأكاديمية {sem.year}-{sem.year + 1}
                      </h4>

                      <p className="text-md font-medium text-blue-600">
                        {major.name} : {sem.name} -{" "}
                        {selectedLevelFilter === "1" ? "سنة أولى" : "سنة ثانية"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-right text-gray-500">
                        المواد الدراسية
                      </span>
                      <div className="flex justify-center border border-gray-200 p-2 rounded-lg  w-[21%]">
                        <span className=" font-medium text-gray-900">
                          {semesterStats[sem.semesterId]?.subjectCount || 0}{" "}
                          مواد
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-right text-gray-500">
                        الطلاب المسجلين
                      </span>
                      <div className="flex justify-center  border border-gray-200 p-2 rounded-lg w-[21%]">
                        <span className="text-right font-medium text-gray-900">
                          {semesterStats[sem.semesterId]?.studentCount || 0}{" "}
                          طالب
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full gap-2 border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 cursor-pointer transition-all"
                    onClick={() => {
                      const studyYear: StudyYear = {
                        id: sem.semesterId.toString(),
                        semesterId: sem.semesterId,
                        yearName: `السنة الأكاديمية ${sem.year} - ${sem.name}`,
                        subjects: [],
                        students: [],
                        academicYearId: sem.academicYearId,
                        studyYear: parseInt(selectedLevelFilter),
                      };
                      onSelectYear(studyYear);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    إدارة الفصل
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-400">
                  لا توجد فصول مضافة لهذه السنة حالياً
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
