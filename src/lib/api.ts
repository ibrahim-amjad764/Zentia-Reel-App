// import axios, { AxiosInstance } from "axios";

// // Resolve API base URL safely
// // Purpose:
// // - Use environment variable when deployed
// // - Fallback to Next.js API routes (/api) in local development
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// console.log("[API] Base URL:", BASE_URL);

// // API instance configuration
// const api: AxiosInstance = axios.create({
//   baseURL: BASE_URL,
//   timeout: 10000,
//   withCredentials: true, // ensures cookies/JWT are sent with every request
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // ===============================
// // REQUEST INTERCEPTOR
// // ===============================
// api.interceptors.request.use(
//   (config) => {
//     try {
//       const fullUrl = `${config.baseURL}${config.url}`;

//       console.log("[API] Request:", {
//         method: config.method?.toUpperCase(),
//         url: fullUrl,
//         data: config.data,
//         params: config.params,
//       });

//       return config;
//     } catch (err) {
//       console.error("[API] Request interceptor error:", err);
//       return config;
//     }
//   },
//   (error) => {
//     console.error("[API] Request Error:", {
//       message: error.message,
//       stack: error.stack,
//     });

//     return Promise.reject(error);
//   }
// );

// // ===============================
// // RESPONSE INTERCEPTOR
// // ===============================
// api.interceptors.response.use(
//   (response) => {
//     console.log("[API] Response:", {
//       url: response.config?.url,
//       status: response.status,
//       data: response.data,
//     });

//     return response;
//   },
//   (error) => {
//     // Network errors (server unreachable)
//     if (error.message === "Network Error") {
//       console.error("[API] Network Error: Server unreachable");

//       console.error({
//         attemptedUrl: `${error.config?.baseURL}${error.config?.url}`,
//         message: error.message,
//       });
//     }

//     // Timeout errors
//     if (error.code === "ECONNABORTED") {
//       console.error("[API] Request Timeout:", {
//         url: error.config?.url,
//         timeout: error.config?.timeout,
//       });
//     }

//     // Server response errors
//     if (error.response) {
//       console.error("[API] Server Error:", {
//         url: error.config?.url,
//         status: error.response.status,
//         data: error.response.data,
//       });
//     }

//     // Unknown errors
//     if (!error.response && error.message !== "Network Error") {
//       console.error("[API] Unknown Axios Error:", {
//         url: error.config?.url,
//         message: error.message,
//       });
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

import axios, { AxiosInstance, AxiosError } from "axios";

const BASE_URL = "/api";
console.log("[API] Base URL:", BASE_URL);

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(
  (config) => {
    try {
      const fullUrl = `${config.baseURL}${config.url}`;
      console.log("[API] Request:", {
        method: config.method?.toUpperCase(),
        url: fullUrl,
        data: config.data,
        params: config.params,
      });
      return config;
    } catch (err) {
      console.error("[API] Request interceptor error:", err);
      return config;
    }
  },
  (error: AxiosError) => {
    console.error("[API] Request Error:", {
      message: error.message,
      stack: error.stack,
    });
    return Promise.reject(error);
  }
);

// ===============================
// RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  (response) => {
    console.log("[API] Response:", {
      url: `${response.config?.baseURL}${response.config?.url}`,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error: AxiosError) => {
    const attemptedUrl = `${error.config?.baseURL}${error.config?.url}`;

    // Network / no response
    if (!error.response) {
      console.error("[API] Network/Unknown Error:", {
        attemptedUrl,
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      return Promise.reject(error);
    }

    // Timeout
    if (error.code === "ECONNABORTED") {
      console.error("[API] Request Timeout:", {
        attemptedUrl,
        timeout: error.config?.timeout,
      });
    }

    // Safely extract server response data
    const safeData =
      error.response && typeof error.response.data === "object"
        ? error.response.data
        : { message: error.response?.statusText || "Unknown server error" };

    console.error("[API] Server Error:", {
      attemptedUrl,
      status: error.response?.status,
      data: safeData,
    });

    // Replace undefined data with safe object
    if (!error.response.data || typeof error.response.data !== "object") {
      error.response.data = safeData;
    }

    return Promise.reject(error);
  }
);
export default api;