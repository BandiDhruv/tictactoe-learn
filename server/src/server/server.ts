import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { Express } from "express";
import initializeSockets from "../sockets/socketHandler";

export function startServer(app: Express): void {
  const port = process.env.PORT || 5000;
  const server = http.createServer(app);

  const io = new SocketIOServer(server, {
    cors: {
      origin: ["http://localhost:5173","https://tictactoe-learn.vercel.app"], 
      methods: ["GET", "POST"],
    },
  });

  initializeSockets(io);

  server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
