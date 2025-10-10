import { useState } from 'react';
import {
  Search,
  Activity,
  Calendar,
  Plus,
  TrendingUp,
} from 'lucide-react';

import PatientCard from '../components/PatientCard';
import VitalsPanel from '../components/VitalsPannel';
import PrescriptionForm from '../components/PrescriptionForm';
import AIDiagnosticPanel from '../components/AiDiagonisticPanel';

import {
  mockPatientsList,
  mockVitals,
  mockPrescriptions,
  mockHealthRecords,
  mockLabReports,
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Doctor Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Dr. Sarah Johnson</span>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">SJ</div>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="divide-y">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                isSelected={selectedPatientId === patient.id}
                onSelect={setSelectedPatientId}
                getRiskBadge={getRiskBadge}
              />
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
                      {selectedPatient.gender} · {new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear()} years old · DOB: {formatDate(selectedPatient.date_of_birth)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadge(selectedPatient.risk_level)}`}>
                    {selectedPatient.risk_level} risk
                  </span>
                </div>
              </div>

              {/* Vitals */}
              <VitalsPanel vitals={latestVitals} />

              {/* Prescriptions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Prescriptions</h3>
                  <button
                    onClick={() => setShowPrescriptionForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Prescription
                  </button>
                </div>
                {showPrescriptionForm && (
                  <PrescriptionForm
                    formData={prescriptionForm}
                    setFormData={setPrescriptionForm}
                    onSubmit={handlePrescriptionSubmit}
                    onCancel={() => setShowPrescriptionForm(false)}
                  />
                )}
                <div className="space-y-3">
                  {mockPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{prescription.medication_name}</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                              <span className="font-medium">Dosage:</span> {prescription.dosage} · {prescription.frequency}
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
                            <div className={`text-sm font-semibold ${value.status === 'high' ? 'text-red-600' : 'text-gray-900'}`}>
                              {value.value} {value.unit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI Diagnostic Suggestions</h3>
                </div>
                <AIDiagnosticPanel diagnostics={mockAIDiagnostics} getRiskColor={getRiskColor} />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a patient from the queue
            </div>
          )}
        </div>
      </div>
    </div>
  );
}