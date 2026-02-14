"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchStudentProfile, fetchStudentSubjects } from "@/features/student";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, BookOpen, Clock, AlertCircle, User } from "lucide-react";
import { SubjectAbsenceDetailsDialog } from "@/components/student/subject-absence-details-dialog";

export default function StudentAbsencesPage() {
  const dispatch = useAppDispatch();
  const { profile, subjects, fetchProfileState, fetchSubjectsState } =
    useAppSelector((state) => state.student);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<{
    subjectId: number;
    subjectName: string;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  // Set default selections when profile loads
  useEffect(() => {
    if (profile && !selectedAcademicYear && !selectedSemester) {
      setSelectedAcademicYear(profile.academicYearId.toString());
      setSelectedSemester(profile.semesterId.toString());
    }
  }, [profile, selectedAcademicYear, selectedSemester]);

  // Fetch subjects when filters change
  useEffect(() => {
    if (selectedAcademicYear && selectedSemester && profile) {
      dispatch(
        fetchStudentSubjects({
          academicYearId: parseInt(selectedAcademicYear),
          semesterId: parseInt(selectedSemester),
          studentId: profile.studentId,
        }),
      );
    }
  }, [selectedAcademicYear, selectedSemester, profile, dispatch]);

  // Show error state if profile fetch failed
  if (fetchProfileState.error) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl py-20 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Clock className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">لا يوجد غيابات</h3>
            <p className="text-gray-500">
              {fetchProfileState.error || "حدث خطأ أثناء تحميل البيانات"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            أهلاً بك، {profile?.fullName.split(" ")[0] || "طالبنا العزيز"} 👋
          </h1>
          <p className="text-gray-500 text-lg">
            {profile
              ? `${profile.specializationName} - السنة ${profile.studyYear === 1 ? "الأولى" : "الثانية"}`
              : "تابع سجل غياباتك بكل سهولة"}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-start px-4">
            <span className="text-xs text-gray-400 font-medium">
              اسم الطالب
            </span>
            <span className="text-sm font-bold text-gray-700">
              {profile?.fullName || "---"}
            </span>
          </div>
          <div className="h-10 w-px bg-gray-100" />
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold ring-1 ring-blue-100">
            <Clock className="h-4 w-4" />
            <span>
              {profile?.semesters.find(
                (s) => s.semesterId.toString() === selectedSemester,
              )?.name ||
                profile?.semesterName ||
                "الفصل الحالي"}
            </span>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-right  text-sm font-bold text-gray-700 mr-1 flex items-center justify-start gap-2">
                <span>السنة الأكاديمية</span>
                <Calendar className="h-4 w-4 text-blue-500" />
              </Label>
              <Select
                dir="rtl"
                value={selectedAcademicYear}
                onValueChange={(yearId) => {
                  const currentSem = profile?.semesters.find(
                    (s) => s.semesterId.toString() === selectedSemester,
                  );
                  if (currentSem) {
                    const matchingSem = profile?.semesters.find(
                      (s) =>
                        s.academicYearId === Number(yearId) &&
                        s.name === currentSem.name,
                    );
                    if (matchingSem) {
                      setSelectedSemester(matchingSem.semesterId.toString());
                    } else {
                      const fallbackSem = profile?.semesters.find(
                        (s) => s.academicYearId === Number(yearId),
                      );
                      if (fallbackSem) {
                        setSelectedSemester(fallbackSem.semesterId.toString());
                      }
                    }
                  }
                  setSelectedAcademicYear(yearId);
                }}
              >
                <SelectTrigger className="w-full h-14 bg-gray-50/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all text-lg">
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-2xl">
                  {profile?.academicYears?.map((year) => (
                    <SelectItem
                      key={year.academicYearId}
                      value={year.academicYearId.toString()}
                      className="rounded-xl py-3 focus:bg-blue-50 cursor-pointer"
                    >
                      {year.year} - {Number(year.year) + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-right  text-sm font-bold text-gray-700 mr-1 flex items-center justify-start gap-2">
                <span>الفصل الدراسي</span>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </Label>
              <Select
                dir="rtl"
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="w-full h-14 bg-gray-50/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all text-lg">
                  <SelectValue placeholder="اختر الفصل" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-2xl">
                  {profile?.academicYears?.map((year) => (
                    <SelectGroup key={year.academicYearId}>
                      <SelectLabel className="text-right px-4 py-2 text-xs font-black text-blue-500 bg-blue-50/50 mb-1">
                        السنة {year.year} - {Number(year.year) + 1}
                      </SelectLabel>
                      {profile?.semesters
                        ?.filter(
                          (s) => s.academicYearId === year.academicYearId,
                        )
                        .map((semester) => (
                          <SelectItem
                            key={semester.semesterId}
                            value={semester.semesterId.toString()}
                            className="rounded-xl py-3 focus:bg-blue-50 cursor-pointer pr-8"
                          >
                            {semester.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {fetchSubjectsState.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="border-none shadow-sm bg-white rounded-3xl p-6 animate-pulse"
            >
              <div className="h-20 bg-gray-100 rounded-2xl mb-4" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : fetchSubjectsState.error ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl py-20 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Clock className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">لا يوجد غيابات</h3>
            <p className="text-gray-500">
              {fetchSubjectsState.error || "حدث خطأ أثناء تحميل المواد"}
            </p>
          </div>
        </div>
      ) : subjects && subjects.subjects.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subjects.subjects.map((subject) => {
              return (
                <Card
                  key={subject.subjectId}
                  onClick={() =>
                    setSelectedSubject({
                      subjectId: subject.subjectId,
                      subjectName: subject.subjectName,
                    })
                  }
                  className="border-none shadow-sm bg-white rounded-2xl p-5 border-b-4 border-b-blue-500/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-right flex-1 mr-3">
                      <p className="text-xs text-gray-500 mb-0.5">
                        {subject.teacherName}
                      </p>
                      <p className="text-base font-bold text-gray-900">
                        {subject.subjectName}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl py-20 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Clock className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              لا يوجد مواد مسجلة
            </h3>
            <p className="text-gray-500">
              سيظهر سجل غياباتك هنا عند البدء في تسجيل الحضور والغياب للمواد
              المختارة
            </p>
          </div>
        </div>
      )}

      {/* Subject Absence Details Dialog */}
      {selectedSubject && subjects && (
        <SubjectAbsenceDetailsDialog
          open={!!selectedSubject}
          onOpenChange={(open) => !open && setSelectedSubject(null)}
          subjectId={selectedSubject.subjectId}
          subjectName={selectedSubject.subjectName}
          studentAcademicInfoId={subjects.studentAcademicInfoId}
        />
      )}
    </div>
  );
}
