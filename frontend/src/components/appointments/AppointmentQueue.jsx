import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { api } from "../../api/api";
import { getSocket } from "../../api/socket";

const RISK_ORDER = { critical: 4, high: 3, moderate: 2, low: 1, unknown: 0 };

const sortQueue = (list = []) =>
  [...list].sort((a, b) => {
    const ra = RISK_ORDER[a?.risk_snapshot?.risk_level] ?? 0;
    const rb = RISK_ORDER[b?.risk_snapshot?.risk_level] ?? 0;
    if (rb !== ra) return rb - ra;
    return new Date(a.requested_at) - new Date(b.requested_at);
  });

const AppointmentQueue = ({ selectedDoctorId }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingIds, setSubmittingIds] = useState(new Set());

  const socketRef = useRef(null);
  const abortRef = useRef(null);

  /* ================= FETCH QUEUE ================= */

  const fetchQueue = useCallback(async (signal) => {
    try {
      setLoading(true);

      const res = await api.get("/doctor/my-appointments", { signal });
      const list = res?.data?.data ?? [];

      // only pending
      const pending = list.filter(
        (a) => String(a.status).toLowerCase() === "pending"
      );

      setQueue(sortQueue(pending));
    } catch (err) {
      if (err?.code !== "ERR_CANCELED") {
        console.error("Failed to fetch appointment queue:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    abortRef.current = new AbortController();
    fetchQueue(abortRef.current.signal);

    return () => abortRef.current?.abort();
  }, [fetchQueue, selectedDoctorId]);

  /* ================= SOCKET ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");
    const doctorId = selectedDoctorId;

    if (!token || !doctorId) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    const room = `doctor:${doctorId}`;
    socket.emit("room:join", room);

    socket.on("appointment:new", (payload) => {
      if (!payload?.appointment) return;
      setQueue((prev) =>
        sortQueue([payload.appointment, ...prev])
      );
    });

    return () => {
      socket.emit("room:leave", room);
      socket.disconnect();
    };
  }, [selectedDoctorId]);

  /* ================= STATUS UPDATE ================= */

  const handleStatusUpdate = async (appointmentId, status) => {
    if (!appointmentId) return;

    setSubmittingIds((prev) => new Set(prev).add(appointmentId));

    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });

      // remove from queue
      setQueue((prev) =>
        prev.filter((a) => a._id !== appointmentId)
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      await fetchQueue();
      alert("Failed to update appointment");
    } finally {
      setSubmittingIds((prev) => {
        const next = new Set(prev);
        next.delete(appointmentId);
        return next;
      });
    }
  };

  /* ================= UI ================= */

  if (loading)
    return <div className="p-6 text-gray-500">Loading Appointment Queue…</div>;

  if (queue.length === 0)
    return <div className="p-6 text-gray-500">No pending appointments.</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Clock className="text-orange-600" /> Pending Appointment Queue
      </h3>

      {queue.map((app) => {
        const risk = app?.risk_snapshot?.risk_level ?? "unknown";
        const isCritical = risk === "critical";
        const isSubmitting = submittingIds.has(app._id);

        return (
          <div
            key={app._id}
            className={`p-4 rounded-lg shadow border-l-4 ${
              isCritical
                ? "bg-red-50 border-red-600"
                : "bg-yellow-50 border-yellow-600"
            }`}
          >
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">{app.patient?.name}</h4>
                <p className="text-sm text-gray-600">
                  Requested: {new Date(app.requested_at).toLocaleString()}
                </p>
                <span className="text-xs font-medium">
                  AI Risk: {risk.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleStatusUpdate(app._id, "confirmed")}
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  <CheckCircle className="inline w-4 h-4 mr-1" />
                  Confirm
                </button>

                <button
                  onClick={() => handleStatusUpdate(app._id, "cancelled")}
                  disabled={isSubmitting}
                  className="border px-3 py-1 rounded"
                >
                  <XCircle className="inline w-4 h-4 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

AppointmentQueue.propTypes = {
  selectedDoctorId: PropTypes.string,
};

export default AppointmentQueue;
