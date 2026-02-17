"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
              className="bg-blue-600 hover:bg-blue-600 text-white font-bold"
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
              className="bg-blue-600 hover:bg-blue-600 text-white font-bold"
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
    </>
  );
}
