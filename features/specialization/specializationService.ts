import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import {
  SpecializationResponse,
  CreateSpecializationDto,
  MonthlyAbsencesResponse,
  SpecializationAbsencesParams,
  SpecializationInfoResponse,
} from "./specializationTypes";

const SPECIALIZATIONS_ENDPOINT = "Specializations";

export const specializationService = {
  /**
   * Get all specializations
   */
  async getAllSpecializations(): Promise<SpecializationResponse[]> {
    const response = await apiClient.get<ApiResponse<SpecializationResponse[]>>(
      SPECIALIZATIONS_ENDPOINT,
    );
    return response.data;
  },

  /**
   * Create a new specialization
   */
  async createSpecialization(
    data: CreateSpecializationDto,
  ): Promise<SpecializationResponse> {
    const response = await apiClient.post<ApiResponse<SpecializationResponse>>(
      SPECIALIZATIONS_ENDPOINT,
      data,
    );
    return response.data;
  },

  /**
   * Update a specialization
   */
  async updateSpecialization(data: {
    id: number;
    name: string;
    departmentId: number;
    yearsNumber: number;
  }): Promise<SpecializationResponse> {
    const response = await apiClient.put<ApiResponse<SpecializationResponse>>(
      `${SPECIALIZATIONS_ENDPOINT}/${data.id}`,
      {
        name: data.name,
        departmentId: data.departmentId,
        yearsNumber: data.yearsNumber,
      },
    );
    return response.data;
  },

  /**
   * Delete a specialization
   */
  async deleteSpecialization(data: {
    id: number;
    password: string;
  }): Promise<void> {
    await apiClient.delete(`${SPECIALIZATIONS_ENDPOINT}/${data.id}`, {
      data: { Password: data.password },
    });
  },

  /**
   * Get specializations for head of department
   */
  async getHeadOfDepartmentSpecializations(): Promise<
    SpecializationResponse[]
  > {
    const response = await apiClient.get<ApiResponse<SpecializationResponse[]>>(
      `${SPECIALIZATIONS_ENDPOINT}/head-of-department/specializations`,
    );
    return response.data;
  },

  /**
   * Get absences for a specialization
   */
  async getSpecializationAbsences(
    params: SpecializationAbsencesParams,
  ): Promise<MonthlyAbsencesResponse[]> {
    const { id, ...queryParams } = params;
    const response = await apiClient.get<
      ApiResponse<MonthlyAbsencesResponse[]>
    >(`${SPECIALIZATIONS_ENDPOINT}/${id}/absences`, {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Get info for a specialization
   */
  async getSpecializationInfo(
    id: number,
    studyYear: number = 1,
  ): Promise<SpecializationInfoResponse> {
    const response = await apiClient.get<ApiResponse<SpecializationInfoResponse>>(
      `${SPECIALIZATIONS_ENDPOINT}/${id}/info`,
      {
        params: { studyYear },
      },
    );
    return response.data;
  },
};
