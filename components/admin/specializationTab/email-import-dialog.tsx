"use client";

import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateStudentEmailsThunk,
  clearError,
} from "@/features/specialization";
import {
  FileUp,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { EmailUpdateDto, MajorStudent } from "@/features/student";

interface EmailImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  students: MajorStudent[];
}

export function EmailImportDialog({
  open,
  onOpenChange,
  onSuccess,
  students,
}: EmailImportDialogProps) {
  const [importedData, setImportedData] = useState<EmailUpdateDto[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<{
    show: boolean;
    title: string;
    description: string;
    variant: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { updateStudentEmailsState } = useAppSelector(
    (state) => state.specializations,
  );
  const isLoading = updateStudentEmailsState.isLoading;

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  const handleDownloadTemplate = async () => {
    const res = await fetch("/students_Email_template.xlsx");
    const buffer = await res.arrayBuffer();

    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];

    // Start writing data from row 2 (keep header)
    students.forEach((s, i) => {
      const row = i + 2;
      ws[`A${row}`] = { v: s.studentId };
      ws[`B${row}`] = { v: s.fullName };
      ws[`C${row}`] = { v: s.username || "" };
    });

    const uniqueId = Date.now();
    XLSX.writeFile(wb, `students_Email_template_${uniqueId}.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        // Map data to EmailUpdateDto
        const mappedData: EmailUpdateDto[] = data.map((item, index) => {
          const studentId = item.ID || item.id || item["رقم الطالب"];
          const fullName = item["الاسم"] || item.Name || item.fullName;
          const email =
            item["البريد الإلكتروني"] ||
            item.Email ||
            item.email ||
            item.username;

          if (!studentId) {
            throw new Error(`السطر ${index + 2}: ID الطالب مفقود`);
          }

          return {
            studentId: Number(studentId),
            fullName: fullName?.toString() || "",
            username: email?.toString() || "",
          };
        });

        setImportedData(mappedData);
      } catch (error: any) {
        setResult({
          show: true,
          title: "خطأ في تحميل الملف",
          description: error.message || "يرجى التأكد من صحة الملف",
          variant: "error",
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (importedData.length === 0) return;

    try {
      await dispatch(updateStudentEmailsThunk(importedData)).unwrap();

      setResult({
        show: true,
        title: "تم التحديث بنجاح",
        description: `تم تحديث بريد ${importedData.length} طالب بنجاح.`,
        variant: "success",
      });
    } catch (error) {
      setResult({
        show: true,
        title: "فشل التحديث",
        description:
          typeof error === "string" ? error : "حدث خطأ أثناء الاتصال بالخادم",
        variant: "error",
      });
    }
  };

  const resetState = () => {
    setImportedData([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    dispatch(clearError());
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          onOpenChange(val);
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader className="p-2">
            <DialogTitle className="text-right">ادخال الايميلات</DialogTitle>
            <DialogDescription className="text-right">
              قم بتحميل الملف، أضف الايميلات، ثم أعد رفعه هنا.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4 py-4 overflow-hidden">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="gap-2 cursor-pointer border-info text-info hover:bg-info-light"
              >
                <Download className="h-4 w-4" />
                تنزيل قائمة الطلاب الحالية
              </Button>
            </div>

            {!fileName ? (
              <div
                className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-12 hover:border-info transition-colors cursor-pointer bg-gray-50/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">
                  اضغط لرفع ملف الـ Excel المحدث
                </p>
                <p className="text-gray-400 text-sm mt-1">يدعم .xlsx, .xls</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between bg-info-light p-3 rounded-t-lg border-x border-t border-info">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-info" />
                    <span className="font-medium text-info-foreground">
                      {fileName}
                    </span>
                    <span className="text-info text-sm">
                      ({importedData.length} طالب جاهز للتحديث)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetState}
                    className="text-danger hover:text-danger-foreground hover:bg-danger-light h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div
                  className="flex-1 border border-gray-200 rounded-b-lg overflow-hidden flex flex-col text-right"
                >
                  <div className="overflow-y-auto max-h-[400px] w-full" dir="ltr">
                    <Table dir="rtl">
                      <TableHeader className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <TableRow>
                          <TableHead className="text-right">الاسم</TableHead>
                          <TableHead className="text-right">
                            البريد الإلكتروني الجديد
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importedData.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{row.fullName}</TableCell>
                            <TableCell dir="ltr" className="font-medium">
                              {row.username || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={isLoading || importedData.length === 0}
              className="cursor-pointer bg-info hover:bg-info-foreground"
            >
              {isLoading ? "جاري التحديث..." : "تحديث الايميلات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog
        open={result?.show}
        onOpenChange={(val) => {
          if (!val) {
            const isSuccess = result?.variant === "success";
            setResult(null);
            if (isSuccess) {
              onOpenChange(false);
              onSuccess?.();
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle
              className={cn(
                "flex items-center justify-start gap-2",
                result?.variant === "success"
                  ? "text-success"
                  : "text-danger",
              )}
            >
              {result?.title}
              {result?.variant === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </DialogTitle>
            <DialogDescription className="text-right pt-2 text-lg">
              {result?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                const isSuccess = result?.variant === "success";
                setResult(null);
                if (isSuccess) {
                  onOpenChange(false);
                  onSuccess?.();
                }
              }}
              className={cn(
                "w-full cursor-pointer",
                result?.variant === "success"
                  ? "bg-success hover:bg-success-foreground"
                  : "bg-danger hover:bg-danger-foreground",
              )}
            >
              حسناً
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
