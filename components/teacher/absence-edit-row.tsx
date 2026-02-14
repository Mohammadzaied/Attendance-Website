"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";
import { LessonMultiSelect, type LessonOption } from "./lesson-multi-select";
import { AbsenceType, AttendanceStatus } from "./types";
import { cn } from "@/lib/utils";
import { Trash2, User, BookOpen, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type AbsenceEditRowProps = {
  studentAcademicInfoId: number;
  studentName: string;
  selectedLessonIds: number[];
  availableLessons: LessonOption[];
  orphanedLessonNames?: string[]; // Lessons that no longer exist in availableLessons
  absenceType: AbsenceType;
  reason: string;
  isDeleting?: boolean;
  onTypeChange: (type: AbsenceType) => void;
  onReasonChange: (reason: string) => void;
  onLessonIdsChange: (lessonIds: number[]) => void;
  onDelete?: () => void;
};

export function AbsenceEditRow({
  studentName,
  selectedLessonIds,
  availableLessons,
  orphanedLessonNames = [],
  absenceType,
  reason,
  isDeleting,
  onTypeChange,
  onReasonChange,
  onLessonIdsChange,
  onDelete,
}: AbsenceEditRowProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <TableRow
        dir="rtl"
        className="flex flex-col mb-4 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:bg-gray-50/50"
      >
        {/* Student Name */}
        <TableCell className="block p-4 text-right">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              اسم الطالب
            </span>
            <span className="font-extrabold text-slate-900">{studentName}</span>
          </div>
        </TableCell>

        {/* Lessons Selection */}
        <TableCell className="block px-4 py-3 border-t border-gray-50">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                اختر الحصص
              </span>
            </div>
            <LessonMultiSelect
              lessons={availableLessons}
              selectedLessonIds={selectedLessonIds}
              onSelectionChange={onLessonIdsChange}
              disabled={false}
              placeholder="اختر الحصص"
              className="h-9"
              orphanedLessonNames={orphanedLessonNames}
            />
          </div>
        </TableCell>

        {/* Absence Type */}
        <TableCell className="block px-4 py-3 border-t border-gray-50">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                الحالة
              </span>
            </div>
            <Select
              dir="rtl"
              value={absenceType}
              onValueChange={(value: AbsenceType) => onTypeChange(value)}
            >
              <SelectTrigger className="w-full h-9 bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="absence">غياب</SelectItem>
                <SelectItem value="late">تأخير</SelectItem>
                <SelectItem value="excused">غياب بعذر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TableCell>

        {/* Reason TextArea */}
        {absenceType === "excused" && (
          <TableCell className="block px-4 py-4 border-t border-gray-50">
            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  الملاحظات
                </span>
              </div>
              <Textarea
                placeholder="أدخل سبب الغياب..."
                value={reason || ""}
                onChange={(e) => onReasonChange(e.target.value)}
                className="text-right text-xs min-h-20 py-2 bg-white border-gray-200 resize-none"
              />
            </div>
          </TableCell>
        )}

        {/* Actions */}
        <TableCell className="block p-4 border-t border-gray-50 bg-gray-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              حذف السجل
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              disabled={isDeleting || selectedLessonIds.length === 0}
              className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              {isDeleting ? (
                <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // Desktop Design
  return (
    <TableRow className="h-12 transition-colors border-b border-gray-50 hover:bg-gray-100/50 group">
      <TableCell className="p-3 align-middle font-bold text-gray-900 text-right">
        {studentName}
      </TableCell>

      <TableCell className="p-3 align-middle text-right w-1/4">
        <LessonMultiSelect
          lessons={availableLessons}
          selectedLessonIds={selectedLessonIds}
          onSelectionChange={onLessonIdsChange}
          disabled={false}
          placeholder="اختر الحصص"
          className="h-8"
          orphanedLessonNames={orphanedLessonNames}
        />
      </TableCell>

      <TableCell className="p-3 align-middle ">
        <Select
          dir="rtl"
          value={absenceType}
          onValueChange={(value: AbsenceType) => onTypeChange(value)}
        >
          <SelectTrigger className="w-32 h-8 bg-white border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="absence">غياب</SelectItem>
            <SelectItem value="late">تأخير</SelectItem>
            <SelectItem value="excused">غياب بعذر</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell className="p-3 align-middle md:max-w-[250px] whitespace-normal">
        {absenceType === "excused" && (
          <Textarea
            placeholder="أدخل سبب الغياب..."
            value={reason || ""}
            onChange={(e) => onReasonChange(e.target.value)}
            className="text-right text-xs min-h-10 py-1.5 bg-white border-gray-200 focus:min-h-[60px] transition-all resize-none"
          />
        )}
      </TableCell>

      <TableCell className="p-3 align-middle text-center w-12">
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={isDeleting || selectedLessonIds.length === 0}
          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isDeleting ? (
            <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
}
