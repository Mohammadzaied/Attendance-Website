"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, User, Search } from "lucide-react";
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

interface TeacherSearchSelectProps {
  value: string;
  onValueChange: (value: string, name: string) => void;
  disabled?: boolean;
  placeholder?: string;
  initialName?: string;
}

export function TeacherSearchSelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = "اختر المعلم",
  initialName,
}: TeacherSearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [teachers, setTeachers] = React.useState<TeacherResponse[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const selectedTeacher = React.useMemo(() => {
    const found = teachers.find((t) => t.userId === value);
    if (found) return found;
    if (value && initialName) {
      return { userId: value, fullName: initialName } as TeacherResponse;
    }
    return null;
  }, [teachers, value, initialName]);

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between text-right font-medium h-11 border-gray-200 transition-all duration-200 rounded-xl bg-gray-50/30 hover:bg-white hover:border-info hover:shadow-sm group",
            open && "border-info ring-4 ring-info-light bg-white",
            selectedTeacher && "text-info bg-info-light/30 border-info-light",
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-white shadow-sm border border-gray-100 shrink-0 group-hover:bg-info-light group-hover:border-info-light transition-colors">
              <User
                className={cn(
                  "h-3.5 w-3.5 text-gray-400 transition-colors",
                  selectedTeacher && "text-info",
                )}
              />
            </div>
            {selectedTeacher ? (
              <span className="truncate font-bold tracking-tight">
                {selectedTeacher.fullName}
              </span>
            ) : (
              <span className="text-gray-400 truncate font-normal">
                {placeholder}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-info" />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-40 text-gray-500 transition-opacity group-hover:opacity-100" />
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
            {/* <Search className="h-4 w-4 shrink-0 text-gray-400 ml-2" /> */}
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
                <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <Search className="h-6 w-6 text-gray-300" />
                </div>
                <CommandEmpty className="text-sm font-medium text-gray-500">
                  لم يتم العثور على أي نتائج
                </CommandEmpty>
              </div>
            )}
            <CommandGroup className="p-0">
              {teachers.map((teacher) => (
                <CommandItem
                  key={teacher.userId}
                  value={teacher.fullName}
                  onSelect={() => {
                    onValueChange(teacher.userId, teacher.fullName);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                  className="flex items-center justify-between py-2 px-3 mb-1 cursor-pointer rounded-xl aria-selected:bg-info aria-selected:text-white hover:bg-info-light group transition-all duration-150"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-bold text-sm tracking-tight">
                        {teacher.fullName}
                      </span>
                    </div>
                  </div>
                  {value === teacher.userId && (
                    <Check className="h-4 w-4 text-white animate-in zoom-in duration-200" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
