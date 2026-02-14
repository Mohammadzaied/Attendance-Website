export interface Semester {
  semesterId: number;
  name: string;
}

export interface SemestersResponse {
  semesterId: number;
  name: string;
  year: number;
  academicYearId: number;
  number: number;
  status: number; // 1 for active, 2 for closed
}

export interface CreateSemesterDto {
  academicYearId: number;
  name: string;
  number: number;
  specializationId?: number;
}

export interface StartSecondSemesterDto {
  academicYearId: number;
  name: string;
  number: number;
  adminPassword: string;
}
