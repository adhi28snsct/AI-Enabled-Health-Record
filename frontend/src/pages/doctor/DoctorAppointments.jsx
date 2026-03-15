import React, { useEffect, useState } from "react";
import { Activity, ExternalLink, Check, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMyAppointments } from "../../api/doctor";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await getMyAppointments();
            setAppointments(res.data.data || []);
        } catch (err) {
            toast.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleAccept = async (id) => {
        try {
            await api.patch(`/appointments/${id}/accept`);
            toast.success("Appointment accepted");
            fetchAppointments();
        } catch (err) {
            toast.error("Failed to accept appointment");
        }
    };

    const handleReject = async (id) => {
        try {
            await api.patch(`/appointments/${id}/reject`);
            toast.success("Appointment rejected");
            fetchAppointments();
        } catch (err) {
            toast.error("Failed to reject appointment");
        }
    };

    const handleOpenPatient = (patientId) => {
        navigate(`/doctor/patients/${patientId}`);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
            case "confirmed":
                return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Confirmed</span>;
            case "completed":
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>;
            case "cancelled":
                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <ToastContainer />

            <header className="bg-white border-b shadow-sm sticky top-0 z-40 px-6 py-4 flex items-center gap-3">
                <Activity className="text-blue-600 w-6 h-6" />
                <h1 className="text-xl font-bold">Appointments</h1>
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-6xl mx-auto bg-white rounded-lg shadow border p-6">
                    {loading ? (
                        <p className="text-gray-500 text-center py-10">Loading appointments...</p>
                    ) : appointments.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">No appointments found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Patient Name</th>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold">Time</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((appt) => {
                                        const dt = new Date(appt.requested_at || appt.scheduled_at);
                                        return (
                                            <tr key={appt._id} className="border-b hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-900 border-r">
                                                    {appt.patient?.name || "Unknown"}
                                                </td>
                                                <td className="px-6 py-4 border-r">
                                                    {dt.toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 border-r">
                                                    {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4 border-r">
                                                    {getStatusBadge(appt.status)}
                                                </td>
                                                <td className="px-6 py-4 flex items-center justify-end flex-wrap gap-2">
                                                    {appt.status === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleAccept(appt._id)}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                                            >
                                                                <Check className="w-4 h-4" /> Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(appt._id)}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                                            >
                                                                <X className="w-4 h-4" /> Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleOpenPatient(appt.patient?._id)}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                                    >
                                                        Open Profile <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
