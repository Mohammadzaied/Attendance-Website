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
  DialogTrigger,
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
import { importStudentsThunk, clearError } from "@/features/specialization";
import { FileUp, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ImportStudentDto } from "@/features/student";

interface ImportStudentsDialogProps {
  onSuccess?: () => void;
  departmentId: number;
  academicYearId: number;
  studyYear: number;
  specializationId: number;
  semesterId: number;
  disabled: boolean;
}

export function ImportStudentsDialog({
  onSuccess,
  departmentId,
  academicYearId,
  studyYear,
  specializationId,
  semesterId,
  disabled,
}: ImportStudentsDialogProps) {
  const [open, setOpen] = useState(false);
  //////////// department id not send
  const [importedData, setImportedData] = useState<ImportStudentDto[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<{
    show: boolean;
    title: string;
    description: string;
    variant: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { importStudentsState } = useAppSelector(
    (state) => state.specializations,
  );
  const isLoading = importStudentsState.isLoading;

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

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

        // Map data to ImportStudentDto
        const mappedData: ImportStudentDto[] = data.map((item, index) => {
          const normalizedItem: any = {};
          Object.keys(item).forEach((key) => {
            normalizedItem[key.trim()] = item[key];
          });

          const rawUsername =
            normalizedItem.Username ||
            normalizedItem.username ||
            normalizedItem.Email ||
            normalizedItem["البريد الإلكتروني"] ||
            normalizedItem["البريد الالكتروني"] ||
            normalizedItem.email;

          const rawFullName =
            normalizedItem.Name ||
            normalizedItem["الاسم"] ||
            normalizedItem["الإسم"] ||
            normalizedItem["Student Name"] ||
            normalizedItem.name ||
            normalizedItem.FullName ||
            normalizedItem.fullname;

          if (!rawFullName) {
            throw new Error(`السطر ${index + 2}: الاسم مفقود (Name/الاسم)`);
          }

          return {
            fullName: rawFullName.toString().trim(),
            departmentId,
            specializationId,
            username: rawUsername ? rawUsername.toString().trim() : "",
            academicYearId,
            semesterId: Number(semesterId),
            studyYear: Number(studyYear),
          };
        });

        // Filter out empty rows
        const filteredData = mappedData.filter((u) => u.fullName);

        setImportedData(filteredData);
      } catch (error: any) {
        setResult({
          show: true,
          title: "خطأ في بيانات الملف",
          description: error.message || "يرجى التأكد من صحة الملف والبيانات",
          variant: "error",
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (importedData.length === 0) return;

    try {
      await dispatch(importStudentsThunk(importedData)).unwrap();

      setResult({
        show: true,
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد ${importedData.length} طالب بنجاح.`,
        variant: "success",
      });
    } catch (error) {
      setResult({
        show: true,
        title: "فشل الاستيراد",
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
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-success hover:bg-success-foreground text-white h-10 md:h-9 border-success gap-2 cursor-pointer shadow-sm"
          disabled={disabled}
        >
          <FileUp className="h-4 w-4" />
          استيراد طلاب من Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader className="p-2">
          <DialogTitle className="text-right">
            استيراد طلاب من Excel
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر ملف Excel يحتوي على بيانات الطلاب (البريد الإلكتروني , الاسم).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 py-4 overflow-hidden">
          {!fileName ? (
            <div
              className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-12 hover:border-info transition-colors cursor-pointer bg-gray-50/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">
                اضغط هنا لاختيار ملف Excel
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
                  <span className="font-medium text-info-foreground">{fileName}</span>
                  <span className="text-info text-sm">
                    ({importedData.length} طالب جاهز)
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

              <div className="flex-1 border border-gray-200 rounded-b-lg overflow-hidden flex flex-col">
                <div className="overflow-y-auto max-h-[400px] w-full" dir="ltr">
                  <Table dir="rtl">
                    <TableHeader className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="text-right whitespace-nowrap">
                          الاسم (FullName)
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap hidden md:table-cell">
                          اسم المستخدم (اختياري)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importedData.length > 0 ? (
                        importedData.map((user, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-right">
                              {user.fullName}
                            </TableCell>
                            <TableCell className="text-right font-medium hidden md:table-cell">
                              {user.username || (
                                <span className="text-gray-400 italic">
                                  غير محدد
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            className="text-center py-8 text-gray-500"
                          >
                            لم يتم العثور على بيانات في الملف
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <div className="bg-warning-light border border-warning p-3 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-warning shrink-0" />
            <p className="text-sm text-warning">
              تأكد من مطابقة عناوين الأعمدة في الملف مع: (البريد الإلكتروني,
              الاسم).
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false);
              resetState();
            }}
            disabled={isLoading}
            className="cursor-pointer"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isLoading || importedData.length === 0}
            className="cursor-pointer bg-success hover:bg-success-foreground"
          >
            {isLoading
              ? "جاري الاستيراد..."
              : `استيراد ${importedData.length} طلاب`}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Result Dialog */}
      <Dialog
        open={result?.show}
        onOpenChange={(val) => {
          if (!val) {
            const isSuccess = result?.variant === "success";
            setResult(null);
            if (isSuccess) {
              setOpen(false);
              resetState();
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
              {result?.variant === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              {result?.title}
            </DialogTitle>
            <DialogDescription asChild className="text-right pt-2">
              <div>
                <div className="text-lg mb-2">{result?.description}</div>
                {importStudentsState.error && (
                  <div className="mt-4 text-right">
                    <p className="font-semibold text-danger mb-2">الخطأ:</p>
                    <p className="text-sm text-danger">
                      {importStudentsState.error}
                    </p>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              onClick={() => {
                const isSuccess = result?.variant === "success";
                setResult(null);
                if (isSuccess) {
                  setOpen(false);
                  resetState();
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
    </Dialog>
  );
}
