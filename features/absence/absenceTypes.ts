import { AttendanceStatus } from "@/components/teacher/types";

// export interface DeleteAbsencesDto {
//   absenceIds: number[];
// }

export interface EditAbsenceStatusDto {
  status: number;
  reason?: string | null;
}
