"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type AbsenceType } from "./types";
import { TableCell, TableRow } from "@/components/ui/table";
import { LessonMultiSelect, type LessonOption } from "./lesson-multi-select";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Student } from "@/features/student";
import { useEffect, useState } from "react";

type AbsenceTableRowProps = {
  student: Student;
  isSelected: boolean;
  selectedLessonIds: number[];
  availableLessons: LessonOption[];
  absenceType?: AbsenceType;
  reason?: string;
  onToggle: () => void;
  onTypeChange: (type: AbsenceType) => void;
  onReasonChange: (reason: string) => void;
  onLessonIdsChange: (lessonIds: number[]) => void;
  isMobile?: boolean;
};

export function AbsenceTableRow({
  student,
  isSelected,
  selectedLessonIds,
  availableLessons,
  absenceType,
  reason,
  onToggle,
  onTypeChange,
  onReasonChange,
  onLessonIdsChange,
  isMobile: isMobileProp,
}: AbsenceTableRowProps) {
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileHook;
  const [showDetails, setShowDetails] = useState(false);

  // Reset showDetails when student is unselected
  useEffect(() => {
    if (!isSelected) {
      setShowDetails(false);
    }
  }, [isSelected]);

  if (isMobile) {
    return (
      <div
        className={cn(
          "p-4 rounded-xl border transition-all mb-3 cursor-pointer",
          isSelected
            ? "border-blue-200 bg-blue-50/30"
            : "border-gray-100 bg-white",
        )}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggle}
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5"
            />
            <span className="font-bold text-sm text-gray-900">
              {student.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 text-blue-600 font-bold hover:bg-blue-100/50 transition-all",
              isSelected && !showDetails
                ? "opacity-100 visible"
                : "opacity-0 invisible pointer-events-none",
            )}
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
          >
            تفاصيل
          </Button>
        </div>

        <div
          onClick={(e) => isSelected && e.stopPropagation()}
          className="w-full"
        >
          <LessonMultiSelect
            lessons={availableLessons}
            selectedLessonIds={selectedLessonIds}
            onSelectionChange={onLessonIdsChange}
            disabled={!isSelected}
            placeholder="اختر الحصص"
            hideSelectedNames={isMobile}
          />
        </div>

        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out overflow-hidden",
            isSelected && showDetails
              ? "grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-blue-100/50"
              : "grid-rows-[0fr] opacity-0 mt-0 pt-0",
          )}
        >
          <div className="min-h-0">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs px-2 font-semibold text-gray-500 block text-right">
                  النوع
                </span>
                <Select
                  value={absenceType || "absence"}
                  onValueChange={(value: AbsenceType) => onTypeChange(value)}
                  dir="rtl"
                >
                  <SelectTrigger className="w-full h-8! bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absence">غياب</SelectItem>
                    <SelectItem value="late">تأخير</SelectItem>
                    <SelectItem value="excused">غياب بعذر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                className={cn(
                  "space-y-1.5 text-right transition-all duration-300",
                  absenceType === "excused"
                    ? "opacity-100 visible h-auto mt-0"
                    : "opacity-0 invisible h-0 -mt-1",
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs font-semibold text-gray-500 block">
                  سبب الغياب
                </span>
                <Textarea
                  placeholder="أدخل سبب الغياب..."
                  value={reason || ""}
                  onChange={(e) => onReasonChange(e.target.value)}
                  className="text-right text-sm min-h-20 bg-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TableRow
      key={student.id}
      className={cn(
        "h-10 cursor-pointer transition-colors border-b border-gray-50 ",
        isSelected
          ? "bg-blue-50/40 hover:bg-blue-50/60"
          : "hover:bg-gray-50/80",
      )}
      onClick={onToggle}
    >
      <TableCell className="align-middle p-2! ">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      <TableCell className="p-2 align-middle font-bold text-gray-900 text-right">
        {student.name}
      </TableCell>
      <TableCell className="p-2 align-middle text-right">
        <div
          onClick={(e) => isSelected && e.stopPropagation()}
          className="w-full max-w-[200px]"
        >
          <LessonMultiSelect
            lessons={availableLessons}
            selectedLessonIds={selectedLessonIds}
            onSelectionChange={onLessonIdsChange}
            disabled={!isSelected}
            placeholder="اختر الحصص"
            className="h-8"
          />
        </div>
      </TableCell>
      <TableCell className="p-2 align-middle">
        <div
          onClick={(e) => isSelected && e.stopPropagation()}
          className={cn(
            "transition-all duration-200",
            isSelected
              ? "opacity-100 visible translate-x-0"
              : "opacity-0 invisible translate-x-2",
          )}
        >
          <Select
            dir="rtl"
            value={absenceType || "absence"}
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
        </div>
      </TableCell>
      <TableCell className="p-2 align-middle min-w-[150px] md:max-w-[200px] whitespace-normal">
        <div
          onClick={(e) => isSelected && e.stopPropagation()}
          className={cn(
            "transition-all duration-300",
            isSelected && absenceType === "excused"
              ? "opacity-100 visible scale-100"
              : "opacity-0 invisible scale-95 pointer-events-none",
          )}
        >
          <Textarea
            placeholder="أدخل سبب الغياب..."
            value={reason || ""}
            onChange={(e) => onReasonChange(e.target.value)}
            className="text-right text-xs min-h-10 py-1.5 bg-white border-gray-200 resize-none"
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
