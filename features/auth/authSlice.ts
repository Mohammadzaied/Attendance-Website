import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "./authService";
import {
  SignInRequestDto,
  SignInResponseDto,
  AuthState,
  ChangePasswordRequestDto,
  PasswordRestoreRequestDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
} from "./authTypes";

const initialAsyncState = { isLoading: false, error: null };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  signInState: initialAsyncState,
  checkAuthSessionState: initialAsyncState,
  signOutState: initialAsyncState,
  changePasswordState: initialAsyncState,
  forgotPasswordState: initialAsyncState,
  verifyResetCodeState: initialAsyncState,
  resetPasswordState: initialAsyncState,
};

export const signIn = createAsyncThunk(
  "auth/signIn",
  async (credentials: SignInRequestDto, { rejectWithValue }) => {
    try {
      const response = await authService.signIn(credentials);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  },
);

export const checkAuthSession = createAsyncThunk(
  "auth/checkAuthSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refresh();
      return response;
    } catch (error) {
      return rejectWithValue(null);
    }
  },
);

export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      await authService.signOut();
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: ChangePasswordRequestDto, { rejectWithValue }) => {
    try {
      await authService.changePassword(data);
      return null;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "An error occurred while changing password",
      );
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data: PasswordRestoreRequestDto, { rejectWithValue }) => {
    try {
      await authService.forgotPassword(data);
      return null;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while sending reset code",
      );
    }
  },
);

export const verifyResetCode = createAsyncThunk(
  "auth/verifyResetCode",
  async (data: VerifyResetCodeDto, { rejectWithValue }) => {
    try {
      await authService.verifyResetCode(data);
      return null;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while verifying reset code",
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: ResetPasswordDto, { rejectWithValue }) => {
    try {
      await authService.resetPassword(data);
      return null;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while resetting password",
      );
    }
  },
);

const AuthSlice = createSlice({
  name: "AuthSlice",
  initialState,
  reducers: {
    clearError: (state) => {
      state.signInState.error = null;
      state.checkAuthSessionState.error = null;
      state.signOutState.error = null;
      state.changePasswordState.error = null;
      state.forgotPasswordState.error = null;
      state.verifyResetCodeState.error = null;
      state.resetPasswordState.error = null;
    },
    updateUserInfo: (
      state,
      action: PayloadAction<{ fullName: string; username: string }>,
    ) => {
      if (state.user) {
        state.user.fullName = action.payload.fullName;
        state.user.username = action.payload.username;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.signInState.isLoading = true;
        state.signInState.error = null;
      })
      .addCase(
        signIn.fulfilled,
        (state, action: PayloadAction<SignInResponseDto>) => {
          state.signInState.isLoading = false;
          state.user = action.payload;
          state.isAuthenticated = true;
          state.signInState.error = null;
        },
      )
      .addCase(signIn.rejected, (state, action) => {
        state.signInState.isLoading = false;
        state.signInState.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(checkAuthSession.pending, (state) => {
        state.checkAuthSessionState.isLoading = true;
        state.isInitializing = true;
      })
      .addCase(
        checkAuthSession.fulfilled,
        (state, action: PayloadAction<SignInResponseDto>) => {
          state.checkAuthSessionState.isLoading = false;
          state.user = action.payload;
          state.isAuthenticated = true;
          state.checkAuthSessionState.error = null;
          state.isInitializing = false;
        },
      )
      .addCase(checkAuthSession.rejected, (state) => {
        state.checkAuthSessionState.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitializing = false;
      })
      .addCase(signOut.pending, (state) => {
        state.signOutState.isLoading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.signOutState.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.signOutState.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.signOutState.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.signOutState.error = action.payload as string;
      })
      .addCase(changePassword.pending, (state) => {
        state.changePasswordState.isLoading = true;
        state.changePasswordState.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordState.isLoading = false;
        state.changePasswordState.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordState.isLoading = false;
        state.changePasswordState.error = action.payload as string;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordState.isLoading = true;
        state.forgotPasswordState.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordState.isLoading = false;
        state.forgotPasswordState.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordState.isLoading = false;
        state.forgotPasswordState.error = action.payload as string;
      })
      .addCase(verifyResetCode.pending, (state) => {
        state.verifyResetCodeState.isLoading = true;
        state.verifyResetCodeState.error = null;
      })
      .addCase(verifyResetCode.fulfilled, (state) => {
        state.verifyResetCodeState.isLoading = false;
        state.verifyResetCodeState.error = null;
      })
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.verifyResetCodeState.isLoading = false;
        state.verifyResetCodeState.error = action.payload as string;
      })
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordState.isLoading = true;
        state.resetPasswordState.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordState.isLoading = false;
        state.resetPasswordState.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordState.isLoading = false;
        state.resetPasswordState.error = action.payload as string;
      });
  },
});

export const { clearError, updateUserInfo } = AuthSlice.actions;
export default AuthSlice.reducer;
