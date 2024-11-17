import { io } from "socket.io-client";
const socket = io("http://localhost:5000"); // Point to your backend server
export default socket;
