import { useState } from 'react';
import { Heart, ClipboardList, Activity, BarChart3 } from 'lucide-react';
import PatientPortal from './portals/PatientPortal';
import HealthWorkerPortal from './portals/HealthWorkerPortal';
import DoctorPortal from './portals/DoctorPortal';
import AdminPortal from './portals/AdminPortal';

function App() {
  const [selectedPortal, setSelectedPortal] = useState(null);

  if (selectedPortal === 'patient') {
    return <PatientPortal />;
  }

  if (selectedPortal === 'health-worker') {
    return <HealthWorkerPortal />;
  }

  if (selectedPortal === 'doctor') {
    return <DoctorPortal />;
  }

  if (selectedPortal === 'admin') {
    return <AdminPortal />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mb-4 shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">HealthConnect Platform</h1>
          <p className="text-lg text-gray-600">Comprehensive Healthcare Management System</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Patient Portal */}
          <button
            onClick={() => setSelectedPortal('patient')}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-blue-600"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
              <Heart className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Portal</h2>
            <p className="text-gray-600 mb-4">
              View your health records, prescriptions, lab reports, and AI-powered health insights.
            </p>
            <div className="flex items-center text-blue-600 font-semibold">
              Enter Portal
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Health Worker Portal */}
          <button
            onClick={() => setSelectedPortal('health-worker')}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-green-600"
          >
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
              <ClipboardList className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Health Worker Portal</h2>
            <p className="text-gray-600 mb-4">
              Register new patients, record vital signs, and manage patient data efficiently.
            </p>
            <div className="flex items-center text-green-600 font-semibold">
              Enter Portal
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Doctor Portal */}
          <button
            onClick={() => setSelectedPortal('doctor')}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-blue-600"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
              <Activity className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Portal</h2>
            <p className="text-gray-600 mb-4">
              Access patient records, view AI diagnostics, prescribe medications, and manage care.
            </p>
            <div className="flex items-center text-blue-600 font-semibold">
              Enter Portal
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Admin Portal */}
          <button
            onClick={() => setSelectedPortal('admin')}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-green-600"
          >
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
              <BarChart3 className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Government Admin Portal</h2>
            <p className="text-gray-600 mb-4">
              Monitor public health trends, analyze data, and generate comprehensive reports.
            </p>
            <div className="flex items-center text-green-600 font-semibold">
              Enter Portal
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Demo Platform • All data shown is mock data for demonstration purposes
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
