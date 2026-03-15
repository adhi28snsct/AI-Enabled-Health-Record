import React from "react";
import PropTypes from "prop-types";
import { Plus, Trash2 } from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilityEditor({ availability = [], onChange }) {
  const addSlot = () => {
    onChange([
      ...availability,
      {
        day: "Monday",
        from: "09:00",
        to: "17:00",
        notes: "",
      },
    ]);
  };

  const updateSlot = (index, field, value) => {
    const updated = availability.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    );
    onChange(updated);
  };

  const removeSlot = (index) => {
    onChange(availability.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">
          Availability
        </h3>
        <button
          onClick={addSlot}
          className="flex items-center gap-1 text-sm text-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Slot
        </button>
      </div>

      {availability.length === 0 && (
        <p className="text-xs text-gray-500">
          No availability added yet.
        </p>
      )}

      {availability.map((slot, index) => (
        <div
          key={slot._id} // ✅ ONLY THIS
          className="grid grid-cols-5 gap-2 items-center border rounded p-3"
        >
          <select
            value={slot.day}
            onChange={(e) =>
              updateSlot(index, "day", e.target.value)
            }
            className="border rounded px-2 py-1 col-span-2"
          >
            {DAYS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <input
            type="time"
            value={slot.from}
            onChange={(e) =>
              updateSlot(index, "from", e.target.value)
            }
            className="border rounded px-2 py-1"
          />

          <input
            type="time"
            value={slot.to}
            onChange={(e) =>
              updateSlot(index, "to", e.target.value)
            }
            className="border rounded px-2 py-1"
          />

          <button
            onClick={() => removeSlot(index)}
            className="text-red-600 flex justify-center"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

AvailabilityEditor.propTypes = {
  availability: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};