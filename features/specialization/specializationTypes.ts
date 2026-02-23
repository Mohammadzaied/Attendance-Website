export interface SpecializationResponse {
  specializationId: number;
  name: string;
  departmentId: number;
  departmentName: string;
  yearsNumber: number;
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
