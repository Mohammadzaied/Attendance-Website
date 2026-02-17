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
import { SpecializationResponse } from "@/features/specialization/specializationTypes";

interface SpecializationSearchSelectProps {
  specializations: SpecializationResponse[];
  value: number | "";
  onValueChange: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function SpecializationSearchSelect({
  specializations,
  value,
  onValueChange,
  disabled = false,
  placeholder = "اختر التخصص",
}: SpecializationSearchSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedSpecialization = React.useMemo(
    () => specializations.find((s) => s.specializationId === value),
    [specializations, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between text-right font-normal h-11 border-gray-200 bg-gray-50/30"
        >
          {selectedSpecialization ? (
            <span className="truncate">{selectedSpecialization.name}</span>
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
          <CommandInput placeholder="بحث عن تخصص..." className="h-9" />
          <CommandList>
            <CommandEmpty>لم يتم العثور على تخصص.</CommandEmpty>
            <CommandGroup>
              {specializations.map((s) => (
                <CommandItem
                  key={s.specializationId}
                  value={s.name}
                  onSelect={() => {
                    onValueChange(s.specializationId);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      value === s.specializationId
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {s.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
