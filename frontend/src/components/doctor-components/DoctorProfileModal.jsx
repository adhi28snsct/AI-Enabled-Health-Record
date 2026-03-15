import React, { useState } from "react";
import PropTypes from "prop-types";
import AvailabilityEditor from "./AvailablityEditor";
import { toast } from "react-toastify";

export default function DoctorProfileModal({
  doctor,
  onClose,
  onSave,
  saving,
}) {
  const [form, setForm] = useState({
    name: doctor.name || "",
    phone: doctor.phone || "",
    specialization: doctor.specialization || "",
    availability: doctor.availability || [],
  });

  const handleSave = async () => {
    if (!form.specialization) {
      toast.error("Specialization required");
      return;
    }

    if (form.availability.length === 0) {
      toast.error("Please add at least one availability slot");
      return;
    }

    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Doctor Profile</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <input
          className="w-full border rounded px-3 py-2"
          value={form.name}
          onChange={(e) =>
            setForm((p) => ({ ...p, name: e.target.value }))
          }
        />

        <input
          className="w-full border rounded px-3 py-2"
          value={form.phone}
          onChange={(e) =>
            setForm((p) => ({ ...p, phone: e.target.value }))
          }
        />

        <input
          className="w-full border rounded px-3 py-2"
          value={form.specialization}
          onChange={(e) =>
            setForm((p) => ({ ...p, specialization: e.target.value }))
          }
        />

        <AvailabilityEditor
          availability={form.availability}
          onChange={(availability) =>
            setForm((p) => ({ ...p, availability }))
          }
        />

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

DoctorProfileModal.propTypes = {
  doctor: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};