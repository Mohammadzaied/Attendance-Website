"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Download, AlertTriangle } from "lucide-react";
import { StudentWithAbsenceDataItem } from "@/features/teacher";
import * as XLSX from "xlsx";

interface StudentAbsenceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentWithAbsenceDataItem[];
  subjectName: string;
  subjectId: number;
}

export function StudentAbsenceDetailsDialog({
  open,
  onOpenChange,
  students,
  subjectName,
  subjectId,
}: StudentAbsenceDetailsDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportToExcel = () => {
    setIsExporting(true);
    try {
      // Prepare data for Excel
      const excelData = students.map((student, index) => ({
        "#": index + 1,
        "اسم الطالب": student.fullName,
        "مجموع الغيابات": student.absenceStats.totalAbsenceWithoutExcuse,
        تأخير: student.absenceStats.lateCount,
        "غياب بعذر": student.absenceStats.excusedAbsenceCount,
        غياب: student.absenceStats.absentCount,
        "انذار أول": student.hasFirstAlert ? "نعم" : "لا",
        "انذار ثاني": student.hasSecondAlert ? "نعم" : "لا",
        حرمان: student.hasApprovedDeprivationAlert ? "نعم" : "لا",
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "إحصائيات الغياب");

      // Set column widths
      ws["!cols"] = [
        { wch: 5 }, // #
        { wch: 25 }, // اسم الطالب
        { wch: 15 }, // غياب
        { wch: 12 }, // تأخير
        { wch: 15 }, // غياب بعذر
        { wch: 12 }, // مجموع الغيابات
        { wch: 12 }, // انذار أول
        { wch: 12 }, // انذار ثاني
        { wch: 12 }, // حرمان
      ];

      // Generate filename with subject name and date
      const date = new Date().toISOString().split("T")[0];
      const filename = `احصائيات_الغياب_${subjectName}_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Failed to export to Excel:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle></DialogTitle>
      <DialogContent
        className="w-[90vw]! max-w-[1400px]! max-h-[90vh]! flex flex-col p-0"
        dir="rtl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">
              إحصائيات الغياب - {subjectName}
            </h2>
            <Badge className="bg-info-light text-info-foreground border-info">
              {students.length} طالب
            </Badge>
          </div>
          <Button
            onClick={handleExportToExcel}
            disabled={isExporting || students.length === 0}
            className="w-full md:w-auto bg-success hover:bg-success-foreground text-white gap-2 h-10 font-bold shadow-sm"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "جاري التصدير..." : "تصدير إلى Excel"}
          </Button>
        </div>

        <div
          className="flex-1 overflow-auto mx-2 pb-4 scrollbar-always-visible"
          dir="rtl"
          style={{ scrollbarGutter: "stable" }}
        >
          <table className="w-full caption-bottom text-sm min-w-[800px] border-separate border-spacing-0">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky top-0 right-0 z-30 bg-gray-100 text-right font-bold text-gray-900 w-[50px] min-w-[50px] border-b border-gray-200 border-l border-l-gray-200/50">
                  #
                </TableHead>
                <TableHead className="sticky top-0 right-[50px] z-30 bg-gray-100 text-right font-bold text-gray-900 w-[200px] min-w-[200px] border-b border-gray-200 border-l border-l-gray-200/50">
                  اسم الطالب
                </TableHead>
                <TableHead className="sticky top-0  z-10 bg-gray-100 text-center font-bold text-gray-900 w-[120px] min-w-[120px] border-b border-gray-200 border-l border-l-gray-200/50">
                  مجموع الغيابات
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50 text-center font-bold text-gray-900 w-24 border-b border-gray-200">
                  تأخير
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50 text-center font-bold text-gray-900 w-28 border-b border-gray-200">
                  غياب بعذر
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50 text-center font-bold text-gray-900 w-28 border-b border-gray-200">
                  غياب
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50 text-center font-bold text-gray-900 w-28 border-b border-gray-200">
                  انذار أول
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50 text-center font-bold text-gray-900 w-28 border-b border-gray-200">
                  انذار ثاني
                </TableHead>
                <TableHead className="sticky top-0 z-10 bg-gray-50 text-center font-bold text-gray-900 w-28 border-b border-gray-200">
                  حرمان
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow
                  key={student.studentId}
                  className="hover:bg-info-light/30 transition-colors group"
                >
                  <TableCell className="text-right font-medium text-gray-500 sticky right-0 z-20 bg-white group-hover:bg-info-light/30 border-l border-l-gray-100">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-right font-medium sticky right-[50px] z-20 bg-white group-hover:bg-info-light/30 border-l border-l-gray-100">
                    {student.fullName}
                  </TableCell>
                  <TableCell className="text-center  z-20 bg-white group-hover:bg-info-light/30 border-l border-l-gray-100 shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <Badge
                      variant="outline"
                      className="bg-danger-light text-danger-foreground border-danger font-bold"
                    >
                      {student.absenceStats.totalAbsenceWithoutExcuse}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="bg-warning-light text-warning-foreground border-warning font-bold"
                    >
                      {student.absenceStats.lateCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="bg-success-light text-success-foreground border-success font-bold"
                    >
                      {student.absenceStats.excusedAbsenceCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="bg-warning-light text-warning-foreground border-warning font-bold"
                    >
                      {student.absenceStats.absentCount}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    {student.hasFirstAlert ? (
                      <div className="flex items-center justify-center gap-1 text-danger">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-bold">نعم</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">لا</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.hasSecondAlert ? (
                      <div className="flex items-center justify-center gap-1 text-danger">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-bold">نعم</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">لا</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.hasApprovedDeprivationAlert ? (
                      <div className="flex items-center justify-center gap-1 text-danger">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-bold">نعم</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">لا</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-w-[100px]"
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
