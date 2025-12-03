
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationRead,
  markNotificationUnread,
  deleteNotification,
  togglePinNotification,
} from "../services/notificationService";

import AppointmentDetailPanel from "./AppointmentDetailPanel";

export default function PatientNotificationsPanel({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, id: null });
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const pendingRequestsRef = useRef(new Set());

  const ignoreNextClickRef = useRef(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      const normalized = (Array.isArray(data) ? data : []).map(n => ({ ...n, pinned: !!n.pinned }));
      setNotifications(normalized);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map(n => (String(n._id) === String(id) ? { ...n, read: true } : n)));
    } catch (err) {
      console.error("mark read failed", err);
    }
  };

  const extractAppointmentId = (n) => {
    return n?.appointmentId
      || n?.meta?.appointmentId
      || n?.meta?.appointment?._id
      || n?.meta?.appointment?._id?.toString?.()
      || null;
  };

const onNotificationClick = (n) => {
 
  const apptId = extractAppointmentId(n);
  if (apptId) {
    setSelectedNotification({ notification: n, appointmentId: apptId });
  }
};

  const onContextMenu = (e, n) => {
    e.preventDefault();
    e.stopPropagation();

    ignoreNextClickRef.current = true;

    window.setTimeout(() => { ignoreNextClickRef.current = false; }, 300);

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      id: String(n._id),
    });
  };

  const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, id: null });

  const handleTogglePin = async (id) => {
    closeContextMenu();
    setNotifications(prev => prev.map(n => (String(n._id) === String(id) ? { ...n, pinned: !n.pinned } : n)));
    try {
      const target = notifications.find(x => String(x._id) === String(id));
      const newPinned = !target?.pinned;
      await togglePinNotification(id, newPinned);
    } catch (err) {
      console.warn("togglePinNotification failed, reverting local change", err);
      setNotifications(prev => prev.map(n => (String(n._id) === String(id) ? { ...n, pinned: !n.pinned } : n)));
    }
  };

  // Delete with optimistic UI
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) {
      closeContextMenu();
      return;
    }
    closeContextMenu();
    const backup = notifications;
    setNotifications(prev => prev.filter(n => String(n._id) !== String(id)));
    try {
      await deleteNotification(id);
    } catch (err) {
      console.warn("deleteNotification failed, restoring item", err);
      setNotifications(backup);
    }
  };

// updated handleMarkUnread
const handleMarkUnread = async (id) => {
  closeContextMenu();

  if (!id) return;
  if (pendingRequestsRef.current.has(id)) {
    console.debug('markUnread ignored, request already pending for', id);
    return;
  }

  pendingRequestsRef.current.add(id);
  const backup = notifications;
  setNotifications(prev => prev.map(n => (String(n._id) === String(id) ? { ...n, read: false } : n)));

  try {
    const resp = await markNotificationUnread(id);
    console.debug('markUnread response', id, resp?.status ?? resp);
  } catch (err) {
    console.warn("mark unread failed, reverting local change", err);
    setNotifications(backup);
  } finally {
    pendingRequestsRef.current.delete(id);
  }
};

const handleMarkAllRead = async () => {
  const unread = notifications.filter(n => !n.read);
  if (unread.length === 0) return;

  const backup = notifications;
 
  setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  try {

    await markAllNotificationsRead();
  } catch (err) {
    console.warn('mark all read encountered error, reverting', err);

    setNotifications(backup);
  }
};

  useEffect(() => {
    const onClick = () => {
      if (contextMenu.visible) closeContextMenu();
    };
    const onKey = (e) => {
      if (e.key === "Escape") closeContextMenu();
    };
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
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value ?? "";
    }
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <p className="text-sm text-gray-500">Recent activity and appointment updates</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Close notifications"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-6 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">You have</div>
            <div className="text-sm font-medium text-gray-900">{notifications.filter(n => !n.read).length} unread</div>
          </div>
          <div>
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-blue-600 hover:underline"
              title="Mark all as read"
            >
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6">
            <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No notifications yet</div>
        ) : (
          <div className="space-y-3 p-4">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => onNotificationClick(n)}
                onContextMenu={(e) => onContextMenu(e, n)}
                className={`relative cursor-pointer rounded-lg p-4 shadow-sm transition hover:shadow-md ${n.read ? "bg-white" : "bg-blue-50"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{n.title ?? (n.type === 'appointment_update' ? 'Appointment update' : (n.type ?? 'Notification'))}</h4>
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                            New
                          </span>
                        )}
                        {n.pinned && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                            Pinned
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                      {n.body ?? n.message ?? (n.meta?.body ?? '')}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                      {n.doctorName && <span className="font-medium text-gray-700">Dr. {n.doctorName}</span>}
                      <span>•</span>
                      <span>{formatDateTime(n.createdAt ?? n.created_at ?? n.time)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {n.type === 'appointment_status' ? (n.meta?.status ? `Status: ${n.meta.status}` : '') : ''}
                  </div>
                  <div className="flex items-center gap-2">
                    {!n.read && (
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleMarkRead(n._id);
                        }}
                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        const apptId = extractAppointmentId(n);
                        if (apptId) {
                          setNotifications(prev => prev.map(p => (String(p._id) === String(n._id) ? { ...p, read: true } : p)));
                          markNotificationRead(n._id).catch(e => console.warn('mark read background failed', e));
                          setSelectedNotification({ notification: n, appointmentId: apptId });
                        }
                      }}
                      className="text-xs px-3 py-1 border border-gray-200 rounded text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t flex items-center justify-between">
        <div className="text-sm text-gray-500">Notifications are stored for your records.</div>
        <div>
          <button
            onClick={() => {
              loadNotifications();
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu.visible && (
        <ul
          role="menu"
          className="fixed z-60 bg-white border rounded shadow-md text-sm py-1"
          style={{ top: contextMenu.y, left: contextMenu.x, minWidth: 140 }}
        >
          <li
            role="menuitem"
            tabIndex={0}
            className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleTogglePin(contextMenu.id)}
            onKeyDown={(e) => e.key === "Enter" && handleTogglePin(contextMenu.id)}
          >
            {notifications.find(n => String(n._id) === String(contextMenu.id))?.pinned ? "Unpin" : "Pin"}
          </li>
          <li
            role="menuitem"
            tabIndex={0}
            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-red-600"
            onClick={() => handleDelete(contextMenu.id)}
            onKeyDown={(e) => e.key === "Enter" && handleDelete(contextMenu.id)}
          >
            Delete
          </li>
          <li
            role="menuitem"
            tabIndex={0}
            className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleMarkUnread(contextMenu.id)}
            onKeyDown={(e) => e.key === "Enter" && handleMarkUnread(contextMenu.id)}
          >
            Mark as unread
          </li>
        </ul>
      )}

      {/* Drawer / side panel for appointment detail */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex"
          aria-hidden="false"
          onClick={() => setSelectedNotification(null)}
        >
          {/* backdrop */}
          <div className="fixed inset-0 bg-black/30" />
          {/* panel aligned to right */}
          <div
            className="ml-auto h-full"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(420px, 95vw)" }}
          >
            <AppointmentDetailPanel
              appointmentId={selectedNotification.appointmentId}
              notification={selectedNotification.notification}
              onClose={() => setSelectedNotification(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
