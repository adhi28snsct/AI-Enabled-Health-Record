
import { useEffect, useRef } from "react";
import { createSocket } from "../api/socket";
export default function useAppointmentSocket(patientId, token, onAppointmentUpdate, onNotification) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!patientId || !token) return;

    const socket = createSocket(token);
    socketRef.current = socket;

    const room = `patient:${patientId}`;
    socket.on("connect", () => {
      socket.emit("room:join", room);
    });

    const apptHandler = (payload) => {
      if (!payload?.appointment) return;
      onAppointmentUpdate?.(payload.appointment);
    };

    const notifHandler = (payload) => {
      if (!payload?.notification) return;
      onNotification?.(payload.notification);
    };

    socket.on("appointment:update", apptHandler);
    socket.on("notification:new", notifHandler);

    socket.on("connect_error", (err) => {
      console.warn("Socket connect_error:", err?.message || err);
    });

    return () => {
      try {
        socket.off("appointment:update", apptHandler);
        socket.off("notification:new", notifHandler);
        socket.emit("room:leave", room);
        socket.disconnect();
      } catch (err) {
        /* ignore */
      }
      socketRef.current = null;
    };
  }, [patientId, token, onAppointmentUpdate, onNotification]);
}
