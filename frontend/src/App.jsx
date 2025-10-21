import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./api/authContext"; // ✅ use full provider

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientPortal from "./pages/PatientPortal";
import HealthWorkerPortal from "./pages/HealthWorkerPortal";
import DoctorPortal from "./pages/DoctorPortal";
import AdminPortal from "./pages/AdminPortal";

import GlobalLayout from "./layouts/GlobalLayout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GlobalLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Role-Based Portals */}
            <Route path="/patient" element={<PatientPortal />} />
            <Route path="/health-worker" element={<HealthWorkerPortal />} />
            <Route path="/doctor" element={<DoctorPortal />} />
            <Route path="/admin" element={<AdminPortal />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;