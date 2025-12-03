// src/api/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_WS_URL || "http://localhost:5000";

let socketInstance = null;

/**
 * getSocket(token)
 * - Returns one shared socket instance for the app.
 * - If token changes, the singleton reconnects with new auth.
 */
export function getSocket(token) {
  // If instance exists and token unchanged, return it
  if (socketInstance) {
    const existingToken = socketInstance.__authToken;
    if (token && token !== existingToken) {
      try { socketInstance.disconnect(); } catch (e) {}
      socketInstance = null;
    } else {
      return socketInstance;
    }
  }

  const opts = {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    timeout: 10000,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true,
  };

  if (token) opts.auth = { token };

  const socket = io(SOCKET_URL, opts);
  socket.__authToken = token;

  // Helpful lifecycle logs (one place only)
  socket.on("connect", () => console.debug("[socket singleton] connect", socket.id));
  socket.on("connect_error", (err) => console.warn("[socket singleton] connect_error", err?.message ?? err));
  socket.on("reconnect_attempt", (n) => console.debug("[socket singleton] reconnect_attempt", n));
  socket.on("reconnect_failed", () => console.warn("[socket singleton] reconnect_failed"));
  socket.on("disconnect", (reason) => console.debug("[socket singleton] disconnect", reason));

  socketInstance = socket;
  return socketInstance;
}

export function disposeSocket() {
  if (!socketInstance) return;
  try { socketInstance.disconnect(); } catch (e) {}
  socketInstance = null;
}
