import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { studentService } from "./studentService";
import { absenceService } from "@/features/absence/absenceService";
import {
  StudentProfileResponse,
  AdminAllSubjectsResponse,
  StudentSubjectsResponse,
  StudentAlertsBySubject,
  GraduationStatusResponse,
  StudentAlertsBySubjectV2,
} from "./studentTypes";
import { StudentAbsenceGroupByDateResponse } from "@/features/teacher/teacherTypes";
import { ExcuseAbsencesDto, ExcuseAbsencesResponse } from "@/features/absence/absenceTypes";

interface AsyncState {
  isLoading: boolean;
  error: string | null;
}

interface StudentState {
  profile: StudentProfileResponse | null;
  subjects: StudentSubjectsResponse | null;
  adminSubjects: AdminAllSubjectsResponse | null;
  absenceDetails: StudentAbsenceGroupByDateResponse | null;
  alerts: StudentAlertsBySubject[] | null;
  graduationStudents: GraduationStatusResponse | null;
  fetchProfileState: AsyncState;
  fetchSubjectsState: AsyncState;
  fetchAdminSubjectsState: AsyncState;
  fetchAbsenceDetailsState: AsyncState;
  fetchAlertsState: AsyncState;
  unifiedAlerts: StudentAlertsBySubjectV2[] | null;
  fetchUnifiedAlertsState: AsyncState;
  fetchGraduationStudentsState: AsyncState;
  deleteAbsenceState: AsyncState;
  editAbsenceState: AsyncState;
  excuseAbsencesState: AsyncState;
}

const initialAsyncState: AsyncState = { isLoading: false, error: null };

const initialState: StudentState = {
  profile: null,
  subjects: null,
  adminSubjects: null,
  absenceDetails: null,
  alerts: null,
  graduationStudents: null,
  fetchProfileState: initialAsyncState,
  fetchSubjectsState: initialAsyncState,
  fetchAdminSubjectsState: initialAsyncState,
  fetchAbsenceDetailsState: initialAsyncState,
  fetchAlertsState: initialAsyncState,
  unifiedAlerts: null,
  fetchUnifiedAlertsState: initialAsyncState,
  fetchGraduationStudentsState: initialAsyncState,
  deleteAbsenceState: initialAsyncState,
  editAbsenceState: initialAsyncState,
  excuseAbsencesState: initialAsyncState,
};

export const fetchStudentProfile = createAsyncThunk<
  StudentProfileResponse,
  number | undefined
>("student/fetchProfile", async (studentId, { rejectWithValue }) => {
  try {
    const response = await studentService.getStudentProfile(studentId);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to fetch student profile");
  }
});

