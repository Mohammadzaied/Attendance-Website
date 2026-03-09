"use client";

import { AbsenceDay, MStudentAbsence } from "@/features/specialization";
import { useState } from "react";

const STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  Absent: { label: "غياب", color: "#dc2626", bg: "#fef2f2", dot: "#ef4444" },
  Late: { label: "تأخر", color: "#d97706", bg: "#fffbeb", dot: "#f59e0b" },
  ExcusedAbsence: {
    label: "غياب معذور",
    color: "#059669",
    bg: "#f0fdf4",
    dot: "#10b981",
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? {
    label: status,
    color: "#4b5563",
    bg: "#f3f4f6",
    dot: "#9ca3af",
  };
  return (
    <span
      style={{ color: s.color, background: s.bg }}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
    >
      <span
        style={{ background: s.dot }}
        className="w-1.5 h-1.5 rounded-full shrink-0"
      />
      {s.label}
    </span>
  );
}

function DateRow({ day, rowIndex }: { day: AbsenceDay; rowIndex: number }) {
  const [expanded, setExpanded] = useState(false);

  const dominantStatus = day.lessons[0]?.status ?? "Absent";
  const s = STATUS_MAP[dominantStatus] ?? STATUS_MAP["Absent"];

  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        style={{
          background: rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        className="hover:bg-indigo-50/60 border-b border-gray-100"
      >
        {/* Date */}
        <td className="px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
          {day.date}
        </td>
        {/* Day of week */}
        <td className="px-4 py-3 text-sm text-gray-500">{day.dayOfWeek}</td>
        {/* Lessons count */}
        <td className="px-4 py-3 text-center">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {day.lessons.length} محاضرة
          </span>
        </td>
        {/* Status */}
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {Array.from(new Set(day.lessons.map((l) => l.status))).map((st) => (
              <StatusBadge key={st} status={st} />
            ))}
          </div>
        </td>
        {/* Expand arrow */}
        <td className="px-4 py-3 text-center">
          <svg
            className={`h-4 w-4 text-gray-400 mx-auto transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </td>
      </tr>

      {/* Expanded lessons */}
      {expanded && (
        <tr style={{ background: "#f0f4ff" }}>
          <td colSpan={5} className="px-6 py-3">
            <div className="flex flex-wrap gap-2">
              {day.lessons.map((lesson) => {
                const ls = STATUS_MAP[lesson.status] ?? STATUS_MAP["Absent"];
                return (
                  <div
                    key={lesson.lessonId}
                    style={{ borderColor: `${ls.dot}40`, background: ls.bg }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs"
                  >
                    <span
                      style={{ color: ls.dot }}
                      className="w-2 h-2 rounded-full shrink-0 bg-current"
                    />
                    <span className="text-gray-700 font-medium">
                      {lesson.lessonName}
                    </span>
                    <span style={{ color: ls.color }} className="font-semibold">
                      {ls.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

interface AbsenceDayTableProps {
  studentAbsence: MStudentAbsence;
}

export function AbsenceDayTable({ studentAbsence }: AbsenceDayTableProps) {
  if (studentAbsence.absencesByDate.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <svg
          className="h-10 w-10 mb-2 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm font-medium">لا توجد غيابات مسجّلة</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" dir="rtl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              التاريخ
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              اليوم
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
              عدد المحاضرات
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              الحالة
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
              تفاصيل
            </th>
          </tr>
        </thead>
        <tbody>
          {studentAbsence.absencesByDate.map((day, i) => (
            <DateRow key={day.date} day={day} rowIndex={i} />
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td
              colSpan={5}
              className="px-4 py-2 text-xs text-gray-500 font-medium text-right"
            >
              الإجمالي:{" "}
              <span className="font-bold text-red-600">
                {studentAbsence.totalAbsences} غياب
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
