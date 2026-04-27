"use client";

import { Book, Trash2, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DetailedSubjectResponse } from "@/features/subject";

interface SubjectsListProps {
  subjects: DetailedSubjectResponse[];
  isLoading: boolean;
  isMobile: boolean;
  canEdit: boolean;
  onEdit: (subject: DetailedSubjectResponse) => void;
  onDelete: (id: string) => void;
}

export function SubjectsList({
  subjects,
  isLoading,
  isMobile,
  canEdit,
  onEdit,
  onDelete,
}: SubjectsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
        <div className="h-16 w-16 border-4 border-info border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium">جاري تحميل المواد...</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="p-4 space-y-3 bg-gray-50/30">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <div
              key={subject.subjectId}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-1 h-full bg-info opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 text-right">
                    <h4
                      className="font-bold text-gray-900 text-lg leading-tight truncate"
                      title={subject.name}
                    >
                      {subject.name}
                    </h4>
                    <div className="flex flex-wrap gap-2 justify-end mt-1">
                      <Badge
                        variant="secondary"
                        className="bg-info-light text-info hover:bg-info-light font-semibold text-[10px] border-none px-2"
                      >
                        {subject.numberOfHours} حصص
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!canEdit}
                      onClick={() => onDelete(subject.subjectId.toString())}
                      className="h-8 w-8 text-danger hover:bg-danger-light hover:text-danger-foreground rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!canEdit}
                      onClick={() => onEdit(subject)}
                      className="h-8 w-8 text-info hover:bg-info-light rounded-lg"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 bg-gray-50/50 -mx-4 px-4 py-2 mt-auto">
                  <div className="flex items-center gap-2">
                    {subject.teacherName ? (
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 bg-info-light text-info rounded-full flex items-center justify-center text-xs font-black ring-2 ring-white">
                          {subject.teacherName.charAt(0)}
                        </div>
                        <span
                          className="text-gray-700 text-sm font-bold truncate max-w-[150px]"
                          title={subject.teacherName}
                        >
                          {subject.teacherName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-danger text-xs font-medium">
                        لم يعين معلم
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Book className="h-8 w-8 opacity-20" />
            </div>
            <p className="font-medium">لا توجد مواد مضافة حالياً</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Table dir="rtl">
      <TableHeader className="bg-gray-50/80">
        <TableRow>
          <TableHead className="text-right font-bold text-gray-700 h-12">
            اسم المادة
          </TableHead>
          <TableHead className="text-right font-bold text-gray-700 h-12">
            المعلم المعين
          </TableHead>
          <TableHead className="text-right font-bold text-gray-700 h-12">
            الحصص / الجدول
          </TableHead>
          <TableHead className="text-center font-bold text-gray-700 h-12">
            التحكم
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((subject) => (
          <TableRow
            key={subject.subjectId}
            className="hover:bg-info-light/10 transition-colors border-b border-gray-50"
          >
            <TableCell className="text-right font-bold text-gray-900 border-none overflow-hidden max-w-[250px]">
              <div className="truncate" title={subject.name}>
                {subject.name}
              </div>
            </TableCell>
            <TableCell className="text-right border-none">
              {subject.teacherName ? (
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 bg-info-light text-info rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                    {subject.teacherName.charAt(0)}
                  </div>
                  <span
                    className="text-gray-700 font-medium truncate max-w-[150px]"
                    title={subject.teacherName}
                  >
                    {subject.teacherName}
                  </span>
                </div>
              ) : (
                <span className="text-danger text-sm">لم يعين</span>
              )}
            </TableCell>
            <TableCell className="text-right border-none">
              <Badge
                variant="secondary"
                className="w-fit bg-gray-100 text-gray-600 font-medium border-none"
              >
                {subject.numberOfHours} حصص
              </Badge>
            </TableCell>
            <TableCell className="border-none">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canEdit}
                  onClick={() => onEdit(subject)}
                  className="h-9 px-4 gap-2 border-gray-200 text-info hover:bg-info-light hover:text-info-foreground hover:border-info cursor-pointer transition-all shadow-sm rounded-lg"
                >
                  <Settings className="h-3.5 w-3.5" />
                  إدارة
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!canEdit}
                  onClick={() => onDelete(subject.subjectId.toString())}
                  className="h-8 w-8 text-danger hover:bg-danger-light rounded-lg cursor-pointer transition-all focus-visible:ring-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {subjects.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="h-40 text-center">
              <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                <Book className="h-8 w-8 opacity-20" />
                <p>لا توجد مواد مضافة حالياً</p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
