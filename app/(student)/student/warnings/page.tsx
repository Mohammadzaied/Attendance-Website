"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchStudentProfile, fetchStudentAlerts } from "@/features/student";
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
import {
  Calendar,
  BookOpen,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
} from "lucide-react";

const getAlertTypeLabel = (type: string | number): string => {
  switch (type) {
    case 1:
      return "إنذار أول";
    case 2:
      return "إنذار ثاني";
    case 3:
      return "حرمان";
    default:
      return `إنذار #${type}`;
  }
};

const getAlertTypeColor = (type: string | number): string => {
  switch (type) {
    case 1:
      return "bg-orange-100 text-orange-700 border-orange-200";
    case 2:
      return "bg-red-100 text-red-700 border-red-200";
    case 3:
      return "bg-red-800 text-white border-red-800";
    default:
      return "bg-amber-100 text-amber-700 border-amber-200";
  }
};

export default function StudentWarningsPage() {
  const dispatch = useAppDispatch();
  const { profile, alerts, fetchAlertsState } = useAppSelector(
    (state) => state.student,
  );

  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

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

  // Fetch alerts when selections change
  useEffect(() => {
    if (profile && selectedAcademicYear && selectedSemester) {
      dispatch(
        fetchStudentAlerts({
          academicYearId: parseInt(selectedAcademicYear),
          semesterId: parseInt(selectedSemester),
          studentId: profile.studentId,
        }),
      );
    }
  }, [profile, selectedAcademicYear, selectedSemester, dispatch]);

  const isLoading = fetchAlertsState.isLoading;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 text-right">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            أهلاً بك، {profile?.fullName.split(" ")[0] || "طالبنا العزيز"} 👋
          </h1>
          <p className="text-gray-500 text-lg">
            {profile
              ? `${profile.specializationName}${!profile.isGraduated ? ` - السنة ${profile.studyYear === 1 ? "الأولى" : "الثانية"}` : " - متخرج"}`
              : "تابع الإنذارات الأكاديمية المسجلة بحقك"}
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
          <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold ring-1 ring-amber-100">
            <ShieldAlert className="h-4 w-4" />
            <span>
              {profile?.semesters.find(
                (s) => s.semesterId.toString() === selectedSemester,
              )?.name ||
                profile?.semesterName ||
                "نظام الإنذارات"}
            </span>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border-r-8 border-r-amber-500">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-right  text-sm font-bold text-gray-700 mr-1 flex items-center justify-start gap-2">
                <span>السنة الأكاديمية</span>
                <Calendar className="h-4 w-4 text-amber-500" />
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
                <SelectTrigger className="w-full h-14 bg-gray-50/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 transition-all text-lg">
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-2xl">
                  {profile?.academicYears?.map((year) => (
                    <SelectItem
                      key={year.academicYearId}
                      value={year.academicYearId.toString()}
                      className="rounded-xl py-3 focus:bg-amber-50 cursor-pointer"
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
                <BookOpen className="h-4 w-4 text-amber-500" />
              </Label>
              <Select
                dir="rtl"
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="w-full h-14 bg-gray-50/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 transition-all text-lg">
                  <SelectValue placeholder="اختر الفصل" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-2xl">
                  {profile?.academicYears
                    ?.filter(
                      (year) =>
                        year.academicYearId.toString() === selectedAcademicYear,
                    )
                    .map((year) => (
                      <SelectGroup key={year.academicYearId}>
                        {profile?.semesters
                          ?.filter(
                            (semester) =>
                              semester.academicYearId === year.academicYearId,
                          )
                          .map((semester) => (
                            <SelectItem
                              key={semester.semesterId}
                              value={semester.semesterId.toString()}
                              className="rounded-xl py-3 focus:bg-amber-50 cursor-pointer pr-8"
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-gray-100 animate-pulse rounded-3xl"
            />
          ))}
        </div>
      ) : alerts && alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((subject) => (
            <Card
              key={subject.subjectId}
              className="border-none shadow-lg rounded-3xl overflow-hidden bg-white hover:shadow-xl transition-shadow border-t-4 border-t-amber-500"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    {subject.subjectName}
                  </h3>
                  <div className="h-10 w-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {subject.teacherName}
                </p>

                <div className="space-y-3">
                  {subject.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-2xl border border-gray-100 space-y-3 bg-gray-50/30"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold border ${getAlertTypeColor(alert.type)}`}
                        >
                          {getAlertTypeLabel(alert.type)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(alert.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-gray-400 text-xs">
                            {" "}
                            عدد الغيابات عند الاصدار
                          </p>
                          <p className="font-bold text-gray-700">
                            {alert.absenceCountAtIssue}
                          </p>
                        </div>
                        {/* <div className="space-y-1">
                          <p className="text-gray-400 text-xs">النسبة</p>
                          <p className="font-bold text-red-600">
                            {alert.percentAtIssue}%
                          </p>
                        </div> */}
                      </div>

                      {alert.isExtended && (
                        <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-700 flex items-center gap-2">
                          <Info className="h-3.5 w-3.5" />
                          <span>
                            تم التمديد بـ {alert.extensionExtraClasses} حصص
                            إضافية. الحد الجديد: {alert.newLimitAfterExtension}
                          </span>
                        </div>
                      )}

                      {alert.adminReviewedAt && (
                        <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 w-fit px-2 py-1 rounded-lg">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>تمت المراجعة من قبل الإدارة</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-3xl py-20 text-center">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-amber-900">سجلك نظيف</h3>
            <p className="text-amber-600/80">
              لا توجد أي إنذارات مسجلة بحقك لهذا الفصل الدراسي. حافظ على حضورك!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
