import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/constants";

function getSocketBaseUrl() {
  // API_BASE_URL looks like: http://localhost:5000/api
  return String(API_BASE_URL || "").replace(/\/api\/?$/, "");
}

let socket = null;
let socketToken = null;

export function getAuthedSocket(token) {
  if (!token) return null;

  if (socket && socketToken === token) return socket;

  if (socket) {
    try {
      socket.removeAllListeners();
      socket.disconnect();
    } catch {
      // ignore
    }
    socket = null;
    socketToken = null;
  }

  socketToken = token;
  socket = io(getSocketBaseUrl(), {
    transports: ["websocket"],
    autoConnect: true,
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelayMax: 4000,
  });

  return socket;
}

export function disconnectAuthedSocket() {
  if (!socket) return;
  try {
    socket.removeAllListeners();
    socket.disconnect();
  } catch {
    // ignore
  } finally {
    socket = null;
    socketToken = null;
  }
}

