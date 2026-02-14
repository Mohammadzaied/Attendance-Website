export interface TeacherListResponse {
  id: string;
  name: string;
}

export interface DepartmentResponse {
  departmentId: number;
  name: string;
  headOfDepartmentId: string | null;
  headOfDepartmentName: string | null;
}

export interface CreateTeacherDto {
  username: string;
  fullName: string;
  password: string;
  roleId: number;
  departmentId: number | null;
}

export interface UpdateTeacherDto {
  id: number;
  username?: string;
  fullName?: string;
  password?: string;
  roleId?: number;
  departmentId?: number;
}

export interface TeacherResponse {
  userId: string;
  username: string;
  fullName: string;
  roleId: number;
  departmentName: string;
}

export interface ImportResponse {
  created: number;
  failed: number;
  users: TeacherResponse[];
  errors: string[];
}

export interface AsyncState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncStateExcel {
  isLoading: boolean;
  error: string[] | null | string;
}

export interface ImportAsyncState extends AsyncStateExcel {
  data?: ImportResponse;
}

export interface SystemSettings {
  id: number;
  numberOfWeeks: number;
  percent2Hour: number;
  percent3Hour: number;
  percent4Hour: number;
  percent5Hour: number;
  secondWarningThreshold: number;
  deprivationExtraAfterSecond: number;
  createdAt: string;
  updatedAt?: string;
}

export interface DepartmentHead {
  userId: string;
  fullName: string;
}

export interface CreateDepartmentDto {
  name: string;
  headOfDepartmentId: string | null;
}

export interface UpdateDepartmentDto {
  id: string;
  name: string;
}

import { DetailedSubjectResponse } from "@/features/subject";
export type { DetailedSubjectResponse };

export interface AdminState {
  teachers: TeacherResponse[];
  teachersList: TeacherListResponse[];
  departments: DepartmentResponse[];
  departmentHeads: DepartmentHead[];
  selectedTeacher: TeacherResponse | null;
  teacherLastActiveSemester: DetailedSubjectResponse[];
  isUpdateDialogOpen: boolean;
  isDeleteDialogOpen: boolean;

  // Granular async states
  fetchTeachersState: AsyncState;
  fetchTeachersListState: AsyncState;
  fetchDepartmentsState: AsyncState;
  fetchDepartmentHeadsState: AsyncState;
  createTeacherState: AsyncState;
  createDepartmentState: AsyncState;
  updateTeacherState: AsyncState;
  updateDepartmentState: AsyncState;
  deleteTeacherState: AsyncState;
  deleteDepartmentState: AsyncState;
  importUsersState: ImportAsyncState;
  fetchTeacherLastActiveSemesterState: AsyncState;
}
