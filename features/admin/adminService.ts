import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import { DetailedSubjectResponse } from "@/features/subject";
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  TeacherResponse,
  DepartmentResponse,
  ImportResponse,
  DepartmentHead,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  TeacherListResponse,
  SystemSettings,
} from "./adminTypes";

const TEACHER_ENDPOINT = "Users";
const DEPARTMENT_ENDPOINT = "Departments";

export const adminService = {
  /**
   * Get all departments
   */
  async getAllDepartments(): Promise<DepartmentResponse[]> {
    const response =
      await apiClient.get<ApiResponse<DepartmentResponse[]>>(
        DEPARTMENT_ENDPOINT,
      );
    return response.data;
  },
  /**
   * Get all teachers
   */
  async getAllTeachers(): Promise<TeacherResponse[]> {
    const response =
      await apiClient.get<ApiResponse<TeacherResponse[]>>(TEACHER_ENDPOINT);
    return response.data;
  },

  /**
   * Get a simplified list of teachers for selection
   */
  async getTeachersList(): Promise<TeacherListResponse[]> {
    const response = await apiClient.get<ApiResponse<TeacherListResponse[]>>(
      `${TEACHER_ENDPOINT}/Teachers`,
    );
    return response.data;
  },

  /**
   * Get a single teacher by ID
   */
  async getTeacherById(id: string): Promise<TeacherResponse> {
    const response = await apiClient.get<ApiResponse<TeacherResponse>>(
      `${TEACHER_ENDPOINT}/${id}`,
    );
    return response.data;
  },

  /**
   * Create a new teacher
   */
  async createTeacher(data: CreateTeacherDto): Promise<TeacherResponse> {
    const response = await apiClient.post<ApiResponse<TeacherResponse>>(
      TEACHER_ENDPOINT,
      data,
    );
    return response.data;
  },

  /**
   * Update an existing teacher
   */
  async updateTeacher(data: UpdateTeacherDto): Promise<TeacherResponse> {
    const { id, ...updateData } = data;
    const response = await apiClient.put<ApiResponse<TeacherResponse>>(
      `${TEACHER_ENDPOINT}/${id}`,
      updateData,
    );
    return response.data;
  },

  /**
   * Delete a teacher
   */
  async deleteTeacher(id: string): Promise<void> {
    await apiClient.delete(`${TEACHER_ENDPOINT}/${id}`);
  },

  /**
   * Import users from Excel data
   */
  async importUsers(users: CreateTeacherDto[]): Promise<ImportResponse> {
    const response = await apiClient.post<ApiResponse<ImportResponse>>(
      `${TEACHER_ENDPOINT}/Import`,
      users,
    );
    return response.data;
  },

  /**
   * Get all department heads
   */
  async getDepartmentHeads(): Promise<DepartmentHead[]> {
    const response = await apiClient.get<ApiResponse<DepartmentHead[]>>(
      `${TEACHER_ENDPOINT}/DepartmentHeads`,
    );
    return response.data;
  },

  /**
   * Create a new department
   */
  async createDepartment(
    data: CreateDepartmentDto,
  ): Promise<DepartmentResponse> {
    const response = await apiClient.post<ApiResponse<DepartmentResponse>>(
      DEPARTMENT_ENDPOINT,
      data,
    );
    return response.data;
  },

  /**
   * Update a department
   */
  async updateDepartment(
    data: UpdateDepartmentDto,
  ): Promise<DepartmentResponse> {
    const { id, ...updateData } = data;
    const response = await apiClient.put<ApiResponse<DepartmentResponse>>(
      `${DEPARTMENT_ENDPOINT}/${id}`,
      updateData,
    );
    return response.data;
  },

  /**
   * Delete a department
   */
  async deleteDepartment(data: {
    id: string;
    password: string;
  }): Promise<void> {
    await apiClient.delete(`${DEPARTMENT_ENDPOINT}/${data.id}`, {
      data: { Password: data.password },
    });
  },

  /**
   * Get system settings (AlertConfigurations)
   */
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await apiClient.get<ApiResponse<SystemSettings>>(
      "AlertConfigurations/latest",
    );
    return response.data;
  },

  /**
   * Update system settings (POST AlertConfigurations)
   */
  async updateSystemSettings(settings: SystemSettings): Promise<void> {
    const payload = {
      NumberOfWeeks: settings.numberOfWeeks,
      Percent2Hour: settings.percent2Hour,
      Percent3Hour: settings.percent3Hour,
      Percent4Hour: settings.percent4Hour,
      Percent5Hour: settings.percent5Hour,
      SecondWarningThreshold: settings.secondWarningThreshold,
      deprivationExtraAfterSecond: settings.deprivationExtraAfterSecond,
    };
    await apiClient.post("AlertConfigurations", payload);
  },

  /**
   * Get teacher's subjects and schedule for their last active semester
   */
  async getTeacherLastActiveSemester(
    teacherId: string,
  ): Promise<DetailedSubjectResponse[]> {
    const response = await apiClient.get<
      ApiResponse<DetailedSubjectResponse[]>
    >(`Subjects/TeacherLastActiveSemester/${teacherId}`);
    return response.data;
  },
};
