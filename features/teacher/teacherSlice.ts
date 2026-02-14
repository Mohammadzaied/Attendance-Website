import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { teacherService } from "./teacherService";
import { academicYearService } from "@/features/academicYear/academicYearService";
import { AcademicYear } from "@/features/academicYear/academicYearTypes";
import {
  TeacherState,
  BatchAttendanceCreateDto,
  AbsenceRecord,
  SubjectStudentsResponse,
  SubjectStudentItem,
  BulkAbsencesEditDto,
  SubjectAbsenceDataResponse,
} from "./teacherTypes";
import { DetailedSubjectResponse } from "@/features/subject/subjectTypes";

const initialState: TeacherState = {
  activeAcademicYears: [],
  allAcademicYears: [],
  subjects: [],
  students: [],
  absences: [],
  absenceSession: null,
  subjectName: "",
  serverTime: null,
  fetchActiveAcademicYearsState: {
    isLoading: false,
    error: null,
  },
  fetchAllAcademicYearsState: {
    isLoading: false,
    error: null,
  },
  fetchSubjectsState: {
    isLoading: false,
    error: null,
  },
  fetchStudentsState: {
    isLoading: false,
    error: null,
  },
  fetchServerTimeState: {
    isLoading: false,
    error: null,
  },
  submitAttendanceState: {
    isLoading: false,
    error: null,
  },
  fetchAbsenceSessionState: { isLoading: false, error: null },
  subjectAbsenceData: null,
  fetchSubjectAbsenceDataState: { isLoading: false, error: null },
  updateAbsenceSessionState: { isLoading: false, error: null },
  deleteStudentAbsenceState: {
    isLoading: false,
    error: null,
    deletingId: null,
  },
};

export const getActiveademicYears = createAsyncThunk(
  "teacher/fetchActiveAcademicYears",
  async (_, { rejectWithValue }) => {
    try {
      const years = await academicYearService.getActiveAcademicYears();
      return years;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch academic years");
    }
  },
);

export const getAllAcademicYears = createAsyncThunk(
  "teacher/fetchAllAcademicYears",
  async (_, { rejectWithValue }) => {
    try {
      const years = await academicYearService.getAllAcademicYears();
      return years;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch academic years");
    }
  },
);
export const fetchTeacherSubjects = createAsyncThunk(
  "teacher/fetchSubjects",
  async (academicYearId: number, { rejectWithValue }) => {
    try {
      const subjects =
        await teacherService.getSubjectsByTeacher(academicYearId);
      return subjects;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch teacher subjects");
    }
  },
);

export const fetchSubjectStudents = createAsyncThunk(
  "teacher/fetchStudents",
  async (subjectId: number, { rejectWithValue }) => {
    try {
      const response = await teacherService.getSubjectStudents(subjectId);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch students");
    }
  },
);

export const fetchServerTime = createAsyncThunk(
  "teacher/fetchServerTime",
  async (_, { rejectWithValue }) => {
    try {
      const response = await teacherService.getServerTime();
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch server time");
    }
  },
);

