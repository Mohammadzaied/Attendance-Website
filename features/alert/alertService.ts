import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import {
  AlertsByStudentParams,
  AlertsByStudentResponse,
  AlertRejectionDto,
  AlertApprovalDto,
} from "./alertTypes";

const ALERTS_ENDPOINT = "Alerts";

export const alertService = {
  /**
   * Get alerts grouped by student with filtering and pagination
   */
  async getAlertsByStudent(
    params: AlertsByStudentParams,
  ): Promise<AlertsByStudentResponse> {
    const queryParams = new URLSearchParams();
    if (params.academicYearId)
      queryParams.append("academicYearId", params.academicYearId.toString());
    if (params.semesterId)
      queryParams.append("semesterId", params.semesterId.toString());
    if (params.status) queryParams.append("status", params.status.toString());
    if (params.type) queryParams.append("type", params.type.toString());
    if (params.studentName)
      queryParams.append("studentName", params.studentName);
    if (params.departmentName)
      queryParams.append("departmentName", params.departmentName);
    if (params.pageNumber)
      queryParams.append("pageNumber", params.pageNumber.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());

    const response = await apiClient.get<ApiResponse<AlertsByStudentResponse>>(
      `${ALERTS_ENDPOINT}/AlertsByStudent?${queryParams.toString()}`,
    );
    return response.data;
  },

  async rejectAlerts(models: AlertRejectionDto[]): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `${ALERTS_ENDPOINT}/Reject/Bulk`,
      models,
    );
    return response.data;
  },

  async approveAlerts(models: AlertApprovalDto[]): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `${ALERTS_ENDPOINT}/Approve/Bulk`,
      models,
    );
    return response.data;
  },
};
