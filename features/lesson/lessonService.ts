import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import {
  CreateLessonDto,
  LessonResponse,
  WeekDayResponse,
} from "./lessonTypes";

const LESSONS_ENDPOINT = "Lessons";

export const lessonService = {
  /**
   * Get all lessons
   */
  async getAllLessons(): Promise<LessonResponse[]> {
    const response = await apiClient.get<ApiResponse<LessonResponse[]>>(
      `${LESSONS_ENDPOINT}`,
    );
    return response.data;
  },

  /**
   * Create a new lesson
   */
  async createLesson(dto: CreateLessonDto): Promise<LessonResponse> {
    const response = await apiClient.post<ApiResponse<LessonResponse>>(
      `${LESSONS_ENDPOINT}`,
      dto,
    );
    return response.data;
  },

  /**
   * Update an existing lesson
   */
  async updateLesson(
    id: number,
    dto: CreateLessonDto,
  ): Promise<LessonResponse> {
    const response = await apiClient.put<ApiResponse<LessonResponse>>(
      `${LESSONS_ENDPOINT}/${id}`,
      dto,
    );
    return response.data;
  },

  /**
   * Delete a lesson
   */
  async deleteLesson(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${LESSONS_ENDPOINT}/${id}`);
  },

  /**
   * Get all week days
   */
  async getAllDays(): Promise<WeekDayResponse[]> {
    const response = await apiClient.get<ApiResponse<WeekDayResponse[]>>(
      `${LESSONS_ENDPOINT}/GetAllDays`,
    );
    return response.data;
  },
};
