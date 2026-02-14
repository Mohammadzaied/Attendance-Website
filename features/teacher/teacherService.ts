import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import { DetailedSubjectResponse } from "@/features/subject/subjectTypes";
import {
  AbsenceSessionResponse,
  BatchAttendanceCreateDto,
  BulkAbsencesEditDto,
  DeleteAbsencesDto,
  SubjectStudentsResponse,
  SubjectAbsenceDataResponse,
} from "./teacherTypes";

const SUBJECTS_ENDPOINT = "Subjects";
const ABSENCES_ENDPOINT = "Absences";

export const teacherService = {
  /**
   * Fetch subjects assigned to the logged-in teacher
   */
  async getSubjectsByTeacher(
    academicYearId: number,
  ): Promise<DetailedSubjectResponse[]> {
    const response = await apiClient.get<
      ApiResponse<DetailedSubjectResponse[]>
    >(`${SUBJECTS_ENDPOINT}/ByTeacher?academicYearId=${academicYearId}`);
    return response.data;
  },

  /**
   * Fetch students enrolled in a specific subject
   */
  async getSubjectStudents(
    subjectId: number,
  ): Promise<SubjectStudentsResponse> {
    const response = await apiClient.get<ApiResponse<SubjectStudentsResponse>>(
      `${SUBJECTS_ENDPOINT}/${subjectId}/students`,
    );
    return response.data;
  },

  /**
   * Submit batch attendance
   */
  async submitBatchAttendance(data: BatchAttendanceCreateDto): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${ABSENCES_ENDPOINT}/Batch`, data);
  },

  /**
   * Get current time from server
   */
  async getServerTime(): Promise<{
    currentHebronTime: string;
    formattedTime: string;
    date: string;
    time: string;
    dayOfWeek: string;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        currentHebronTime: string;
        formattedTime: string;
        date: string;
        time: string;
        dayOfWeek: string;
      }>
    >(`TimeZone/current`);
    return response.data;
  },

  /**
   * Get absence session by subject ID with date and academic year filters
   */
  async getAbsenceSession(
    subjectId: number,
    date: string,
    academicYearId: number,
  ): Promise<AbsenceSessionResponse> {
    const response = await apiClient.get<ApiResponse<AbsenceSessionResponse>>(
      `${ABSENCES_ENDPOINT}/Session/${subjectId}?date=${date}&academicYearId=${academicYearId}`,
    );
    return response.data;
  },

  async updateAbsenceBatch(data: BulkAbsencesEditDto): Promise<any> {
    const response = await apiClient.put<ApiResponse<any>>(
      `${ABSENCES_ENDPOINT}/Batch`,
      data,
    );
    return response.data;
  },

  async deleteAbsencesBatch(data: DeleteAbsencesDto): Promise<any> {
    const response = await apiClient.delete<ApiResponse<any>>(
      `${ABSENCES_ENDPOINT}/Batch`,
      { data },
    );
    return response.data;
  },

  /**
   * Get student absences for a specific subject
   */
  async getStudentAbsencesBySubject(
    studentAcademicInfoId: number,
    subjectId: number,
  ): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(
      `${ABSENCES_ENDPOINT}/Student/${studentAcademicInfoId}/Subject/${subjectId}`,
    );
    return response.data;
  },

  /**
   * Get all students with their absence data for a specific subject
   */
  async getSubjectStudentsWithAbsenceData(
    subjectId: number,
  ): Promise<SubjectAbsenceDataResponse> {
    const response = await apiClient.get<
      ApiResponse<SubjectAbsenceDataResponse>
    >(`${SUBJECTS_ENDPOINT}/${subjectId}/StudentsWithAbsenceData`);
    return response.data;
  },
};
