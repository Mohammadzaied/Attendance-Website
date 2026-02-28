// import { checkAuthSession } from "@/features/auth";
// import axios, {
//   AxiosInstance,
//   AxiosError,
//   InternalAxiosRequestConfig,
// } from "axios";

// // Import offline banner control

// // API Configuration
// export const API_BASE_URL = "https://localhost:7094";
// // export const API_BASE_URL = "https://attendance-rwtc.runasp.net";

// // Public endpoints that don't require authentication cookies
// const PUBLIC_ENDPOINTS = ["/Users/SignIn"];

// // Check if endpoint is public
// const isPublicEndpoint = (url: string): boolean => {
//   return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
// };

// // API Client
// let store: any; // Avoid circular dependency by typing as any, or define a minimal interface

// export const injectStore = (_store: any) => {
//   store = _store;
// };

// class ApiClient {
//   private axiosInstance: AxiosInstance;
//   private isRefreshing = false;
//   private failedQueue: any[] = [];

//   private processQueue(error: any, token: string | null = null) {
//     this.failedQueue.forEach((prom) => {
//       if (error) {
//         prom.reject(error);
//       } else {
//         prom.resolve(token);
//       }
//     });

//     this.failedQueue = [];
//   }

//   constructor(baseURL: string) {
//     this.axiosInstance = axios.create({
//       baseURL,
//       headers: {
//         "Content-Type": "application/json",
//       },
//       withCredentials: true,
//     });

//     // Request interceptor - Toggle cookies for public endpoints and add Authorization header
//     this.axiosInstance.interceptors.request.use(
//       (config: InternalAxiosRequestConfig) => {
//         if (config.url && isPublicEndpoint(config.url)) {
//           config.withCredentials = false;
//         } else {
//           config.withCredentials = true;
//         }

//         // Add Authorization header if token exists in store
//         if (store) {
//           const state = store.getState();
//           const token = state.AuthSlice?.accessToken;
//           if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//             console.log(
//               `[API Request] ${config.method?.toUpperCase()} ${config.url} - Authorization: Bearer ${token}`,
//             );
//           }
//         }

//         return config;
//       },
//       (error) => {
//         return Promise.reject(error);
//       },
//     );

//     // Response interceptor - Handle errors and token refresh
//     this.axiosInstance.interceptors.response.use(
//       (response) => response,
//       async (error: AxiosError) => {
//         const originalRequest = error.config as InternalAxiosRequestConfig & {
//           _retry?: boolean;
//         };

//         // Handle connection errors - No internet or server down
//         if (
//           !error.response || // No response from server
//           error.code === "ERR_NETWORK" ||
//           error.code === "ECONNREFUSED" ||
//           error.code === "ERR_CONNECTION_REFUSED"
//         ) {
//           console.error("Connection error:", error.message);
//           // Redirect to not-found page if not already there
//           if (
//             typeof window !== "undefined" &&
//             window.location.pathname !== "/not-found"
//           ) {
//             window.location.href = "/not-found";
//           }
//           return Promise.reject(new Error("Server is unreachable"));
//         }

//         // Handle 401 Unauthorized - Token expired or invalid
//         if (error.response?.status === 401 && !originalRequest._retry) {
//           // If the refresh request itself fails with 401, don't try again
//           if (originalRequest.url?.toLowerCase().includes("auth/refresh")) {
//             this.isRefreshing = false;
//             return Promise.reject(error);
//           }

//           if (this.isRefreshing) {
//             return new Promise((resolve, reject) => {
//               this.failedQueue.push({ resolve, reject });
//             })
//               .then(() => {
//                 return this.axiosInstance(originalRequest);
//               })
//               .catch((err) => {
//                 return Promise.reject(err);
//               });
//           }

//           originalRequest._retry = true;
//           this.isRefreshing = true;

//           try {
//             // Attempt to refresh the session
//             await store.dispatch(checkAuthSession()).unwrap();

//             this.isRefreshing = false;
//             this.processQueue(null);

//             // Retry original request if refresh succeeded
//             return this.axiosInstance(originalRequest);
//           } catch (refreshError) {
//             this.isRefreshing = false;
//             this.processQueue(refreshError);

//             // Refresh failed or no session, redirect to login
//             if (
//               typeof window !== "undefined" &&
//               window.location.pathname !== "/login"
//             ) {
//               window.location.href = "/login";
//             }
//             return Promise.reject(refreshError);
//           }
//         }

//         // Format error message
//         const errorMessage =
//           (error.response?.data as { message?: string })?.message ||
//           error.message ||
//           "An unexpected error occurred";

//         return Promise.reject(new Error(errorMessage));
//       },
//     );
//   }

//   // Token management methods removed as they now live in Redux

//   // HTTP Methods
//   async get<T>(endpoint: string, config?: any): Promise<T> {
//     const response = await this.axiosInstance.get<T>(endpoint, config);
//     return response.data;
//   }

//   async post<T>(endpoint: string, data?: unknown, config?: any): Promise<T> {
//     const response = await this.axiosInstance.post<T>(endpoint, data, config);
//     return response.data;
//   }

//   async put<T>(endpoint: string, data?: unknown): Promise<T> {
//     const response = await this.axiosInstance.put<T>(endpoint, data);
//     return response.data;
//   }

//   async delete<T>(endpoint: string, config?: any): Promise<T> {
//     const response = await this.axiosInstance.delete<T>(endpoint, config);
//     return response.data;
//   }

//   async patch<T>(endpoint: string, data?: unknown): Promise<T> {
//     const response = await this.axiosInstance.patch<T>(endpoint, data);
//     return response.data;
//   }
// }

// export const apiClient = new ApiClient(API_BASE_URL);

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { checkAuthSession, signOut } from "@/features/auth";
// import type { AppStore } from "@/app/store";

export const API_BASE_URL = "https://localhost:7094";

const PUBLIC_ENDPOINTS = ["/Users/SignIn"];

const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some((endpoint) =>
    url.toLowerCase().endsWith(endpoint.toLowerCase()),
  );
};

let store: any;

export const injectStore = (_store: any) => {
  store = _store;
};

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
  }[] = [];

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    // =======================
    // Request Interceptor
    // =======================
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (isPublicEndpoint(config.url)) {
          config.withCredentials = false;
        }

        const token = store?.getState()?.AuthSlice?.accessToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // =======================
    // Response Interceptor
    // =======================
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Network Error
        if (!error.response) {
          return Promise.reject(new Error("Server unreachable"));
        }

        // Handle 401
        if (
          error.response.status === 401 &&
          !originalRequest._retry &&
          !isPublicEndpoint(originalRequest.url)
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.axiosInstance(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await store.dispatch(checkAuthSession()).unwrap();

            const newToken = store.getState()?.AuthSlice?.accessToken;

            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            this.processQueue(null);
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            store.dispatch(signOut());
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        const errorMessage =
          (error.response.data as any)?.message ||
          error.message ||
          "Unexpected error";

        return Promise.reject(new Error(errorMessage));
      },
    );
  }

  private processQueue(error: any) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(true);
      }
    });

    this.failedQueue = [];
  }

  // =======================
  // HTTP Methods
  // =======================

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data);
    return response.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
