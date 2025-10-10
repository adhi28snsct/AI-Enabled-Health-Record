import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientPortal from './pages/PatientPortal';
import HealthWorkerPortal from './pages/HealthWorkerPortal';
import DoctorPortal from './pages/DoctorPortal';
import AdminPortal from './pages/AdminPortal';
import Navbar from './components/NavBar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Global Navigation */}
        <Navbar />

        {/* Page Content */}
        <main className="p-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Role-Based Portals */}
            <Route path="/patient" element={<PatientPortal />} />
            <Route path="/health-worker" element={<HealthWorkerPortal />} />
            <Route path="/doctor" element={<DoctorPortal />} />
            <Route path="/admin" element={<AdminPortal />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;