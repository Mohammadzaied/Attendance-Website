"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ar } from "date-fns/locale";

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  label?: string;
}

export function DatePicker({ date, setDate, label }: DatePickerProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-right block text-sm font-bold text-gray-700">
          {label}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full h-9! px-1 justify-start text-right font-normal bg-white border-gray-200 hover:bg-gray-50 rounded-md! transition-all",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4 text-blue-600" />
            {date ? (
              format(date, "PPP", { locale: ar })
            ) : (
              <span>اختر التاريخ</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            locale={ar}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
