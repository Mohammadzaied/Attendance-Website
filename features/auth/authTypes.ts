// Sign-In Request DTO
export interface SignInRequestDto {
  username: string;
  password: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Sign-In Response DTO (matches C# backend)
export interface SignInResponseDto {
  userId: number;
  fullName: string;
  username: string;
  roleName: string;
  departmentId: number | null;
  departmentName: string | null;
}

export interface AsyncState {
  isLoading: boolean;
  error: string | null;
}

// Auth State
export interface AuthState {
  user: SignInResponseDto | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  signInState: AsyncState;
  checkAuthSessionState: AsyncState;
  signOutState: AsyncState;
  changePasswordState: AsyncState;
  forgotPasswordState: AsyncState;
  verifyResetCodeState: AsyncState;
  resetPasswordState: AsyncState;
}

export interface PasswordRestoreRequestDto {
  email: string;
}

export interface VerifyResetCodeDto {
  email: string;
  code: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}
