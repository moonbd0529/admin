import { io } from "socket.io-client";

// Make sure this matches your backend port!
export const socket = io("http://localhost:5001", {
  transports: ["websocket", "polling"],
  withCredentials: true
});
