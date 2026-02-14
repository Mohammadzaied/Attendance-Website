import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminService } from "./adminService";
import {
  AdminState,
  TeacherResponse,
  DepartmentResponse,
  CreateTeacherDto,
  UpdateTeacherDto,
  ImportResponse,
  DepartmentHead,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  TeacherListResponse,
  DetailedSubjectResponse,
} from "./adminTypes";

const initialAsyncState = { isLoading: false, error: null };

const initialState: AdminState = {
  teachers: [],
  teachersList: [],
  departments: [],
  departmentHeads: [],
  selectedTeacher: null,
  isUpdateDialogOpen: false,
  isDeleteDialogOpen: false,
  fetchTeachersState: initialAsyncState,
  fetchTeachersListState: initialAsyncState,
  fetchDepartmentsState: initialAsyncState,
  fetchDepartmentHeadsState: initialAsyncState,
  createTeacherState: initialAsyncState,
  createDepartmentState: initialAsyncState,
  updateTeacherState: initialAsyncState,
  updateDepartmentState: initialAsyncState,
  deleteTeacherState: initialAsyncState,
  deleteDepartmentState: initialAsyncState,
  importUsersState: initialAsyncState,
  teacherLastActiveSemester: [],
  fetchTeacherLastActiveSemesterState: initialAsyncState,
};

export const fetchDepartments = createAsyncThunk(
  "admin/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllDepartments();
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch departments");
    }
  },
);

export const fetchTeachers = createAsyncThunk(
  "admin/fetchTeachers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllTeachers();
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch teachers");
    }
  },
);

export const fetchTeachersList = createAsyncThunk(
  "admin/fetchTeachersList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getTeachersList();
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch teachers list");
    }
  },
);

export const fetchDepartmentHeads = createAsyncThunk(
  "admin/fetchDepartmentHeads",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getDepartmentHeads();
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch department heads");
    }
  },
);

