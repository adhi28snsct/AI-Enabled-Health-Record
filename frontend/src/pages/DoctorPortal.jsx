import { useState, useEffect } from 'react';
import { Search, Activity, Calendar, Plus, TrendingUp } from 'lucide-react';

import PatientCard from '../components/PatientCard';
import VitalsPanel from '../components/VitalsPannel';
import PrescriptionForm from '../components/PrescriptionForm';
import AIDiagnosticPanel from '../components/AiDiagonisticPanel';

import {
  getAllPatients,
  getVitals,
  getPrescriptions,
  addPrescription,
  getLabReports,
  getAISummary,
  getPatientAlerts,
  addVitals
} from '../api/doctor';

export default function DoctorPortal() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    temperature: '',
    respiration_rate: '', // ✅ Add this line
    oxygen_saturation: '',
    symptoms: '',
  });
  const [labReports, setLabReports] = useState([]);
  const [aiSummary, setAISummary] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: ''
  });

  useEffect(() => {
    getAllPatients()
      .then((res) => {
        setPatients(res.data);
      })
      .catch((err) => console.error("Patient fetch error:", err));
  }, []);
  useEffect(() => {
    if (!selectedPatientId || patients.length === 0) return;

    const patient = patients.find((p) => p._id === selectedPatientId);
    setSelectedPatient(patient || null);

    // Fetch all patient-specific data
    Promise.all([
      getVitals(selectedPatientId),
      getLabReports(selectedPatientId),
      getAISummary(selectedPatientId),
      getPrescriptions(selectedPatientId),
      getPatientAlerts(selectedPatientId),
    ])
      .then(([vitalsRes, labsRes, aiRes, prescriptionsRes, alertsRes]) => {
        const sortedVitals = [...vitalsRes.data].sort(
          (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)
        );
        setVitals(sortedVitals[0] || null);
        setLabReports(labsRes.data || []);
        setAISummary(aiRes.data || null);
        setPrescriptions(prescriptionsRes.data || []);
        setAlerts(alertsRes.data || []);
      })
      .catch((err) => {
        console.error("Error fetching patient data:", err);
        setVitals(null);
        setLabReports([]);
        setAISummary(null);
        setPrescriptions([]);
        setAlerts([]);
      });
  }, [selectedPatientId, patients]);
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();

    // 1. Get the doctor's ID from localStorage
    const loggedInDoctorId = localStorage.getItem("userId"); // ✅ correct key

    // 2. Add a check to make sure the ID exists
    if (!loggedInDoctorId) {
      alert("Could not find Doctor ID. Please log in again.");
      return; // Stop the function if no ID is found
    }

    // 3. Build the payload with the correct doctor ID
    const payload = {
      patient: selectedPatientId,
      doctor: loggedInDoctorId, // Use the variable you just created
      ...prescriptionForm, // Switched to the spread operator for cleaner code
      prescribed_at: new Date().toISOString(), // Using ISOString is better for databases
    };

    try {
      await addPrescription(payload);
      alert("Prescription added successfully!");

      setPrescriptionForm({
        medication_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: "",
      });
      setShowPrescriptionForm(false);
      // Refresh the prescription list for the currently selected patient
      getPrescriptions(selectedPatientId).then((res) => setPrescriptions(res.data));

    } catch (error) {
      console.error("Failed to add prescription:", error);
      alert("There was an error saving the prescription. Please try again.");
    }
  };
  const handleVitalsSubmit = async (e) => {
    e.preventDefault();

    try {
      // Assuming you have an API helper similar to addPrescription
      await addVitals({
        patient: selectedPatientId,
        blood_pressure: `${vitalsForm.blood_pressure_systolic}/${vitalsForm.blood_pressure_diastolic}`,
        heart_rate: vitalsForm.heart_rate,
        temperature: vitalsForm.temperature,
        respiration_rate: vitalsForm.respiration_rate,
        symptoms: vitalsForm.symptoms,
        recorded_at: new Date().toISOString()
      });

      alert("Vitals added successfully!");

      setShowVitalsForm(false);
      setVitalsForm({
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        temperature: '',
        respiration_rate: '', // ✅ Add this line
        oxygen_saturation: '',
        symptoms: '',
      });

      // Refresh vitals after adding
      getVitals(selectedPatientId).then((res) => {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)
        );
        setVitals(sorted[0] || null);
      });
    } catch (err) {
      console.error("Error adding vitals:", err);
      alert("Failed to add vitals. Please try again.");
    }
  };


  const sortedPatients = [...patients].sort((a, b) => {
    const riskOrder = { critical: 4, high: 3, moderate: 2, low: 1 };
    return riskOrder[b.risk_level] - riskOrder[a.risk_level];
  });
  const filteredPatients = sortedPatients.filter((patient) =>
    (patient.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Doctor Portal</h1>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <span className="text-sm font-medium text-gray-700">
              Dr. {localStorage.getItem("name") || "Unknown"}
            </span>
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
                key={patient._id}
                patient={patient}
                isSelected={selectedPatientId === patient._id}
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
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                    <p className="text-gray-600">
                      {selectedPatient.gender} · {new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()} years old · DOB: {formatDate(selectedPatient.dob)}
                    </p>
                  </div>
                  {selectedPatient.risk_level ? (
                    <span className={`... ${getRiskBadge(selectedPatient.risk_level)}`}>
                      {selectedPatient.risk_level} risk
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-600">
                      No risk data
                    </span>
                  )}
                </div>
              </div>

              {/* Vitals */}
              <VitalsPanel
                vitals={vitals}
                onAddVitals={() => setShowVitalsForm(true)}
              />
              {showVitalsForm && (
                <form
                  onSubmit={handleVitalsSubmit}
                  className="bg-white rounded-lg shadow-sm p-6 mt-4"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Vitals</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="number"
                      placeholder="Systolic Pressure"
                      value={vitalsForm.blood_pressure_systolic}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, blood_pressure_systolic: e.target.value })}
                      className="border p-2 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Diastolic Pressure"
                      value={vitalsForm.blood_pressure_diastolic}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, blood_pressure_diastolic: e.target.value })}
                      className="border p-2 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Heart Rate"
                      value={vitalsForm.heart_rate}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, heart_rate: e.target.value })}
                      className="border p-2 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Temperature (°F)"
                      value={vitalsForm.temperature}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
                      className="border p-2 rounded"
                    />
                    <input
                      type="number"
                      placeholder="SpO₂ (%)"
                      value={vitalsForm.oxygen_saturation}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, oxygen_saturation: e.target.value })}
                      className="border p-2 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Respiration Rate (breaths/min)"
                      value={vitalsForm.respiration_rate}
                      onChange={(e) =>
                        setVitalsForm({ ...vitalsForm, respiration_rate: e.target.value })
                      }
                      className="border p-2 rounded"
                    />
                  </div>

                  <textarea
                    placeholder="Symptoms (optional)"
                    value={vitalsForm.symptoms}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, symptoms: e.target.value })}
                    className="border p-2 rounded w-full mb-4"
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVitalsForm(false)}
                      className="border px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}


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
                  {prescriptions.map((prescription) => (
                    <div key={prescription._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{prescription.medication_name}</h4>
                          <p className="text-gray-700 text-sm">
                            <span className="font-medium">Dosage:</span> {prescription.dosage} · {prescription.frequency}
                          </p>
                          <p className="text-gray-700 text-sm">
                            <span className="font-medium">Duration:</span> {prescription.duration}
                          </p>
                          {prescription.notes && (
                            <p className="text-gray-600 text-sm">{prescription.notes}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(prescription.prescribed_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Reports */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lab Reports</h3>
                <div className="space-y-4">
                  {labReports.map((report) => (
                    <div key={report._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{report.test_name}</h4>
                          <p className="text-sm text-gray-500">{report.test_type}</p>
                        </div>
                        <p className="text-sm text-gray-500">{formatDate(report.test_date)}</p>
                      </div>
                      <div className="grid gap-2 grid-cols-2">
                        {Object.entries(report.results || {}).slice(0, 4).map(([key, value]) => (
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

              {/* AI Diagnostic Suggestions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI Diagnostic Suggestions</h3>
                </div>
                {aiSummary ? (
                  <AIDiagnosticPanel diagnostics={aiSummary} getRiskColor={getRiskColor} />
                ) : (
                  <p className="text-sm text-gray-500">No AI summary available.</p>
                )}
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