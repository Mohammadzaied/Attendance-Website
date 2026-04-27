import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { StudentAbsence } from "@/features/specialization/specializationTypes";

interface AbsenceMatrixProps {
  students: StudentAbsence[];
  subjectId: number;
  subjectName: string;
  monthYear: string; // "m/yyyy" e.g. "2/2026"
}

const STATUS_COLORS: Record<string, { dot: string; label: string }> = {
  Absent: { dot: "bg-danger", label: "غياب" },
  Late: { dot: "bg-warning", label: "تأخر" },
  ExcusedAbsence: { dot: "bg-success", label: "معذور" },
};

export function AbsenceMatrix({
  students,
  subjectId,
  subjectName,
  monthYear,
}: AbsenceMatrixProps) {
  const isMobile = useIsMobile();

  // Parse month and year from "m/yyyy"
  const { month, year } = useMemo(() => {
    const [m, y] = monthYear.split("/").map(Number);
    return { month: m, year: y };
  }, [monthYear]);

  // Calculate days in month excluding weekends (Friday=5, Saturday=6)
  const daysInMonth = useMemo(() => {
    const date = new Date(year, month, 0);
    const numDays = date.getDate();
    const result: number[] = [];

    for (let d = 1; d <= numDays; d++) {
      const dayDate = new Date(year, month - 1, d);
      const dayOfWeek = dayDate.getDay(); // 0=Sun, 5=Fri, 6=Sat
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        result.push(d);
      }
    }
    return result;
  }, [month, year]);

  const tableData = useMemo(() => {
    return students.map((s) => {
      const dayMap: Record<number, string[]> = {};
      let monthTotal = 0;

      // Find the specific subject's absences for this student
      const subjectData = s.subjects.find(
        (subj) => subj.subjectId === subjectId,
      );

      subjectData?.absences.forEach((abs) => {
        const dateObj = new Date(abs.date);
        const dayNum = dateObj.getDate();

        if (!dayMap[dayNum]) dayMap[dayNum] = [];
        dayMap[dayNum].push(abs.status);
        monthTotal += 1;
      });

      return {
        studentId: s.studentId,
        studentName: s.studentName,
        dayMap,
        monthTotal,
      };
    });
  }, [students, subjectId]);

  return (
    <div
      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-info flex items-center justify-center text-white shadow-sm">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900">
              تقرير الغياب — {monthYear}
            </h3>
            <p className="text-[10px] text-info font-black uppercase tracking-widest mt-0.5">
              {subjectName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400">
            <div className="w-2 h-2 rounded-full bg-danger" />
            <span>غياب</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span>تأخر</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>معذور</span>
          </div>
        </div>
      </div>

      {/* Scrollable Table - both X and Y */}
      <div
        className="overflow-auto font-black"
        style={{ maxHeight: "60vh", minHeight: "300px" }}
      >
        <table
          className="text-sm border-separate border-spacing-0"
          style={{ minWidth: "1100px", width: "100%" }}
        >
          <thead className="sticky top-0 z-30">
            <tr className="bg-white">
              <th
                className="sticky right-0 z-40 bg-white px-2 py-3 text-right font-black text-gray-900 text-[10px] border-b-2 border-l-2 border-slate-100"
                style={
                  isMobile
                    ? { width: "70px", minWidth: "70px", maxWidth: "70px" }
                    : { minWidth: "150px", maxWidth: "150px" }
                }
              >
                اسم الطالب
              </th>
              {daysInMonth.map((day) => (
                <th
                  key={day}
                  className="px-1 py-4 text-center border-b-2 border-l border-slate-50 text-[10px] font-black text-slate-400 bg-white"
                  style={{ width: "32px" }}
                >
                  {day}
                </th>
              ))}
              {!isMobile && (
                <th
                  className="sticky left-0 z-40 bg-info-light/50 px-3 py-3 text-center font-black text-info border-b-2 border-slate-100"
                  style={{ minWidth: "80px" }}
                >
                  المجموع
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr
                key={row.studentId}
                className={`group transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
              >
                {/* Name */}
                <td
                  className="sticky right-0 z-20 bg-white px-2 py-2 text-right border-l-2 border-b border-slate-50 transition-colors group-hover:bg-info-light/30"
                  style={
                    isMobile
                      ? { width: "70px", minWidth: "70px", maxWidth: "70px" }
                      : { minWidth: "150px", maxWidth: "150px" }
                  }
                >
                  <div
                    className="text-[11px] font-black text-gray-900 truncate"
                    title={row.studentName}
                  >
                    {isMobile
                      ? (() => {
                          const parts = row.studentName.split(" ");
                          return parts.length > 1
                            ? `${parts[0]} ${parts[parts.length - 1]}`
                            : parts[0];
                        })()
                      : row.studentName}
                  </div>
                </td>

                {/* Day cells */}
                {daysInMonth.map((day) => {
                  const statuses = row.dayMap[day] || [];
                  return (
                    <td
                      key={day}
                      className="px-1 py-4 text-center border-l border-b border-slate-50 group-hover:bg-info-light/10"
                    >
                      <div
                        className="flex flex-wrap items-center justify-center gap-0.5"
                        style={{ minHeight: "20px" }}
                      >
                        {statuses.map((status, i) => (
                          <div
                            key={i}
                            title={STATUS_COLORS[status]?.label}
                            className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]?.dot || "bg-gray-400"} ring-1 ring-white`}
                          />
                        ))}
                      </div>
                    </td>
                  );
                })}

                {/* Total */}
                {!isMobile && (
                  <td className="sticky left-0 z-20 px-3 py-3 text-center font-black text-xs bg-white border-b border-slate-100 border-r group-hover:bg-info-light/30">
                    <span
                      className={`px-2 py-1 rounded-md border flex items-center justify-center ${row.monthTotal > 0 ? "bg-info-light text-info border-info/20" : "bg-slate-50 text-slate-400 border-slate-100"}`}
                    >
                      {row.monthTotal}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest shrink-0">
        <span>* النقاط المتعددة = غيابات لمحاضرات مختلفة في نفس اليوم</span>
        <span className="text-info">شهر {monthYear}</span>
      </div>
    </div>
  );
}
