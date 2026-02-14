import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { alertService } from "./alertService";
import {
  AlertsByStudentParams,
  AlertsByStudentResponse,
  AlertRejectionDto,
  AlertApprovalDto,
} from "./alertTypes";

interface AlertState {
  alertsByStudent: AlertsByStudentResponse | null;
  fetchAlertsByStudentState: {
    isLoading: boolean;
    error: string | null;
  };
  rejectAlertsState: {
    isLoading: boolean;
    isSuccess: boolean;
    error: string | null;
  };
  approveAlertsState: {
    isLoading: boolean;
    isSuccess: boolean;
    error: string | null;
  };
}

const initialState: AlertState = {
  alertsByStudent: null,
  fetchAlertsByStudentState: {
    isLoading: false,
    error: null,
  },
  rejectAlertsState: {
    isLoading: false,
    isSuccess: false,
    error: null,
  },
  approveAlertsState: {
    isLoading: false,
    isSuccess: false,
    error: null,
  },
};

export const fetchAlertsByStudent = createAsyncThunk(
  "alert/fetchByStudent",
  async (params: AlertsByStudentParams, { rejectWithValue }) => {
    try {
      return await alertService.getAlertsByStudent(params);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch alerts",
      );
    }
  },
);

export const rejectAlerts = createAsyncThunk(
  "alert/reject",
  async (models: AlertRejectionDto[], { rejectWithValue }) => {
    try {
      return await alertService.rejectAlerts(models);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject alerts",
      );
    }
  },
);

export const approveAlerts = createAsyncThunk(
  "alert/approve",
  async (models: AlertApprovalDto[], { rejectWithValue }) => {
    try {
      return await alertService.approveAlerts(models);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve alerts",
      );
    }
  },
);

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    resetAlertsState: (state) => {
      state.alertsByStudent = null;
      state.fetchAlertsByStudentState = initialState.fetchAlertsByStudentState;
      state.rejectAlertsState = initialState.rejectAlertsState;
    },
    resetRejectAlertsState: (state) => {
      state.rejectAlertsState = initialState.rejectAlertsState;
    },
    resetApproveAlertsState: (state) => {
      state.approveAlertsState = initialState.approveAlertsState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlertsByStudent.pending, (state) => {
        state.fetchAlertsByStudentState.isLoading = true;
        state.fetchAlertsByStudentState.error = null;
        state.alertsByStudent = null;
      })
      .addCase(fetchAlertsByStudent.fulfilled, (state, action) => {
        state.fetchAlertsByStudentState.isLoading = false;
        state.alertsByStudent = action.payload;
      })
      .addCase(fetchAlertsByStudent.rejected, (state, action) => {
        state.fetchAlertsByStudentState.isLoading = false;
        state.fetchAlertsByStudentState.error = action.payload as string;
      })
      .addCase(rejectAlerts.pending, (state) => {
        state.rejectAlertsState.isLoading = true;
        state.rejectAlertsState.isSuccess = false;
        state.rejectAlertsState.error = null;
      })
      .addCase(rejectAlerts.fulfilled, (state) => {
        state.rejectAlertsState.isLoading = false;
        state.rejectAlertsState.isSuccess = true;
      })
      .addCase(rejectAlerts.rejected, (state, action) => {
        state.rejectAlertsState.isLoading = false;
        state.rejectAlertsState.isSuccess = false;
        state.rejectAlertsState.error = action.payload as string;
      })
      .addCase(approveAlerts.pending, (state) => {
        state.approveAlertsState.isLoading = true;
        state.approveAlertsState.isSuccess = false;
        state.approveAlertsState.error = null;
      })
      .addCase(approveAlerts.fulfilled, (state) => {
        state.approveAlertsState.isLoading = false;
        state.approveAlertsState.isSuccess = true;
      })
      .addCase(approveAlerts.rejected, (state, action) => {
        state.approveAlertsState.isLoading = false;
        state.approveAlertsState.isSuccess = false;
        state.approveAlertsState.error = action.payload as string;
      });
  },
});

export const {
  resetAlertsState,
  resetRejectAlertsState,
  resetApproveAlertsState,
} = alertSlice.actions;
export default alertSlice.reducer;
