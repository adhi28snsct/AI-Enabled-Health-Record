import { useState, useEffect } from 'react';
import { Search, Activity, Calendar, Plus, TrendingUp, FlaskConical, Pencil } from 'lucide-react';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PatientCard from '../components/PatientCard';
import VitalsPanel from '../components/VitalsPannel';
import PrescriptionForm from '../components/PrescriptionForm';
import AIDiagnosticPanel from '../components/AiDiagonisticPanel';
import LabReportForm from '../components/LabReportForm'; 
import AppointmentQueue from '../components/AppointmentQueue';
import { api } from "../api/api";
import {
  getAllPatients,
  getVitals,
  getPrescriptions,
  addPrescription,
  getLabReports,
  getAISummary,
  getPatientAlerts,
  addVitals,
  updateVitals,
  addLabReport,
  updateLabReport,
  getDoctorProfile,
  updateDoctorProfile,
} from '../api/doctor';


export default function DoctorPortal() {
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [vitals, setVitals] = useState(null);
    const [showVitalsForm, setShowVitalsForm] = useState(false);

    const [editingVitalsId, setEditingVitalsId] = useState(null);

    const [vitalsForm, setVitalsForm] = useState({
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        temperature: '',
        respiration_rate: '',
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

    const [showLabReportForm, setShowLabReportForm] = useState(false);
    const [editingLabReportId, setEditingLabReportId] = useState(null);
    const [labReportForm, setLabReportForm] = useState({
        test_name: '',
        test_type: '',
        results: { Glucose: { value: '', unit: '', status: '', range: '' } },
        notes: '',
    });

    const doctorId = localStorage.getItem('userId');

    const [doctorProfile, setDoctorProfile] = useState({
      _id: doctorId,
      name: localStorage.getItem('name') || '',
      phone: localStorage.getItem('phone') || '',
      dob: localStorage.getItem('dob') || '',
      blood_group: localStorage.getItem('blood_group') || '',
      specialization: localStorage.getItem('specialization') || '',
      otherSpecialization: '',
    });

    const [showDoctorProfile, setShowDoctorProfile] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(false);
    const [savingDoctor, setSavingDoctor] = useState(false);

    const specializationOptions = [
      'General Practitioner',
      'General Consultant',
      'Diabetologist',
      'Cardiologist',
      'Neurologist',
      'Pulmonologist',
      'Pediatrician',
      'Dermatologist',
      'Obstetrician/Gynecologist',
      'Orthopedist',
      'Other'
    ];

    const handleDoctorInputChange = (e) => {
      const { name, value } = e.target;
      setDoctorProfile(prev => ({ ...prev, [name]: value }));
    };

const handleDoctorSave = async () => {
  setSavingDoctor(true);
  try {
    const finalSpecialization = doctorProfile.specialization === 'Other'
      ? (doctorProfile.otherSpecialization || 'Other')
      : doctorProfile.specialization;

    const payload = {
      name: doctorProfile.name,
      phone: doctorProfile.phone,
      dob: doctorProfile.dob,
      blood_group: doctorProfile.blood_group,
      specialization: finalSpecialization,
    };

    const doctorId = doctorProfile._id || localStorage.getItem("userId");

    if (!doctorId) {
      toast.error("Doctor ID missing.");
      return;
    }

    // 🔥 THIS NOW POINTS TO THE CORRECT BACKEND ROUTE
    const res = await api.patch(`/doctor/doctors/${doctorId}`, payload);

    const updated = res.data;

    // Update local UI
    setDoctorProfile(prev => ({ ...prev, ...updated }));

    // Optional: Store in localStorage
    localStorage.setItem("name", updated.name || "");
    localStorage.setItem("phone", updated.phone || "");
    localStorage.setItem("dob", updated.dob || "");
    localStorage.setItem("blood_group", updated.blood_group || "");
    localStorage.setItem("specialization", updated.specialization || "");

    setEditingDoctor(false);
    setShowDoctorProfile(false);

    toast.success("Profile updated successfully!");

  } catch (err) {
    console.error("Failed to save doctor profile:", err);
    toast.error(err?.response?.data?.message || "Failed to save profile.");
  } finally {
    setSavingDoctor(false);
  }
};

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

    const handleEditVitals = (latestVitals) => {
        setEditingVitalsId(latestVitals._id);
        setVitalsForm({
            blood_pressure_systolic: latestVitals.blood_pressure_systolic,
            blood_pressure_diastolic: latestVitals.blood_pressure_diastolic,
            heart_rate: latestVitals.heart_rate,
            temperature: latestVitals.temperature,
            respiration_rate: latestVitals.respiration_rate,
            oxygen_saturation: latestVitals.oxygen_saturation,
            symptoms: latestVitals.symptoms,
        });
        setShowVitalsForm(true);
    };

    const handleEditLabReport = (latestReport) => {
        setEditingLabReportId(latestReport._id);
        setLabReportForm({
            test_name: latestReport.test_name,
            test_type: latestReport.test_type,
            results: latestReport.results,
            notes: latestReport.notes,
        });
        setShowLabReportForm(true);
    };

    const handlePrescriptionSubmit = async (e) => {
        e.preventDefault();
        const loggedInDoctorId = localStorage.getItem("userId");
        if (!loggedInDoctorId) {
            alert("Could not find Doctor ID. Please log in again.");
            return;
        }

        const payload = {
            patient: selectedPatientId,
            doctor: loggedInDoctorId,
            ...prescriptionForm,
            prescribed_at: new Date().toISOString(),
        };

        try {
            await addPrescription(payload);
            alert("Prescription added successfully!");
            setPrescriptionForm({ /* reset */ });
            setShowPrescriptionForm(false);
            getPrescriptions(selectedPatientId).then((res) => setPrescriptions(res.data));
        } catch (error) {
            console.error("Failed to add prescription:", error);
            alert("There was an error saving the prescription. Please try again.");
        }
    };

   const handleVitalsSubmit = async (e) => {
    e.preventDefault();

    const payload = {
        patient: selectedPatientId,
        blood_pressure_systolic: vitalsForm.blood_pressure_systolic,
        blood_pressure_diastolic: vitalsForm.blood_pressure_diastolic,
        heart_rate: vitalsForm.heart_rate,
        temperature: vitalsForm.temperature,
        respiration_rate: vitalsForm.respiration_rate,
        oxygen_saturation: vitalsForm.oxygen_saturation,
        symptoms: vitalsForm.symptoms,
        recorded_at: new Date().toISOString()
    };

    try {
        if (editingVitalsId) {
            // --- UPDATE LOGIC ---
            await updateVitals(editingVitalsId, payload);
            alert("Vitals updated successfully!");
        } else {
            // --- ADD LOGIC ---
            await addVitals(payload); 
            alert("Vitals added successfully!");
        }

        setEditingVitalsId(null);
        setShowVitalsForm(false);
        setVitalsForm({ /* reset */ });


        getVitals(selectedPatientId).then((res) => {
            const sorted = [...res.data].sort(
                (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)
            );
            setVitals(sorted[0] || null);
        });

   
        getAllPatients()
            .then((res) => {
                setPatients(res.data);
            })
            .catch((err) => console.error("Error refreshing patient list after vitals update:", err));
        
    } catch (err) {
        console.error(`Error ${editingVitalsId ? 'updating' : 'adding'} vitals:`, err);
        alert(`Failed to ${editingVitalsId ? 'update' : 'add'} vitals. Please try again.`);
    }
};

const handleLabReportSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const payload = { patient: selectedPatientId, ...labReportForm };

        if (editingLabReportId) {
            // If editing, use the PUT/PATCH endpoint
            await updateLabReport(editingLabReportId, payload); 
            alert("Lab Report updated successfully! AI re-analysis triggered.");
        } else {
            // If adding, use the POST endpoint
            await addLabReport(payload); 
            alert("Lab Report added successfully! AI analysis triggered.");
        }

        // 1. Reset state and close form
        setEditingLabReportId(null);
        setShowLabReportForm(false);
        setLabReportForm({ test_name: '', test_type: '', results: {}, notes: '', });

        getLabReports(selectedPatientId).then((res) => setLabReports(res.data));
        getAISummary(selectedPatientId).then((res) => setAISummary(res.data)); 

       
        getAllPatients()
            .then((res) => {
                setPatients(res.data);
            })
            .catch((err) => console.error("Error refreshing patient list after lab update:", err));


    } catch (err) {
        console.error(`Error ${editingLabReportId ? 'updating' : 'adding'} lab report:`, err);
        alert(`Failed to ${editingLabReportId ? 'update' : 'add'} lab report. Please try again.`);
    }
};

    const sortedPatients = [...patients].sort((a, b) => {
        const riskOrder = { critical: 4, high: 3, moderate: 2, low: 1 };
        return riskOrder[b.risk_level] - riskOrder[a.risk_level];
    });
    const filteredPatients = sortedPatients.filter((patient) =>
        (patient.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRiskBadge = (risk) => { /* ... returns style ... */ };
    const getRiskColor = (risk) => { /* ... returns color ... */ };
    const formatDate = (dateString) => { /* ... returns date ... */ };


    return (
        <div className="min-h-screen bg-gray-50">
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

                        <button
                          onClick={() => setShowDoctorProfile(true)}
                          className="text-sm font-medium text-gray-700 hover:underline"
                          type="button"
                        >
                          Dr. {doctorProfile.name || localStorage.getItem("name") || "Unknown"}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
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

                <div className="flex-1 overflow-y-auto">
    <div className="p-6 space-y-6"> 
        <AppointmentQueue 
            selectedDoctorId={localStorage.getItem('userId')} 
        />
        {showDoctorProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setShowDoctorProfile(false); setEditingDoctor(false); }} />
            <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 z-10">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
                <div className="flex items-center gap-2">
                  {!editingDoctor && (
                    <button onClick={() => setEditingDoctor(true)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                  )}
                  <button onClick={() => { setShowDoctorProfile(false); setEditingDoctor(false); }} className="px-3 py-1 border rounded">Close</button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Full name</label>
                  {editingDoctor ? (
                    <input name="name" value={doctorProfile.name} onChange={handleDoctorInputChange} className="w-full px-3 py-2 border rounded" />
                  ) : <p className="text-gray-700">{doctorProfile.name || '—'}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Phone</label>
                  {editingDoctor ? (
                    <input name="phone" value={doctorProfile.phone} onChange={handleDoctorInputChange} className="w-full px-3 py-2 border rounded" />
                  ) : <p className="text-gray-700">{doctorProfile.phone || '—'}</p>}
                </div>

    
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Date of Birth</label>
                  {editingDoctor ? (
                    <input name="dob" type="date" value={doctorProfile.dob ? new Date(doctorProfile.dob).toISOString().slice(0,10) : ''} onChange={handleDoctorInputChange} className="w-full px-3 py-2 border rounded" />
                  ) : <p className="text-gray-700">{doctorProfile.dob ? new Date(doctorProfile.dob).toLocaleDateString() : '—'}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Blood group</label>
                  {editingDoctor ? (
                    <input name="blood_group" value={doctorProfile.blood_group} onChange={handleDoctorInputChange} className="w-full px-3 py-2 border rounded" placeholder="e.g., A+, O-" />
                  ) : <p className="text-gray-700">{doctorProfile.blood_group || '—'}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Specialization</label>
                  {editingDoctor ? (
                    <div className="flex gap-2 items-center">
                      <select name="specialization" value={doctorProfile.specialization || ''} onChange={handleDoctorInputChange} className="px-3 py-2 border rounded flex-1">
                        <option value="">Select specialization</option>
                        {specializationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      {doctorProfile.specialization === 'Other' && (
                        <input name="otherSpecialization" value={doctorProfile.otherSpecialization} onChange={handleDoctorInputChange} className="px-3 py-2 border rounded flex-1" placeholder="Please specify" />
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-700">{doctorProfile.specialization || doctorProfile.otherSpecialization || '—'}</p>
                  )}
                </div>
              </div>

              {editingDoctor && (
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => { setEditingDoctor(false); }} className="px-4 py-2 border rounded">Cancel</button>
                  <button onClick={handleDoctorSave} disabled={savingDoctor} className="px-4 py-2 bg-green-600 text-white rounded">
                    {savingDoctor ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
                   {selectedPatient ? (
    <div className="p-6 space-y-6">

        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {selectedPatient.name}
                    </h2>

                    {/* ✔ Age shown, DOB removed */}
                    <p className="text-gray-600">
                        {selectedPatient.gender} · 
                        {new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()} years old
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

                            <VitalsPanel
                                vitals={vitals}
                                onAddVitals={() => {
                                    setEditingVitalsId(null);
                                    setShowVitalsForm(true);
                                }}
                                onEditVitals={handleEditVitals}
                            />

                            {showVitalsForm && (
                                <form
                                    onSubmit={handleVitalsSubmit}
                                    className="bg-white rounded-lg shadow-sm p-6 mt-4"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {editingVitalsId ? 'Edit Latest Vitals' : 'Add New Vitals'}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {/* Systolic Pressure */}
                                        <input
                                            type="number"
                                            placeholder="Systolic Pressure"
                                            value={vitalsForm.blood_pressure_systolic}
                                            onChange={(e) => setVitalsForm({ ...vitalsForm, blood_pressure_systolic: e.target.value })}
                                            className="border p-2 rounded"
                                        />
                                        {/* Diastolic Pressure */}
                                        <input
                                            type="number"
                                            placeholder="Diastolic Pressure"
                                            value={vitalsForm.blood_pressure_diastolic}
                                            onChange={(e) => setVitalsForm({ ...vitalsForm, blood_pressure_diastolic: e.target.value })}
                                            className="border p-2 rounded"
                                        />
                                        {/* Heart Rate */}
                                        <input
                                            type="number"
                                            placeholder="Heart Rate"
                                            value={vitalsForm.heart_rate}
                                            onChange={(e) => setVitalsForm({ ...vitalsForm, heart_rate: e.target.value })}
                                            className="border p-2 rounded"
                                        />
                                        {/* Temperature */}
                                        <input
                                            type="number"
                                            placeholder="Temperature (°F)"
                                            value={vitalsForm.temperature}
                                            onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: e.target.value })}
                                            className="border p-2 rounded"
                                        />
                                        {/* Oxygen Saturation */}
                                        <input
                                            type="number"
                                            placeholder="SpO₂ (%)"
                                            value={vitalsForm.oxygen_saturation}
                                            onChange={(e) => setVitalsForm({ ...vitalsForm, oxygen_saturation: e.target.value })}
                                            className="border p-2 rounded"
                                        />
                                        {/* Respiration Rate */}
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
                                            {editingVitalsId ? 'Update Vitals' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowVitalsForm(false);
                                                setEditingVitalsId(null); // Clear edit ID on cancel
                                            }}
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
                                    {prescriptions.length > 0 ? (
                                        prescriptions.map((p) => (
                                            <div key={p._id} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900">{p.medication_name}</h4>
                                                        <p className="text-gray-700 text-sm">
                                                            <span className="font-medium">Dosage:</span> {p.dosage} · {p.frequency}
                                                        </p>
                                                        <p className="text-gray-700 text-sm">
                                                            <span className="font-medium">Duration:</span> {p.duration}
                                                        </p>
                                                        {p.notes && (
                                                            <p className="text-gray-600 text-sm">{p.notes}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(p.prescribed_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No active prescriptions recorded.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-6">

                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Lab Reports</h3>
                                    <div className="flex gap-2">

                                        <button
                                            onClick={() => {
                                                setEditingLabReportId(null); 
                                                setShowLabReportForm(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Report
                                        </button>

                                        {labReports.length > 0 && (
                                            <button
                                                onClick={() => handleEditLabReport(labReports[0])}
                                                className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                                            >
                                                <Pencil className="w-4 h-4" /> Edit Last
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {showLabReportForm && (
                                    <LabReportForm
                                        formData={labReportForm}
                                        setFormData={setLabReportForm}
                                        onSubmit={handleLabReportSubmit}
                                        onCancel={() => {
                                            setShowLabReportForm(false);
                                            setEditingLabReportId(null);
                                        }}
                                        isEditing={!!editingLabReportId}
                                    />
                                )}

                                <div className="space-y-4">
                                    {labReports.length > 0 ? (
                                        labReports.map((report) => (
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
                                                            <div className="text-xs text-gray-500">Range: {value.range}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {report.notes && <p className="text-sm text-gray-600 bg-blue-50 rounded p-2">{report.notes}</p>}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No lab reports found for this patient.</p>
                                    )}
                                </div>
                            </div>

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
