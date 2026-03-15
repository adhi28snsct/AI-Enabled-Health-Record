import { api } from "./api";

/* =====================================================
   DASHBOARD & APPOINTMENTS
===================================================== */

// ✅ FIXED (added "s")
export const getMyAppointments = () =>
    api.get("/appointments/my");

// ✅ FIXED (added "s")
export const getAllDoctors = () =>
    api.get("/appointments/doctors");

// ✅ FIXED (added "s")
export const bookAppointment = (payload) =>
    api.post("/appointments", payload);


/* =====================================================
   MEDICAL RECORDS
===================================================== */

export const getMyVitals = () =>
    api.get("/patients/me/records");

export const getMyPrescriptions = () =>
    api.get("/patients/me/prescriptions");

export const getMyLabReports = () =>
    api.get("/patients/me/lab-reports");

export const getMyAISummary = () =>
    api.get("/patients/me/ai-summary");

export const getMyAlerts = () =>
    api.get("/patients/me/alerts");


/* =====================================================
   AI HEALTH CHECK
===================================================== */

export const predictRisk = (payload) =>
    api.post("/ai/predict-risk", payload);


/* =====================================================
   PROFILE
===================================================== */

export const getPatientProfile = () =>
    api.get("/patients/me/profile");  // 🔥 important

export const updatePatientProfile = (payload) =>
    api.patch("/patients/me/profile", payload);