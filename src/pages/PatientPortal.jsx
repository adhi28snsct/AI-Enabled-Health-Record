import { useState } from 'react';
import { Menu, X, Heart, FileText, User, Activity, AlertCircle, Calendar, Pill, FlaskConical } from 'lucide-react';
import {
  mockPatientData,
  mockAIDiagnostics,
  mockAlerts,
  mockHealthRecords,
  mockPrescriptions,
  mockLabReports,
} from '../lib/mockData';

export default function PatientPortal() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const getRiskColor = (risk) => {
    if (risk < 30) return 'text-green-600';
    if (risk < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBg = (risk) => {
    if (risk < 30) return 'bg-green-100';
    if (risk < 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">HealthConnect</h1>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <nav className="hidden md:flex gap-6">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Activity className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('records')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'records'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                My Records
              </button>
              <button
                onClick={() => setCurrentPage('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'profile'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                Profile
              </button>
            </nav>
          </div>

          {menuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentPage('dashboard');
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Activity className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentPage('records');
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentPage === 'records'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                My Records
              </button>
              <button
                onClick={() => {
                  setCurrentPage('profile');
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentPage === 'profile'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                Profile
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* DASHBOARD */}
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Welcome back, {mockPatientData.full_name}!</h2>
              <p className="text-blue-100">Here's your health overview</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Health Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['diabetes_risk', 'anemia_risk', 'hypertension_risk', 'cardiac_risk'].map((key) => (
                  <div key={key} className={`${getRiskBg(mockAIDiagnostics[key])} rounded-lg p-4`}>
                    <div className="text-sm text-gray-600 mb-1 capitalize">{key.replace('_', ' ')}</div>
                    <div className={`text-3xl font-bold ${getRiskColor(mockAIDiagnostics[key])}`}>
                      {mockAIDiagnostics[key]}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
              </div>
              <div className="space-y-3">
                {mockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900">{alert.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(alert.created_at)} at {formatTime(alert.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RECORDS */}
        {currentPage === 'records' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Health Records</h2>

            {/* Medical History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Medical History</h3>
              </div>
              <div className="space-y-4">
                {mockHealthRecords.map((record, index) => (
                  <div key={record.id} className="relative pl-8 pb-8 last:pb-0">
                    {index < mockHealthRecords.length - 1 && (
                      <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-600" />
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{record.title}</h4>
                          <p className="text-sm text-gray-500">{record.recorded_by}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {record.record_type}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{record.description}</p>
                      <p className="text-sm text-gray-500">{formatDate(record.recorded_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Prescriptions</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {mockPrescriptions.map((p) => (
                  <div key={p.id} className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{p.medication_name}</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Dosage:</span> {p.dosage}</p>
                      <p><span className="font-medium">Frequency:</span> {p.frequency}</p>
                      <p><span className="font-medium">Duration:</span> {p.duration}</p>
                      {p.notes && <p className="text-gray-600 mt-2">{p.notes}</p>}
                      <p className="text-gray-500 mt-2">Prescribed: {formatDate(p.prescribed_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Reports */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Lab Reports</h3>
              </div>
              <div className="space-y-4">
                {mockLabReports.map((r) => (
                  <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{r.test_name}</h4>
                        <p className="text-sm text-gray-500">{r.test_type}</p>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(r.test_date)}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 mb-3">
                      {Object.entries(r.results).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded p-3">
                          <div className="text-sm text-gray-600">{key}</div>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-lg font-semibold ${
                              value.status === 'high' ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {value.value}
                            </span>
                            <span className="text-sm text-gray-500">{value.unit}</span>
                          </div>
                          <div className="text-xs text-gray-500">Range: {value.range}</div>
                        </div>
                      ))}
                    </div>
                    {r.notes && (
                      <p className="text-sm text-gray-600 bg-blue-50 rounded p-2">{r.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {currentPage === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>

            {/* Personal Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="block text-sm text-gray-600 mb-1">Full Name</label><p>{mockPatientData.full_name}</p></div>
                <div><label className="block text-sm text-gray-600 mb-1">Email</label><p>{mockPatientData.email}</p></div>
                <div><label className="block text-sm text-gray-600 mb-1">DOB</label><p>{formatDate(mockPatientData.date_of_birth)}</p></div>
                <div><label className="block text-sm text-gray-600 mb-1">Gender</label><p>{mockPatientData.gender}</p></div>
                <div><label className="block text-sm text-gray-600 mb-1">Blood Type</label><p>{mockPatientData.blood_type}</p></div>
                <div><label className="block text-sm text-gray-600 mb-1">Phone</label><p>{mockPatientData.phone}</p></div>
                <div className="sm:col-span-2"><label className="block text-sm text-gray-600 mb-1">Address</label><p>{mockPatientData.address}</p></div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="block text-sm text-gray-600 mb-1">Contact Name</label><p>{mockPatientData.emergency_contact_name}</p></div>
                <div><label className="block text-sm text-gray-600 mb-1">Contact Phone</label><p>{mockPatientData.emergency_contact_phone}</p></div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Preferred Language</label>
                <select
                  value={mockPatientData.preferred_language}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
