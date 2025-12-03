
import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { api } from "../api/api"; 
import { getSocket } from "../api/socket"; 

const RISK_ORDER = { critical: 4, high: 3, moderate: 2, low: 1, unknown: 0 };

const sortQueue = (list = []) => {
  return [...list].sort((a, b) => {
    const ra = RISK_ORDER[a?.risk_snapshot?.risk_level] ?? 0;
    const rb = RISK_ORDER[b?.risk_snapshot?.risk_level] ?? 0;
    if (rb !== ra) return rb - ra; 
    const da = new Date(a.requested_at || a.requestedAt || 0).getTime();
    const db = new Date(b.requested_at || b.requestedAt || 0).getTime();
    return da - db;
  });
};

const AppointmentQueue = ({ selectedDoctorId }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingIds, setSubmittingIds] = useState(new Set()); 
  const socketRef = useRef(null);
  const abortRef = useRef(null);

  const getAuthToken = () => localStorage.getItem("token");
  const getDoctorId = () => {
    if (selectedDoctorId) return selectedDoctorId;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?._id ?? u?.id ?? null;
    } catch {
      return null;
    }
  };


  const fetchQueue = useCallback(async (signal) => {
    try {
      setLoading(true);
      const res = await api.get("/appointments/doctor/appointments", { signal });
  
      const list = res?.data?.data ?? res?.data ?? [];
      setQueue(sortQueue(Array.isArray(list) ? list : []));
    } catch (err) {
      const isAbort =
        err?.name === "CanceledError" ||
        err?.name === "AbortError" ||
        err?.code === "ERR_CANCELED";
      if (!isAbort) {
        console.error("Failed to fetch appointment queue:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    abortRef.current = new AbortController();
    fetchQueue(abortRef.current.signal);

    return () => {
      try {
        abortRef.current?.abort();
      } catch (e) {}
    };
  }, [fetchQueue, selectedDoctorId]);

useEffect(() => {
  const token = getAuthToken();
  const doctorId = getDoctorId();
  if (!token || !doctorId) return; // nothing to do

  // use the singleton socket
  const socket = getSocket(token);
  socketRef.current = socket;

  const room = `doctor:${doctorId}`;

  const onConnect = () => {
    try {
      socket.emit("room:join", room);
    } catch (e) {
      console.warn("room:join emit failed", e);
    }
  };

  const onNewAppointment = (payload) => {
    if (!payload || !payload.appointment) return;
    setQueue(prev => {
      const exists = prev.some(a => String(a._id) === String(payload.appointment._id));
      const next = exists
        ? prev.map(a => String(a._id) === String(payload.appointment._id) ? payload.appointment : a)
        : [payload.appointment, ...prev];
      return sortQueue(next);
    });
  };

  socket.on("connect", onConnect);
  socket.on("appointment:new", onNewAppointment);

  socket.on("connect_error", (err) => {
    console.warn("Socket connect_error:", err?.message || err);
  });

  return () => {
    try {
  
      socket.off("connect", onConnect);
      socket.off("appointment:new", onNewAppointment);
      socket.off("connect_error");
    
      try { socket.emit("room:leave", room); } catch (e) {}
    } catch (e) {
    
    }
    socketRef.current = null;
  };
}, [selectedDoctorId]);
  const handleStatusUpdate = async (appointmentId, status) => {
    if (!appointmentId || !status) return;

    setSubmittingIds(prev => new Set(prev).add(appointmentId));

    setQueue(prev => prev.map(app => app._id === appointmentId ? { ...app, status } : app));

    try {
      const res = await api.patch(`/appointments/doctor/appointments/${appointmentId}/status`, { status });
     
      const updated = res?.data?.appointment ?? res?.data ?? null;

      if (updated) {
        setQueue(prev => prev.filter(app => String(app._id) !== String(appointmentId))); // remove processed
      } else {
     
        setQueue(prev => prev.filter(app => String(app._id) !== String(appointmentId)));
      }
    } catch (err) {
      console.error(`Failed to update status to ${status}:`, err);
      // rollback: reload fresh queue
      try {
        const fresh = await api.get("/appointments/doctor/appointments");
        const list = fresh?.data?.data ?? fresh?.data ?? [];
        setQueue(sortQueue(Array.isArray(list) ? list : []));
      } catch (reloadErr) {
        console.error("Failed to reload queue after status update error:", reloadErr);
      }
      alert("Failed to update status. Please try again.");
    } finally {
      // unmark submitting
      setSubmittingIds(prev => {
        const next = new Set(prev);
        next.delete(appointmentId);
        return next;
      });
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading Appointment Queue...</div>;
  if (!queue || queue.length === 0) return <div className="p-6 text-gray-500">No pending appointments.</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Clock className="w-6 h-6 text-orange-600" /> Pending Triage Queue
      </h3>
      <p className="text-sm text-gray-600">Appointments are prioritized by AI risk level [critical | high]</p>

      {queue.map((app) => {
        const riskLevel = app?.risk_snapshot?.risk_level ?? "unknown";
        const isCritical = riskLevel === "critical";
        const isSubmitting = submittingIds.has(app._id);

        return (
          <div
            key={app._id}
            className={`p-4 rounded-lg shadow-md border-l-4 ${isCritical ? 'bg-red-50 border-red-600' : 'bg-yellow-50 border-yellow-600'}`}
            aria-live="polite"
          >
            <div className="flex justify-between items-start">
              {/* LEFT: Patient Info & Risk */}
              <div>
                <h4 className="font-semibold text-gray-900">{app.patient?.name ?? app.patient}</h4>
                <p className="text-sm text-gray-600">
                  Requested: {new Date(app.requested_at).toLocaleString()}
                </p>
                <span className={`text-xs font-medium px-2 py-1 rounded mt-1 inline-block bg-white ${isCritical ? 'text-red-700 border border-red-300' : 'text-yellow-700 border border-yellow-300'}`}>
                  AI Risk: {String(riskLevel).toUpperCase()}
                </span>
              </div>

              {/* RIGHT: Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleStatusUpdate(app._id, 'confirmed')}
                  disabled={isSubmitting}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${isSubmitting ? 'bg-gray-400 text-white cursor-wait' : 'bg-green-600 text-white hover:bg-green-700'}`}
                  aria-disabled={isSubmitting}
                >
                  <CheckCircle className="w-4 h-4" /> {isSubmitting ? 'Processing...' : 'Confirm'}
                </button>

                <button
                  onClick={() => handleStatusUpdate(app._id, 'cancelled')}
                  disabled={isSubmitting}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${isSubmitting ? 'border border-gray-300 text-gray-400 cursor-wait' : 'border border-gray-300 hover:bg-gray-100'}`}
                  aria-disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4" /> Cancel
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
