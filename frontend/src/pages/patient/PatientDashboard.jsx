import React, { useEffect, useState } from "react";
import { Activity, Calendar, Users, HeartPulse } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

import { getMyAppointments, getAllDoctors, getMyAISummary } from "../../api/patient";

export default function PatientDashboard() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [doctorsCount, setDoctorsCount] = useState(0);
    const [aiScore, setAiScore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [apptsRes, docsRes, aiRes] = await Promise.all([
                    getMyAppointments().catch(() => ({ data: { data: [] } })),
                    getAllDoctors().catch(() => ({ data: { data: [] } })),
                    getMyAISummary().catch(() => ({ data: {} }))
                ]);

                setAppointments(apptsRes.data?.data || []);
                setDoctorsCount(docsRes.data?.data?.length || 0);

                // Calculate a mock score or use provided risk level if available.
                // The backend might return standard AI summary object with risk_level.
                setAiScore(aiRes.data?.risk_level || "Unknown");

            } catch (err) {
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-6 text-gray-500">Loading Dashboard...</div>;

    const upcomingAppts = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
    const completedAppts = appointments.filter(a => a.status === 'completed');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <ToastContainer />
            <header className="bg-white border-b shadow-sm sticky top-0 z-40 px-6 py-4 flex items-center gap-3">
                <Activity className="text-blue-600 w-6 h-6" />
                <h1 className="text-xl font-bold flex-1">Patient Dashboard</h1>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">

                {/* STATS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow border flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Calendar className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Upcoming Appointments</p>
                            <h3 className="text-2xl font-bold text-gray-900">{upcomingAppts.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow border flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Calendar className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Completed Visits</p>
                            <h3 className="text-2xl font-bold text-gray-900">{completedAppts.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow border flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Doctors Available</p>
                            <h3 className="text-2xl font-bold text-gray-900">{doctorsCount}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow border flex items-center gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-lg"><HeartPulse className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Latest AI Risk Level</p>
                            <h3 className="text-xl font-bold text-gray-900 capitalize">{aiScore}</h3>
                        </div>
                    </div>
                </div>

                {/* RECENT ACTIVITY & UPCOMING */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="bg-white rounded-xl shadow border overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" /> Upcoming Appointments
                            </h2>
                            <button
                                onClick={() => navigate('/patient/appointments')}
                                className="text-sm text-blue-600 font-medium hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <div className="p-6">
                            {upcomingAppts.length === 0 ? (
                                <p className="text-gray-500 text-sm">No upcoming appointments.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {upcomingAppts.slice(0, 3).map(appt => (
                                        <li key={appt._id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium text-gray-900">Dr. {appt.doctor?.name || "Unknown"}</p>
                                                <p className="text-sm text-gray-500">{new Date(appt.requested_at || appt.scheduled_at).toLocaleString()}</p>
                                            </div>
                                            <span className={`px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium ${appt.status === "confirmed" ? "bg-blue-100 text-blue-800" : ""
                                                }`}>
                                                {appt.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>

                    <section className="bg-white rounded-xl shadow border overflow-hidden flex flex-col justify-center items-center p-8 text-center">
                        <HeartPulse className="w-16 h-16 text-red-500 mb-4 opacity-80" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Check Your Health Status</h3>
                        <p className="text-gray-500 mb-6 max-w-sm">
                            Take our AI-powered health assessment to get continuous risk monitoring and tailored recommendations based on your symptoms.
                        </p>
                        <button
                            onClick={() => navigate('/patient/ai-check')}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                        >
                            Start AI Health Check
                        </button>
                    </section>
                </div>

            </main>
        </div>
    );
}
