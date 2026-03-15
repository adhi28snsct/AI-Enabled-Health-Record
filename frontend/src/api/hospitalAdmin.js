// src/api/hospitalAdmin.js
import { api } from "./api"

/* =========================================
   ADD DOCTOR
========================================= */
export const addDoctor = (email, name) =>
  api.post("/hospital/add-doctor", { email, name })

/* =========================================
   GET ALL DOCTORS
========================================= */
export const getHospitalDoctors = () =>
  api.get("/hospital/doctors")

/* =========================================
   APPROVE DOCTOR
========================================= */
export const approveDoctor = (id) =>
  api.patch(`/hospital/approve-doctor/${id}`)

/* =========================================
   DEACTIVATE DOCTOR
========================================= */
export const deactivateDoctor = (id) =>
  api.patch(`/hospital/deactivate-doctor/${id}`)

/* =========================================
   GET ALL PATIENTS
========================================= */
export const getHospitalPatients = () =>
  api.get("/hospital/patients")

/* =========================================
   GET ALL APPOINTMENTS
========================================= */
export const getHospitalAppointments = () =>
  api.get("/hospital/appointments")

/* =========================================
   GET DASHBOARD STATS
========================================= */
export const getHospitalStats = () =>
  api.get("/hospital/stats")