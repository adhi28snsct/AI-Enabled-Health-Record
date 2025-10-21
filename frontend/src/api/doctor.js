import { api } from "./api"; // your axios instance

export const getAllPatients = () => api.get("/doctor/patients");
export const getVitals = (patientId) => api.get(`/doctor/vitals/${patientId}`);
export const addPrescription = (data) => api.post("/doctor/prescriptions", data);
export const getPrescriptions = (patientId) => api.get(`/doctor/prescriptions/${patientId}`);
export const getLabReports = (patientId) => api.get(`/doctor/lab-reports/${patientId}`);
export const getAISummary = (patientId) => api.get(`/doctor/ai-summary/${patientId}`);
export const getPatientAlerts = (patientId) => api.get(`/doctor/alerts/${patientId}`);
export const addVitals = (data) =>
  api.post("/doctor/vitals", data);
