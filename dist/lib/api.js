import axios from "axios";
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
    return config;
});
api.interceptors.response.use((res) => res, (err) => {
    console.error("API ERROR:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
    });
    return Promise.reject(err);
});
export default api;
