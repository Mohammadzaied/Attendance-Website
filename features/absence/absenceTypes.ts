import { AttendanceStatus } from "@/components/teacher/types";

// export interface DeleteAbsencesDto {
//   absenceIds: number[];
// }

export interface EditAbsenceStatusDto {
  status: number;
  reason?: string | null;
}

export interface ExcuseAbsencesDto {
  studentAcademicInfoId: number;
  date: string;
  reason?: string | null;
}

export interface ExcuseAbsenceSubjectDetail {
  subjectId: number;
  subjectName: string;
  convertedAbsencesCount: number;
  lessons: {
    id: number;
    lessonId: number;
    lessonName: string;
    oldStatus: string;
    newStatus: string;
    reason: string | null;
  }[];
}

export interface ExcuseAbsencesResponse {
  studentName: string;
  date: string;
  totalExcusedAbsencesCount: number;
  totalSubjectsAffected: number;
  subjectDetails: ExcuseAbsenceSubjectDetail[];
}

export interface CreateAbsenceSessionDto {
  subjectId: number;
  date: string;
  lessonIds?: number[] | null;
}
