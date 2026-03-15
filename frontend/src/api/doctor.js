import { api } from "./api";

/* =====================================================
   DASHBOARD
===================================================== */

export const getMyAppointments = () =>
  api.get("/doctor/my-appointments");

export const getMyPatients = () =>
  api.get("/doctor/patients");

/* =====================================================
   APPOINTMENT
===================================================== */

export const getDoctorAppointmentById = (appointmentId) =>
  api.get(`/doctor/appointments/${appointmentId}`);

/* =====================================================
   APPOINTMENT-BASED DATA
===================================================== */

export const getVitalsByAppointment = (appointmentId) =>
  api.get(`/doctor/appointments/${appointmentId}/vitals`);

export const getLabReportsByAppointment = (appointmentId) =>
  api.get(`/doctor/appointments/${appointmentId}/lab-reports`);

export const getAISummaryByAppointment = (appointmentId) =>
  api.get(`/doctor/appointments/${appointmentId}/ai-summary`);

export const getPatientAlertsByAppointment = (appointmentId) =>
  api.get(`/doctor/appointments/${appointmentId}/alerts`);

/* =====================================================
   PATIENT-BASED
===================================================== */

export const getVitals = (patientId) =>
  api.get(`/doctor/patients/${patientId}/vitals`);

export const getPrescriptions = (patientId) =>
  api.get(`/doctor/patients/${patientId}/prescriptions`);

export const getLabReports = (patientId) =>
  api.get(`/doctor/patients/${patientId}/lab-reports`);

export const getAISummary = (patientId) =>
  api.get(`/doctor/patients/${patientId}/ai-summary`);

export const getPatientAlerts = (patientId) =>
  api.get(`/doctor/patients/${patientId}/alerts`);

/* =====================================================
   WRITE ACTIONS
===================================================== */

export const addVitals = (payload) =>
  api.post("/vitals", payload);

export const predictRisk = (payload) =>
  api.post("/ai/predict-risk", payload);

export const updateVitals = (id, payload) =>
  api.put(`/vitals/${id}`, payload);

export const addPrescription = (payload) =>
  api.post("/prescriptions", payload);

export const addLabReport = (payload) =>
  api.post("/lab-reports", payload);

export const updateLabReport = (id, payload) =>
  api.put(`/lab-reports/${id}`, payload);

/* =====================================================
   PROFILE
===================================================== */

export const getDoctorProfile = () =>
  api.get("/doctor/me");

export const updateDoctorProfile = (payload) =>
  api.patch("/doctor/me", payload);