export const createTeacher = createAsyncThunk(
  "admin/createTeacher",
  async (data: CreateTeacherDto, { rejectWithValue }) => {
    try {
      const response = await adminService.createTeacher(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create teacher");
    }
  },
);

export const createDepartment = createAsyncThunk(
  "admin/createDepartment",
  async (data: CreateDepartmentDto, { rejectWithValue }) => {
    try {
      const response = await adminService.createDepartment(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to create department");
    }
  },
);

export const updateTeacher = createAsyncThunk(
  "admin/updateTeacher",
  async (data: UpdateTeacherDto, { rejectWithValue }) => {
    try {
      const response = await adminService.updateTeacher(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update teacher");
    }
  },
);

export const deleteTeacher = createAsyncThunk(
  "admin/deleteTeacher",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminService.deleteTeacher(id);
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete teacher");
    }
  },
);

export const importUsers = createAsyncThunk(
  "admin/importUsers",
  async (users: CreateTeacherDto[], { dispatch, rejectWithValue }) => {
    try {
      const response = await adminService.importUsers(users);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to import users");
    }
  },
);

export const deleteDepartment = createAsyncThunk(
  "admin/deleteDepartment",
  async (data: { id: string; password: string }, { rejectWithValue }) => {
    try {
      await adminService.deleteDepartment(data);
      return data.id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to delete department");
    }
  },
);

export const updateDepartment = createAsyncThunk(
  "admin/updateDepartment",
  async (data: UpdateDepartmentDto, { rejectWithValue }) => {
    try {
      const response = await adminService.updateDepartment(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update department");
    }
  },
);

export const fetchTeacherLastActiveSemester = createAsyncThunk(
  "admin/fetchTeacherLastActiveSemester",
  async (teacherId: string, { rejectWithValue }) => {
    try {
      const response =
        await adminService.getTeacherLastActiveSemester(teacherId);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch teacher last active semester");
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.fetchTeachersState.error = null;
      state.fetchTeachersListState.error = null;
      state.fetchDepartmentsState.error = null;
      state.fetchDepartmentHeadsState.error = null;
      state.createTeacherState.error = null;
      state.createDepartmentState.error = null;
      state.updateTeacherState.error = null;
      state.updateDepartmentState.error = null;
      state.deleteTeacherState.error = null;
      state.deleteDepartmentState.error = null;
      state.importUsersState.error = null;
      state.fetchTeacherLastActiveSemesterState.error = null;
    },
    setSelectedTeacher: (
      state,
      action: PayloadAction<TeacherResponse | null>,
    ) => {
      state.selectedTeacher = action.payload;
    },
    openUpdateDialog: (state, action: PayloadAction<TeacherResponse>) => {
      state.selectedTeacher = action.payload;
      state.isUpdateDialogOpen = true;
    },
    closeUpdateDialog: (state) => {
      state.isUpdateDialogOpen = false;
      state.selectedTeacher = null;
    },
    openDeleteDialog: (state, action: PayloadAction<TeacherResponse>) => {
      state.selectedTeacher = action.payload;
      state.isDeleteDialogOpen = true;
    },
    closeDeleteDialog: (state) => {
      state.isDeleteDialogOpen = false;
      state.selectedTeacher = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.fetchDepartmentsState.isLoading = true;
        state.fetchDepartmentsState.error = null;
      })
      .addCase(
        fetchDepartments.fulfilled,
        (state, action: PayloadAction<DepartmentResponse[]>) => {
          state.fetchDepartmentsState.isLoading = false;
          state.departments = action.payload;
          state.fetchDepartmentsState.error = null;
        },
      )
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.fetchDepartmentsState.isLoading = false;
        state.fetchDepartmentsState.error = action.payload as string;
      })
      .addCase(fetchTeachers.pending, (state) => {
        state.fetchTeachersState.isLoading = true;
        state.fetchTeachersState.error = null;
      })
      .addCase(
        fetchTeachers.fulfilled,
        (state, action: PayloadAction<TeacherResponse[]>) => {
          state.fetchTeachersState.isLoading = false;
          state.teachers = action.payload;
          state.fetchTeachersState.error = null;
        },
      )
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.fetchTeachersState.isLoading = false;
        state.fetchTeachersState.error = action.payload as string;
      })
      .addCase(fetchTeachersList.pending, (state) => {
        state.fetchTeachersListState.isLoading = true;
        state.fetchTeachersListState.error = null;
      })
      .addCase(
        fetchTeachersList.fulfilled,
        (state, action: PayloadAction<TeacherListResponse[]>) => {
          state.fetchTeachersListState.isLoading = false;
          state.teachersList = action.payload;
          state.fetchTeachersListState.error = null;
        },
      )
      .addCase(fetchTeachersList.rejected, (state, action) => {
        state.fetchTeachersListState.isLoading = false;
        state.fetchTeachersListState.error = action.payload as string;
      })
      .addCase(createTeacher.pending, (state) => {
        state.createTeacherState.isLoading = true;
        state.createTeacherState.error = null;
      })
      .addCase(
        createTeacher.fulfilled,
        (state, action: PayloadAction<TeacherResponse>) => {
          state.createTeacherState.isLoading = false;
          state.teachers.push(action.payload);
          state.createTeacherState.error = null;
        },
      )
      .addCase(createTeacher.rejected, (state, action) => {
        state.createTeacherState.isLoading = false;
        state.createTeacherState.error = action.payload as string;
      })
      .addCase(updateTeacher.pending, (state) => {
        state.updateTeacherState.isLoading = true;
        state.updateTeacherState.error = null;
      })
      .addCase(
        updateTeacher.fulfilled,
        (state, action: PayloadAction<TeacherResponse>) => {
          state.updateTeacherState.isLoading = false;
          const index = state.teachers.findIndex(
            (t) => t.userId === action.payload.userId,
          );
          if (index !== -1) {
            state.teachers[index] = action.payload;
          }
          state.isUpdateDialogOpen = false;
          state.selectedTeacher = null;
        },
      )
      .addCase(updateTeacher.rejected, (state, action) => {
        state.updateTeacherState.isLoading = false;
        state.updateTeacherState.error = action.payload as string;
      })
      .addCase(deleteTeacher.pending, (state) => {
        state.deleteTeacherState.isLoading = true;
        state.deleteTeacherState.error = null;
      })
      .addCase(
        deleteTeacher.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.deleteTeacherState.isLoading = false;
          state.teachers = state.teachers.filter(
            (t) => t.userId !== action.payload,
          );
          state.isDeleteDialogOpen = false;
          state.selectedTeacher = null;
        },
      )
      .addCase(deleteTeacher.rejected, (state, action) => {
        state.deleteTeacherState.isLoading = false;
        state.deleteTeacherState.error = action.payload as string;
      })
      .addCase(importUsers.pending, (state) => {
        state.importUsersState.isLoading = true;
        state.importUsersState.error = null;
        state.importUsersState.data = undefined;
      })
      .addCase(
        importUsers.fulfilled,
        (state, action: PayloadAction<ImportResponse>) => {
          state.importUsersState.isLoading = false;
          state.importUsersState.data = action.payload;
          state.importUsersState.error = action.payload.errors;
        },
      )
      .addCase(importUsers.rejected, (state, action) => {
        state.importUsersState.isLoading = false;
        state.importUsersState.error = action.payload as string;
      })
      .addCase(fetchDepartmentHeads.pending, (state) => {
        state.fetchDepartmentHeadsState.isLoading = true;
        state.fetchDepartmentHeadsState.error = null;
      })
      .addCase(
        fetchDepartmentHeads.fulfilled,
        (state, action: PayloadAction<DepartmentHead[]>) => {
          state.fetchDepartmentHeadsState.isLoading = false;
          state.departmentHeads = action.payload;
          state.fetchDepartmentHeadsState.error = null;
        },
      )
      .addCase(fetchDepartmentHeads.rejected, (state, action) => {
        state.fetchDepartmentHeadsState.isLoading = false;
        state.fetchDepartmentHeadsState.error = action.payload as string;
      })
      .addCase(createDepartment.pending, (state) => {
        state.createDepartmentState.isLoading = true;
        state.createDepartmentState.error = null;
      })
      .addCase(
        createDepartment.fulfilled,
        (state, action: PayloadAction<DepartmentResponse>) => {
          state.createDepartmentState.isLoading = false;
          state.departments.push(action.payload);
          state.createDepartmentState.error = null;
        },
      )
      .addCase(createDepartment.rejected, (state, action) => {
        state.createDepartmentState.isLoading = false;
        state.createDepartmentState.error = action.payload as string;
      })
      .addCase(deleteDepartment.pending, (state) => {
        state.deleteDepartmentState.isLoading = true;
        state.deleteDepartmentState.error = null;
      })
      .addCase(
        deleteDepartment.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.deleteDepartmentState.isLoading = false;
          state.departments = state.departments.filter(
            (d) => d.departmentId.toString() !== action.payload,
          );
        },
      )
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.deleteDepartmentState.isLoading = false;
        state.deleteDepartmentState.error = action.payload as string;
      })
      .addCase(updateDepartment.pending, (state) => {
        state.updateDepartmentState.isLoading = true;
        state.updateDepartmentState.error = null;
      })
      .addCase(
        updateDepartment.fulfilled,
        (state, action: PayloadAction<DepartmentResponse>) => {
          state.updateDepartmentState.isLoading = false;
          const index = state.departments.findIndex(
            (d) => d.departmentId === action.payload.departmentId,
          );
          if (index !== -1) {
            state.departments[index] = action.payload;
          }
        },
      )
      .addCase(updateDepartment.rejected, (state, action) => {
        state.updateDepartmentState.isLoading = false;
        state.updateDepartmentState.error = action.payload as string;
      })
      .addCase(fetchTeacherLastActiveSemester.pending, (state) => {
        state.fetchTeacherLastActiveSemesterState.isLoading = true;
        state.fetchTeacherLastActiveSemesterState.error = null;
        state.teacherLastActiveSemester = []; // Clear previous data
      })
      .addCase(
        fetchTeacherLastActiveSemester.fulfilled,
        (state, action: PayloadAction<DetailedSubjectResponse[] | any>) => {
          state.fetchTeacherLastActiveSemesterState.isLoading = false;
          // Handle cases where the payload might be the full ApiResponse or have different structures
          const data = Array.isArray(action.payload)
            ? action.payload
            : action.payload?.data || action.payload?.subjects || [];

          state.teacherLastActiveSemester = Array.isArray(data) ? data : [];
          state.fetchTeacherLastActiveSemesterState.error = null;
        },
      )
      .addCase(fetchTeacherLastActiveSemester.rejected, (state, action) => {
        state.fetchTeacherLastActiveSemesterState.isLoading = false;
        state.fetchTeacherLastActiveSemesterState.error =
          action.payload as string;
        state.teacherLastActiveSemester = [];
      });
  },
});

export const {
  clearError,
  setSelectedTeacher,
  openUpdateDialog,
  closeUpdateDialog,
  openDeleteDialog,
  closeDeleteDialog,
} = adminSlice.actions;

export default adminSlice.reducer;