export const fetchAbsenceSession = createAsyncThunk(
  "teacher/fetchAbsenceSession",
  async (
    params: { subjectId: number; date: string; academicYearId: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await teacherService.getAbsenceSession(
        params.subjectId,
        params.date,
        params.academicYearId,
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch absence session");
    }
  },
);

export const updateAbsenceBatch = createAsyncThunk(
  "teacher/updateAbsenceBatch",
  async (data: BulkAbsencesEditDto, { rejectWithValue, dispatch }) => {
    try {
      const response = await teacherService.updateAbsenceBatch(data);
      // Refresh the session after update
      dispatch(
        fetchAbsenceSession({
          subjectId: data.subjectId,
          date: data.date,
          academicYearId: data.academicYearId,
        }),
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update absence session");
    }
  },
);

export const deleteAbsencesBatch = createAsyncThunk(
  "teacher/deleteAbsencesBatch",
  async (
    {
      absenceIds,
      subjectId,
      date,
      academicYearId,
    }: {
      absenceIds: number[];
      subjectId: number;
      date: string;
      academicYearId: number;
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const response = await teacherService.deleteAbsencesBatch({
        absenceIds,
      });
      // Refresh session after deletion
      dispatch(
        fetchAbsenceSession({
          subjectId,
          date: new Date(date).toISOString().split("T")[0],
          academicYearId: academicYearId,
        }),
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete student absence");
    }
  },
);

const submitBatchAttendance = createAsyncThunk(
  "teacher/submitBatchAttendance",
  async (data: BatchAttendanceCreateDto, { rejectWithValue }) => {
    try {
      await teacherService.submitBatchAttendance(data);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to submit attendance");
    }
  },
);

const fetchSubjectStudentsWithAbsenceData = createAsyncThunk(
  "teacher/fetchSubjectStudentsWithAbsenceData",
  async (subjectId: number, { rejectWithValue }) => {
    try {
      const response =
        await teacherService.getSubjectStudentsWithAbsenceData(subjectId);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch students absence data");
    }
  },
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    clearError: (state) => {
      state.fetchActiveAcademicYearsState.error = null;
      state.fetchSubjectsState.error = null;
      state.fetchStudentsState.error = null;
      state.fetchServerTimeState.error = null;
      state.submitAttendanceState.error = null;
      state.fetchAbsenceSessionState.error = null;
      state.updateAbsenceSessionState.error = null;
      state.deleteStudentAbsenceState.error = null;
    },
    addAbsences: (state, action: PayloadAction<AbsenceRecord[]>) => {
      state.absences = [...action.payload, ...state.absences];
    },
    deleteAbsence: (state, action: PayloadAction<string>) => {
      state.absences = state.absences.filter(
        (a: AbsenceRecord) => a.id !== action.payload,
      );
    },
    markAbsenceExcused: (state, action: PayloadAction<string>) => {
      state.absences = state.absences.map((a: AbsenceRecord) =>
        a.id === action.payload ? { ...a, isExcused: true } : a,
      );
    },
    clearStudents: (state) => {
      state.students = [];
      state.fetchStudentsState.error = null;
    },
    clearSubjects: (state) => {
      state.subjects = [];
      state.fetchSubjectsState.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Academic Years
      .addCase(getActiveademicYears.pending, (state) => {
        state.fetchActiveAcademicYearsState.isLoading = true;
        state.fetchActiveAcademicYearsState.error = null;
      })
      .addCase(
        getActiveademicYears.fulfilled,
        (state, action: PayloadAction<AcademicYear[]>) => {
          state.fetchActiveAcademicYearsState.isLoading = false;
          state.activeAcademicYears = action.payload;
          state.fetchActiveAcademicYearsState.error = null;
        },
      )
      .addCase(getActiveademicYears.rejected, (state, action) => {
        state.fetchActiveAcademicYearsState.isLoading = false;
        state.fetchActiveAcademicYearsState.error = action.payload as string;
      })
      .addCase(getAllAcademicYears.pending, (state) => {
        state.fetchAllAcademicYearsState.isLoading = true;
        state.fetchAllAcademicYearsState.error = null;
      })
      .addCase(
        getAllAcademicYears.fulfilled,
        (state, action: PayloadAction<AcademicYear[]>) => {
          state.fetchAllAcademicYearsState.isLoading = false;
          state.allAcademicYears = action.payload;
          state.fetchAllAcademicYearsState.error = null;
        },
      )
      .addCase(getAllAcademicYears.rejected, (state, action) => {
        state.fetchAllAcademicYearsState.isLoading = false;
        state.fetchAllAcademicYearsState.error = action.payload as string;
      })
      // Fetch Subjects
      .addCase(fetchTeacherSubjects.pending, (state) => {
        state.fetchSubjectsState.isLoading = true;
        state.fetchSubjectsState.error = null;
        state.subjects = [];
        state.students = [];
      })
      .addCase(
        fetchTeacherSubjects.fulfilled,
        (state, action: PayloadAction<DetailedSubjectResponse[]>) => {
          state.fetchSubjectsState.isLoading = false;
          state.subjects = action.payload;
          state.fetchSubjectsState.error = null;
        },
      )
      .addCase(fetchTeacherSubjects.rejected, (state, action) => {
        state.fetchSubjectsState.isLoading = false;
        state.fetchSubjectsState.error = action.payload as string;
        state.subjects = [];
      })
      // Fetch Students
      .addCase(fetchSubjectStudents.pending, (state) => {
        state.fetchStudentsState.isLoading = true;
        state.fetchStudentsState.error = null;
      })
      .addCase(
        fetchSubjectStudents.fulfilled,
        (state, action: PayloadAction<SubjectStudentsResponse>) => {
          state.fetchStudentsState.isLoading = false;
          state.students = action.payload.students;
          state.subjectName = action.payload.subjectName;
          state.fetchStudentsState.error = null;
        },
      )
      .addCase(fetchSubjectStudents.rejected, (state, action) => {
        state.fetchStudentsState.isLoading = false;
        state.fetchStudentsState.error = action.payload as string;
      })
      // Submit Attendance
      .addCase(submitBatchAttendance.pending, (state) => {
        state.submitAttendanceState.isLoading = true;
        state.submitAttendanceState.error = null;
      })
      .addCase(submitBatchAttendance.fulfilled, (state) => {
        state.submitAttendanceState.isLoading = false;
        state.submitAttendanceState.error = null;
      })
      .addCase(submitBatchAttendance.rejected, (state, action) => {
        state.submitAttendanceState.isLoading = false;
        state.submitAttendanceState.error = action.payload as string;
      })
      // Fetch Server Time
      .addCase(fetchServerTime.pending, (state) => {
        state.fetchServerTimeState.isLoading = true;
        state.fetchServerTimeState.error = null;
      })
      .addCase(fetchServerTime.fulfilled, (state, action) => {
        state.fetchServerTimeState.isLoading = false;
        state.serverTime = action.payload;
        state.fetchServerTimeState.error = null;
      })
      .addCase(fetchServerTime.rejected, (state, action) => {
        state.fetchServerTimeState.isLoading = false;
        state.fetchServerTimeState.error = action.payload as string;
      })
      // Fetch Absence Session
      .addCase(fetchAbsenceSession.pending, (state) => {
        state.fetchAbsenceSessionState.isLoading = true;
        state.fetchAbsenceSessionState.error = null;
      })
      .addCase(fetchAbsenceSession.fulfilled, (state, action) => {
        state.fetchAbsenceSessionState.isLoading = false;
        state.absenceSession = action.payload;
        state.fetchAbsenceSessionState.error = null;
      })
      .addCase(fetchAbsenceSession.rejected, (state, action) => {
        state.fetchAbsenceSessionState.isLoading = false;
        state.fetchAbsenceSessionState.error = action.payload as string;
      })
      // updateAbsenceBatch
      .addCase(updateAbsenceBatch.pending, (state) => {
        state.updateAbsenceSessionState.isLoading = true;
        state.updateAbsenceSessionState.error = null;
      })
      .addCase(updateAbsenceBatch.fulfilled, (state) => {
        state.updateAbsenceSessionState.isLoading = false;
        state.updateAbsenceSessionState.error = null;
      })
      .addCase(updateAbsenceBatch.rejected, (state, action) => {
        state.updateAbsenceSessionState.isLoading = false;
        state.updateAbsenceSessionState.error = action.payload as string;
      })
      // deleteAbsencesBatch
      .addCase(deleteAbsencesBatch.pending, (state) => {
        state.deleteStudentAbsenceState.isLoading = true;
        state.deleteStudentAbsenceState.error = null;
      })
      .addCase(deleteAbsencesBatch.fulfilled, (state) => {
        state.deleteStudentAbsenceState.isLoading = false;
        state.deleteStudentAbsenceState.error = null;
        state.deleteStudentAbsenceState.deletingId = null;
      })
      .addCase(deleteAbsencesBatch.rejected, (state, action) => {
        state.deleteStudentAbsenceState.isLoading = false;
        state.deleteStudentAbsenceState.error = action.payload as string;
        state.deleteStudentAbsenceState.deletingId = null;
      })
      // fetchSubjectStudentsWithAbsenceData
      .addCase(fetchSubjectStudentsWithAbsenceData.pending, (state) => {
        state.fetchSubjectAbsenceDataState.isLoading = true;
        state.fetchSubjectAbsenceDataState.error = null;
      })
      .addCase(
        fetchSubjectStudentsWithAbsenceData.fulfilled,
        (state, action: PayloadAction<SubjectAbsenceDataResponse>) => {
          state.fetchSubjectAbsenceDataState.isLoading = false;
          state.subjectAbsenceData = action.payload;
          state.fetchSubjectAbsenceDataState.error = null;
        },
      )
      .addCase(
        fetchSubjectStudentsWithAbsenceData.rejected,
        (state, action) => {
          state.fetchSubjectAbsenceDataState.isLoading = false;
          state.fetchSubjectAbsenceDataState.error = action.payload as string;
        },
      );
  },
});

export const {
  clearError,
  addAbsences,
  deleteAbsence,
  markAbsenceExcused,
  clearStudents,
  clearSubjects,
} = teacherSlice.actions;
export { submitBatchAttendance, fetchSubjectStudentsWithAbsenceData };
export default teacherSlice.reducer;
