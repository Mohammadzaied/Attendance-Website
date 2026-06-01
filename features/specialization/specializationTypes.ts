export interface SpecializationResponse {
  specializationId: number;
  name: string;
  departmentId: number;
  departmentName: string;
  yearsNumber: number;
  studentCount?: number;
}

export interface ApiSpecialization {
  SpecializationId: number;
  Name: string;
  DepartmentId: number;
  DepartmentName: string;
  YearsNumber: number;
  StudentCount: number;
}

export interface CreateSpecializationDto {
  name: string;
  departmentId: number;
  yearsNumber: number;
}

export interface UpdateSpecializationDto {
  id: number;
  name: string;
  departmentId: number;
  yearsNumber: number;
}

export interface Major {
  id: string;
  name: string;
  departmentId: number;
  // yearsCount: number;
  yearsNumber: number;

  // studentCount: number;
  // years: Array<{
  //   id: string;
  //   semesterId: number;
  //   yearName: string;
  //   studyYear: number;
  // }>;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  headName?: string;
  majors: Major[];
}
export interface AbsenceEntry {
  absenceId: number;
  teacherName: string;
  date: string;
  status: string;
  reason?: string;
  createdAt: string;
}

export interface SubjectAbsence {
  subjectId: number;
  subjectName: string;
  absences: AbsenceEntry[];
}

export interface StudentAbsence {
  studentId: string;
  studentName: string;
  subjects: SubjectAbsence[];
}

export interface MonthlyAbsencesResponse {
  monthYear: string;
  month: number;
  students: StudentAbsence[];
}

export interface SpecializationAbsencesParams {
  id: number;
  studyYear?: number;
  subjectId?: number;
}

export interface SpecializationSubject {
  subjectId: number;
  name: string;
  studyYear: number;
  teachers: { userId: string; fullName: string }[];
  numberOfHours: number;
  semesterId: number;
}

export interface SpecializationInfoResponse {
  specializationId: number;
  name: string;
  departmentId: number;
  departmentName: string;
  yearsNumber: number;
  studentCount: number;
  subjects: SpecializationSubject[];
}

export interface AbsenceDay {
  date: string;
  dayOfWeek: string;
  totalAbsencesOnDate: number;
  lessons: AbsenceLesson[];
}

export interface MStudentAbsence {
  studentId: number;
  studentAcademicInfoId: number;
  fullName: string;
  subjectId: number;
  subjectName: string;
  totalAbsences: number;
  absencesByDate: AbsenceDay[];
}

export interface AbsenceLesson {
  lessonId: number;
  lessonName: string;
  status: string;
}
