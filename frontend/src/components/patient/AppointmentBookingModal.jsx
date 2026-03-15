import React, { useState } from "react";
import { X, Calendar, Clock, FileText } from "lucide-react";
import { bookAppointment } from "../../api/patient";
import { toast } from "react-toastify";

export default function AppointmentBookingModal({ isOpen, onClose, doctor }) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [symptoms, setSymptoms] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen || !doctor) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!date || !time) {
            toast.warning("Please select both date and time");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                doctorId: doctor._id,
                date: date,
                time: time,
                symptoms: symptoms
            };

            await bookAppointment(payload);
            toast.success("Appointment booked successfully!");
            onClose();
            setDate("");
            setTime("");
            setSymptoms("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to book appointment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h2 className="text-lg font-semibold">Book Appointment</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6 pb-6 border-b">
                        <h3 className="font-medium text-gray-900 text-lg">Dr. {doctor.name}</h3>
                        <p className="text-blue-600 capitalize">{doctor.specialization}</p>
                        {doctor.hospital && <p className="text-sm text-gray-500 mt-1">{doctor.hospital.name}</p>}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-blue-500" /> Select Date
                                </label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-blue-500" /> Select Time
                                </label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <FileText className="w-4 h-4 text-blue-500" /> Symptoms / Reason
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Briefly describe your symptoms or reason for visit..."
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-blue-400"
                            >
                                {loading ? "Booking..." : "Confirm Booking"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
