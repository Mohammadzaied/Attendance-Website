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
import { Textarea } from "@/components/ui/textarea";
import { Student } from "@/features/student";

type WarningDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  severity: "low" | "medium" | "high";
  onSeverityChange: (value: "low" | "medium" | "high") => void;
  text: string;
  onTextChange: (value: string) => void;
  onSend: () => void;
};

export function WarningDialog({
  open,
  onOpenChange,
  student,
  severity,
  onSeverityChange,
  text,
  onTextChange,
  onSend,
}: WarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-right">إرسال إنذار للطالب</DialogTitle>
          <DialogDescription className="text-right">
            {student?.name} - {student?.studentNumber}
          </DialogDescription>
        </DialogHeader>

        {student && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 text-right">عدد الغيابات</p>
                <p className="text-lg font-semibold text-right text-danger">
                  {student.absenceCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 text-right">نسبة الحضور</p>
                <p className="text-lg font-semibold text-right">
                  {student.attendanceRate}%
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity" className="text-right block">
                درجة الإنذار
              </Label>
              <Select
                value={severity}
                onValueChange={(v: any) => onSeverityChange(v)}
              >
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warningText" className="text-right block">
                نص الإنذار
              </Label>
              <Textarea
                id="warningText"
                placeholder="اكتب نص الإنذار هنا..."
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                className="text-right min-h-[120px]"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={onSend}
            disabled={!text.trim()}
            className="bg-danger hover:bg-danger-foreground"
          >
            إرسال الإنذار
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
