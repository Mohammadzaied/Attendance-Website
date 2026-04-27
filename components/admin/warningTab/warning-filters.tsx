"use client";

import { Search, RotateCcw, Download } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface WarningFiltersProps {
  studentName: string;
  setStudentName: (name: string) => void;
  academicYearId: string;
  setAcademicYearId: (id: string) => void;
  academicYears: any[];
  semesterId: string;
  setSemesterId: (id: string) => void;
  semesters: any[];
  alertType: string;
  setAlertType: (type: string) => void;
  alertStatus: string;
  setAlertStatus: (status: string) => void;
  departmentName: string;
  setDepartmentName: (name: string) => void;
  departments: any[];
  isLoadingDepartments: boolean;
  isExporting: boolean;
  onExport: () => void;
  onReset: () => void;
  isDepartmentHead?: boolean;
  hasData: boolean;
}

export function WarningFilters({
  studentName,
  setStudentName,
  academicYearId,
  setAcademicYearId,
  academicYears,
  semesterId,
  setSemesterId,
  semesters,
  alertType,
  setAlertType,
  alertStatus,
  setAlertStatus,
  departmentName,
  setDepartmentName,
  departments,
  isLoadingDepartments,
  isExporting,
  onExport,
  onReset,
  isDepartmentHead,
  hasData,
}: WarningFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          سجل الإنذارات الأكاديمية
        </h1>

        <div className="relative w-full md:w-[400px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="البحث باسم الطالب..."
            className="pr-10 h-11 bg-white border-gray-200 rounded-xl focus:ring-info/20"
          />
        </div>
      </div>

      {/* Filters Grid */}
      <Card className="border-none shadow-xl shadow-info/5 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border-t-4 border-t-info">
        <CardContent className="p-6">
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 gap-6",
              isDepartmentHead ? "lg:grid-cols-4" : "lg:grid-cols-5",
            )}
          >
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 mr-1">
                السنة الأكاديمية
              </Label>
              <Select
                value={academicYearId}
                onValueChange={(value) => {
                  setAcademicYearId(value);
                }}
                dir="rtl"
              >
                <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-100 rounded-xl">
                  <SelectValue placeholder="اختر السنة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {academicYears?.map((year) => (
                    <SelectItem
                      key={year.academicYearId}
                      value={year.academicYearId.toString()}
                    >
                      {year.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 mr-1">
                الفصل الدراسي
              </Label>
              <Select
                value={semesterId}
                onValueChange={setSemesterId}
                dir="rtl"
              >
                <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-100 rounded-xl">
                  <SelectValue placeholder="اختر الفصل" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {semesters
                    ?.filter((sem) =>
                      academicYearId === "all" || academicYearId === ""
                        ? true
                        : sem.academicYearId.toString() === academicYearId,
                    )
                    .map((sem) => (
                      <SelectItem
                        key={sem.semesterId}
                        value={sem.semesterId.toString()}
                      >
                        {sem.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 mr-1">
                نوع الإنذار
              </Label>
              <Select value={alertType} onValueChange={setAlertType} dir="rtl">
                <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-100 rounded-xl">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="1">إنذار أول</SelectItem>
                  <SelectItem value="2">إنذار ثاني</SelectItem>
                  <SelectItem value="3">حرمان</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 mr-1">
                حالة الإنذار
              </Label>
              <Select
                value={alertStatus}
                onValueChange={setAlertStatus}
                dir="rtl"
              >
                <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-100 rounded-xl">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="1">معلق</SelectItem>
                  <SelectItem value="2">تم الموافقة عليه</SelectItem>
                  <SelectItem value="3">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isDepartmentHead && (
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 mr-1">
                  القسم
                </Label>
                <Select
                  value={departmentName}
                  onValueChange={setDepartmentName}
                  dir="rtl"
                  disabled={isLoadingDepartments}
                >
                  <SelectTrigger className="w-full h-11 bg-gray-50/50 border-gray-100 rounded-xl">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all">الكل</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.departmentId} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <Button
                      onClick={onExport}
                      disabled={
                        isExporting || departmentName === "all" || !hasData
                      }
                      className={cn(
                        "bg-success hover:bg-success-foreground text-white rounded-xl font-bold gap-2",
                        (departmentName === "all" || !hasData) &&
                          "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {isExporting ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      تصدير Excel
                    </Button>
                  </div>
                </TooltipTrigger>
                {(departmentName === "all" || !hasData) && (
                  <TooltipContent>
                    <p>
                      {departmentName === "all"
                        ? "الرجاء اختيار القسم"
                        : "لا يوجد طلاب لتصدير بياناتهم"}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="ghost"
              onClick={onReset}
              className="text-gray-400 hover:text-info gap-2 font-bold"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة تعيين الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
