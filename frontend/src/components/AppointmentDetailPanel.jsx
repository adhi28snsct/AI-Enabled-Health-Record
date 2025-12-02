// src/components/AppointmentDetailPanel.jsx
import React, { useEffect, useRef } from "react";
import { X, Calendar } from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export default function AppointmentDetailPanel({ appointment, appointmentId, notification, onClose }) {
  const containerRef = useRef(null);
  const previousActiveRef = useRef(null);
  const navigate = useNavigate();

  const formatDate = (value) => {
    if (!value) return null;
    try {
      if (typeof value === "string") {

        if (/[A-Za-z]{3,}/.test(value) && /\d/.test(value)) return value;

        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString();
        return value;
      }
      if (value instanceof Date) {
        if (!Number.isNaN(value.getTime())) return value.toLocaleString();
      }
      // For numeric timestamps
      if (typeof value === "number") {
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) return d.toLocaleString();
      }
      return String(value);
    } catch {
      return String(value);
    }
  };

  useEffect(() => {
    previousActiveRef.current = document.activeElement;
    // focus the container so screen readers announce dialog
    containerRef.current?.focus?.();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      try { previousActiveRef.current?.focus?.(); } catch {}
    };
  }, [onClose]);

  // Prefer notification data (so UI doesn't depend on API)
  const source = notification ?? appointment ?? {};

  const displayDoctor =
    source.doctorName ||
    (source.doctor && (source.doctor.name ?? `${source.doctor.firstName ?? ""} ${source.doctor.lastName ?? ""}`.trim())) ||
    "—";

  const displaySpecialty =
    (source.doctor && (source.doctor.specialty || source.doctor.specialization)) ||
    source.doctorSpecialty ||
    source.meta?.doctorSpecialty ||
    "";

  const displayStatus = source.status || source.meta?.status || "Pending";

  // try multiple possible time fields commonly used in your notifications/schema
  const rawTime =
    source.requested_at ??
    source.requestedAt ??
    source.date ??
    source.time ??
    source.meta?.appointmentDate ??
    source.createdAt ??
    source.created_at ??
    null;

  const displayTime = formatDate(rawTime) ?? "—";

  const displayMessage =
    source.notes ||
    source.message ||
    source.body ||
    source.meta?.body ||
    "No message provided.";

  // Optional: Open full appointment page (if desired)
  const openAppointmentPage = () => {
    if (appointmentId) {
      navigate(`/appointments/${appointmentId}`);
    }
    onClose?.();
  };

  return (
    <aside
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-detail-title"
      aria-describedby="appointment-detail-desc"
      tabIndex={-1}
      className="w-full max-w-md h-full bg-white shadow-xl flex flex-col"
      style={{ backgroundColor: "#ffffff" }} // ensure full opacity / no dull shading
    >
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 id="appointment-detail-title" className="text-lg font-semibold text-gray-900">
            Appointment Details
          </h2>
          <p id="appointment-detail-desc" className="text-sm text-gray-500">
            Details for the selected appointment
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* keep only close in header for a clean accessible toolbar */}
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Close appointment details"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500">Doctor</div>
            <div className="mt-1 text-sm font-medium text-gray-900">Dr. {displayDoctor}</div>
            {displaySpecialty && <div className="text-sm text-gray-600">{displaySpecialty}</div>}
          </div>

          <div>
            <div className="text-xs text-gray-500">Date &amp; time</div>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-900">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>{displayTime || "—"}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Status</div>
            <div
              className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${
                displayStatus === "cancelled"
                  ? "bg-red-50 text-red-700 border border-red-100"
                  : displayStatus === "approved" || displayStatus === "confirmed"
                  ? "bg-green-50 text-green-700 border border-green-100"
                  : "bg-yellow-50 text-yellow-700 border border-yellow-100"
              }`}
              aria-label={`Appointment status: ${displayStatus}`}
            >
              {displayStatus}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Message</div>
            <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{displayMessage}</div>
          </div>

          {(!appointment && notification) && (
            <div className="pt-3 border-t text-xs text-gray-500">
              Showing data from notification record (no API lookup).
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}

AppointmentDetailPanel.propTypes = {
  appointmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  appointment: PropTypes.object,
  notification: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
