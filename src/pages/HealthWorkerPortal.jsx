import { useState } from 'react';
import { Menu, X, Users, UserPlus, ClipboardList, Search, ArrowLeft } from 'lucide-react';
import { mockPatientsList } from '../lib/mockData';

export default function HealthWorkerPortal() {
  const [currentPage, setCurrentPage] = useState('patients');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: 'male',
    bloodType: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const [vitalsData, setVitalsData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    bloodGlucose: '',
    oxygenSaturation: '',
    symptoms: '',
  });

  const filteredPatients = mockPatientsList.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    alert('Patient registered successfully!');
    setFormData({
      fullName: '',
      email: '',
      dateOfBirth: '',
      gender: 'male',
      bloodType: '',
      phone: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    });
    setCurrentPage('patients');
  };

  const handleVitalsSubmit = (e) => {
    e.preventDefault();
    alert('Vitals recorded successfully!');
    setVitalsData({
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      bloodGlucose: '',
      oxygenSaturation: '',
      symptoms: '',
    });
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">Health Worker Portal</h1>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <nav className="hidden md:flex gap-4">
              <button
                onClick={() => setCurrentPage('patients')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'patients'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5" />
                Patients
              </button>
              <button
                onClick={() => setCurrentPage('register')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'register'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                New Patient
              </button>
            </nav>
          </div>

          {menuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentPage('patients');
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentPage === 'patients'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5" />
                Patients
              </button>
              <button
                onClick={() => {
                  setCurrentPage('register');
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentPage === 'register'
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                New Patient
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patients Page */}
        {currentPage === 'patients' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Patients</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{patient.full_name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskBadge(patient.risk_level)}`}>
                          {patient.risk_level} risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        DOB: {new Date(patient.date_of_birth).toLocaleDateString()} •
                        Gender: {patient.gender} •
                        Last visit: {new Date(patient.last_visit).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPatient(patient.id);
                        setCurrentPage('data-entry');
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Record Vitals
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registration Form */}
        {currentPage === 'register' && (
          <div className="max-w-2xl mx-auto">
            {/* form content (unchanged) */}
            {/* ... */}
          </div>
        )}

        {/* Data Entry Form */}
        {currentPage === 'data-entry' && (
          <div className="max-w-2xl mx-auto">
            {/* vitals entry form (unchanged) */}
            {/* ... */}
          </div>
        )}
      </main>
    </div>
  );
}
