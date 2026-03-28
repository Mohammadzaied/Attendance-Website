import { MajorStudent } from "@/features/student/studentTypes";

export type MajorStatus = "active" | "inactive";

export interface Subject {
  id: string;
  name: string;
  teacherId?: string;
  teacherName?: string;
  credits: number;
}

export interface StudyYear {
  id: string;
  semesterId: number;
  yearName: string;
  subjects: Subject[];
  students: MajorStudent[];
  academicYearId?: number;
  studyYear: number;
}

export interface LessonResponse {
  lessonId: number;
  name: string;
}

export interface WeekDayResponse {
  weekDayId: number;
  name: string;
}

export interface CreateSubjectDto {
  name: string;
  specializationId: number;
  semesterId: number;
  studyYear: number;
  teacherId: string;
  numberOfHours: number;
}

export interface CreateSubjectToTeacherDto {
  name: string;
  specializationId: number;
  studyYear: number;
  teacherId: string;
  numberOfHours: number;
}

// export interface ScheduleDayResponse {
//   weekDayId: number;
//   name: string;
//   nameEnglish: string;
//   order: number;
//   lessons: {
//     isActive: boolean;
//     lessonId: number;
//     name: string;
//   }[];
// }

export interface DetailedSubjectResponse {
  subjectId: number;
  name: string;
  teacherId: string;
  teacherName: string;
  numberOfHours: number;
  specializationId: number;
  specializationName: string;
  departmentId: number;
  departmentName: string;
  semesterId: number;
  semesterName: string;
  semesterNumber: number;
  academicYearId: number;
  academicYear: number;
  studyYear: number;
  createdAt: string;
  // schedule: ScheduleDayResponse[];
  enrolledStudentsCount: number;
}

export interface SubjectUpdateDto {
  name: string;
  teacherId: string;
  numberOfHours: number;
}

export interface AcademicStatisticsParams {
  specializationId: number;
  academicYearId: number;
  semesterId: number;
  studyYear: number;
}

export interface AcademicStatisticsResponse {
  yearsNumber: number;
  studentCountSpecialization: number;
  subjectCount: number;
  studentCount: number;
  audiencePercent: number;
}
