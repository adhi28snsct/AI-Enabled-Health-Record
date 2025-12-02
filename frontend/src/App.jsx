
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientPortal from "./pages/PatientPortal";
import HealthWorkerPortal from "./pages/HealthWorkerPortal";
import DoctorPortal from "./pages/DoctorPortal";
import AdminPortal from "./pages/AdminPortal";

import GlobalLayout from "./layouts/GlobalLayout";

const router = createBrowserRouter([
  {
    element: <GlobalLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/patient", element: <PatientPortal /> },
      { path: "/health-worker", element: <HealthWorkerPortal /> },
      { path: "/doctor", element: <DoctorPortal /> },
      { path: "/admin", element: <AdminPortal /> },
    ],
  },
]);

export default function AppRouter(props) {
  return (
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
      {...props}
    />
  );
}
