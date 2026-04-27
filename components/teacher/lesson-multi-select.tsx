"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LessonOption {
  lessonId: number;
  name: string;
  isActive?: boolean;
}

type LessonMultiSelectProps = {
  lessons: LessonOption[];
  selectedLessonIds: number[];
  onSelectionChange: (lessonIds: number[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  orphanedLessonNames?: string[]; // Non-selectable lessons that have been rescheduled
  hideSelectedNames?: boolean;
};

export function LessonMultiSelect({
  lessons,
  selectedLessonIds,
  onSelectionChange,
  disabled = false,
  placeholder = "اختر الحصص",
  className,
  orphanedLessonNames = [],
  hideSelectedNames = false,
}: LessonMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleLesson = (lessonId: number) => {
    if (selectedLessonIds.includes(lessonId)) {
      onSelectionChange(selectedLessonIds.filter((id) => id !== lessonId));
    } else {
      onSelectionChange([...selectedLessonIds, lessonId]);
    }
  };

  const selectedLessons = lessons.filter((lesson) =>
    selectedLessonIds.includes(lesson.lessonId),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between text-right h-8 bg-white border-gray-200",
            className,
          )}
        >
          <span className="truncate text-sm">
            {selectedLessons.length === 0
              ? placeholder
              : selectedLessons.length === 1
                ? selectedLessons[0].name
                : `${selectedLessons.length} حصة مختارة`}
          </span>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start" dir="rtl">
        <div className="space-y-2">
          {lessons.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-2">
              لا توجد حصص متاحة
            </div>
          ) : (
            lessons.map((lesson) => {
              const isSelected = selectedLessonIds.includes(lesson.lessonId);
              // const isLastSelected =
              //   isSelected && selectedLessonIds.length === 1;
              return (
                <div
                  key={lesson.lessonId}
                  className={cn(
                    "flex items-center space-x-2 space-x-reverse rounded-md p-2",
                    "cursor-pointer hover:bg-gray-50",
                  )}
                  onClick={() => toggleLesson(lesson.lessonId)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleLesson(lesson.lessonId)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4"
                  />
                  <label
                    className={cn(
                      "text-sm font-medium leading-none flex-1 pr-1",
                      "cursor-pointer",
                    )}
                  >
                    {lesson.name}
                  </label>
                </div>
              );
            })
          )}
        </div>
        {orphanedLessonNames.length > 0 && (
          <div className="mt-3 pt-3 border-t border-warning">
            <span className="text-[9px] font-bold text-warning uppercase tracking-wider block mb-2">
              حصص تم تغيير موعدها (للعرض فقط)
            </span>
            <div className="flex flex-wrap gap-1">
              {orphanedLessonNames.map((name, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-warning-light/50 text-warning-foreground border-warning text-[10px] opacity-70"
                >
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {/* {selectedLessons.length > 0 && !hideSelectedNames && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-1">
              {selectedLessons.map((lesson) => (
                <Badge
                  key={lesson.lessonId}
                  variant="secondary"
                  className="text-xs"
                >
                  {lesson.name}
                </Badge>
              ))}
            </div>
          </div>
        )} */}
        <div className="mt-3 pt-2 text-[10px] text-gray-400 text-center border-t border-gray-100 italic">
          يجب اختيار حصة واحدة على الأقل.
        </div>
      </PopoverContent>
    </Popover>
  );
}
