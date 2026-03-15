import { useState, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { api } from "@/api/api";
import { Calendar, Heart } from "lucide-react";

const AppointmentBooker = ({ doctor, currentRiskLevel = "moderate", onClose }) => {
  const [requestedTime, setRequestedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const messageRef = useRef(null);

  const minDatetimeLocal = useMemo(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().slice(0, 16);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctor?._id || !requestedTime) return;

    try {
      setLoading(true);
      setMessage("");

      // ✅ FINAL, CORRECT ENDPOINT
      await api.post("/appointments", {
        doctorId: doctor._id,
        requestedTime: new Date(requestedTime).toISOString(),
        notes,
      });

      setMessage("✅ Appointment requested successfully");
      setMessageType("success");

      setRequestedTime("");
      setNotes("");

      messageRef.current?.focus?.();

      setTimeout(() => {
        onClose?.();
      }, 1200);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "❌ Failed to book appointment"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) {
    return (
      <div className="p-6 text-gray-500">
        Select a doctor to book an appointment.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Calendar /> Book Appointment
      </h3>

      <div className="mb-4 text-sm text-gray-700">
        Booking with <strong>Dr. {doctor.name}</strong>{" "}
        ({doctor.specialization || "General"})
      </div>

      <div className="mb-4 p-2 rounded bg-yellow-100 flex items-center gap-2">
        <Heart className="w-4 h-4 text-red-600" />
        Risk Level: <strong>{currentRiskLevel.toUpperCase()}</strong>
      </div>

      {message && (
        <div
          ref={messageRef}
          tabIndex={-1}
          className={`mb-4 p-2 rounded ${
            messageType === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="datetime-local"
          min={minDatetimeLocal}
          value={requestedTime}
          onChange={(e) => setRequestedTime(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full border p-2 rounded"
        />

        <button
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Request Appointment"}
        </button>
      </form>
    </div>
  );
};

AppointmentBooker.propTypes = {
  doctor: PropTypes.object,
  currentRiskLevel: PropTypes.string,
  onClose: PropTypes.func,
};

export default AppointmentBooker;