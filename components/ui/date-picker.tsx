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
            <CalendarIcon className="ml-2 h-4 w-4 text-info" />
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
            classNames={{
              weekday:
                "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none [&:nth-child(1)]:hidden [&:nth-child(7)]:hidden",
              day: "group relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:nth-child(1)]:hidden [&:nth-child(7)]:hidden",
            }}
            hidden={
              (date) =>
                date.getDay() === 5 || // Friday
                date.getDay() === 6 // Saturday
            }
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
