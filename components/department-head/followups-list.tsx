"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type FollowUpNote } from "./types";
import { type Student } from "@/lib/mock-data";

type FollowUpsListProps = {
  notes: FollowUpNote[];
  students: Student[];
};

const getStatusBadge = (status: FollowUpNote["status"]) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">قيد الانتظار</Badge>;
    case "in-progress":
      return <Badge className="bg-blue-500 hover:bg-blue-600">قيد المتابعة</Badge>;
    case "resolved":
      return <Badge className="bg-green-500 hover:bg-green-600">تم الحل</Badge>;
    default:
      return null;
  }
};

export function FollowUpsList({ notes, students }: FollowUpsListProps) {
  if (notes.length === 0) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">ملاحظات المتابعة</CardTitle>
        <CardDescription className="text-right">جميع ملاحظات المتابعة المضافة</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map((note) => {
            const student = students.find((s) => s.id === note.studentId);
            return (
              <div
                key={note.id}
                className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-900">{student?.name}</h4>
                    <p className="text-sm text-gray-600">
                      {student?.studentNumber} - {student?.section}
                    </p>
                  </div>
                  {getStatusBadge(note.status)}
                </div>
                <p className="text-gray-700 mb-3 leading-relaxed">{note.note}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{note.date}</span>
                  <span>•</span>
                  <span>{note.addedBy}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
