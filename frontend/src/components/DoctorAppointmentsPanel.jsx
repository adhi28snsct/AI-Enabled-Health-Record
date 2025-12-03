
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bell, X, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import ConfirmDialog from "./ConfirmDialog";
import { api } from "../api/api";

export default function DoctorAppointmentsPanel({ doctorId: propPropDoctorId }) {
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, id: null });

  const mountedRef = useRef(true);
  const firstOpenRef = useRef(true);

  const getDoctorId = () => {
    if (propPropDoctorId) return propPropDoctorId;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?._id ?? u?.id ?? null;
    } catch {
      return null;
    }
  };

  const acceptedStatusList = ["confirmed", "accepted", "booked", "doctor_confirmed"];

  const fetchConfirmed = useCallback(async ({ populate = false } = {}) => {
    if (!mountedRef.current) return [];
    setLoading(true);
    try {
      const res = await api.get("/appointments/doctor/appointments?status=confirmed");
      const list = res?.data?.data ?? res?.data ?? [];
      const confirmed = (Array.isArray(list) ? list : []).filter((a) => {
        const s = (a?.status ?? "").toString().toLowerCase();
        return acceptedStatusList.includes(s);
      });

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

  useEffect(() => {
    mountedRef.current = true;
    // initial badge-only fetch
    (async () => {
      try { await fetchConfirmed({ populate: false }); } catch (e) {}
    })();
    return () => { mountedRef.current = false; };
  }, [fetchConfirmed]);

  // Toggle open: fetch & populate on first open
  const toggleOpen = () => {
    setOpen(o => {
      const next = !o;
      if (next && firstOpenRef.current) {
        fetchConfirmed({ populate: true }).finally(() => { firstOpenRef.current = false; });
      }
      return next;
    });
  };

  // Manual refresh (refresh badge + optionally appointments if panel open)
  const handleManualRefresh = async () => {
    await fetchConfirmed({ populate: open });
  };

  // Request cancel (show confirm dialog)
  const requestCancel = (id) => {
    setPendingCancelId(id);
    setConfirmOpen(true);
    closeContextMenu();
  };

  // Perform cancel (optimistic)
  const performCancel = async () => {
    const id = pendingCancelId;
    if (!id) { setConfirmOpen(false); return; }

    const backupAppointments = [...appointments];
    const backupBadge = badgeCount;

    // optimistic remove
    let removed = false;
    setAppointments(prev => {
      const next = prev.filter(a => {
        if (String(a._id) === String(id)) { removed = true; return false; }
        return true;
      });
      return next;
    });
    if (removed) setBadgeCount(b => Math.max(0, b - 1));

    setConfirmOpen(false);

    try {
      await api.patch(`/appointments/doctor/appointments/${id}/status`, { status: "cancelled" });
      // intentionally no auto-refresh
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      setAppointments(backupAppointments);
      setBadgeCount(backupBadge);
      // simple alert; replace with toast if you have one
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setPendingCancelId(null);
    }
  };

  const handleView = (appt) => {

    try {
      const url = `/appointments/${appt._id}`;
      window.open(url, "_blank", "noopener");
    } catch {
      console.log("View appointment", appt);
    }
    closeContextMenu();
  };

  // Context menu helpers
  const onContextMenu = (e, appt) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, id: String(appt._id) });
  };
  const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, id: null });

  // Close context menu when clicking elsewhere or pressing Escape
  useEffect(() => {
    const onClick = () => { if (contextMenu.visible) closeContextMenu(); };
    const onKey = (e) => { if (e.key === "Escape") closeContextMenu(); };
    window.addEventListener("click", onClick);
    window.addEventListener("contextmenu", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("contextmenu", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [contextMenu.visible]);

  const formatDateTime = (value) => {
    try { return new Date(value).toLocaleString(); } catch { return value ?? ""; }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        title="Confirmed appointments"
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {badgeCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-red-600 text-white">
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 z-50 w-[420px] max-w-[95vw] bg-white border rounded shadow-lg overflow-hidden"
          role="dialog"
          aria-label="Confirmed appointments"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Confirmed Appointments</h4>
              <p className="text-xs text-gray-500">Appointments you have confirmed</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100" title="Close" aria-label="Close appointments panel">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No confirmed appointments</div>
            ) : (
              <ul className="divide-y" role="list" aria-label="List of confirmed appointments">
                {appointments.map((a) => (
                  <li
                    key={a._id}
                    className="p-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-gray-50"
                    onContextMenu={(e) => onContextMenu(e, a)}
                    role="listitem"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") handleView(a); }}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{a.patient?.name ?? "Unknown patient"}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {a.reason ? `${a.reason} • ` : ""}{formatDateTime(a.scheduled_at ?? a.start_at ?? a.requested_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(ev) => { ev.stopPropagation(); requestCancel(a._id); }}
                        className="flex items-center gap-1 px-2 py-1 rounded text-sm border border-gray-200 hover:bg-gray-50"
                        title="Cancel appointment"
                        aria-label={`Cancel appointment for ${a.patient?.name ?? "patient"}`}
                        aria-disabled={confirmOpen}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" /> Cancel
                      </button>

                      <button
                        onClick={(ev) => { ev.stopPropagation(); handleView(a); }}
                        className="text-xs px-3 py-1 border border-gray-200 rounded text-gray-700 hover:bg-gray-50"
                        title="View appointment"
                      >
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-3 border-t text-xs text-gray-500 flex items-center justify-between">
            <span>Confirmed appointments are visible here. Cancelling will notify patient.</span>
            <div>
              <button onClick={handleManualRefresh} className="ml-3 text-blue-600 hover:underline text-sm">Refresh</button>
            </div>
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenu.visible && (
        <ul
          role="menu"
          className="fixed z-60 bg-white border rounded shadow-md text-sm py-1"
          style={{ top: contextMenu.y, left: contextMenu.x, minWidth: 140 }}
          onClick={(e) => e.stopPropagation()}
        >
          <li
            role="menuitem"
            tabIndex={0}
            className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              const appt = appointments.find(x => String(x._id) === String(contextMenu.id));
              if (appt) handleView(appt);
              closeContextMenu();
            }}
            onKeyDown={(e) => e.key === "Enter" && (() => {
              const appt = appointments.find(x => String(x._id) === String(contextMenu.id));
              if (appt) handleView(appt);
              closeContextMenu();
            })()}
          >
            View
          </li>

          <li
            role="menuitem"
            tabIndex={0}
            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-600"
            onClick={() => requestCancel(contextMenu.id)}
            onKeyDown={(e) => e.key === "Enter" && requestCancel(contextMenu.id)}
          >
            Cancel
          </li>
        </ul>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel appointment?"
        message="Are you sure you want to cancel this confirmed appointment? This will notify the patient."
        onConfirm={performCancel}
        onCancel={() => { setConfirmOpen(false); setPendingCancelId(null); }}
        confirmLabel="Yes, cancel"
        cancelLabel="No"
      />
    </div>
  );
}

DoctorAppointmentsPanel.propTypes = {
  doctorId: PropTypes.string,
};
