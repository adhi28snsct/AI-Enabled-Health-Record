import React, { useState, useEffect } from 'react';
import { api } from '../api/api'; 
import { Calendar, UserCheck, Clock, Heart } from 'lucide-react';

const AppointmentBooker = ({ patientId, currentRiskLevel }) => {
    // State to hold the list of available doctors fetched from the backend
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // State for the form payload
    const [bookingData, setBookingData] = useState({
        doctorId: '',
        requestedTime: '',
        notes: '',
        patientId: patientId, // Set patient ID from props
    });

    // --- Update bookingData when patientId prop changes ---
    useEffect(() => {
        // This ensures if the PatientPortal component re-renders with a new userId, 
        // the form data is updated before submission.
        setBookingData(prev => ({ ...prev, patientId: patientId }));
    }, [patientId]);

    // --- Fetch Doctors on Load ---
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                // Calls the route to fetch general doctor availability
                const res = await api.get('/appointments/doctors/available'); 
                // ASSUMED: Doctors data includes a 'specialty' or similar field
                setDoctors(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch doctors:", error);
                setLoading(false);
                setMessage("Could not load doctor list. Please try again later.");
            }
        };
        fetchDoctors();
    }, []); // Runs once on mount

    // --- Form Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        if (!bookingData.doctorId) {
            setMessage("❌ Please select a doctor before submitting.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Calls POST /api/appointments/book
            await api.post('/appointments/book', bookingData);
            
            setMessage("✅ Appointment requested successfully! Awaiting doctor confirmation.");
            setBookingData({ // Reset form fields
                doctorId: '',
                requestedTime: '',
                notes: '',
                patientId: patientId,
            });
            
        } catch (error) {
            console.error("Booking error:", error.response?.data || error);
            setMessage(`❌ Booking failed. ${error.response?.data?.message || 'Check connection/ID.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Loading and Error States ---
    if (loading) return <div className="p-6 text-center text-gray-500">Loading available doctors...</div>;
    if (doctors.length === 0) return <div className="p-6 text-center text-red-500">No doctors available for booking at this time.</div>;

    // --- Rendering ---
    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Calendar className="w-6 h-6 text-blue-600" /> Book New Appointment
                </h3>
                
                {/* Patient's Current Risk Snapshot (Highlights AI Triage) */}
                <div className={`p-3 rounded-lg ${currentRiskLevel === 'critical' ? 'bg-red-100 border-red-400' : 'bg-yellow-100 border-yellow-400'} border-l-4 mb-6`}>
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-600" /> Your Current AI Risk Level:
                        <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${currentRiskLevel === 'critical' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'}`}>
                            {currentRiskLevel}
                        </span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">This appointment will be prioritized based on this score.</p>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Doctor Selection */}
                    <div>
                        <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Doctor
                        </label>
                        <select
                            id="doctorId"
                            name="doctorId"
                            required
                            value={bookingData.doctorId}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                        >
                            <option value="">-- Choose Your Doctor --</option>
                            {doctors.map(doctor => (
                                <option key={doctor._id} value={doctor._id}>
                                    {doctor.name} ({doctor.specialty || 'General Practitioner'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date and Time Selection */}
                    <div>
                        <label htmlFor="requestedTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Date and Time
                        </label>
                        <input
                            id="requestedTime"
                            name="requestedTime"
                            type="datetime-local"
                            required
                            value={bookingData.requestedTime}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                        />
                    </div>
                    
                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Appointment (Optional)
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            value={bookingData.notes}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500"
                            placeholder="e.g., Follow up on high blood pressure readings, general checkup."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Appointment Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}
export default AppointmentBooker;