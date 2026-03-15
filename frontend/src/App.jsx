import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ================= PUBLIC PAGES ================= */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* ================= LAYOUT ================= */
import GlobalLayout from "./layouts/GlobalLayout";

/* ================= PATIENT ================= */
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientDoctors from "./pages/patient/PatientDoctors";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientAIHealthCheck from "./pages/patient/PatientAIHealthCheck";

/* ================= DOCTOR ================= */
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorPatientDetail from "./pages/doctor/DoctorPatientDetail";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";

/* ================= HOSPITAL ADMIN ================= */
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalDoctors from "./pages/hospital/Doctors";
import HospitalPatients from "./pages/hospital/Patients";

/* ================= PLATFORM ADMIN ================= */
import PlatformDashboard from "./pages/platform/Dashboard";
import Hospitals from "./pages/platform/Hospitals";
import HospitalDetail from "./pages/platform/HospitalDetail";

/* ================= ROUTE GUARDS ================= */
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import HospitalAppointmentsPage from "./pages/hospital/Appointments";

const router = createBrowserRouter([
  {
    element: <GlobalLayout />,
    children: [
      /* ================= HOME ================= */
      { path: "/", element: <Home /> },

      /* ================= PUBLIC ONLY ================= */
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
          { path: "/forgot-password", element: <ForgotPassword /> },
          { path: "/reset-password", element: <ResetPassword /> },
          { path: "/reset-password/:token", element: <ResetPassword /> },
        ],
      },

      /* ================= PATIENT ================= */
      {
        element: <ProtectedRoute allowedRoles={["patient"]} />,
        children: [
          { path: "/patient", element: <PatientDashboard /> },
          { path: "/patient/doctors", element: <PatientDoctors /> },
          { path: "/patient/appointments", element: <PatientAppointments /> },
          { path: "/patient/records", element: <PatientRecords /> },
          { path: "/patient/ai-check", element: <PatientAIHealthCheck /> },
        ],
      },

      /* ================= DOCTOR ================= */
      {
        element: <ProtectedRoute allowedRoles={["doctor"]} />,
        children: [
          { path: "/doctor/dashboard", element: <DoctorDashboard /> },
          { path: "/doctor/patients", element: <DoctorPatients /> },
          { path: "/doctor/appointments", element: <DoctorAppointments /> },
          {
            path: "/doctor/patients/:patientId",
            element: <DoctorPatientDetail />,
          },
        ],
      },

      /* ================= HOSPITAL ADMIN ================= */
      {
        element: <ProtectedRoute allowedRoles={["hospital_admin"]} />,
        children: [
          { path: "/hospital/dashboard", element: <HospitalDashboard /> },
          { path: "/hospital/doctors", element: <HospitalDoctors /> },
          { path: "/hospital/patients", element: <HospitalPatients /> },
          { path: "/hospital/appointments", element: <HospitalAppointmentsPage /> },
        ],
      },

      /* ================= PLATFORM ADMIN ================= */
      {
        element: <ProtectedRoute allowedRoles={["platform_admin"]} />,
        children: [
          { path: "/platform/dashboard", element: <PlatformDashboard /> },
          { path: "/platform/hospitals", element: <Hospitals /> },
          { path: "/platform/hospitals/:id", element: <HospitalDetail /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <RouterProvider router={router} />
    </>
  );
}