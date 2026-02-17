import { DetailedSubjectResponse } from "@/features/subject/subjectTypes";
import { AcademicYear } from "@/features/academicYear/academicYearTypes";
import { AttendanceStatus } from "@/components/teacher/types";

export type AbsenceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  section: string;
  count: number;
  type: "absence" | "late" | "excused";
  isExcused: boolean;
  reason?: string;
  recordedBy: string;
};

// Subject Students Response Types
export interface SubjectStudentItem {
  studentId: number;
  fullName: string;
  username: string | null;
  userId: number;
  studentAcademicInfoId: number;
  enrolledAt: string;
}

export interface SubjectStudentsResponse {
  subjectId: number;
  subjectName: string;
  semesterId: number;
  specializationId: number;
  studyYear: number;
  students: SubjectStudentItem[];
  totalStudents: number;
}

export interface StudentAttendanceItem {
  studentAcademicInfoId: number;
  status: AttendanceStatus;
  reason?: string | null;
  ListIdLessons: number[];
}

export interface BatchAttendanceCreateDto {
  students: StudentAttendanceItem[];
  subjectId: number;
  date: string;
}

export interface ServerTime {
  currentHebronTime: string;
  formattedTime: string;
  date: string;
  time: string;
  dayOfWeek: string;
}

// Absence Session Response Types
export interface LessonAbsenceItem {
  id: number;
  subjectLessonId: number;
  lessonId: number;
  lessonName: string;
  status: AttendanceStatus;
  reason: string | null;
  date: string;
  createdAt: string;
}

export interface StudentAbsenceItem {
  studentAcademicInfoId: number;
  studentName: string;
  status: AttendanceStatus;
  absenceCount: number;
  lessons: LessonAbsenceItem[];
}

export interface AbsenceSessionResponse {
  absenceSessionId: number;
  teacherId: number;
  subjectId: number;
  subjectName: string;
  date: string;
  createdAt: string;
  absenceCount: number;
  studentCount: number;
  canEdit: boolean;
  students: StudentAbsenceItem[];
}

export interface BulkStudentAbsenceItem {
  studentAcademicInfoId: number;
  listIdLessons: number[];
  status: AttendanceStatus;
  reason: string | null;
}

export interface BulkAbsencesEditDto {
  absenceSessionId: number;
  students: BulkStudentAbsenceItem[];
  academicYearId: number;
  subjectId: number;
  date: string;
}

export interface DeleteAbsencesDto {
  absenceIds: number[];
}

export interface EditAbsenceStatusDto {
  status: string;
  reason?: string | null;
}

// Student Absences by Subject Response Types
export interface StudentAbsenceLessonItem {
  id: number;
  subjectLessonId: number;
  lessonId: number;
  lessonNumber: number;
  lessonName: string;
  dayName: string;
  status: string;
  statusValue: number;
  reason: string | null;
  createdAt: string;
}

export interface StudentAbsenceGroupItem {
  date: string;
  status: string;
  statusValue: number;
  absenceCount: number;
  lessons: StudentAbsenceLessonItem[];
}

export interface StudentAbsencesBySubjectResponse {
  studentAcademicInfoId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  totalAbsences: number;
  adjustedTotalAbsences: number;
  absencesByStatus: Record<string, number>;
  absences: StudentAbsenceGroupItem[];
}

export interface AbsenceByDateItem {
  date: string;
  dayOfWeek: string;
  totalAbsencesOnDate: number;
  absencesByStatusOnDate: Record<string, number>;
  lessons: StudentAbsenceLessonItem[];
}

export interface StudentAbsenceGroupByDateResponse {
  studentAcademicInfoId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  totalAbsences: number;
  adjustedTotalAbsences: number;
  absencesByStatus: Record<string, number>;
  totalDaysWithAbsences: number;
  absencesByDate: AbsenceByDateItem[];
}

export interface StudentAbsenceStats {
  absentCount: number;
  lateCount: number;
  excusedAbsenceCount: number;
  totalAbsenceWithoutExcuse: number;
}

export interface StudentWithAbsenceDataItem {
  studentId: number;
  fullName: string;
  absenceStats: StudentAbsenceStats;
  hasApprovedDeprivationAlert: boolean;
  hasFirstAlert: boolean;
  hasSecondAlert: boolean;
}

export interface SubjectAbsenceDataResponse {
  subjectId: number;
  subjectName: string;
  specializationName: string;
  students: StudentWithAbsenceDataItem[];
  totalStudents: number;
}

export interface TeacherState {
  activeAcademicYears: AcademicYear[];
  allAcademicYears: AcademicYear[];
  subjects: DetailedSubjectResponse[];
  students: SubjectStudentItem[];
  subjectName: string;
  absences: AbsenceRecord[];
  absenceSession: AbsenceSessionResponse | null;
  subjectAbsenceData: SubjectAbsenceDataResponse | null;
  serverTime: ServerTime | null;
  favoriteLessonIds: number[];
  fetchActiveAcademicYearsState: {
    isLoading: boolean;
    error: string | null;
  };
  fetchAllAcademicYearsState: {
    isLoading: boolean;
    error: string | null;
  };
  fetchSubjectsState: {
    isLoading: boolean;
    error: string | null;
  };
  fetchStudentsState: {
    isLoading: boolean;
    error: string | null;
  };
  fetchServerTimeState: {
    isLoading: boolean;
    error: string | null;
  };
  submitAttendanceState: {
    isLoading: boolean;
    error: string | null;
  };
  fetchAbsenceSessionState: {
    isLoading: boolean;
    error: string | null;
  };
  fetchSubjectAbsenceDataState: {
    isLoading: boolean;
    error: string | null;
  };
  updateAbsenceSessionState: {
    isLoading: boolean;
    error: string | null;
  };
  deleteStudentAbsenceState: {
    isLoading: boolean;
    error: string | null;
    deletingId: number | null;
  };
  fetchFavoriteLessonsState: {
    isLoading: boolean;
    error: string | null;
  };
}
