import { api } from "./api";

// Assuming these were previously in a generic file or need to be here
export const getHospitals = () =>
    api.get("/admin/hospitals");

export const createHospital = (payload) =>
    api.post("/admin/hospitals", payload);

export const updateHospitalStatus = (id, isActive) =>
    api.patch(`/admin/hospitals/${id}/status`, { isActive });

export const getHospitalAnalytics = (id) =>
    api.get(`/admin/hospitals/${id}/analytics`);
