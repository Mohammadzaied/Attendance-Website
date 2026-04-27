"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

interface AbsencesDialogsProps {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  editStatus: string;
  setEditStatus: (status: string) => void;
  editReason: string;
  setEditReason: (reason: string) => void;
  onConfirmEdit: () => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  editLoading: boolean;
  deleteLoading: boolean;
  excuseResult: any | null;
  setExcuseResult: (result: any | null) => void;
  excuseError: string | null;
  setExcuseError: (error: string | null) => void;
}

export function AbsencesDialogs({
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  editStatus,
  setEditStatus,
  editReason,
  setEditReason,
  onConfirmEdit,
  onConfirmDelete,
  editLoading,
  deleteLoading,
  excuseResult,
  setExcuseResult,
  excuseError,
  setExcuseError,
}: AbsencesDialogsProps) {
  return (
    <>
      {/* Edit Absence Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل حالة الغياب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-right" dir="rtl">
              <label className="text-sm font-bold text-gray-700">الحالة</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full text-right" dir="rtl">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="Absent">غياب</SelectItem>
                  <SelectItem value="Late">تأخير</SelectItem>
                  <SelectItem value="ExcusedAbsence">غياب بعذر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editStatus === "ExcusedAbsence" && (
              <div className="space-y-2 text-right">
                <label className="text-sm font-bold text-gray-700">السبب</label>
                <Textarea
                  placeholder="اكتب سبب الغياب بعذر..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              disabled={editLoading}
              onClick={onConfirmEdit}
              className="bg-info hover:bg-info-foreground text-white font-bold"
            >
              {editLoading ? <Spinner className="h-4 w-4" /> : "تأكيد التعديل"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="font-bold border-gray-200"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Absence Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذا الغياب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              onClick={onConfirmDelete}
              disabled={deleteLoading}
              className="bg-info hover:bg-info-foreground text-white font-bold"
            >
              {deleteLoading ? (
                <Spinner className="h-4 w-4 animate-spin" />
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
            <AlertDialogCancel
              disabled={deleteLoading}
              className="font-bold border-gray-200"
            >
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Excuse Result Dialog */}
      <Dialog open={!!excuseResult} onOpenChange={(open) => !open && setExcuseResult(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-info p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/20">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white text-center">تمت العملية بنجاح</DialogTitle>
            </DialogHeader>
            <p className="text-info-foreground font-bold">{excuseResult?.studentName}</p>
          </div>
          
          <div className="p-6 text-center space-y-6 bg-white" dir="rtl">
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-500 font-bold">تاريخ الغياب:</span>
                <span className="text-gray-900 font-black" dir="ltr">
                  {excuseResult?.date ? new Date(excuseResult.date).toLocaleDateString("en-GB") : ""}
                </span>
              </div>

              <div className="space-y-2 text-right">
                <h4 className="text-sm font-black text-gray-900 pr-2">تفاصيل المواد المتأثرة</h4>
                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {excuseResult?.subjectDetails?.map((subject: any) => (
                    <div key={subject.subjectId} className="flex items-center justify-between p-3 bg-info-light/50 rounded-xl border border-info-light/50">
                      <span className="text-gray-700 font-bold text-sm">{subject.subjectName}</span>
                      <Badge variant="secondary" className="bg-info text-white border-none font-black">
                        {subject.convertedAbsencesCount} حصص
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 flex-1">
                  <span className="block text-[10px] text-gray-400 font-bold mb-1">إجمالي الحصص</span>
                  <span className="text-2xl font-black text-gray-900">{excuseResult?.totalExcusedAbsencesCount || 0}</span>
                </div>
                <div className="bg-info-light px-4 py-3 rounded-2xl border border-info flex-1">
                  <span className="block text-[10px] text-info font-bold mb-1">عدد المواد</span>
                  <span className="text-2xl font-black text-info">{excuseResult?.totalSubjectsAffected || 0}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setExcuseResult(null)}
              className="w-full h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition-all"
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Excuse Error Dialog */}
      <Dialog open={!!excuseError} onOpenChange={(open) => !open && setExcuseError(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-danger p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/20">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white text-center">عذراً، حدث خطأ</DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-8 text-center space-y-6 bg-white" dir="rtl">
            <div className="space-y-2">
              <p className="text-gray-600 font-bold">فشلت عملية تحويل الغيابات:</p>
              <div className="p-4 bg-danger-light rounded-2xl border border-danger">
                <p className="text-danger-foreground font-black text-sm">{excuseError}</p>
              </div>
            </div>

            <Button
              onClick={() => setExcuseError(null)}
              className="w-full h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition-all"
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
