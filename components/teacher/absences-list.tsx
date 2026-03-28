import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateAbsenceBatch, deleteAbsencesBatch } from "@/features/teacher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AbsenceSessionResponse } from "@/features/teacher";
import { AbsenceEditRow } from "./absence-edit-row";
import { AbsenceReadOnlyRow } from "./absence-readonly-row";
import { AttendanceStatus, type AbsenceType } from "./types";
import type { LessonOption } from "./lesson-multi-select";
import { cn } from "@/lib/utils";

type AbsencesListProps = {
  absenceSession: AbsenceSessionResponse | null;
  isLoading: boolean;
  error: string | null;
  availableLessons: LessonOption[];
  academicYearId: number;
};

// Map AttendanceStatus to AbsenceType
const mapStatusToAbsenceType = (status: AttendanceStatus): AbsenceType => {
  switch (status) {
    case AttendanceStatus.Absent:
      return "absence";
    case AttendanceStatus.ExcusedAbsence:
      return "excused";
    case AttendanceStatus.Late:
      return "late";
    default:
      return "absence";
  }
};

// Map AbsenceType to AttendanceStatus
const mapAbsenceTypeToStatus = (type: AbsenceType): AttendanceStatus => {
  switch (type) {
    case "absence":
      return AttendanceStatus.Absent;
    case "excused":
      return AttendanceStatus.ExcusedAbsence;
    case "late":
      return AttendanceStatus.Late;
    default:
      return AttendanceStatus.Absent;
  }
};

type StudentEditState = {
  studentAcademicInfoId: number;
  selectedLessonIds: number[]; // Only valid lesson IDs
  orphanedLessonNames: string[]; // Names of lessons that no longer exist
  absenceType: AbsenceType;
  reason: string;
};

