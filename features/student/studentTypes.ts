export interface MajorStudent {
  studentId: number;
  fullName: string;
  username: string | null;
  id?: number; // Alias for studentId
  name?: string; // Alias for fullName
  email?: string;
  studentNumber?: string;
}

export type Warning = {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  department: string;
  section: string;
  warningText: string;
  sentBy: string;
  sentByEmail: string;
  date: string;
  severity: "low" | "medium" | "high";
  isRead: boolean;
};

export type Student = {
  id: string;
  name: string;
  studentNumber: string;
  department: string;
  section: string;
  level: string;
  absenceCount: number;
  attendanceRate: number;
};

export interface StudentResponse {
  studentId: number;
  fullName: string;
  username: string;
  departmentId: number;
  departmentName: string;
  specializationId: number;
  specializationName: string;
  createdAt: string;
}

export interface CreateStudentDto {
  fullName: string;
  departmentId: number;
  specializationId: number;
  username: string;
  academicYearId: number;
}

export interface CreateAndEnrollStudentDto {
  fullName: string;
  departmentId: number;
  specializationId: number;
  username?: string;
  semesterId: number;
  studyYear: number; // 1 or 2
}

export interface UpdateStudentDto {
  fullName: string;
  username?: string;
  password?: string;
  departmentId: number;
  specializationId: number;
  semesterId: number;
  studyYear: number;
}

export interface StudentEnrollmentItem {
  studentId: number;
  fullName: string;
  username: string | null;
  userId: number | null;
  departmentId: number;
  departmentName: string | null;
  specializationId: number;
  specializationName: string | null;
  createdAt: string;
}

export interface SemesterEnrollmentsResponse {
  canEdit: boolean;
  items: StudentEnrollmentItem[];
}

export interface CreateStudentEnrollmentDto {
  studentId: number;
  programYearId: number;
}

export interface StudentProfileResponse {
  fullName: string;
  username: string;
  studentId: number;
  studentAcademicInfoId: number;
  specializationId: number;
  specializationName: string;
  semesterId: number;
  semesterName: string;
  academicYearId: number;
  academicYear: number;
  studyYear: number;
  isGraduated: boolean;
  academicYears: Array<{
    academicYearId: number;
    year: number;
  }>;
  semesters: Array<{
    semesterId: number;
    name: string;
    academicYearId: number;
  }>;
}

export interface BulkStudentEmailUpdateDto {
  studentId: number;
  newEmail: string;
}

export interface PromoteStudentsDto {
  // studentIds: number[];
  academicYearId: number;
  adminPassword: string;
}

export interface StudentSubjectsResponse {
  studentId: number;
  studentAcademicInfoId: number;
  subjects: Array<{
    subjectId: number;
    subjectName: string;
    teachers: Array<{ userId: string; fullName: string }>;
    totalAbsences: number;
    lateCount: number;
    excusedCount: number;
    attendancePercentage: number;
  }>;
}

export interface StudentAlertsBySubject {
  subjectId: number;
  subjectName: string;
  teachers: Array<{ userId: string; fullName: string }>;
  alerts: Array<{
    id: number;
    status: number;
    type: string;
    message: string;
    date: string;
    severity: "low" | "medium" | "high";
    absenceCountAtIssue: number;
    limitAtIssue: number;
    isExtended: boolean;
    extensionExtraClasses?: number;
    newLimitAfterExtension?: number;
    adminReviewedAt?: string;
    createdAt: string;
  }>;
}

export interface GraduationStatusResponse {
  students: StudentGraduationDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface StudentGraduationDto {
  studentId: number;
  fullName: string;
  username: string | null;
  enrollments: {
    specializationName: string;
    studyYear: number;
    semesterName: string;
    semesterId: number;
    // isActive: boolean;
    departmentId: number;
    departmentName: string;
    specializationId: number;
  };
}

export interface UnifiedAlertItem {
  id: number;
  studentId: number;
  studentName: string;
  studentAcademicInfoId: number;
  subjectId: number;
  subjectName: string;
  alertType: number;
  status: number;
  absenceCountAtIssue: number;
  limitAtIssue: number;
  percentAtIssue: number;
  isExtended: boolean;
  extensionExtraClasses: number | null;
  newLimitAfterExtension: number | null;
  adminRejectionReason: string | null;
  createdAt: string;
  createdByName: string;
  adminReviewedAt: string | null;
  adminReviewedBy: number | null;
  previousAlertId: number | null;
}

export interface StudentAlertsByTypeV2 {
  alertType: string;
  alerts: UnifiedAlertItem[];
}

export interface StudentAlertsBySubjectV2 {
  subjectId: number;
  subjectName: string;
  numberOfHours: number;

  alertsByType: StudentAlertsByTypeV2[];
}

export interface AdminAllSubjectsResponse {
  specializations: Array<{
    specializationId: number;
    specializationName: string;
    studentAcademicInfos: Array<{
      studentAcademicInfoId: number;
      semesterId: number;
      semesterName: string;
      subjects: Array<{
        subjectId: number;
        subjectName: string;
        teachers: Array<{ userId: string; fullName: string }>;
        numberOfHours: number;
      }>;
    }>;
  }>;
}

export interface EmailUpdateDto {
  studentId: number;
  fullName?: string;
  username: string;
}

export interface ImportStudentDto {
  fullName: string;
  username?: string;
  departmentId: number;
  specializationId: number;
  academicYearId: number;
  semesterId: number;
  studyYear: number;
}
