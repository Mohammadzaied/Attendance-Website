import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/lib/ApiResponse";
import {
  SignInRequestDto,
  SignInResponseDto,
  ChangePasswordRequestDto,
  PasswordRestoreRequestDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
} from "./authTypes";

const AUTH_ENDPOINT = "Auth";
const USER_ENDPOINT = "Users";

export const authService = {
  signIn: async (credentials: SignInRequestDto): Promise<SignInResponseDto> => {
    const response = await apiClient.post<ApiResponse<SignInResponseDto>>(
      `${AUTH_ENDPOINT}/SignIn`,
      credentials,
    );
    return response.data;
  },

  refresh: async (): Promise<SignInResponseDto> => {
    const response = await apiClient.post<ApiResponse<SignInResponseDto>>(
      `${AUTH_ENDPOINT}/Refresh`,
    );
    return response.data;
  },

  signOut: async (): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_ENDPOINT}/SignOut`);
    } finally {
      // Cookies or storage clearing usually handled in slice or on caller side if needed
    }
  },

  changePassword: async (data: ChangePasswordRequestDto): Promise<void> => {
    await apiClient.post(`${USER_ENDPOINT}/ChangePassword`, data);
  },

  forgotPassword: async (data: PasswordRestoreRequestDto): Promise<void> => {
    await apiClient.post(`${USER_ENDPOINT}/ForgotPassword`, data);
  },

  verifyResetCode: async (data: VerifyResetCodeDto): Promise<void> => {
    await apiClient.post(`${USER_ENDPOINT}/VerifyResetCode`, data);
  },

  resetPassword: async (data: ResetPasswordDto): Promise<void> => {
    await apiClient.post(`${USER_ENDPOINT}/ResetPassword`, data);
  },
};
