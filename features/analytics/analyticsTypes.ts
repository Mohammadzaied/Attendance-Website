export interface StudyYearAnalytics {
  yearNumber: number;
  totalActiveStudents: number;
  presentStudents: number;
  absentStudents: number;
  attendancePercentage: number;
  absencePercentage: number;
}

export interface SpecializationAnalytics {
  specializationId: number;
  specializationName: string;
  yearsNumber: number;
  studyYears: StudyYearAnalytics[];
  totalActiveStudents: number;
  presentStudents: number;
  absentStudents: number;
  attendancePercentage: number;
  absencePercentage: number;
}

export interface DepartmentAnalytics {
  departmentId: number;
  departmentName: string;
  totalActiveStudents: number;
  presentStudents: number;
  absentStudents: number;
  attendancePercentage: number;
  absencePercentage: number;
  specializations: SpecializationAnalytics[];
}

export interface OverallSummary {
  totalActiveStudents: number;
  presentStudents: number;
  absentStudents: number;
  attendancePercentage: number;
}

export interface AttendancePercentageResponse {
  semesterId: number;
  semesterName: string;
  academicYearId: number;
  academicYear: string;
  departmentCount: number;
  overallSummary: OverallSummary;
  departments: DepartmentAnalytics[];
}

export interface DepartmentHeadAnalyticsResponse {
  departmentId: number;
  departmentName: string;
  semesterId: number;
  semesterName: string;
  academicYearId?: number;
  academicYear?: string;
  totalActiveStudents: number;
  totalLecturers: number;
  totalExpectedSessions: number;
  totalAbsenceRecords: number;
  directAbsences: number;
  convertedLateAbsences: number;
  attendancePercentage: number;
  absencePercentage: number;
  specializations: SpecializationAnalytics[];
}

export interface DailyAttendanceAnalytics {
  dayOfWeek: string;
  totalActiveStudents: number;
  attendancePercentage: number;
  absencePercentage: number;
}
