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

export interface SubjectLessonDto {
  lessonId: number;
  weekDayId: number;
}

export interface CreateSubjectDto {
  name: string;
  specializationId: number;
  semesterId: number;
  studyYear: number;
  teacherId: string;
  numberOfHours: number;
  lessons: SubjectLessonDto[];
}

export interface ScheduleDayResponse {
  weekDayId: number;
  name: string;
  nameEnglish: string;
  order: number;
  lessons: {
    isActive: boolean;
    lessonId: number;
    name: string;
  }[];
}

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
  schedule: ScheduleDayResponse[];
  enrolledStudentsCount: number;
}

export interface SubjectUpdateDto {
  name: string;
  teacherId: string;
  numberOfHours: number;
  lessons: SubjectLessonDto[];
}

export interface AcademicStatisticsParams {
  specializationId: number;
  academicYearId: number;
  semesterId: number;
  studyYear: number;
}

export interface AcademicStatisticsResponse {
  // totalStudents: number;
  // activeStudents: number;
  // inactiveStudents: number;
  yearsNumber: number;
  studentCountSpecialization: number;
  subjectCount: number;
  studentCount: number;
}
