import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import { SemestersResponse, StartSecondSemesterDto } from "./semesterTypes";

const SEMESTERS_ENDPOINT = "Semesters";

export const semesterService = {
  /**
   * Start second semester
   */
  async startSecondSemester(data: StartSecondSemesterDto): Promise<void> {
    await apiClient.post(`${SEMESTERS_ENDPOINT}/StartSecondSemester`, data);
  },

  /**
   * Get all semesters
   */
  async getAllSemesters(): Promise<SemestersResponse[]> {
    const response = await apiClient.get<ApiResponse<SemestersResponse[]>>(
      `${SEMESTERS_ENDPOINT}`,
    );
    return response.data;
  },

  /**
   * Delete a semester
   */
  async deleteSemester(id: number): Promise<void> {
    await apiClient.delete(`${SEMESTERS_ENDPOINT}/${id}`);
  },
};
