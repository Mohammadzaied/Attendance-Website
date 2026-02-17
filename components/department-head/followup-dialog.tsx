"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { type FollowUpNote } from "./types";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { Badge } from "@/components/ui/badge";
import { Student, Warning } from "@/features/student";

type FollowUpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  warnings: Warning[];
  followUps: FollowUpNote[];
  note: string;
  onNoteChange: (value: string) => void;
  status: FollowUpNote["status"];
  onStatusChange: (value: FollowUpNote["status"]) => void;
  onSave: () => void;
};

const getAttendanceColor = (rate: number) => {
  if (rate >= 90) return "text-green-600";
  if (rate >= 85) return "text-amber-600";
  return "text-red-600";
};

const getStatusBadge = (status: FollowUpNote["status"]) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">قيد الانتظار</Badge>;
    case "in-progress":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">قيد المتابعة</Badge>
      );
    case "resolved":
      return <Badge className="bg-green-500 hover:bg-green-600">تم الحل</Badge>;
    default:
      return null;
  }
};

export function FollowUpDialog({
  open,
  onOpenChange,
  student,
  warnings,
  followUps,
  note,
  onNoteChange,
  status,
  onStatusChange,
  onSave,
}: FollowUpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة متابعة للطالب</DialogTitle>
          <DialogDescription className="text-right">
            {student?.name} - {student?.studentNumber}
          </DialogDescription>
        </DialogHeader>

        {student && (
          <div className="space-y-4 py-4">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">معلومات الطالب</TabsTrigger>
                <TabsTrigger value="warnings">
                  الإنذارات ({warnings.length})
                </TabsTrigger>
                <TabsTrigger value="followups">المتابعات السابقة</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 text-right">
                      عدد الغيابات
                    </p>
                    <p className="text-lg font-semibold text-right">
                      {student.absenceCount}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 text-right">
                      نسبة الحضور
                    </p>
                    <p
                      className={`text-lg font-semibold text-right ${getAttendanceColor(student.attendanceRate)}`}
                    >
                      {student.attendanceRate}%
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="warnings" className="space-y-2">
                {warnings.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {warnings.map((warning) => (
                      <div
                        key={warning.id}
                        className="border rounded p-3 bg-red-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {warning.date}
                          </span>
                          <SeverityBadge severity={warning.severity} />
                        </div>
                        <p className="text-gray-700 text-right mb-2 bg-white p-2 rounded">
                          {warning.warningText}
                        </p>
                        <p className="text-xs text-gray-600 text-right">
                          من: {warning.sentBy}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا توجد إنذارات لهذا الطالب</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="followups" className="space-y-2">
                {followUps.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {followUps.map((noteItem) => (
                      <div
                        key={noteItem.id}
                        className="border rounded p-3 bg-gray-50 text-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {noteItem.date}
                          </span>
                          {getStatusBadge(noteItem.status)}
                        </div>
                        <p className="text-gray-700 text-right">
                          {noteItem.note}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا توجد متابعات سابقة لهذا الطالب</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="note" className="text-right block font-semibold">
                إضافة متابعة جديدة
              </Label>
              <Textarea
                id="note"
                placeholder="أدخل ملاحظات المتابعة للطالب..."
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                className="text-right min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-right block">
                حالة المتابعة
              </Label>
              <Select
                value={status}
                onValueChange={(value: any) => onStatusChange(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="in-progress">قيد المتابعة</SelectItem>
                  <SelectItem value="resolved">تم الحل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={onSave}
            disabled={!note.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            حفظ المتابعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
