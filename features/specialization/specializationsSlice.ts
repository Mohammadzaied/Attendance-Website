import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { specializationService } from "./specializationService";
import { subjectService } from "@/features/subject/subjectService";
import { academicYearService } from "@/features/academicYear/academicYearService";
import { studentService } from "@/features/student/studentService";
import { semesterService } from "@/features/semester/semesterService";

import {
  SpecializationResponse,
  CreateSpecializationDto,
  UpdateSpecializationDto,
} from "./specializationTypes";
import {
  AcademicYearResponse,
  CreateAcademicYearDto,
} from "@/features/academicYear/academicYearTypes";
import { SemestersResponse } from "@/features/semester/semesterTypes";
import {
  AcademicStatisticsParams,
  AcademicStatisticsResponse,
  CreateSubjectDto,
  DetailedSubjectResponse,
} from "@/features/subject";
import {
  CreateAndEnrollStudentDto,
  EmailUpdateDto,
  ImportStudentDto,
  PromoteStudentsDto,
  StudentEnrollmentItem,
  SemesterEnrollmentsResponse,
  UpdateStudentDto,
} from "@/features/student/studentTypes";

interface AsyncState {
  isLoading: boolean;
  error: string | null;
}

interface SpecializationsState {
  specializations: SpecializationResponse[];
  fetchSpecializationsState: AsyncState;
  createSpecializationState: AsyncState;
  updateSpecializationState: AsyncState;
  deleteSpecializationState: AsyncState;
  academicYears: AcademicYearResponse[];
  fetchAcademicYearsState: AsyncState;
  createAcademicYearState: AsyncState;
  deleteProgramYearState: AsyncState;
  importStudentsState: AsyncState;
  updateStudentEmailsState: AsyncState;
  updateStudentState: AsyncState;
  createAndEnrollStudentState: AsyncState;
  specializationAcademicYears: AcademicYearResponse[];
  semestersBySpecialization: SemestersResponse[];
  enrollments: StudentEnrollmentItem[];
  fetchEnrollmentsState: AsyncState;
  fetchSemestersState: AsyncState;
  deleteStudentState: AsyncState;
  semesterStats: Record<number, AcademicStatisticsResponse>;
  fetchStatsState: AsyncState;
  createSubjectState: AsyncState;
  subjectsBySpecialization: DetailedSubjectResponse[];
  fetchDetailedSubjectsState: AsyncState;
  deleteSubjectState: AsyncState;
  updateSubjectState: AsyncState;
  StudentCountSpecialization: number;
  yearsNumber: number;
  promoteStudentsState: AsyncState;
}

const initialAsyncState: AsyncState = { isLoading: false, error: null };

const initialState: SpecializationsState = {
  specializations: [],
  fetchSpecializationsState: initialAsyncState,
  createSpecializationState: initialAsyncState,
  updateSpecializationState: initialAsyncState,
  deleteSpecializationState: initialAsyncState,
  academicYears: [],
  fetchAcademicYearsState: initialAsyncState,
  createAcademicYearState: initialAsyncState,
  deleteProgramYearState: initialAsyncState,
  importStudentsState: initialAsyncState,
  updateStudentEmailsState: initialAsyncState,
  updateStudentState: initialAsyncState,
  createAndEnrollStudentState: initialAsyncState,
  specializationAcademicYears: [],
  semestersBySpecialization: [],
  enrollments: [],
  fetchEnrollmentsState: initialAsyncState,
  fetchSemestersState: initialAsyncState,
  deleteStudentState: initialAsyncState,
  semesterStats: {},
  fetchStatsState: initialAsyncState,
  createSubjectState: initialAsyncState,
  subjectsBySpecialization: [],
  fetchDetailedSubjectsState: initialAsyncState,
  updateSubjectState: initialAsyncState,
  deleteSubjectState: initialAsyncState,
  StudentCountSpecialization: 0,
  yearsNumber: 0,
  promoteStudentsState: initialAsyncState,
};

// Async thunks
export const fetchSpecializations = createAsyncThunk(
  "specializations/fetchSpecializations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await specializationService.getAllSpecializations();
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch specializations");
    }
  },
);

