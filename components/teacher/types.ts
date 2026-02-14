export type AbsenceType = "absence" | "late" | "excused";
export type AbsenceTypeMap = { [key: string]: AbsenceType };
export type ReasonMap = { [key: string]: string };
export type AbsenceCountMap = { [key: string]: string };
export type LessonIdMap = { [key: string]: number[] }; // Maps studentId to array of lessonIds
// Attendance API Types
export enum AttendanceStatus {
  Absent = 1,
  ExcusedAbsence = 2,
  Late = 3,
}
