import { UserDTO } from "@/types/users";

// CREATE user
export const createUser = async (
  payload: Omit<UserDTO, "id"> // Remove id because DB generates
): Promise<UserDTO> => {
  try {
    const res = await api.post<UserDTO>("/users", payload); // POST request to create user
    return res.data;
  } catch (error) {
    console.error("[CREATE USER ERROR]", error);
    throw error;
  }
};

// UPDATE user
export const updateUser = async (
  id: number,               
  payload: Partial<UserDTO>// Only fields that need change
): Promise<UserDTO> => {
  try {
    const res = await api.patch<UserDTO>(`/users/${id}`, payload); // PATCH request to update user
    return res.data;
  } catch (error) {
    console.error("[UPDATE USER ERROR]", error);
    throw error;
  }
};

// DELETE user
export const deleteUser = async (
  id: number 
): Promise<void> => {
  try {
    await api.delete(`/users/${id}`); // DELETE request to remove user
  } catch (error) {
    console.error("[DELETE USER ERROR]", error);
    throw error;
  }
};
import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000, 
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });

    return Promise.reject(err);
  }
);

//  Search users API call
export const searchUsers = async (query: string) => {
  try {
    console.log(" Calling search API with:", query);

    const res = await fetch(`/api/users/search?q=${query}`);

    console.log(" Response status:", res.status);

    const text = await res.text(); //  IMPORTANT DEBUG
    console.log(" Raw response:", text);

    if (!res.ok) {
      throw new Error(`Failed to search users: ${res.status}`);
    }
    const data = JSON.parse(text);
    console.log(" Parsed data:", data);

    return data.users;
  } catch (error) {
    console.error(" searchUsers error:", error);
    return [];
  }
};

export default api;