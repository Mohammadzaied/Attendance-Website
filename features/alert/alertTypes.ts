export enum AlertType {
  FirstWarning = 1,
  SecondWarning = 2,
  Deprivation = 3,
}

export enum AlertStatus {
  Draft = 1,
  Approved = 2,
  Rejected = 3,
}

export interface AlertGroupItem {
  id: number;
  type: number | AlertType;
  status: number | AlertStatus;
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
  previousAlertId: number | null;
}

export interface SubjectAlertsItem {
  subjectId: number;
  subjectName: string;
  numberOfHours: number;
  absenceCounts: {
    absent: number;
    late: number;
    excusedAbsence: number;
  };
  alerts: AlertGroupItem[];
}

export interface StudentAlertsGroupItem {
  studentId: number;
  studentName: string;
  specializationName: string;
  departmentName: string;
  studyYear: number;
  studentAcademicInfoId: number;
  studentAlerts: SubjectAlertsItem[];
}

export interface AlertsByStudentResponse {
  students: StudentAlertsGroupItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface AlertsByStudentParams {
  academicYearId?: number;
  semesterId?: number;
  status?: number | string;
  type?: number | string;
  studentName?: string;
  pageNumber?: number;
  pageSize?: number;
  departmentName?: string;
}

export interface AlertRejectionDto {
  alertId: number;
  rejectionReason: string;
  extensionExtraClasses: number;
}

export interface AlertApprovalDto {
  alertId: number;
  approvedBy: string;
}
