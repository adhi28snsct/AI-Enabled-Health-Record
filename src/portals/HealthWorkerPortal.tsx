import { useState } from 'react';
import { Menu, X, Users, UserPlus, ClipboardList, Search, ArrowLeft } from 'lucide-react';
import { mockPatientsList } from '../lib/mockData';

type Page = 'patients' | 'register' | 'data-entry';

export default function HealthWorkerPortal() {
  const [currentPage, setCurrentPage] = useState<Page>('patients');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
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

  const handleRegisterSubmit = (e: React.FormEvent) => {
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

  const handleVitalsSubmit = (e: React.FormEvent) => {
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

  const getRiskBadge = (risk: string) => {
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

        {currentPage === 'register' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">New Patient Registration</h2>
            <form onSubmit={handleRegisterSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type
                    </label>
                    <input
                      type="text"
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                      placeholder="e.g., O+"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                      placeholder="+1-555-0123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    rows={2}
                    placeholder="Full address"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="Emergency contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="+1-555-0124"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-base"
              >
                Register Patient
              </button>
            </form>
          </div>
        )}

        {currentPage === 'data-entry' && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => {
                setCurrentPage('patients');
                setSelectedPatient(null);
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Patients
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Patient Vitals</h2>

            <form onSubmit={handleVitalsSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Recording vitals for:</p>
                <p className="font-semibold text-gray-900">
                  {mockPatientsList.find((p) => p.id === selectedPatient)?.full_name}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Pressure (Systolic)
                  </label>
                  <input
                    type="number"
                    value={vitalsData.bloodPressureSystolic}
                    onChange={(e) => setVitalsData({ ...vitalsData, bloodPressureSystolic: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Pressure (Diastolic)
                  </label>
                  <input
                    type="number"
                    value={vitalsData.bloodPressureDiastolic}
                    onChange={(e) => setVitalsData({ ...vitalsData, bloodPressureDiastolic: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    value={vitalsData.heartRate}
                    onChange={(e) => setVitalsData({ ...vitalsData, heartRate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="72"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsData.temperature}
                    onChange={(e) => setVitalsData({ ...vitalsData, temperature: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="98.6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsData.weight}
                    onChange={(e) => setVitalsData({ ...vitalsData, weight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="70"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsData.height}
                    onChange={(e) => setVitalsData({ ...vitalsData, height: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="170"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Glucose (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={vitalsData.bloodGlucose}
                    onChange={(e) => setVitalsData({ ...vitalsData, bloodGlucose: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oxygen Saturation (%)
                  </label>
                  <input
                    type="number"
                    value={vitalsData.oxygenSaturation}
                    onChange={(e) => setVitalsData({ ...vitalsData, oxygenSaturation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                    placeholder="98"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms
                </label>
                <textarea
                  value={vitalsData.symptoms}
                  onChange={(e) => setVitalsData({ ...vitalsData, symptoms: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                  rows={3}
                  placeholder="Patient reported symptoms..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-base"
              >
                Save Vitals
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
