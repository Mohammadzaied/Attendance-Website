"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { TeacherListResponse } from "@/features/admin/adminTypes";

interface TeacherSearchSelectProps {
  teachers: TeacherListResponse[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TeacherSearchSelect({
  teachers,
  value,
  onValueChange,
  disabled = false,
  placeholder = "اختر المعلم",
}: TeacherSearchSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedTeacher = React.useMemo(
    () => teachers.find((teacher) => teacher.id === value),
    [teachers, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between text-right font-normal h-10 border-gray-200"
        >
          {selectedTeacher ? (
            <span className="truncate">{selectedTeacher.name}</span>
          ) : (
            <span className="text-muted-foreground truncate">
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
        dir="rtl"
      >
        <Command>
          <CommandInput placeholder="بحث عن معلم..." className="h-9" />
          <CommandList>
            <CommandEmpty>لم يتم العثور على معلم.</CommandEmpty>
            <CommandGroup>
              {teachers.map((teacher) => (
                <CommandItem
                  key={teacher.id}
                  value={teacher.name}
                  onSelect={() => {
                    onValueChange(teacher.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      value === teacher.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {teacher.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
