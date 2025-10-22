import { useState, useEffect } from 'react';
import { Menu, X, Users, UserPlus, ClipboardList, Search, ArrowLeft, Mic } from 'lucide-react';
import { api, setAuthToken } from '../api/api';

export default function HealthWorkerPortal() {
    const [currentPage, setCurrentPage] = useState('patients');
    const [menuOpen, setMenuOpen] = useState(false);
    
    // State for fetching and filtering real patients
    const [patients, setPatients] = useState([]); 
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Authentication
    const token = localStorage.getItem("token");
    // Assuming the Health Worker is logged in as a Doctor/Health Worker role
    const assignedDoctorId = localStorage.getItem('userId'); 

    // State for New Patient Registration (User Schema fields)
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

    // State for Vitals Data Entry (Vitals Schema fields)
    const [vitalsData, setVitalsData] = useState({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: '',
        bloodGlucose: '',
        oxygenSaturation: '',
        symptoms: '', // Key for audio/text symptom input
    });
    
    // Utility function for input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Correctly maps the frontend name (e.g., 'fullName') to the state key
        setFormData((prev) => ({ ...prev, [name]: value })); 
    };

    const handleVitalsDataChange = (e) => {
        const { name, value } = e.target;
        setVitalsData((prev) => ({ ...prev, [name]: value }));
    };

    // --- FETCH PATIENTS ON LOAD ---
    useEffect(() => {
        if (token) setAuthToken(token);

        const fetchPatients = async () => {
            try {
                // Calls the backend route: GET /api/doctor/patients 
                const res = await api.get('/doctor/patients'); 
                setPatients(res.data);

                // Set initial selected patient if available
                if (res.data.length > 0 && !selectedPatientId) {
                    setSelectedPatientId(res.data[0]._id);
                }

            } catch (err) {
                console.error("Failed to fetch patients:", err);
            }
        };
        fetchPatients();
    }, [token, selectedPatientId]); 
    
    useEffect(() => {
        if (selectedPatientId && patients.length > 0) {
            const patient = patients.find(p => p._id === selectedPatientId);
            setSelectedPatient(patient);
        }
    }, [selectedPatientId, patients]);


    // --- 1. PATIENT REGISTRATION SUBMISSION (POST /api/auth/register-patient) ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (!assignedDoctorId) {
            alert("Error: Health Worker ID not found. Cannot assign patient.");
            return;
        }

        try {
            const payload = {
                // Map frontend keys to backend User Schema keys
                name: formData.fullName,
                email: formData.email,
                password: "defaultpassword", // ⚠️ MUST be secure and handled server-side later!
                dob: formData.dateOfBirth,
                gender: formData.gender,
                // Assigning patient role and doctor linkage
                role: 'patient',
                proof: 'HW_REGISTRY', // Simple placeholder proof
                assignedDoctor: assignedDoctorId, 

                // Optional fields
                blood_type: formData.bloodType,
                phone: formData.phone,
                address: formData.address,
                emergency_contact_name: formData.emergencyContactName,
                emergency_contact_phone: formData.emergencyContactPhone,
            };

            // This POST route is necessary: /api/auth/register-patient
            await api.post('/auth/register-patient', payload); 
            
            alert('Patient registered successfully and added to the list!');
            
            // Reset state and immediately refresh the patient list
            setFormData({/* reset object */});
            setCurrentPage('patients');
            // Re-run the fetch to include the new patient
            const res = await api.get('/doctor/patients'); 
            setPatients(res.data); 

        } catch (error) {
            console.error("Registration error:", error);
            alert(`Registration failed. Server error: ${error.message}`);
        }
    };

    // --- 2. VITALS SUBMISSION (POST /api/doctor/vitals) ---
    const handleVitalsSubmit = async (e) => {
        e.preventDefault();

        if (!selectedPatientId) {
            alert("Please select a patient to record vitals.");
            return;
        }

        try {
            const payload = {
                patient: selectedPatientId, 
                // Map frontend keys to the Vitals Schema:
                blood_pressure_systolic: vitalsData.bloodPressureSystolic,
                blood_pressure_diastolic: vitalsData.bloodPressureDiastolic,
                heart_rate: vitalsData.heartRate,
                temperature: vitalsData.temperature,
                oxygen_saturation: vitalsData.oxygenSaturation,
                respiration_rate: vitalsData.respirationRate,
                symptoms: vitalsData.symptoms,
            };

            // Calls the fully working backend route: POST /api/doctor/vitals
            // This triggers the addPatientVitals controller, which runs the AI.
            await api.post('/doctor/vitals', payload); 
            
            alert('Vitals recorded successfully! AI analysis triggered.');
            
            // Reset state and return to patient list
            setVitalsData({/* reset object */});
            setCurrentPage('patients');

        } catch (error) {
            console.error("Vitals submission error:", error);
            alert('Failed to record vitals. Check server connection.');
        }
    };


    // Utility functions moved inside the component
    const filteredPatients = patients.filter((patient) => 
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
    
    const PatientListCard = ({ patient, onClick }) => (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{patient.name || 'Unnamed Patient'}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskBadge(patient.risk_level)}`}>
                            {patient.risk_level || 'unknown'} risk
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">
                        {patient.gender} · Age: {new Date().getFullYear() - new Date(patient.dob).getFullYear()}
                    </p>
                </div>
                <button
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                    Record Vitals
                </button>
            </div>
        </div>
    );


    // --- RENDER LOGIC ---
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                            <ClipboardList className="w-8 h-8 text-green-600" />
                            <h1 className="text-xl font-bold text-gray-900">Health Worker Portal</h1>
                        </div>
                        {/* ... (omitted menu/nav buttons - structure is same) ... */}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Patients Page (Default View) */}
                {currentPage === 'patients' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Patient List ({patients.length})</h2>
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
                                <PatientListCard
                                    key={patient._id}
                                    patient={patient}
                                    onClick={() => {
                                        setSelectedPatientId(patient._id);
                                        setSelectedPatient(patient);
                                        setCurrentPage('data-entry');
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Registration Form */}
                {currentPage === 'register' && (
                    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Register New Patient</h2>
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Basic Info */}
                                <input name="fullName" type="text" placeholder="Full Name" required value={formData.fullName} onChange={handleInputChange} className="p-3 border rounded-lg" />
                                <input name="email" type="email" placeholder="Email (Optional)" value={formData.email} onChange={handleInputChange} className="p-3 border rounded-lg" />
                                <input name="phone" type="text" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className="p-3 border rounded-lg" />
                                <select name="gender" value={formData.gender} onChange={handleInputChange} className="p-3 border rounded-lg">
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <input name="dateOfBirth" type="date" placeholder="Date of Birth" required value={formData.dateOfBirth} onChange={handleInputChange} className="p-3 border rounded-lg" />
                                <input name="bloodType" type="text" placeholder="Blood Type (e.g., O+)" value={formData.bloodType} onChange={handleInputChange} className="p-3 border rounded-lg" />
                            </div>
                            <textarea name="address" placeholder="Residential Address (Rural Village)" value={formData.address} onChange={handleInputChange} className="w-full p-3 border rounded-lg" rows="2" />
                            
                            <h3 className="text-lg font-semibold text-gray-700 pt-4">Emergency Contact</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input name="emergencyContactName" type="text" placeholder="Contact Name" value={formData.emergencyContactName} onChange={handleInputChange} className="p-3 border rounded-lg" />
                                <input name="emergencyContactPhone" type="text" placeholder="Contact Phone" value={formData.emergencyContactPhone} onChange={handleInputChange} className="p-3 border rounded-lg" />
                            </div>
                            
                            <button type="submit" className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
                                Finalize Registration
                            </button>
                        </form>
                    </div>
                )}

                {/* Data Entry Form (Vitals) */}
                {currentPage === 'data-entry' && selectedPatient && (
                    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
                        <button onClick={() => setCurrentPage('patients')} className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Patients
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Record Vitals for: {selectedPatient.name}</h2>
                        <p className="text-gray-600 mb-6">Health ID: {selectedPatient._id}</p>

                        <form onSubmit={handleVitalsSubmit} className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-700">Vitals and Measurements</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <input name="bloodPressureSystolic" type="number" placeholder="BP Systolic (mmHg)" value={vitalsData.bloodPressureSystolic} onChange={handleVitalsDataChange} required className="p-3 border rounded-lg" />
                                <input name="bloodPressureDiastolic" type="number" placeholder="BP Diastolic (mmHg)" value={vitalsData.bloodPressureDiastolic} onChange={handleVitalsDataChange} required className="p-3 border rounded-lg" />
                                <input name="heartRate" type="number" placeholder="Heart Rate (BPM)" value={vitalsData.heartRate} onChange={handleVitalsDataChange} required className="p-3 border rounded-lg" />
                                <input name="temperature" type="number" placeholder="Temperature (°F)" value={vitalsData.temperature} onChange={handleVitalsDataChange} required className="p-3 border rounded-lg" />
                                <input name="oxygenSaturation" type="number" placeholder="SpO₂ (%)" value={vitalsData.oxygenSaturation} onChange={handleVitalsDataChange} className="p-3 border rounded-lg" />
                                <input name="respirationRate" type="number" placeholder="Respiration Rate" value={vitalsData.respirationRate} onChange={handleVitalsDataChange} required className="p-3 border rounded-lg" />
                            </div>

                            {/* Symptoms and Audio Input (Placeholder for future feature) */}
                            <h3 className="text-lg font-semibold text-gray-700 pt-4">Symptoms and Notes</h3>
                            <div className="relative">
                                <textarea name="symptoms" placeholder="Describe symptoms (e.g., fever, cough, joint pain)" value={vitalsData.symptoms} onChange={handleVitalsDataChange} className="w-full p-3 border rounded-lg" rows="4" />
                                <button type="button" className="absolute right-3 top-3 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors" aria-label="Record Symptoms">
                                    <Mic className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">Audio input feature coming soon to support low-literacy users.</p>

                            <button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                                Save Vitals & Trigger AI Analysis
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}