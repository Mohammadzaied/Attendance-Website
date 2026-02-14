import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import { CreateSubjectDto, DetailedSubjectResponse } from "./subjectTypes";

const SUBJECTS_ENDPOINT = "Subjects";

export const subjectService = {
  /**
   * Create a new subject
   */
  async createSubject(data: CreateSubjectDto): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `${SUBJECTS_ENDPOINT}`,
      data,
    );
    return response.data;
  },

  /**
   * Get subjects by specialization, semester, and study year
   */
  async getSubjectsBySpecialization(params: {
    specializationId: number;
    semesterId: number;
    studyYear: number;
  }): Promise<DetailedSubjectResponse[]> {
    const response = await apiClient.get<
      ApiResponse<DetailedSubjectResponse[]>
    >(`${SUBJECTS_ENDPOINT}/SubjectsBySpecialization`, { params });
    return response.data;
  },

  /**
   * Update a subject
   */
  async updateSubject(id: number, data: any): Promise<any> {
    const response = await apiClient.put<ApiResponse<any>>(
      `${SUBJECTS_ENDPOINT}/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete a subject
   */
  async deleteSubject(id: number): Promise<void> {
    await apiClient.delete(`${SUBJECTS_ENDPOINT}/${id}`);
  },
};