export const createSpecialization = createAsyncThunk(
  "specializations/createSpecialization",
  async (data: CreateSpecializationDto, { rejectWithValue }) => {
    try {
      const response = await specializationService.createSpecialization(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create specialization");
    }
  },
);

export const updateSpecialization = createAsyncThunk(
  "specializations/updateSpecialization",
  async (data: UpdateSpecializationDto, { rejectWithValue }) => {
    try {
      const response = await specializationService.updateSpecialization(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update specialization");
    }
  },
);

export const deleteSpecialization = createAsyncThunk(
  "specializations/deleteSpecialization",
  async (data: { id: number; password: string }, { rejectWithValue }) => {
    try {
      await specializationService.deleteSpecialization(data);
      return data.id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete specialization");
    }
  },
);

export const fetchAcademicYears = createAsyncThunk(
  "specializations/fetchAcademicYears",
  async (_, { rejectWithValue }) => {
    try {
      const response = await academicYearService.getAllAcademicYears();
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch academic years");
    }
  },
);

export const fetchSemesters = createAsyncThunk(
  "specializations/fetchSemesters",
  async (_, { rejectWithValue }) => {
    try {
      const response = await semesterService.getAllSemesters();
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch semesters");
    }
  },
);

export const createAcademicYearThunk = createAsyncThunk(
  "specializations/createAcademicYear",
  async (data: CreateAcademicYearDto, { rejectWithValue }) => {
    try {
      const response = await academicYearService.createAcademicYear(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create academic year");
    }
  },
);

export const importStudentsThunk = createAsyncThunk(
  "specializations/importStudents",
  async (data: ImportStudentDto[], { rejectWithValue }) => {
    try {
      const response = await studentService.importStudents(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to import students");
    }
  },
);

export const fetchEnrollmentsBySemester = createAsyncThunk(
  "specializations/fetchEnrollmentsBySemester",
  async (
    {
      semesterId,
      specializationId,
      studyYear,
    }: { semesterId: number; specializationId: number; studyYear: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await studentService.getEnrollmentsBySemster(
        semesterId,
        specializationId,
        studyYear,
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch enrollments");
    }
  },
);

export const createAndEnrollStudentThunk = createAsyncThunk(
  "specializations/createAndEnrollStudent",
  async (data: CreateAndEnrollStudentDto, { rejectWithValue }) => {
    try {
      const response = await studentService.createAndEnrollStudent(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create and enroll student");
    }
  },
);

export const updateStudentEmailsThunk = createAsyncThunk(
  "specializations/updateStudentEmails",
  async (data: EmailUpdateDto[], { rejectWithValue }) => {
    try {
      const response = await studentService.bulkUpdateStudentEmails(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update student emails");
    }
  },
);

export const updateStudentThunk = createAsyncThunk(
  "specializations/updateStudent",
  async (
    { id, data }: { id: number; data: UpdateStudentDto },
    { rejectWithValue },
  ) => {
    try {
      const response = await studentService.updateStudent(id, data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update student");
    }
  },
);

export const deleteStudentThunk = createAsyncThunk(
  "specializations/deleteStudent",
  async (id: number, { rejectWithValue }) => {
    try {
      await studentService.deleteStudent(id);
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete student");
    }
  },
);

export const fetchAcademicStatistics = createAsyncThunk(
  "specializations/fetchAcademicStatistics",
  async (params: AcademicStatisticsParams, { rejectWithValue }) => {
    try {
      const response = await studentService.getAcademicStatistics(params);
      return { semesterId: params.semesterId, stats: response };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch statistics");
    }
  },
);

export const createSubjectThunk = createAsyncThunk(
  "specializations/createSubject",
  async (data: CreateSubjectDto, { rejectWithValue }) => {
    try {
      const response = await subjectService.createSubject(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create subject");
    }
  },
);

export const fetchSubjectsBySpecializationThunk = createAsyncThunk(
  "specializations/fetchSubjectsBySpecialization",
  async (
    params: { specializationId: number; semesterId: number; studyYear: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await subjectService.getSubjectsBySpecialization(params);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch subjects");
    }
  },
);

export const updateSubjectThunk = createAsyncThunk(
  "specializations/updateSubject",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await subjectService.updateSubject(id, data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update subject");
    }
  },
);

export const deleteSubjectThunk = createAsyncThunk(
  "specializations/deleteSubject",
  async (id: number, { rejectWithValue }) => {
    try {
      await subjectService.deleteSubject(id);
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete subject");
    }
  },
);

export const promoteStudentsThunk = createAsyncThunk(
  "specializations/promoteStudents",
  async (data: PromoteStudentsDto, { rejectWithValue }) => {
    try {
      await studentService.promoteStudents(data);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to promote students");
    }
  },
);

export const deleteAcademicYearThunk = createAsyncThunk(
  "specializations/deleteAcademicYear",
  async (data: { id: number; password: string }, { rejectWithValue }) => {
    try {
      await academicYearService.deleteAcademicYear(data);
      return data.id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete academic year");
    }
  },
);

// Slice
const specializationsSlice = createSlice({
  name: "specializations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.fetchSpecializationsState.error = null;
      state.createSpecializationState.error = null;
      state.updateSpecializationState.error = null;
      state.deleteSpecializationState.error = null;
      state.fetchAcademicYearsState.error = null;
      state.createAcademicYearState.error = null;
      state.deleteProgramYearState.error = null;
      state.importStudentsState.error = null;
      state.updateStudentEmailsState.error = null;
      state.updateStudentState.error = null;
      state.fetchEnrollmentsState.error = null;
      state.createAndEnrollStudentState.error = null;
      state.fetchSemestersState.error = null;
      state.deleteStudentState.error = null;
      state.fetchStatsState.error = null;
      state.createSubjectState.error = null;
      state.fetchDetailedSubjectsState.error = null;
      state.updateSubjectState.error = null;
      state.deleteSubjectState.error = null;
      state.promoteStudentsState.error = null;
    },
    clearSubjects: (state) => {
      state.subjectsBySpecialization = [];
      state.fetchDetailedSubjectsState = { isLoading: false, error: null };
    },
    clearEnrollments: (state) => {
      state.enrollments = [];
      state.fetchEnrollmentsState = { isLoading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    // Fetch specializations
    builder
      .addCase(fetchSpecializations.pending, (state) => {
        state.fetchSpecializationsState.isLoading = true;
        state.fetchSpecializationsState.error = null;
      })
      .addCase(
        fetchSpecializations.fulfilled,
        (state, action: PayloadAction<SpecializationResponse[]>) => {
          state.fetchSpecializationsState.isLoading = false;
          state.specializations = action.payload;
          state.fetchSpecializationsState.error = null;
        },
      )
      .addCase(fetchSpecializations.rejected, (state, action) => {
        state.fetchSpecializationsState.isLoading = false;
        state.fetchSpecializationsState.error = action.payload as string;
      })
      .addCase(createSpecialization.pending, (state) => {
        state.createSpecializationState.isLoading = true;
        state.createSpecializationState.error = null;
      })
      .addCase(
        createSpecialization.fulfilled,
        (state, action: PayloadAction<SpecializationResponse>) => {
          state.createSpecializationState.isLoading = false;
          state.specializations.push(action.payload);
          state.createSpecializationState.error = null;
        },
      )
      .addCase(createSpecialization.rejected, (state, action) => {
        state.createSpecializationState.isLoading = false;
        state.createSpecializationState.error = action.payload as string;
      })
      .addCase(updateSpecialization.pending, (state) => {
        state.updateSpecializationState.isLoading = true;
        state.updateSpecializationState.error = null;
      })
      .addCase(
        updateSpecialization.fulfilled,
        (state, action: PayloadAction<SpecializationResponse>) => {
          state.updateSpecializationState.isLoading = false;
          state.specializations = state.specializations.map((s) =>
            s.specializationId === action.payload.specializationId
              ? action.payload
              : s,
          );
          state.updateSpecializationState.error = null;
        },
      )
      .addCase(updateSpecialization.rejected, (state, action) => {
        state.updateSpecializationState.isLoading = false;
        state.updateSpecializationState.error = action.payload as string;
      })
      .addCase(deleteSpecialization.pending, (state) => {
        state.deleteSpecializationState.isLoading = true;
        state.deleteSpecializationState.error = null;
      })
      .addCase(
        deleteSpecialization.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.deleteSpecializationState.isLoading = false;
          state.specializations = state.specializations.filter(
            (s) => s.specializationId !== action.payload,
          );
          state.deleteSpecializationState.error = null;
        },
      )
      .addCase(deleteSpecialization.rejected, (state, action) => {
        state.deleteSpecializationState.isLoading = false;
        state.deleteSpecializationState.error = action.payload as string;
      })
      .addCase(fetchAcademicYears.pending, (state) => {
        state.fetchAcademicYearsState.isLoading = true;
        state.fetchAcademicYearsState.error = null;
      })
      .addCase(
        fetchAcademicYears.fulfilled,
        (state, action: PayloadAction<AcademicYearResponse[]>) => {
          state.fetchAcademicYearsState.isLoading = false;
          state.academicYears = action.payload;
          state.fetchAcademicYearsState.error = null;
        },
      )
      .addCase(fetchAcademicYears.rejected, (state, action) => {
        state.fetchAcademicYearsState.isLoading = false;
        state.fetchAcademicYearsState.error = action.payload as string;
      })
      .addCase(createAcademicYearThunk.pending, (state) => {
        state.createAcademicYearState.isLoading = true;
        state.createAcademicYearState.error = null;
      })
      .addCase(
        createAcademicYearThunk.fulfilled,
        (state, action: PayloadAction<AcademicYearResponse>) => {
          state.createAcademicYearState.isLoading = false;
          state.academicYears.push(action.payload);
          state.createAcademicYearState.error = null;
        },
      )
      .addCase(createAcademicYearThunk.rejected, (state, action) => {
        state.createAcademicYearState.isLoading = false;
        state.createAcademicYearState.error = action.payload as string;
      })
      .addCase(fetchSemesters.pending, (state) => {
        state.fetchSemestersState.isLoading = true;
        state.fetchSemestersState.error = null;
      })
      .addCase(
        fetchSemesters.fulfilled,
        (state, action: PayloadAction<SemestersResponse[]>) => {
          state.fetchSemestersState.isLoading = false;
          state.semestersBySpecialization = action.payload;
          state.fetchSemestersState.error = null;
        },
      )
      .addCase(fetchSemesters.rejected, (state, action) => {
        state.fetchSemestersState.isLoading = false;
        state.fetchSemestersState.error = action.payload as string;
      })
      .addCase(importStudentsThunk.pending, (state) => {
        state.importStudentsState.isLoading = true;
        state.importStudentsState.error = null;
      })
      .addCase(importStudentsThunk.fulfilled, (state) => {
        state.importStudentsState.isLoading = false;
        state.importStudentsState.error = null;
      })
      .addCase(importStudentsThunk.rejected, (state, action) => {
        state.importStudentsState.isLoading = false;
        state.importStudentsState.error = action.payload as string;
      })
      .addCase(fetchEnrollmentsBySemester.pending, (state) => {
        state.fetchEnrollmentsState.isLoading = true;
        state.fetchEnrollmentsState.error = null;
      })
      .addCase(
        fetchEnrollmentsBySemester.fulfilled,
        (state, action: PayloadAction<SemesterEnrollmentsResponse>) => {
          state.fetchEnrollmentsState.isLoading = false;
          state.enrollments = action.payload.items;
          state.fetchEnrollmentsState.error = null;
        },
      )
      .addCase(fetchEnrollmentsBySemester.rejected, (state, action) => {
        state.fetchEnrollmentsState.isLoading = false;
        state.fetchEnrollmentsState.error = action.payload as string;
      })
      .addCase(createAndEnrollStudentThunk.pending, (state) => {
        state.createAndEnrollStudentState.isLoading = true;
        state.createAndEnrollStudentState.error = null;
      })
      .addCase(
        createAndEnrollStudentThunk.fulfilled,
        (state, action: PayloadAction<StudentEnrollmentItem>) => {
          state.createAndEnrollStudentState.isLoading = false;
          state.enrollments.push(action.payload);
          state.createAndEnrollStudentState.error = null;
        },
      )
      .addCase(createAndEnrollStudentThunk.rejected, (state, action) => {
        state.createAndEnrollStudentState.isLoading = false;
        state.createAndEnrollStudentState.error = action.payload as string;
      })
      .addCase(updateStudentEmailsThunk.pending, (state) => {
        state.updateStudentEmailsState.isLoading = true;
        state.updateStudentEmailsState.error = null;
      })
      .addCase(updateStudentEmailsThunk.fulfilled, (state) => {
        state.updateStudentEmailsState.isLoading = false;
        state.updateStudentEmailsState.error = null;
      })
      .addCase(updateStudentEmailsThunk.rejected, (state, action) => {
        state.updateStudentEmailsState.isLoading = false;
        state.updateStudentEmailsState.error = action.payload as string;
      })
      .addCase(updateStudentThunk.pending, (state) => {
        state.updateStudentState.isLoading = true;
        state.updateStudentState.error = null;
      })
      .addCase(updateStudentThunk.fulfilled, (state) => {
        state.updateStudentState.isLoading = false;
        state.updateStudentState.error = null;
      })
      .addCase(updateStudentThunk.rejected, (state, action) => {
        state.updateStudentState.isLoading = false;
        state.updateStudentState.error = action.payload as string;
      })
      .addCase(deleteStudentThunk.pending, (state) => {
        state.deleteStudentState.isLoading = true;
        state.deleteStudentState.error = null;
      })
      .addCase(
        deleteStudentThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.deleteStudentState.isLoading = false;
          state.enrollments = state.enrollments.filter(
            (en) => en.studentId !== action.payload,
          );
          state.deleteStudentState.error = null;
        },
      )
      .addCase(deleteStudentThunk.rejected, (state, action) => {
        state.deleteStudentState.isLoading = false;
        state.deleteStudentState.error = action.payload as string;
      })
      .addCase(fetchAcademicStatistics.pending, (state) => {
        state.fetchStatsState.isLoading = true;
        state.fetchStatsState.error = null;
      })
      .addCase(fetchAcademicStatistics.fulfilled, (state, action) => {
        state.fetchStatsState.isLoading = false;
        state.semesterStats[action.payload.semesterId] = action.payload.stats;
        state.StudentCountSpecialization =
          action.payload.stats.studentCountSpecialization;
        state.yearsNumber = action.payload.stats.yearsNumber;
        state.fetchStatsState.error = null;
      })
      .addCase(fetchAcademicStatistics.rejected, (state, action) => {
        state.fetchStatsState.isLoading = false;
        state.fetchStatsState.error = action.payload as string;
      })
      .addCase(createSubjectThunk.pending, (state) => {
        state.createSubjectState.isLoading = true;
        state.createSubjectState.error = null;
      })
      .addCase(createSubjectThunk.fulfilled, (state) => {
        state.createSubjectState.isLoading = false;
        state.createSubjectState.error = null;
      })
      .addCase(createSubjectThunk.rejected, (state, action) => {
        state.createSubjectState.isLoading = false;
        state.createSubjectState.error = action.payload as string;
      })
      .addCase(fetchSubjectsBySpecializationThunk.pending, (state) => {
        state.fetchDetailedSubjectsState.isLoading = true;
        state.fetchDetailedSubjectsState.error = null;
      })
      .addCase(
        fetchSubjectsBySpecializationThunk.fulfilled,
        (state, action: PayloadAction<DetailedSubjectResponse[]>) => {
          state.fetchDetailedSubjectsState.isLoading = false;
          state.subjectsBySpecialization = action.payload;
          state.fetchDetailedSubjectsState.error = null;
        },
      )
      .addCase(fetchSubjectsBySpecializationThunk.rejected, (state, action) => {
        state.fetchDetailedSubjectsState.isLoading = false;
        state.fetchDetailedSubjectsState.error = action.payload as string;
      })
      .addCase(updateSubjectThunk.pending, (state) => {
        state.updateSubjectState.isLoading = true;
        state.updateSubjectState.error = null;
      })
      .addCase(updateSubjectThunk.fulfilled, (state) => {
        state.updateSubjectState.isLoading = false;
        state.updateSubjectState.error = null;
      })
      .addCase(updateSubjectThunk.rejected, (state, action) => {
        state.updateSubjectState.isLoading = false;
        state.updateSubjectState.error = action.payload as string;
      })
      .addCase(deleteSubjectThunk.pending, (state) => {
        state.deleteSubjectState.isLoading = true;
        state.deleteSubjectState.error = null;
      })
      .addCase(deleteSubjectThunk.fulfilled, (state) => {
        state.deleteSubjectState.isLoading = false;
        state.deleteSubjectState.error = null;
      })
      .addCase(deleteSubjectThunk.rejected, (state, action) => {
        state.deleteSubjectState.isLoading = false;
        state.deleteSubjectState.error = action.payload as string;
      })
      .addCase(promoteStudentsThunk.pending, (state) => {
        state.promoteStudentsState.isLoading = true;
        state.promoteStudentsState.error = null;
      })
      .addCase(promoteStudentsThunk.fulfilled, (state) => {
        state.promoteStudentsState.isLoading = false;
        state.promoteStudentsState.error = null;
      })
      .addCase(promoteStudentsThunk.rejected, (state, action) => {
        state.promoteStudentsState.isLoading = false;
        state.promoteStudentsState.error = action.payload as string;
      })
      .addCase(deleteAcademicYearThunk.pending, (state) => {
        state.deleteProgramYearState.isLoading = true;
        state.deleteProgramYearState.error = null;
      })
      .addCase(
        deleteAcademicYearThunk.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.deleteProgramYearState.isLoading = false;
          state.academicYears = state.academicYears.filter(
            (ay) => ay.academicYearId !== action.payload,
          );
          state.deleteProgramYearState.error = null;
        },
      )
      .addCase(deleteAcademicYearThunk.rejected, (state, action) => {
        state.deleteProgramYearState.isLoading = false;
        state.deleteProgramYearState.error = action.payload as string;
      });
  },
});

export const { clearError, clearSubjects, clearEnrollments } =
  specializationsSlice.actions;
export default specializationsSlice.reducer;
