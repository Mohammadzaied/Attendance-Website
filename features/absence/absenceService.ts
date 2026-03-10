import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import { StudentAbsenceGroupByDateResponse } from "@/features/teacher/teacherTypes";
import { EditAbsenceStatusDto, ExcuseAbsencesDto, ExcuseAbsencesResponse } from "./absenceTypes";

const ABSENCES_ENDPOINT = "Absences";

export const absenceService = {
  /**
   * Get detailed absence records for a student in a specific subject
   */
  async getStudentAbsencesBySubject(
    studentAcademicInfoId: number,
    subjectId: number,
  ): Promise<StudentAbsenceGroupByDateResponse> {
    const response = await apiClient.get<
      ApiResponse<StudentAbsenceGroupByDateResponse>
    >(
      `${ABSENCES_ENDPOINT}/Student/${studentAcademicInfoId}/Subject/${subjectId}/GroupByDate`,
    );
    return response.data;
  },

  /**
   * Delete absences batch
   */
  async deleteAbsencesBatch(absenceId: number): Promise<void> {
    await apiClient.delete(`${ABSENCES_ENDPOINT}/${absenceId}/Delete`);
  },

  /**
   * Edit individual absence status
   */
  async editAbsenceStatus(
    absenceId: number,
    data: EditAbsenceStatusDto,
  ): Promise<void> {
    await apiClient.put(`${ABSENCES_ENDPOINT}/${absenceId}/Status`, data);
  },

  /**
   * Bulk excuse absences by date
   */
  async excuseAbsences(data: ExcuseAbsencesDto): Promise<ExcuseAbsencesResponse> {
    const response = await apiClient.post<ApiResponse<ExcuseAbsencesResponse>>(
      `${ABSENCES_ENDPOINT}/ExcuseAbsences`,
      data,
    );
    return response.data;
  },
};
