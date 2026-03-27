// import api from "@/lib/api";
// import { UserDTO } from "@/types/users";
// // Get
// export const getUsers = async (): Promise<UserDTO[]> => {
import api from "@/lib/api";
// CREATE user
export const createUser = async (payload // Remove id because DB generates
) => {
    try {
        const res = await api.post("/users", payload); // POST request to create user
        return res.data;
    }
    catch (error) {
        console.error("[CREATE USER ERROR]", error);
        throw error;
    }
};
// UPDATE user
export const updateUser = async (id, payload // Only fields that need change
) => {
    try {
        const res = await api.patch(`/users/${id}`, payload); // PATCH request to update user
        return res.data;
    }
    catch (error) {
        console.error("[UPDATE USER ERROR]", error);
        throw error;
    }
};
// DELETE user
export const deleteUser = async (id) => {
    try {
        await api.delete(`/users/${id}`); // DELETE request to remove user
    }
    catch (error) {
        console.error("[DELETE USER ERROR]", error);
        throw error;
    }
};
