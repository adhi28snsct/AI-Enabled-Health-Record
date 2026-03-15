import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bell, X, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import ConfirmDialog from "../ConfirmDialog";
import { api } from "../../api/api";

export default function DoctorAppointmentsPanel({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);

  const mountedRef = useRef(true);
  const firstOpenRef = useRef(true);

  const acceptedStatusList = ["confirmed"];

  /* ======================================================
     FETCH CONFIRMED APPOINTMENTS
  ====================================================== */
  const fetchConfirmed = useCallback(async ({ populate = false } = {}) => {
    if (!mountedRef.current) return [];
    setLoading(true);

    try {
      const res = await api.get("/doctor/my-appointments");
      const list = res?.data?.data ?? [];

      const confirmed = list.filter((a) =>
        acceptedStatusList.includes(
          String(a.status || "").toLowerCase()
        )
      );

      if (mountedRef.current) {
        setBadgeCount(confirmed.length);
        if (populate) setAppointments(confirmed);
      }

      return confirmed;
    } catch (err) {
      console.warn("[DoctorAppointmentsPanel] fetchConfirmed failed:", err);
      return [];
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  /* ======================================================
     INITIAL BADGE LOAD
  ====================================================== */
  useEffect(() => {
    mountedRef.current = true;
    fetchConfirmed({ populate: false });
    return () => {
      mountedRef.current = false;
    };
  }, [fetchConfirmed]);

  /* ======================================================
     TOGGLE PANEL
  ====================================================== */
  const toggleOpen = () => {
    setOpen((o) => {
      const next = !o;
      if (next && firstOpenRef.current) {
        fetchConfirmed({ populate: true }).finally(() => {
          firstOpenRef.current = false;
        });
      }
      return next;
    });
  };

  /* ======================================================
     CANCEL APPOINTMENT
  ====================================================== */
  const requestCancel = (id) => {
    setPendingCancelId(id);
    setConfirmOpen(true);
  };

  const performCancel = async () => {
    if (!pendingCancelId) return;

    const backup = [...appointments];
    const backupCount = badgeCount;

    setAppointments((prev) =>
      prev.filter((a) => a._id !== pendingCancelId)
    );
    setBadgeCount((c) => Math.max(0, c - 1));
    setConfirmOpen(false);

    try {
      await api.patch(`/appointments/${pendingCancelId}/status`, {
        status: "cancelled",
      });
    } catch (err) {
      console.error("Cancel failed:", err);
      setAppointments(backup);
      setBadgeCount(backupCount);
      alert("Failed to cancel appointment");
    } finally {
      setPendingCancelId(null);
    }
  };

  const formatDateTime = (value) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value ?? "";
    }
  };

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50"
        title="Confirmed appointments"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {badgeCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-red-600 text-white">
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 w-[420px] bg-white border rounded shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h4 className="text-sm font-semibold">Confirmed Appointments</h4>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-gray-500">Loading…</div>
            ) : appointments.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                No confirmed appointments
              </div>
            ) : (
              <ul className="divide-y">
                {appointments.map((a) => (
                  <li key={a._id} className="p-3 flex justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">
                        {a.patient?.name || "Unknown patient"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(
                          a.scheduled_at ||
                          a.start_at ||
                          a.requested_at
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (onSelect) onSelect(a._id);
                          setOpen(false);
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Start Consultation
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          requestCancel(a._id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        Cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel appointment?"
        message="This will notify the patient."
        onConfirm={performCancel}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel="Yes, cancel"
        cancelLabel="No"
      />
    </div>
  );
}

DoctorAppointmentsPanel.propTypes = {
  doctorId: PropTypes.string,
  onSelect: PropTypes.func,
};