export function AbsencesList({
  absenceSession,
  isLoading,
  error,
  availableLessons,
  academicYearId,
}: AbsencesListProps) {
  const dispatch = useAppDispatch();
  const { updateAbsenceSessionState, deleteStudentAbsenceState } =
    useAppSelector((state) => state.teacher);
  const [editStates, setEditStates] = useState<Map<string, StudentEditState>>(
    new Map(),
  );

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    type: "save" | "delete";
    absenceIds?: number[];
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: "save",
    title: "",
    description: "",
  });

  const [pendingOperation, setPendingOperation] = useState<
    "save" | "delete" | null
  >(null);

  const [resultConfig, setResultConfig] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    description: "",
  });

  const hasChanges = useMemo(() => {
    if (!absenceSession) return false;

    const availableLessonIds = new Set(availableLessons.map((l) => l.lessonId));

    for (const student of absenceSession.students) {
      const rowKey = `${student.studentAcademicInfoId}-${student.status}`;
      const currentState = editStates.get(rowKey);
      if (!currentState) continue;

      // 1. Check status/type
      if (currentState.absenceType !== mapStatusToAbsenceType(student.status)) {
        return true;
      }

      // 2. Check reason
      const originalReason = student.lessons[0]?.reason || "";
      if (currentState.reason !== originalReason) {
        return true;
      }

      // 3. Check lessons
      const originalValidLessonIds = student.lessons
        .map((l) => l.lessonId)
        .filter((id) => availableLessonIds.has(id));

      if (
        originalValidLessonIds.length !== currentState.selectedLessonIds.length
      ) {
        return true;
      }

      const currentSelectedIds = new Set(currentState.selectedLessonIds);
      if (!originalValidLessonIds.every((id) => currentSelectedIds.has(id))) {
        return true;
      }
    }

    return false;
  }, [absenceSession, editStates, availableLessons]);

  // Monitor update result
  useEffect(() => {
    if (!updateAbsenceSessionState.isLoading && pendingOperation === "save") {
      if (updateAbsenceSessionState.error) {
        setResultConfig({
          isOpen: true,
          type: "error",
          title: "فشل الحفظ",
          description: updateAbsenceSessionState.error,
        });
      } else {
        setResultConfig({
          isOpen: true,
          type: "success",
          title: "تم الحفظ بنجاح",
          description: "تم تحديث سجلات الغياب بنجاح.",
        });
      }
      setPendingOperation(null);
    }
  }, [
    updateAbsenceSessionState.isLoading,
    updateAbsenceSessionState.error,
    pendingOperation,
  ]);

  // Monitor delete result
  useEffect(() => {
    if (!deleteStudentAbsenceState.isLoading && pendingOperation === "delete") {
      if (deleteStudentAbsenceState.error) {
        setResultConfig({
          isOpen: true,
          type: "error",
          title: "فشل الحذف",
          description: deleteStudentAbsenceState.error,
        });
      } else {
        setResultConfig({
          isOpen: true,
          type: "success",
          title: "تم الحذف بنجاح",
          description: "تم حذف سجل الغياب المختار بنجاح.",
        });
      }
      setPendingOperation(null);
    }
  }, [
    deleteStudentAbsenceState.isLoading,
    deleteStudentAbsenceState.error,
    pendingOperation,
  ]);

  // Initialize edit states when absenceSession changes
  useEffect(() => {
    if (absenceSession?.students) {
      const newStates = new Map<string, StudentEditState>();
      const availableLessonIds = new Set(
        availableLessons.map((l) => l.lessonId),
      );

      absenceSession.students.forEach((student) => {
        const allLessonIds = student.lessons.map((l) => l.lessonId);
        const stateKey = `${student.studentAcademicInfoId}-${student.status}`;

        // Separate valid and orphaned lessons
        const validLessonIds = allLessonIds.filter((id) =>
          availableLessonIds.has(id),
        );
        const orphanedLessonIds = allLessonIds.filter(
          (id) => !availableLessonIds.has(id),
        );

        // Get names of orphaned lessons from the original data
        const orphanedLessonNames = student.lessons
          .filter((l) => orphanedLessonIds.includes(l.lessonId))
          .map((l) => l.lessonName);

        newStates.set(stateKey, {
          studentAcademicInfoId: student.studentAcademicInfoId,
          selectedLessonIds: validLessonIds, // Only store valid IDs
          orphanedLessonNames, // Store orphaned lesson names for display
          absenceType: mapStatusToAbsenceType(student.status),
          reason: student.lessons[0]?.reason || "",
        });
      });

      setEditStates(newStates);
    }
  }, [absenceSession, availableLessons]);

  const handleLessonIdsChange = (rowKey: string, lessonIds: number[]) => {
    setEditStates((prev) => {
      const newStates = new Map(prev);
      const current = newStates.get(rowKey);
      if (current) {
        newStates.set(rowKey, {
          ...current,
          selectedLessonIds: lessonIds,
        });
      }
      return newStates;
    });
  };

  const handleTypeChange = (rowKey: string, type: AbsenceType) => {
    setEditStates((prev) => {
      const newStates = new Map(prev);
      const current = newStates.get(rowKey);
      if (current) {
        newStates.set(rowKey, {
          ...current,
          absenceType: type,
        });
      }
      return newStates;
    });
  };

  const handleReasonChange = (rowKey: string, reason: string) => {
    setEditStates((prev) => {
      const newStates = new Map(prev);
      const current = newStates.get(rowKey);
      if (current) {
        newStates.set(rowKey, {
          ...current,
          reason,
        });
      }
      return newStates;
    });
  };

  const handleSave = () => {
    setConfirmConfig({
      isOpen: true,
      type: "save",
      title: "تأكيد حفظ التعديلات",
      description: "هل أنت متأكد من رغبتك في حفظ التعديلات التي أجريتها؟",
    });
  };

  const executeSave = () => {
    if (!absenceSession) return;

    const studentsToUpdate = Array.from(editStates.values()).map((state) => ({
      studentAcademicInfoId: state.studentAcademicInfoId,
      listIdLessons: state.selectedLessonIds,
      status: mapAbsenceTypeToStatus(state.absenceType),
      reason: state.absenceType === "excused" ? state.reason : null,
    }));

    dispatch(
      updateAbsenceBatch({
        absenceSessionId: absenceSession.absenceSessionId,
        subjectId: absenceSession.subjectId,
        date: absenceSession.date,
        students: studentsToUpdate,
        academicYearId: academicYearId,
      }),
    );
    setPendingOperation("save");
  };

  const handleDelete = (rowKey: string) => {
    if (!absenceSession) return;

    // Extract studentId and status from rowKey
    const [studentIdStr, statusStr] = rowKey.split("-");
    const studentId = parseInt(studentIdStr);
    const status = parseInt(statusStr) as AttendanceStatus;

    // Find the current edit state for this row
    const editState = editStates.get(rowKey);

    // Find the student in the session
    const student = absenceSession.students.find(
      (s) => s.studentAcademicInfoId === studentId && s.status === status,
    );
    if (!student) return;

    let absenceIds: number[] = [];

    if (absenceSession.canEdit && editState) {
      // For editable mode, use selectedLessonIds
      absenceIds = student.lessons
        .filter((l) => editState.selectedLessonIds.includes(l.lessonId))
        .map((l) => l.id);
    } else {
      // For read-only mode, use all lessons in this row
      absenceIds = student.lessons.map((l) => l.id);
    }

    if (absenceIds.length === 0) return;

    setConfirmConfig({
      isOpen: true,
      type: "delete",
      absenceIds: absenceIds,
      title: "تأكيد حذف الغياب",
      description: `هل أنت متأكد من رغبتك في حذف غياب الطالب "${student.studentName}" للحصص المختارة؟`,
    });
  };

  const executeDelete = (absenceIds: number[]) => {
    if (!absenceSession) return;

    dispatch(
      deleteAbsencesBatch({
        absenceIds,
        academicYearId: academicYearId,
        subjectId: absenceSession.subjectId,
        date: absenceSession.date.split("T")[0],
      }),
    );
    setPendingOperation("delete");
  };

  return (
    <Card className="shadow-sm border-none md:border md:shadow-xs overflow-hidden rounded-xl">
      <CardHeader className="px-4 md:px-6 pt-4 pb-4 md:pb-6 text-right">
        <CardTitle className="text-lg md:text-xl font-bold text-blue-900 leading-tight">
          الغيابات المسجلة
        </CardTitle>
        <CardDescription className="text-blue-700/70 text-sm mt-1">
          {absenceSession
            ? `${new Date(absenceSession.date).toLocaleDateString("en-GB")}`
            : "اختر المادة والتاريخ لعرض الغيابات"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-blue-800">
                جاري تحميل البيانات...
              </p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 text-red-800">
            <div className="h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="text-center md:text-right">
              <p className="text-lg font-bold">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && !absenceSession && (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="h-12 w-12 mx-auto mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>اختر السنة الأكاديمية والمادة والتاريخ لعرض الغيابات</p>
          </div>
        )}

        {!isLoading &&
          !error &&
          absenceSession &&
          absenceSession.students.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="h-12 w-12 mx-auto mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>لا توجد غيابات مسجلة لهذا اليوم</p>
              <p className="text-sm mt-1">جميع الطلاب حاضرون</p>
            </div>
          )}

        {!isLoading &&
          !error &&
          absenceSession &&
          absenceSession.students.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                    عدد الغيابات: {absenceSession.absenceCount}
                  </span>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">
                    عدد الطلاب: {absenceSession.studentCount}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                <Table>
                  <TableBody>
                    {absenceSession.canEdit
                      ? // Editable rows when canEdit is true
                        absenceSession.students.map((student) => {
                          const rowKey = `${student.studentAcademicInfoId}-${student.status}`;
                          const editState = editStates.get(rowKey);
                          if (!editState) return null;

                          return (
                            <AbsenceEditRow
                              key={rowKey}
                              studentAcademicInfoId={
                                student.studentAcademicInfoId
                              }
                              studentName={student.studentName}
                              selectedLessonIds={editState.selectedLessonIds}
                              availableLessons={availableLessons.filter((l) =>
                                absenceSession?.canEdit ? l.isActive : true,
                              )}
                              orphanedLessonNames={
                                editState.orphanedLessonNames
                              }
                              absenceType={editState.absenceType}
                              reason={editState.reason}
                              onTypeChange={(type) =>
                                handleTypeChange(rowKey, type)
                              }
                              onReasonChange={(reason) =>
                                handleReasonChange(rowKey, reason)
                              }
                              onLessonIdsChange={(lessonIds) =>
                                handleLessonIdsChange(rowKey, lessonIds)
                              }
                              isDeleting={deleteStudentAbsenceState.isLoading}
                              onDelete={() => handleDelete(rowKey)}
                            />
                          );
                        })
                      : // Read-only rows when canEdit is false
                        absenceSession.students.map((student) => (
                          <AbsenceReadOnlyRow
                            key={`${student.studentAcademicInfoId}-${student.status}`}
                            studentName={student.studentName}
                            status={student.status}
                            lessons={student.lessons.map((l) => ({
                              lessonName: l.lessonName,
                              status: l.status,
                            }))}
                            reason={student.lessons[0]?.reason || null}
                          />
                        ))}
                  </TableBody>
                </Table>
              </div>

              {absenceSession.canEdit && (
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    onClick={handleSave}
                    disabled={
                      updateAbsenceSessionState.isLoading || !hasChanges
                    }
                    className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 transition-all font-bold min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateAbsenceSessionState.isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري الحفظ...</span>
                      </div>
                    ) : (
                      "حفظ التعديلات"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
      </CardContent>

      <AlertDialog
        open={confirmConfig.isOpen}
        onOpenChange={(open) =>
          setConfirmConfig((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent className="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              {confirmConfig.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {confirmConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              onClick={() => {
                if (confirmConfig.type === "save") {
                  executeSave();
                } else if (
                  confirmConfig.type === "delete" &&
                  confirmConfig.absenceIds
                ) {
                  executeDelete(confirmConfig.absenceIds);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              تأكيد
            </AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={resultConfig.isOpen}
        onOpenChange={(open) =>
          setResultConfig((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent className="rtl">
          <AlertDialogHeader>
            <div
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4",
                resultConfig.type === "success"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600",
              )}
            >
              {resultConfig.type === "success" ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <AlertDialogTitle className="text-center">
              {resultConfig.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center whitespace-pre-wrap">
              {resultConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-center mt-2">
            <AlertDialogAction
              onClick={() =>
                setResultConfig((prev) => ({ ...prev, isOpen: false }))
              }
              className={cn(
                "px-8 rounded-xl",
                resultConfig.type === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700",
              )}
            >
              موافق
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
