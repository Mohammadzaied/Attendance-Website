"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStudentAbsenceDetails } from "@/features/student";
import { Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";

interface SubjectAbsenceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectId: number;
  subjectName: string;
  studentAcademicInfoId: number;
}

const getStatusLabel = (status: string | number): string => {
  // Handle string status
  const statusLower = String(status).toLowerCase();
  switch (statusLower) {
    case "absent":
      return "غياب";
    case "late":
      return "تأخير";
    case "excused":
    case "excusedabsence":
      return "بعذر";
    default:
      return String(status);
  }
};

const getStatusColor = (status: string | number): string => {
  // Handle string status
  const statusLower = String(status).toLowerCase();
  switch (statusLower) {
    case "absent":
      return "bg-red-100 text-red-700 border-red-200";
    case "late":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "excused":
    case "excusedabsence":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export function SubjectAbsenceDetailsDialog({
  open,
  onOpenChange,
  subjectId,
  subjectName,
  studentAcademicInfoId,
}: SubjectAbsenceDetailsDialogProps) {
  const dispatch = useAppDispatch();
  const { absenceDetails: data, fetchAbsenceDetailsState } = useAppSelector(
    (state) => state.student,
  );

  const { isLoading, error } = fetchAbsenceDetailsState;

  useEffect(() => {
    if (open && subjectId && studentAcademicInfoId) {
      dispatch(
        fetchStudentAbsenceDetails({
          studentAcademicInfoId,
          subjectId,
        }),
      );
    }
  }, [open, subjectId, studentAcademicInfoId, dispatch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[90%] max-h-[85vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-right">
            {subjectName}
          </DialogTitle>
          <p className="text-sm text-gray-500 text-right">تفاصيل الغيابات</p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
            <p className="text-gray-500">جاري تحميل البيانات...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
              {data.adjustedTotalAbsences > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-center">
                  <p className="text-sm text-red-600 mb-1">إجمالي الغيابات</p>
                  <p className="text-3xl font-bold text-red-700">
                    {data.adjustedTotalAbsences}
                  </p>
                </div>
              )}
              {data.absencesByStatus["Late"] > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center">
                  <p className="text-sm text-amber-600 mb-1">تأخير</p>
                  <p className="text-3xl font-bold text-amber-700">
                    {data.absencesByStatus["Late"]}
                  </p>
                </div>
              )}
              {data.absencesByStatus["Absent"] > 0 && (
                <div className="bg-red-50  border-red-200 rounded-xl p-2 text-center">
                  <p className="text-sm text-red-600 mb-1">غياب</p>
                  <p className="text-3xl font-bold text-red-700">
                    {data.absencesByStatus["Absent"]}
                  </p>
                </div>
              )}

              {data.absencesByStatus["ExcusedAbsence"] > 0 && (
                <div className="bg-blue-50  border-blue-200 rounded-xl p-2 text-center">
                  <p className="text-sm text-blue-600 mb-1">بعذر</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {data.absencesByStatus["ExcusedAbsence"]}
                  </p>
                </div>
              )}
            </div>

            {/* Absence Records Grouped by Date */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>سجل الغيابات</span>
              </h3>

              {data.absencesByDate && data.absencesByDate.length > 0 ? (
                <div className="space-y-3">
                  {[...data.absencesByDate]
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .map((absenceGroup, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                      >
                        {/* Date Header */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">
                              {new Date(absenceGroup.date).toLocaleDateString(
                                "en-GB",
                                {
                                  year: "numeric",
                                  month: "numeric",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Lessons */}
                        <div className="space-y-2">
                          {absenceGroup.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-100"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 text-sm">
                                      {lesson.lessonName}
                                    </p>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(lesson.status)}`}
                                    >
                                      {getStatusLabel(lesson.status)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {lesson.dayName}
                                  </p>
                                </div>
                              </div>
                              {lesson.reason && (
                                <div className="text-left">
                                  <p className="text-xs text-gray-500">السبب</p>
                                  <p className="text-sm text-gray-700">
                                    {lesson.reason}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold">
                    لا توجد سجلات غياب لهذه المادة
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
