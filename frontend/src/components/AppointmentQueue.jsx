import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { api } from '../api/api'; // Your Axios instance

const AppointmentQueue = ({ selectedDoctorId }) => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                // Calls the route that fetches pending appointments, sorted by AI risk
                const res = await api.get('/appointments/doctor/appointments');
                setQueue(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch appointment queue:", error);
                setLoading(false);
            }
        };
        fetchQueue();
    }, [selectedDoctorId]); // Refresh when the doctor changes or on initial load

    // Handler to approve or cancel the appointment
    const handleStatusUpdate = async (appointmentId, status) => {
        try {
            // Calls the PATCH /api/appointments/doctor/appointments/:id/status route
            await api.patch(`/appointments/doctor/appointments/${appointmentId}/status`, { status });
            alert(`Appointment ${status} successfully!`);

            // Remove the processed appointment from the local queue view
            setQueue(queue.filter(app => app._id !== appointmentId));
        } catch (error) {
            console.error(`Failed to update status to ${status}:`, error);
            alert('Failed to update status.');
        }
    };

    if (loading) return <div className="p-6 text-gray-500">Loading Appointment Queue...</div>;
    if (queue.length === 0) return <div className="p-6 text-gray-500">No pending appointments.</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-600" /> Pending Triage Queue
            </h3>
            <p className="text-sm text-gray-600">Appointments are prioritized by AI risk level [critical | high]</p>
            {queue.map((app) => (
                <div
                    key={app._id}
                    className={`p-4 rounded-lg shadow-md border-l-4 ${app.risk_snapshot.risk_level === 'critical' ? 'bg-red-50 border-red-600' : 'bg-yellow-50 border-yellow-600'}`}
                >
                    <div className="flex justify-between items-start">
                        {/* LEFT: Patient Info & Risk */}
                        <div>
                            <h4 className="font-semibold text-gray-900">{app.patient.name}</h4>
                            <p className="text-sm text-gray-600">
                                Requested: {new Date(app.requested_at).toLocaleString()}
                            </p>
                            <span className="text-xs font-medium px-2 py-1 rounded mt-1 inline-block bg-white text-red-700 border border-red-300">
                                AI Risk: {app.risk_snapshot.risk_level.toUpperCase()}
                            </span>
                        </div>

                        {/* RIGHT: Actions */}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => handleStatusUpdate(app._id, 'confirmed')}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4" /> Confirm
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(app._id, 'cancelled')}
                                className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
                            >
                                <XCircle className="w-4 h-4" /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AppointmentQueue;