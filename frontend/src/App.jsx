// src/App.jsx
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientPortal from "./pages/PatientPortal";
import HealthWorkerPortal from "./pages/HealthWorkerPortal";
import DoctorPortal from "./pages/DoctorPortal";
import AdminPortal from "./pages/AdminPortal";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import GlobalLayout from "./layouts/GlobalLayout";

const router = createBrowserRouter([
  {
    element: <GlobalLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },

      // allow visiting the generic reset page (enter email)
      { path: "/forgot-password", element: <ForgotPassword /> },

      // register both the generic reset page and the token route
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/reset-password/:token", element: <ResetPassword /> },

      { path: "/patient", element: <PatientPortal /> },
      { path: "/health-worker", element: <HealthWorkerPortal /> },
      { path: "/doctor", element: <DoctorPortal /> },
      { path: "/admin", element: <AdminPortal /> },
    ],
  },
]);

export default function App() {
  return (
    <>
      <ToastContainer position="top-right" />
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      />
    </>
  );
}
