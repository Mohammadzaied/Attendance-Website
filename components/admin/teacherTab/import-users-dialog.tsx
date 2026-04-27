"use client";

import { useState, useRef } from "react";
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
import { importUsers } from "@/features/admin/adminSlice";
import { CreateTeacherDto } from "@/features/admin/adminTypes";
import { FileUp, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS } from "@/Config/roles";

interface ImportUsersDialogProps {
  onSuccess?: () => void;
}

export function ImportUsersDialog({ onSuccess }: ImportUsersDialogProps) {
  const [open, setOpen] = useState(false);
  const [importedData, setImportedData] = useState<CreateTeacherDto[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<{
    show: boolean;
    title: string;
    description: string;
    variant: "success" | "error";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { departments, importUsersState } = useAppSelector(
    (state) => state.admin,
  );
  const isLoading = importUsersState.isLoading;

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

        // Map data to CreateTeacherDto
        const mappedData: CreateTeacherDto[] = data.map((item, index) => {
          const username = item.username || item["اسم المستخدم"];
          const fullName = item.fullName || item["الاسم الكامل"];

          if (!username || !fullName) {
            throw new Error(
              `السطر ${index + 2}: اسم المستخدم أو الاسم الكامل مفقود`,
            );
          }
          // 1. Map Department (by ID, Name, or Arabic Name)

          let deptId = item.departmentId || item["رقم القسم"] || null;
          // let deptId = null;
          const deptNameInput = item.departmentName || item["اسم القسم"];
          if (deptNameInput) {
            const dept = departments.find(
              (d) =>
                d.name.toLowerCase().trim() ===
                deptNameInput.toString().toLowerCase().trim(),
            );
            deptId = dept ? dept.departmentId : null;
          }

          // 2. Map Role (Label, or Arabic Label)
          let roleId = item.roleId || item["رقم المسمى الوظيفي"];
          const roleLabelInput = item.role || item["المسمى الوظيفي"];

          if (roleLabelInput) {
            const roleStr = roleLabelInput.toString().toLowerCase().trim();
            const role = ROLE_OPTIONS.find(
              (r) =>
                r.label.toLowerCase().trim() === roleStr ||
                (r.id === 1 && (roleStr === "admin" || roleStr === "مدير")) ||
                (r.id === 2 && (roleStr === "teacher" || roleStr === "معلم")) ||
                (r.id === 3 && (roleStr === "head" || roleStr === "رئيس قسم")),
            );
            if (role) roleId = role.id;
          }

          return {
            username: username.toString(),
            fullName: fullName.toString(),
            password: (
              item.password ||
              item["كلمة المرور"] ||
              "123"
            ).toString(),
            roleId: roleId || 2, // Default to teacher
            departmentId: deptId ? parseInt(deptId.toString()) : null,
          };
        });

        // Filter out empty rows
        const filteredData = mappedData.filter((u) => u.username && u.fullName);
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
      console.log(importedData);
      const response = await dispatch(importUsers(importedData)).unwrap();

      const isPartial = response.failed > 0;
      const isTotalFailure = response.created === 0 && response.failed > 0;

      setResult({
        show: true,
        title: isTotalFailure
          ? "فشل الاستيراد"
          : isPartial
            ? "تم الاستيراد جزئياً"
            : "تم الاستيراد بنجاح",
        description: `تم إضافة ${response.created} مستخدمين بنجاح. ${
          response.failed > 0 ? `فشل إضافة ${response.failed} مستخدمين.` : ""
        }`,
        variant: isTotalFailure ? "error" : "success",
      });
    } catch (error) {
      setResult({
        show: true,
        title: "خطأ غير متوقع",
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
  };

  const getRoleLabel = (roleId: number) => {
    return ROLE_OPTIONS.find((r) => r.id === roleId)?.label || roleId;
  };

  const getDepartmentName = (deptId: number | null) => {
    if (!deptId) return "بدون قسم";
    return departments.find((d) => d.departmentId === deptId)?.name || deptId;
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
          className="cursor-pointer border-success text-success hover:bg-success-light"
        >
          <FileUp className="h-4 w-4 ml-2" />
          استيراد من Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader className="p-2">
          <DialogTitle className="text-right">
            استيراد مستخدمين من Excel
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر ملف Excel يحتوي على بيانات المستخدمين (اسم المستخدم, الاسم
            الكامل, كلمة المرور, المسمى الوظيفي , اسم القسم)
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
                    ({importedData.length} مستخدم جاهز)
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

              <div className="flex-1 border border-gray-200 rounded-b-lg overflow-hidden">
                <ScrollArea className="h-full max-h-[400px]">
                  <Table dir="rtl">
                    <TableHeader className="bg-gray-50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="text-right whitespace-nowrap">
                          اسم المستخدم
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          الاسم الكامل
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          الدور
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          القسم
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importedData.length > 0 ? (
                        importedData.map((user, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-right font-medium">
                              {user.username}
                            </TableCell>
                            <TableCell className="text-right">
                              {user.fullName}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {getRoleLabel(user.roleId)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {getDepartmentName(user.departmentId)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-gray-500"
                          >
                            لم يتم العثور على بيانات في الملف
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}

          <div className="bg-warning-light border border-warning p-3 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-warning shrink-0" />
            <p className="text-sm text-warning-foreground">
              تأكد من مطابقة عناوين الأعمدة في الملف مع: (اسم المستخدم , الاسم
              الكامل , كلمة المرور , المسمى الوظيفي , اسم القسم). كلمة المرور
              الافتراضية هي "123" إذا تم تركها فارغة.
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
              : `استيراد ${importedData.length} مستخدمين`}
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
              {result?.title}
              {result?.variant === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </DialogTitle>
            <DialogDescription asChild className="text-right pt-2">
              <div>
                <div className="text-lg mb-2">{result?.description}</div>
                {importUsersState.data &&
                  importUsersState.data.errors?.length > 0 && (
                    <div className="mt-4 text-right">
                      <p className="font-semibold text-danger mb-2">
                        الأخطاء الواردة:
                      </p>
                      <ScrollArea className="h-[100px] w-full border rounded-md p-2 bg-danger-light/50">
                        <ul
                          dir="rtl"
                          className="list-disc list-inside space-y-1 text-sm text-danger-foreground "
                        >
                          {importUsersState.data.errors?.map((err, idx) => (
                            <li
                              key={idx}
                              className="wrap-break-word text-right justify-items-center"
                            >
                              {err}
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
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
