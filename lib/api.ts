import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// Import offline banner control

// API Configuration
export const API_BASE_URL = "https://localhost:7094";
// export const API_BASE_URL = "https://attendance-rwtc.runasp.net";

// Public endpoints that don't require authentication cookies
const PUBLIC_ENDPOINTS = ["/Users/SignIn"];

// Check if endpoint is public
const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// API Client
let store: any; // Avoid circular dependency by typing as any, or define a minimal interface

export const injectStore = (_store: any) => {
  store = _store;
};

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Request interceptor - Toggle cookies for public endpoints
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (config.url && isPublicEndpoint(config.url)) {
          config.withCredentials = false;
        } else {
          config.withCredentials = true;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor - Handle errors and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle connection errors - No internet or server down
        if (
          !error.response || // No response from server
          error.code === "ERR_NETWORK" ||
          error.code === "ECONNREFUSED" ||
          error.code === "ERR_CONNECTION_REFUSED"
        ) {
          console.error("Connection error:", error.message);
          // Redirect to not-found page if not already there
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/not-found"
          ) {
            window.location.href = "/not-found";
          }
          return Promise.reject(new Error("Server is unreachable"));
        }

        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/login"
          ) {
            window.location.href = "/login";
          }
          // originalRequest._retry = true;

          // // Prevent infinite loop if the refresh endpoint itself returns 401
          // if (originalRequest.url?.includes("/Auth/Refresh")) {
          //   return Promise.reject(error);
          // }

          // try {
          //   await store.dispatch(checkAuthSession());

          //   // Retry original request
          //   return this.axiosInstance(originalRequest);
          // } catch (refreshError) {
          //   // Refresh failed, log out
          //   store.dispatch({ type: "AppS/signOut/fulfilled" });
          //   if (
          //     typeof window !== "undefined" &&
          //     window.location.pathname !== "/login"
          //   ) {
          //     window.location.href = "/login";
          //   }
          // }

          // // No refresh token or refresh failed
          // store.dispatch({ type: "AppS/signOut/fulfilled" });
          // if (
          //   typeof window !== "undefined" &&
          //   window.location.pathname !== "/login"
          // ) {
          //   window.location.href = "/login";
          // }
        }

        // Format error message
        const errorMessage =
          (error.response?.data as { message?: string })?.message ||
          error.message ||
          "An unexpected error occurred";

        return Promise.reject(new Error(errorMessage));
      },
    );
  }

  // Token management methods removed as they now live in Redux

  // HTTP Methods
  async get<T>(endpoint: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(endpoint: string, data?: unknown, config?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, config);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data);
    return response.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
