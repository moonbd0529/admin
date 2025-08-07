import { io } from "socket.io-client";
import apiConfig from './apiConfig.js';

// Make sure this matches your backend port!
export const socket = io(apiConfig.getSocketUrl(), {
  transports: ["websocket", "polling"],
  withCredentials: true
});
