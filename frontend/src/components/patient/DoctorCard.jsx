import React from "react";
import { User, Building, Stethoscope, Briefcase, CalendarPlus } from "lucide-react";

export default function DoctorCard({ doctor, onBook }) {
    return (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col hover:shadow-md transition">

            <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-7 h-7" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Dr. {doctor.name}</h3>
                    <p className="text-blue-600 text-sm font-medium capitalize flex items-center gap-1 mt-0.5">
                        <Stethoscope className="w-4 h-4" /> {doctor.specialization || "General"}
                    </p>
                </div>
            </div>

            <div className="space-y-2 mb-6 flex-1 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    {doctor.hospital ? doctor.hospital.name : "Independent Practice"}
                </p>
                <p className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    {doctor.experience ? `${doctor.experience} years experience` : "Experience unlisted"}
                </p>
            </div>

            <button
                onClick={onBook}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-medium rounded-lg transition"
            >
                <CalendarPlus className="w-5 h-5" /> Book Appointment
            </button>

        </div>
    );
}
