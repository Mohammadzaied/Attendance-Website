import { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSpecializationAbsences,
  fetchSpecializationInfo,
  clearAbsences,
  clearSpecializationInfo,
} from "@/features/specialization/specializationsSlice";
import { useRouter } from "next/navigation";
import { AbsenceMatrix } from "./AbsenceMatrix";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { formatName } from "@/lib/utils";

type StudyYear = 1 | 2;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  specializationId: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SpecializationSummaryTable({
  students,
  subjects,
}: {
  students: {
    studentId: string;
    studentName: string;
    subjectTotals: Record<number, number>;
  }[];
  subjects: any[];
}) {
  const isMobile = useIsMobile();
  return (
    <div
      className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm flex flex-col"
      dir="rtl"
    >
      <div className="overflow-x-auto">
        <table
          className={`w-full text-sm border-collapse ${isMobile ? "min-w-max" : "min-w-[800px]"}`}
        >
          <thead>
            <tr className="bg-slate-50 border-b-2 border-gray-100 text-gray-400 font-black uppercase tracking-widest text-[10px]">
              <th
                className={`${isMobile ? "pr-3 pl-1 min-w-20" : "pr-6 pl-4 min-w-[100px]"} py-4 text-right sticky right-0 bg-slate-50 z-10`}
              >
                اسم الطالب
              </th>
              {subjects.map((subject) => (
                <th
                  key={subject.subjectId}
                  className={`${isMobile ? "px-2 min-w-[70px]" : "px-4 min-w-[100px]"} py-4 text-center`}
                >
                  {subject.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              return (
                <tr
                  key={student.studentId}
                  className={`border-b-2 border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors bg-white`}
                >
                  <td
                    className={`${isMobile ? "pr-3 pl-1" : "pr-6 pl-4"} py-4 text-right font-black text-gray-900 sticky right-0 bg-inherit z-10 border-l-2 border-gray-50`}
                  >
                    <span className="text-[11px] font-black whitespace-nowrap">
                      {isMobile
                        ? (() => {
                            const parts = student.studentName.split(" ");
                            return parts.length > 1
                              ? `${parts[0]} ${parts[parts.length - 1]}`
                              : parts[0];
                          })()
                        : student.studentName}
                    </span>
                  </td>
                  {subjects.map((subject) => {
                    const count = student.subjectTotals[subject.subjectId] || 0;
                    return (
                      <td
                        key={subject.subjectId}
                        className={`${isMobile ? "px-2" : "px-4"} py-4 text-center text-gray-600 font-medium`}
                      >
                        {count > 0 ? (
                          <span className="text-red-600 font-black">
                            {count}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SpecializationDetailPage({ specializationId }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux state
  const specializationInfo = useAppSelector(
    (state) => state.specializations.specializationInfo,
  );
  const specializationAbsences = useAppSelector(
    (state) => state.specializations.specializationAbsences,
  );
  const { isLoading: isInfoLoading } = useAppSelector(
    (state) => state.specializations.fetchSpecializationInfoState,
  );
  const { isLoading: isAbsencesLoading } = useAppSelector(
    (state) => state.specializations.fetchSpecializationAbsencesState,
  );

  const [activeYear, setActiveYear] = useState<StudyYear>(1);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");

  // Clear state on entry
  useEffect(() => {
    dispatch(clearAbsences());
    dispatch(clearSpecializationInfo());
  }, [dispatch]);

  // Fetch specialization info when id or year changes
  useEffect(() => {
    if (specializationId) {
      dispatch(
        fetchSpecializationInfo({
          id: specializationId,
          studyYear: activeYear,
        }),
      );
    }
  }, [dispatch, specializationId, activeYear]);

  useEffect(() => {
    dispatch(
      fetchSpecializationAbsences({
        id: specializationId,
        studyYear: activeYear,
        subjectId:
          selectedSubjectId === "all" ? undefined : Number(selectedSubjectId),
      }),
    );
  }, [dispatch, specializationId, activeYear, selectedSubjectId]);

  // Set default month when absences are loaded
  useEffect(() => {
    if (specializationAbsences.length > 0 && !selectedMonth) {
      setSelectedMonth(specializationAbsences[0].monthYear);
    }
  }, [specializationAbsences, selectedMonth]);

  const subjects = useMemo(() => {
    return specializationInfo?.subjects || [];
  }, [specializationInfo]);

  const selectedMonthData = useMemo(() => {
    return specializationAbsences.find((m) => m.monthYear === selectedMonth);
  }, [specializationAbsences, selectedMonth]);

  const studentsAbsences = useMemo(() => {
    return selectedMonthData?.students || [];
  }, [selectedMonthData]);

  // Aggregate all absences for the "Grand Summary" view
  const summaryData = useMemo(() => {
    if (selectedSubjectId !== "all") return [];

    // Aggregate by student
    const studentMap: Record<
      string,
      {
        studentId: string;
        studentName: string;
        subjectTotals: Record<number, number>;
        grandTotal: number;
      }
    > = {};

    specializationAbsences.forEach((monthData) => {
      monthData.students.forEach((student) => {
        if (!studentMap[student.studentId]) {
          studentMap[student.studentId] = {
            studentId: student.studentId,
            studentName: student.studentName,
            subjectTotals: {},
            grandTotal: 0,
          };
        }

        student.subjects.forEach((subj) => {
          // Rule: Absent = 1, Late = 1/3, ExcusedAbsence = 0
          const absents = subj.absences.filter(
            (a) => a.status === "Absent",
          ).length;
          const lates = subj.absences.filter((a) => a.status === "Late").length;

          const weightedCount = absents + Math.floor(lates / 3);

          if (weightedCount > 0) {
            studentMap[student.studentId].subjectTotals[subj.subjectId] =
              (studentMap[student.studentId].subjectTotals[subj.subjectId] ||
                0) + weightedCount;
            studentMap[student.studentId].grandTotal += weightedCount;
          }
        });
      });
    });

    // Filter: Show only students who have at least one weighted absence
    return Object.values(studentMap).filter((s) => s.grandTotal > 0);
  }, [specializationAbsences, selectedSubjectId]);

  const selectedSubjectName = useMemo(() => {
    if (selectedSubjectId === "all") return "جميع المواد";
    return (
      subjects.find((s) => String(s.subjectId) === selectedSubjectId)?.name ??
      ""
    );
  }, [selectedSubjectId, subjects]);

  const handleYearChange = (val: string) => {
    setActiveYear(Number(val) as StudyYear);
    setSelectedSubjectId("all");
    setSelectedMonth("");
  };

  if (isInfoLoading && !specializationInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <div className="text-blue-600 font-black">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!specializationInfo) return null;

  const spec = specializationInfo;

  return (
    <div className="min-h-screen bg-slate-50/30" dir="rtl">
      {/* Compact Blue Header */}
      <div className="bg-blue-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 text-white relative overflow-hidden shadow-lg shadow-blue-200/40">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-28 -mt-28 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest text-center">
                {spec.departmentName}
              </span>
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <span className="text-blue-100 text-[9px] font-black uppercase tracking-widest">
                رئيس القسم
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              {spec.name}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="bg-blue-700/50 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-black shrink-0">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>{spec.studentCount} طالب</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar - Year + Subject + Month */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-gray-100 p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end">
          {/* Year */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">
              السنة الدراسية
            </label>
            <Select
              dir="rtl"
              value={String(activeYear)}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-full bg-slate-50 border-2 border-slate-100 h-10 rounded-xl text-sm font-black text-gray-900 px-3 focus:ring-blue-600 focus:ring-1">
                <SelectValue placeholder="اختر السنة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">السنة الأولى</SelectItem>
                {spec.yearsNumber === 2 && (
                  <SelectItem value="2">السنة الثانية</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">
              المادة الدراسية
            </label>
            <Select
              dir="rtl"
              value={selectedSubjectId}
              onValueChange={(val) => {
                setSelectedSubjectId(val);
                if (val === "all") setSelectedMonth("");
              }}
            >
              <SelectTrigger className="w-full bg-slate-50 border-2 border-slate-100 h-10 rounded-xl text-sm font-black text-gray-900 px-3 focus:ring-blue-600 focus:ring-1">
                <SelectValue placeholder="اختر المادة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📦 ملخص جميع المواد</SelectItem>
                {subjects.map((sub) => {
                  const formattedTeacherName =
                    sub.teachers.length > 1
                      ? sub.teachers
                          ?.map((t) =>
                            t.fullName.split(" ").slice(0, 1).join(" "),
                          )
                          .join(" , ") || "غير محدد"
                      : sub.teachers?.map((t) => formatName(t.fullName)) ||
                        "غير محدد";

                  return (
                    <SelectItem
                      key={sub.subjectId}
                      value={String(sub.subjectId)}
                    >
                      {sub.name} — {formattedTeacherName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Month */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">
              شهر التقرير
            </label>
            <Select
              dir="rtl"
              value={selectedMonth}
              onValueChange={setSelectedMonth}
              disabled={
                selectedSubjectId === "all" ||
                specializationAbsences.length === 0
              }
            >
              <SelectTrigger
                className={`w-full border-2 h-10 rounded-xl text-sm font-black px-3 transition-all ${
                  selectedSubjectId === "all" ||
                  specializationAbsences.length === 0
                    ? "bg-gray-50 border-gray-100 text-gray-300"
                    : "bg-blue-50 border-blue-100 text-blue-700 focus:ring-blue-600 focus:ring-1"
                }`}
              >
                <SelectValue placeholder="اختر الشهر" />
              </SelectTrigger>
              <SelectContent>
                {specializationAbsences.map((m) => (
                  <SelectItem key={m.monthYear} value={m.monthYear}>
                    {m.monthYear}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {specializationAbsences.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 py-32 text-center">
          <p className="text-gray-400 font-black text-lg">
            لا يوجد بيانات مسجلة لهذه السنة
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
          {/* Table Loading Overlay */}
          {(isAbsencesLoading || isInfoLoading) && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-3xl transition-all duration-300">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  جاري تحديث البيانات...
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                {selectedSubjectId === "all"
                  ? "الملخص العام للطلاب - كامل السنة"
                  : "كشف الحضور والغياب التفصيلي"}
              </h2>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg">
              {subjects.length} مواد دراسية
            </div>
          </div>

          {selectedSubjectId === "all" ? (
            <SpecializationSummaryTable
              students={summaryData}
              subjects={subjects}
            />
          ) : (
            <AbsenceMatrix
              students={studentsAbsences}
              subjectId={Number(selectedSubjectId)}
              subjectName={selectedSubjectName}
              monthYear={selectedMonth}
            />
          )}
        </div>
      )}
    </div>
  );
}
