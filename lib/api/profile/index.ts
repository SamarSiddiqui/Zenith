import apiClient from "../../utils/apiClient";

export const getProfile = async () => {
    try {
        const response = await apiClient.get(`/profile`);
        return response.data; // Return response from the server
    } catch (error) {
        console.error("Error Fetching Profile:", error);
        throw error;
    }
};

export const updateProfile = async (data: any) => {
    try {
        const response = await apiClient.patch(`/profile`, data);
        return response.data;
    } catch (error) {
        console.error("Error Updating Profile:", error);
        throw error;
    }
};
