import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import {
  CreateAndEnrollStudentDto,
  CreateStudentDto,
  EmailUpdateDto,
  ImportStudentDto,
  PromoteStudentsDto,
  StudentEnrollmentItem,
  SemesterEnrollmentsResponse,
  StudentProfileResponse,
  AdminAllSubjectsResponse,
  StudentResponse,
  StudentSubjectsResponse,
  StudentAlertsBySubject,
  UpdateStudentDto,
  GraduationStatusResponse,
  StudentAlertsBySubjectV2,
} from "./studentTypes";
import { StudentAbsenceGroupByDateResponse } from "@/features/teacher/teacherTypes";
import {
  AcademicStatisticsParams,
  AcademicStatisticsResponse,
} from "@/features/subject";

const STUDENTS_ENDPOINT = "Students";

export const studentService = {
  /**
   * Get all students
   */
  async getAllStudents(): Promise<StudentResponse[]> {
    const response =
      await apiClient.get<ApiResponse<StudentResponse[]>>(STUDENTS_ENDPOINT);
    return response.data;
  },

  /**
   * Create a new student
   */
  async createStudent(data: CreateStudentDto): Promise<StudentResponse> {
    const response = await apiClient.post<ApiResponse<StudentResponse>>(
      STUDENTS_ENDPOINT,
      data,
    );
    return response.data;
  },

  /**
   * Update a student (includes transfer logic)
   */
  async updateStudent(
    id: number,
    data: UpdateStudentDto,
  ): Promise<StudentResponse> {
    const response = await apiClient.put<ApiResponse<StudentResponse>>(
      `${STUDENTS_ENDPOINT}/EditStudent/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete a student
   */
  async deleteStudent(id: number): Promise<void> {
    await apiClient.delete(`${STUDENTS_ENDPOINT}/${id}`);
  },

  /**
   * Import students (bulk create and enroll)
   */
  async importStudents(data: ImportStudentDto[]): Promise<void> {
    await apiClient.post(`${STUDENTS_ENDPOINT}/create-and-enroll-batch`, data);
  },

  /**
   * Create and enroll a single student
   */
  async createAndEnrollStudent(
    data: CreateAndEnrollStudentDto,
  ): Promise<StudentEnrollmentItem> {
    const response = await apiClient.post<ApiResponse<StudentEnrollmentItem>>(
      `${STUDENTS_ENDPOINT}/create-and-enroll`,
      data,
    );
    return response.data;
  },

  /**
   * Bulk update student emails
   */
  async bulkUpdateStudentEmails(data: EmailUpdateDto[]): Promise<void> {
    await apiClient.put(`${STUDENTS_ENDPOINT}/username-batch`, data);
  },

  /**
   * Get enrollments by program year
   */
  async getEnrollmentsBySemster(
    semesterId: number,
    specializationId: number,
    studyYear: number,
  ): Promise<SemesterEnrollmentsResponse> {
    const response = await apiClient.get<
      ApiResponse<SemesterEnrollmentsResponse>
    >(
      `${STUDENTS_ENDPOINT}/by-semester/${semesterId}?specializationId=${specializationId}&studyYear=${studyYear}`,
    );
    return response.data;
  },

  /**
   * Get academic statistics (student and subject counts)
   */
  async getAcademicStatistics(
    params: AcademicStatisticsParams,
  ): Promise<AcademicStatisticsResponse> {
    const response = await apiClient.get<
      ApiResponse<AcademicStatisticsResponse>
    >(
      `${STUDENTS_ENDPOINT}/Statistics/Count?SpecializationId=${params.specializationId}&SemesterId=${params.semesterId}&StudyYear=${params.studyYear}&AcademicYearId=${params.academicYearId}`,
    );
    return response.data;
  },

  /**
   * Promote students
   */
  async promoteStudents(data: PromoteStudentsDto): Promise<void> {
    await apiClient.post(`${STUDENTS_ENDPOINT}/promote`, data);
  },

  /**
   * Get student subjects with absence statistics
   */
  async getStudentSubjects(
    academicYearId: number,
    semesterId: number,
    studentId: number,
  ): Promise<StudentSubjectsResponse> {
    const response = await apiClient.get<ApiResponse<StudentSubjectsResponse>>(
      `Subjects/ByStudent?academicYearId=${academicYearId}&semesterId=${semesterId}&studentId=${studentId}`,
    );
    return response.data;
  },

  /**
   * Get student profile details
   */
  async getStudentProfile(studentId?: number): Promise<StudentProfileResponse> {
    const url = studentId
      ? `${STUDENTS_ENDPOINT}/${studentId}/Profile`
      : `${STUDENTS_ENDPOINT}/StudentProfile`;
    const response =
      await apiClient.get<ApiResponse<StudentProfileResponse>>(url);
    return response.data;
  },

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
      `Absences/Student/${studentAcademicInfoId}/Subject/${subjectId}/GroupByDate`,
    );
    return response.data;
  },

  /**
   * Get student alerts/warnings
   */
  async getStudentAlerts(
    academicYearId: number,
    semesterId: number,
    studentId: number,
  ): Promise<StudentAlertsBySubject[]> {
    const response = await apiClient.get<ApiResponse<StudentAlertsBySubject[]>>(
      `Alerts/Student?academicYearId=${academicYearId}&semesterId=${semesterId}&studentId=${studentId}`,
    );
    return response.data;
  },

  /**
   * Get students by graduation status (paginated)
   */
  async getStudentsByGraduationStatus(
    isGraduated: boolean = false,
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm: string | null = null,
    departmentId: number | null = null,
  ): Promise<GraduationStatusResponse> {
    const params = new URLSearchParams({
      isGraduated: isGraduated.toString(),
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (departmentId) params.append("departmentId", departmentId.toString());

    const response = await apiClient.get<ApiResponse<GraduationStatusResponse>>(
      `${STUDENTS_ENDPOINT}/by-graduation-status?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get all subjects for a student grouped by specialization and academic info
   */
  async getAdminAllSubjectsByStudent(
    academicYearId: number,
    semesterId: number,
    studentId: number,
  ): Promise<AdminAllSubjectsResponse> {
    const response = await apiClient.get<ApiResponse<AdminAllSubjectsResponse>>(
      `Subjects/AdminAllSubjectsByStudent?academicYearId=${academicYearId}&semesterId=${semesterId}&studentId=${studentId}`,
    );
    return response.data;
  },

  /**
   * Get student alerts unified (grouped by subject and type)
   */
  async getStudentAlertsUnified(
    studentId: number,
  ): Promise<StudentAlertsBySubjectV2[]> {
    const response = await apiClient.get<
      ApiResponse<StudentAlertsBySubjectV2[]>
    >(`Alerts/StudentAlerts/${studentId}`);
    return response.data;
  },
};
