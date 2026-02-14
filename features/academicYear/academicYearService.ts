import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import {
  AcademicYear,
  AcademicYearResponse,
  CreateAcademicYearDto,
} from "./academicYearTypes";

const ACADEMIC_YEARS_ENDPOINT = "AcademicYears";

export const academicYearService = {
  /**
   * Fetch active academic years
   */
  async getActiveAcademicYears(): Promise<AcademicYear[]> {
    const response = await apiClient.get<ApiResponse<AcademicYear[]>>(
      `${ACADEMIC_YEARS_ENDPOINT}/ActiveYears`,
    );
    return response.data;
  },

  /**
   * Get all academic years
   */
  async getAllAcademicYears(): Promise<AcademicYearResponse[]> {
    const response = await apiClient.get<ApiResponse<AcademicYearResponse[]>>(
      ACADEMIC_YEARS_ENDPOINT,
    );
    return response.data;
  },

  /**
   * Create a new academic year
   */
  async createAcademicYear(
    data: CreateAcademicYearDto,
  ): Promise<AcademicYearResponse> {
    const response = await apiClient.post<ApiResponse<AcademicYearResponse>>(
      ACADEMIC_YEARS_ENDPOINT,
      data,
    );
    return response.data;
  },

  /**
   * Delete an academic year
   */
  async deleteAcademicYear(data: {
    id: number;
    password: string;
  }): Promise<void> {
    await apiClient.delete(`${ACADEMIC_YEARS_ENDPOINT}/${data.id}`, {
      data: { Password: data.password },
    });
  },
};