export const fetchStudentSubjects = createAsyncThunk(
  "student/fetchSubjects",
  async (
    params: {
      academicYearId: number;
      semesterId: number;
      studentId: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await studentService.getStudentSubjects(
        params.academicYearId,
        params.semesterId,
        params.studentId,
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch student subjects");
    }
  },
);

export const fetchStudentAlerts = createAsyncThunk(
  "student/fetchAlerts",
  async (
    params: {
      academicYearId: number;
      semesterId: number;
      studentId: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await studentService.getStudentAlerts(
        params.academicYearId,
        params.semesterId,
        params.studentId,
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch student alerts");
    }
  },
);

export const fetchUnifiedAlerts = createAsyncThunk<
  StudentAlertsBySubjectV2[],
  number
>("student/fetchUnifiedAlerts", async (studentId, { rejectWithValue }) => {
  try {
    const response = await studentService.getStudentAlertsUnified(studentId);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to fetch unified alerts");
  }
});

export const fetchAdminAllSubjects = createAsyncThunk<
  AdminAllSubjectsResponse,
  {
    academicYearId: number;
    semesterId: number;
    studentId: number;
  }
>("student/fetchAdminSubjects", async (params, { rejectWithValue }) => {
  try {
    const response = await studentService.getAdminAllSubjectsByStudent(
      params.academicYearId,
      params.semesterId,
      params.studentId,
    );
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to fetch admin subjects");
  }
});

export const fetchStudentsByGraduationStatus = createAsyncThunk(
  "student/fetchByGraduationStatus",
  async (
    params: {
      isGraduated: boolean;
      pageNumber?: number;
      pageSize?: number;
      searchTerm?: string | null;
      departmentId?: number | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await studentService.getStudentsByGraduationStatus(
        params.isGraduated,
        params.pageNumber,
        params.pageSize,
        params.searchTerm,
        params.departmentId,
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch students");
    }
  },
);

export const fetchStudentAbsenceDetails = createAsyncThunk(
  "student/fetchAbsenceDetails",
  async (
    params: { studentAcademicInfoId: number; subjectId: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await absenceService.getStudentAbsencesBySubject(
        params.studentAcademicInfoId,
        params.subjectId,
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch student absence details");
    }
  },
);

export const editAbsenceStatus = createAsyncThunk(
  "student/editAbsenceStatus",
  async (
    params: {
      absenceId: number;
      status: number;
      reason?: string | null;
      studentAcademicInfoId: number;
      subjectId: number;
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const { absenceId, status, reason } = params;
      await absenceService.editAbsenceStatus(absenceId, { status, reason });
      // Refresh absence details
      dispatch(
        fetchStudentAbsenceDetails({
          studentAcademicInfoId: params.studentAcademicInfoId,
          subjectId: params.subjectId,
        }),
      );
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to edit absence status");
    }
  },
);

export const deleteAbsenceRecord = createAsyncThunk(
  "student/deleteAbsenceRecord",
  async (
    params: {
      absenceId: number;
      studentAcademicInfoId: number;
      subjectId: number;
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await absenceService.deleteAbsencesBatch(params.absenceId);
      // Refresh absence details
      dispatch(
        fetchStudentAbsenceDetails({
          studentAcademicInfoId: params.studentAcademicInfoId,
          subjectId: params.subjectId,
        }),
      );
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete absence record");
    }
  },
);

export const bulkExcuseAbsences = createAsyncThunk<
  ExcuseAbsencesResponse,
  ExcuseAbsencesDto
>("student/bulkExcuseAbsences", async (data, { rejectWithValue }) => {
  try {
    const response = await absenceService.excuseAbsences(data);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to excuse absences");
  }
});

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.fetchProfileState = initialAsyncState;
    },
    resetStudentDetails: (state) => {
      state.profile = null;
      state.subjects = null;
      state.adminSubjects = null;
      state.absenceDetails = null;
      state.alerts = null;
      state.unifiedAlerts = null;
      state.fetchProfileState = initialAsyncState;
      state.fetchSubjectsState = initialAsyncState;
      state.fetchAdminSubjectsState = initialAsyncState;
      state.fetchAbsenceDetailsState = initialAsyncState;
      state.fetchAlertsState = initialAsyncState;
      state.fetchUnifiedAlertsState = initialAsyncState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentProfile.pending, (state) => {
        state.fetchProfileState.isLoading = true;
        state.fetchProfileState.error = null;
      })
      .addCase(
        fetchStudentProfile.fulfilled,
        (state, action: PayloadAction<StudentProfileResponse>) => {
          state.fetchProfileState.isLoading = false;
          state.profile = action.payload;
          state.fetchProfileState.error = null;
        },
      )
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.fetchProfileState.isLoading = false;
        state.fetchProfileState.error = action.payload as string;
      })
      .addCase(fetchStudentSubjects.pending, (state) => {
        state.fetchSubjectsState.isLoading = true;
        state.fetchSubjectsState.error = null;
      })
      .addCase(
        fetchStudentSubjects.fulfilled,
        (state, action: PayloadAction<StudentSubjectsResponse>) => {
          state.fetchSubjectsState.isLoading = false;
          state.subjects = action.payload;
          state.fetchSubjectsState.error = null;
        },
      )
      .addCase(fetchStudentSubjects.rejected, (state, action) => {
        state.fetchSubjectsState.isLoading = false;
        state.fetchSubjectsState.error = action.payload as string;
      })
      .addCase(fetchStudentAbsenceDetails.pending, (state) => {
        state.fetchAbsenceDetailsState.isLoading = true;
        state.fetchAbsenceDetailsState.error = null;
      })
      .addCase(
        fetchStudentAbsenceDetails.fulfilled,
        (state, action: PayloadAction<StudentAbsenceGroupByDateResponse>) => {
          state.fetchAbsenceDetailsState.isLoading = false;
          state.absenceDetails = action.payload;
          state.fetchAbsenceDetailsState.error = null;
        },
      )
      .addCase(fetchStudentAbsenceDetails.rejected, (state, action) => {
        state.fetchAbsenceDetailsState.isLoading = false;
        state.fetchAbsenceDetailsState.error = action.payload as string;
      })
      .addCase(fetchStudentAlerts.pending, (state) => {
        state.fetchAlertsState.isLoading = true;
        state.fetchAlertsState.error = null;
      })
      .addCase(
        fetchStudentAlerts.fulfilled,
        (state, action: PayloadAction<StudentAlertsBySubject[]>) => {
          state.fetchAlertsState.isLoading = false;
          state.alerts = action.payload;
          state.fetchAlertsState.error = null;
        },
      )
      .addCase(fetchStudentAlerts.rejected, (state, action) => {
        state.fetchAlertsState.isLoading = false;
        state.fetchAlertsState.error = action.payload as string;
      })
      .addCase(fetchUnifiedAlerts.pending, (state) => {
        state.fetchUnifiedAlertsState.isLoading = true;
        state.fetchUnifiedAlertsState.error = null;
      })
      .addCase(
        fetchUnifiedAlerts.fulfilled,
        (state, action: PayloadAction<StudentAlertsBySubjectV2[]>) => {
          state.fetchUnifiedAlertsState.isLoading = false;
          state.unifiedAlerts = action.payload;
          state.fetchUnifiedAlertsState.error = null;
        },
      )
      .addCase(fetchUnifiedAlerts.rejected, (state, action) => {
        state.fetchUnifiedAlertsState.isLoading = false;
        state.fetchUnifiedAlertsState.error = action.payload as string;
      })
      .addCase(fetchAdminAllSubjects.pending, (state) => {
        state.fetchAdminSubjectsState.isLoading = true;
        state.fetchAdminSubjectsState.error = null;
      })
      .addCase(
        fetchAdminAllSubjects.fulfilled,
        (state, action: PayloadAction<AdminAllSubjectsResponse>) => {
          state.fetchAdminSubjectsState.isLoading = false;
          state.adminSubjects = action.payload;
          state.fetchAdminSubjectsState.error = null;
        },
      )
      .addCase(fetchAdminAllSubjects.rejected, (state, action) => {
        state.fetchAdminSubjectsState.isLoading = false;
        state.fetchAdminSubjectsState.error = action.payload as string;
      })
      .addCase(fetchStudentsByGraduationStatus.pending, (state) => {
        state.fetchGraduationStudentsState.isLoading = true;
        state.fetchGraduationStudentsState.error = null;
      })
      .addCase(
        fetchStudentsByGraduationStatus.fulfilled,
        (state, action: PayloadAction<GraduationStatusResponse>) => {
          state.fetchGraduationStudentsState.isLoading = false;
          state.graduationStudents = action.payload;
          state.fetchGraduationStudentsState.error = null;
        },
      )
      .addCase(fetchStudentsByGraduationStatus.rejected, (state, action) => {
        state.fetchGraduationStudentsState.isLoading = false;
        state.fetchGraduationStudentsState.error = action.payload as string;
      })
      .addCase(editAbsenceStatus.pending, (state) => {
        state.editAbsenceState.isLoading = true;
        state.editAbsenceState.error = null;
      })
      .addCase(editAbsenceStatus.fulfilled, (state) => {
        state.editAbsenceState.isLoading = false;
        state.editAbsenceState.error = null;
      })
      .addCase(editAbsenceStatus.rejected, (state, action) => {
        state.editAbsenceState.isLoading = false;
        state.editAbsenceState.error = action.payload as string;
      })
      .addCase(deleteAbsenceRecord.pending, (state) => {
        state.deleteAbsenceState.isLoading = true;
        state.deleteAbsenceState.error = null;
      })
      .addCase(deleteAbsenceRecord.fulfilled, (state) => {
        state.deleteAbsenceState.isLoading = false;
        state.deleteAbsenceState.error = null;
      })
      .addCase(deleteAbsenceRecord.rejected, (state, action) => {
        state.deleteAbsenceState.isLoading = false;
        state.deleteAbsenceState.error = action.payload as string;
      })
      .addCase(bulkExcuseAbsences.pending, (state) => {
        state.excuseAbsencesState.isLoading = true;
        state.excuseAbsencesState.error = null;
      })
      .addCase(bulkExcuseAbsences.fulfilled, (state) => {
        state.excuseAbsencesState.isLoading = false;
        state.excuseAbsencesState.error = null;
      })
      .addCase(bulkExcuseAbsences.rejected, (state, action) => {
        state.excuseAbsencesState.isLoading = false;
        state.excuseAbsencesState.error = action.payload as string;
      });
  },
});

export const { clearProfile, resetStudentDetails } = studentSlice.actions;
export default studentSlice.reducer;
