import React from "react";
import PropTypes from "prop-types";
import { Stethoscope, IndianRupee } from "lucide-react";

export default function DoctorCard({ doctor, onBook }) {
  return (
    <div className="bg-white rounded-xl shadow border p-4 flex gap-4">
      {/* Avatar */}
      <img
        src={doctor.profile_image || "/doctor-avatar.png"}
        alt={doctor.name}
        className="w-16 h-16 rounded-full object-cover border"
      />

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">
          Dr. {doctor.name}
        </h3>

        <p className="text-sm text-gray-600 flex items-center gap-1">
          <Stethoscope className="w-4 h-4" />
          {doctor.specialization || doctor.otherSpecialization || "General"}
        </p>

        <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
          <IndianRupee className="w-4 h-4" />
          {doctor.consultation_fee || 0}
        </p>
      </div>

      {/* Action */}
      <div className="flex items-center">
        <button
          onClick={() => onBook(doctor)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Book
        </button>
      </div>
    </div>
  );
}

DoctorCard.propTypes = {
  doctor: PropTypes.object.isRequired,
  onBook: PropTypes.func.isRequired,
};