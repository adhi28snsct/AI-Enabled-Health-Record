import { io } from "socket.io-client";
const SOCKET_URL = import.meta.env.VITE_WS_URL || "http://localhost:5000";

export function createSocket(token) {
  if (!token) {
    return io(SOCKET_URL, { autoConnect: false });
  }

  return io(SOCKET_URL, {
    auth: { token },        
    autoConnect: true,
    transports: ["websocket"],
  });
}
