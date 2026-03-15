import React, { useEffect, useState } from "react";
import { Search, Stethoscope } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getAllDoctors } from "../../api/patient";
import DoctorCard from "../../components/patient/DoctorCard";
import AppointmentBookingModal from "../../components/patient/AppointmentBookingModal";

export default function PatientDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedDoctor, setSelectedDoctor] = useState(null);

    useEffect(() => {
        getAllDoctors()
            .then((res) => setDoctors(res.data.data || []))
            .catch(() => toast.error("Failed to fetch doctors"))
            .finally(() => setLoading(false));
    }, []);

    const filteredDoctors = doctors.filter(d =>
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.hospital && d.hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <ToastContainer />

            <header className="bg-white border-b shadow-sm sticky top-0 z-30 px-6 py-4 flex gap-3 items-center">
                <Stethoscope className="text-blue-600 w-6 h-6" />
                <h1 className="text-xl font-bold flex-1">Find a Doctor</h1>
            </header>

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
                {/* SEARCH BAR */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, specialty, or hospital..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* DOCTOR GRID */}
                {loading ? (
                    <div className="text-center p-10 text-gray-500">Loading doctors...</div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="text-center p-10 text-gray-500 bg-white rounded-xl border">
                        No doctors found matching your search.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDoctors.map(doc => (
                            <DoctorCard
                                key={doc._id}
                                doctor={doc}
                                onBook={() => setSelectedDoctor(doc)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* BOOKING MODAL */}
            <AppointmentBookingModal
                isOpen={!!selectedDoctor}
                doctor={selectedDoctor}
                onClose={() => setSelectedDoctor(null)}
            />
        </div>
    );
}
