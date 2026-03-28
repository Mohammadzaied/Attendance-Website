import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import { AttendancePercentageResponse, DepartmentHeadAnalyticsResponse, DailyAttendanceAnalytics } from "./analyticsTypes";

export const analyticsService = {
  /**
   * Fetches the attendance percentage statistics grouped by department and specialization.
   */
  async getAttendancePercentageByDepartment(): Promise<AttendancePercentageResponse> {
    const response = await apiClient.get<ApiResponse<AttendancePercentageResponse>>(
      "Absences/AttendancePercentageByDepartment"
    );
    // Accommodate generic ApiResponse wrapper where the data is in response.data
    return response.data;
  },

  /**
   * Fetches the attendance statistics grouped explicitly for the Department Head's logged-in department
   */
  async getAttendancePercentageByMyDepartment(): Promise<DepartmentHeadAnalyticsResponse> {
    const response = await apiClient.get<ApiResponse<DepartmentHeadAnalyticsResponse>>(
      "Absences/AttendancePercentageByDepartment/MyDepartment"
    );
    return response.data;
  },

  /**
   * Fetches the daily overall attendance statistics filtered uniquely by date
   */
  async getDailyAttendancePercentage(date: string): Promise<DailyAttendanceAnalytics> {
    const response = await apiClient.get<ApiResponse<DailyAttendanceAnalytics>>(
      `Absences/AttendancePercentage?date=${date}`
    );
    return response.data;
  },
};
