import { api } from "./api"; // your axios instance

// READ Endpoints
export const getAllPatients = () => api.get("/doctor/patients");
export const getVitals = (patientId) => api.get(`/doctor/vitals/${patientId}`);
export const getPrescriptions = (patientId) => api.get(`/doctor/prescriptions/${patientId}`);
export const getLabReports = (patientId) => api.get(`/doctor/lab-reports/${patientId}`);
export const getAISummary = (patientId) => api.get(`/doctor/ai-summary/${patientId}`);
export const getPatientAlerts = (patientId) => api.get(`/doctor/alerts/${patientId}`);


export const addVitals = (data) => api.post("/doctor/vitals", data);
export const addPrescription = (data) => api.post("/doctor/prescriptions", data);
export const addLabReport = (data) => api.post("/doctor/lab-reports", data);
export const addAlert = (data) => api.post("/doctor/alerts", data);

export const getDoctorProfile = (doctorId) => api.get(`/doctor/doctors/${doctorId}`);
export const updateDoctorProfile = (doctorId, payload) => api.patch(`/doctor/doctors/${doctorId}`, payload);


export const updateVitals = (vitalsId, payload) => api.put(`/doctor/vitals/${vitalsId}`, payload);
export const updateLabReport = (reportId, payload) => api.put(`/doctor/lab-reports/${reportId}`, payload); 