import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import {
  SpecializationResponse,
  CreateSpecializationDto,
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
};
