"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { adminService } from "@/features/admin/adminService";
import { TeacherResponse } from "@/features/admin/adminTypes";
import { Badge } from "@/components/ui/badge";
import { formatName } from "@/lib/utils";

export interface SelectedTeacher {
  userId: string;
  fullName: string;
}

interface MultiTeacherSearchSelectProps {
  selectedTeachers: SelectedTeacher[];
  onTeachersChange: (teachers: SelectedTeacher[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MultiTeacherSearchSelect({
  selectedTeachers,
  onTeachersChange,
  disabled = false,
  placeholder = "اختر المعلمين",
}: MultiTeacherSearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [teachers, setTeachers] = React.useState<TeacherResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const fetchTeachers = React.useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const response = await adminService.getAllTeachers({
        pageNumber: 1,
        pageSize: 10,
        searchTerm: query || null,
      });
      setTeachers(response.teachers);
    } catch (error) {
      console.error("Failed to fetch teachers for select:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  React.useEffect(() => {
    if (open) {
      fetchTeachers("");
    }
  }, [open, fetchTeachers]);

  // Debounced search
  React.useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      fetchTeachers(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, open, fetchTeachers]);

  const toggleTeacher = (teacher: TeacherResponse) => {
    const isSelected = selectedTeachers.some(
      (t) => t.userId === teacher.userId,
    );
    if (isSelected) {
      onTeachersChange(
        selectedTeachers.filter((t) => t.userId !== teacher.userId),
      );
    } else {
      onTeachersChange([
        ...selectedTeachers,
        { userId: teacher.userId, fullName: teacher.fullName },
      ]);
    }
  };

  const removeTeacher = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    onTeachersChange(selectedTeachers.filter((t) => t.userId !== userId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between text-right font-medium min-h-11 h-auto py-2 border-gray-200 transition-all duration-200 rounded-xl bg-gray-50/30 hover:bg-white hover:border-info hover:shadow-sm group",
            open && "border-info ring-4 ring-info-light bg-white",
            selectedTeachers.length > 0 && "border-info-light",
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
            {selectedTeachers.length > 0 ? (
              selectedTeachers.map((t) => (
                <Badge
                  key={t.userId}
                  variant="secondary"
                  className="bg-info-light/50 text-info hover:bg-info-light flex items-center gap-1 pl-1 pr-2 py-0.5"
                >
                  <span className="truncate max-w-[100px]">
                    {formatName(t.fullName)}
                  </span>
                  <div
                    role="button"
                    className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-info/20 cursor-pointer"
                    onClick={(e) => removeTeacher(e, t.userId)}
                  >
                    <X className="h-3 w-3" />
                  </div>
                </Badge>
              ))
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-white shadow-sm border border-gray-100 shrink-0 group-hover:bg-info-light group-hover:border-info-light transition-colors">
                  <User className="h-3.5 w-3.5 text-gray-400 transition-colors" />
                </div>
                <span className="text-gray-400 truncate font-normal">
                  {placeholder}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-1">
            {isLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-info" />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-40 text-gray-500 transition-opacity group-hover:opacity-100" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0 overflow-hidden border-gray-100 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl animate-in fade-in zoom-in duration-200"
        align="start"
        dir="rtl"
      >
        <Command shouldFilter={false} className="bg-transparent">
          <div className="flex items-center border-b border-gray-50 px-4 py-2 bg-gray-50/50">
            <CommandInput
              placeholder="إبحث عن اسم المعلم..."
              className="h-10 border-none focus:ring-0 bg-transparent text-sm font-medium w-full"
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
          </div>
          <CommandList className="max-h-[250px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
            {isLoading && teachers.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 border-4 border-info-light rounded-full animate-pulse" />
                  <Loader2 className="h-6 w-6 animate-spin text-info absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="text-sm font-bold text-info animate-pulse">
                  جاري البحث عن المعلمين...
                </span>
              </div>
            )}
            {!isLoading && teachers.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center gap-2 opacity-50">
                <CommandEmpty className="text-sm font-medium text-gray-500">
                  لم يتم العثور على أي نتائج
                </CommandEmpty>
              </div>
            )}
            <CommandGroup className="p-0">
              {teachers.map((teacher) => {
                const isSelected = selectedTeachers.some(
                  (t) => t.userId === teacher.userId,
                );
                return (
                  <CommandItem
                    key={teacher.userId}
                    value={teacher.fullName}
                    onSelect={() => {
                      toggleTeacher(teacher);
                      setSearchTerm("");
                    }}
                    className="flex items-center justify-between py-2 px-3 mb-1 cursor-pointer rounded-xl aria-selected:bg-info aria-selected:text-white hover:bg-info-light group transition-all duration-150"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-bold text-sm tracking-tight">
                          {formatName(teacher.fullName)}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-white animate-in zoom-in duration-200" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
