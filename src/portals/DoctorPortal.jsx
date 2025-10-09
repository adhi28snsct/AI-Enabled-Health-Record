import { useState } from 'react';
import { Search, AlertCircle, TrendingUp, Activity, Calendar, Pill, Plus, X } from 'lucide-react';
import {
  mockPatientsList,
  mockHealthRecords,
  mockPrescriptions,
  mockLabReports,
  mockVitals,
  mockAIDiagnostics,
} from '../lib/mockData';

export default function DoctorPortal() {
  const [selectedPatientId, setSelectedPatientId] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
  });

  const sortedPatients = [...mockPatientsList].sort((a, b) => {
    const riskOrder = { critical: 4, high: 3, moderate: 2, low: 1 };
    return riskOrder[b.risk_level] - riskOrder[a.risk_level];
  });

  const filteredPatients = sortedPatients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPatient = mockPatientsList.find((p) => p.id === selectedPatientId);
  const latestVitals = mockVitals[0];

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk) => {
    if (risk < 30) return 'text-green-600';
    if (risk < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    alert('Prescription added successfully!');
    setPrescriptionForm({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: '',
    });
    setShowPrescriptionForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Doctor Portal</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Dr. Sarah Johnson</span>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                SJ
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Left Panel: Patient Queue */}
        <div className="lg:w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 border-b sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Patient Queue</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="divide-y">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedPatientId === patient.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{patient.full_name}</h3>
                  {(patient.risk_level === 'high' || patient.risk_level === 'critical') && (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskBadge(patient.risk_level)}`}>
                    {patient.risk_level}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{patient.gender}</span>
                  <span className="text-xs text-gray-500">
                    {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}y
                  </span>
                </div>
                <p className="text-xs text-gray-500">Last visit: {formatDate(patient.last_visit)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Center Panel: Patient Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedPatient ? (
            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.full_name}</h2>
                    <p className="text-gray-600">
                      {selectedPatient.gender} • {new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear()} years old •
                      DOB: {formatDate(selectedPatient.date_of_birth)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadge(selectedPatient.risk_level)}`}>
                    {selectedPatient.risk_level} risk
                  </span>
                </div>
              </div>

              {/* Latest Vitals */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Vitals</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Blood Pressure</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}
                    </div>
                    <div className="text-xs text-gray-500">mmHg</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Heart Rate</div>
                    <div className="text-xl font-semibold text-gray-900">{latestVitals.heart_rate}</div>
                    <div className="text-xs text-gray-500">BPM</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Temperature</div>
                    <div className="text-xl font-semibold text-gray-900">{latestVitals.temperature}</div>
                    <div className="text-xs text-gray-500">°F</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">SpO2</div>
                    <div className="text-xl font-semibold text-gray-900">{latestVitals.oxygen_saturation}%</div>
                    <div className="text-xs text-gray-500">Oxygen</div>
                  </div>
                </div>
                {latestVitals.symptoms && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Symptoms:</p>
                    <p className="text-sm text-gray-700">{latestVitals.symptoms}</p>
                  </div>
                )}
              </div>

              {/* Prescriptions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Prescriptions</h3>
                  <button
                    onClick={() => setShowPrescriptionForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Prescription
                  </button>
                </div>

                {showPrescriptionForm && (
                  <form onSubmit={handlePrescriptionSubmit} className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">New Prescription</h4>
                      <button
                        type="button"
                        onClick={() => setShowPrescriptionForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Medication name"
                        required
                        value={prescriptionForm.medication}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g., 10mg)"
                        required
                        value={prescriptionForm.dosage}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Frequency (e.g., Once daily)"
                        required
                        value={prescriptionForm.frequency}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g., 30 days)"
                        value={prescriptionForm.duration}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <textarea
                      placeholder="Notes"
                      value={prescriptionForm.notes}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Save Prescription
                    </button>
                  </form>
                )}

                <div className="space-y-3">
                  {mockPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Pill className="w-4 h-4 text-green-600" />
                            <h4 className="font-semibold text-gray-900">{prescription.medication_name}</h4>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                              <span className="font-medium">Dosage:</span> {prescription.dosage} • {prescription.frequency}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Duration:</span> {prescription.duration}
                            </p>
                            {prescription.notes && <p className="text-gray-600">{prescription.notes}</p>}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(prescription.prescribed_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical History */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Medical History</h3>
                </div>
                <div className="space-y-3">
                  {mockHealthRecords.map((record) => (
                    <div key={record.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{record.title}</h4>
                          <p className="text-sm text-gray-500">{record.recorded_by}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {record.record_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{record.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(record.recorded_at)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Reports */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lab Reports</h3>
                <div className="space-y-4">
                  {mockLabReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{report.test_name}</h4>
                          <p className="text-sm text-gray-500">{report.test_type}</p>
                        </div>
                        <p className="text-sm text-gray-500">{formatDate(report.test_date)}</p>
                      </div>
                      <div className="grid gap-2 grid-cols-2">
                        {Object.entries(report.results).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-600">{key}</div>
                            <div
                              className={`text-sm font-semibold ${
                                value.status === 'high' ? 'text-red-600' : 'text-gray-900'
                              }`}
                            >
                              {value.value} {value.unit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a patient from the queue
            </div>
          )}
        </div>

        {/* Right Panel: AI Diagnostic Suggestions */}
        <div className="lg:w-96 bg-white border-l overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Diagnostic Suggestions</h3>
              </div>

              <div className="space-y-4">
                {/* Risk Analysis */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Risk Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">Hypertension</span>
                      <span className={`text-lg font-bold ${getRiskColor(mockAIDiagnostics.hypertension_risk)}`}>
                        {mockAIDiagnostics.hypertension_risk}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">Diabetes</span>
                      <span className={`text-lg font-bold ${getRiskColor(mockAIDiagnostics.diabetes_risk)}`}>
                        {mockAIDiagnostics.diabetes_risk}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">Cardiac Risk</span>
                      <span className={`text-lg font-bold ${getRiskColor(mockAIDiagnostics.cardiac_risk)}`}>
                        {mockAIDiagnostics.cardiac_risk}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">Anemia</span>
                      <span className={`text-lg font-bold ${getRiskColor(mockAIDiagnostics.anemia_risk)}`}>
                        {mockAIDiagnostics.anemia_risk}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clinical Suggestions */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Clinical Suggestions</h4>
                  <ul className="space-y-2">
                    {mockAIDiagnostics.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-blue-50 rounded">
                        <span className="text-blue-600 font-bold">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Tests */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Recommended Tests</h4>
                  <div className="space-y-2">
                    {mockAIDiagnostics.recommended_tests.map((test, index) => (
                      <div key={index} className="p-2 bg-purple-50 rounded text-sm text-gray-900">
                        {test}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Note */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 italic">
                    AI analysis based on patient vitals, medical history, and current symptoms. Always use clinical judgment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
