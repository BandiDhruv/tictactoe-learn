import { Server as SocketIOServer, Socket } from "socket.io";
import redisClient from "../config/redisClient";

export default function initializeSockets(io: SocketIOServer): void {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("createRoom", async (roomId) => {
      const roomData = {
        players: [socket.id],
        gameState: {
          board: [["", "", ""], ["", "", ""], ["", "", ""]],
          currentTurn: socket.id,
        },
      };

      await redisClient.set(`room:${roomId}`, JSON.stringify(roomData), { EX: 3600 });

      socket.join(roomId);
      socket.emit("roomCreated", { roomId });
    });

    socket.on("joinRoom", async (roomId) => {
      const roomDataStr = await redisClient.get(`room:${roomId}`);
      if (roomDataStr) {
        const roomData = JSON.parse(roomDataStr);
        if (!roomData.players.includes(socket.id)) {
          if (roomData.players.length < 2) {
            roomData.players.push(socket.id);
            await redisClient.set(`room:${roomId}`, JSON.stringify(roomData));
            socket.join(roomId);
            io.to(roomId).emit("roomJoined", { players: roomData.players });
            io.to(roomId).emit("gameState", roomData.gameState); // Send initial game state
          } else {
            socket.emit("error", { message: "Room is full" });
          }
        } else {
          socket.emit("error", { message: "You are already in the room" });
        }
      } else {
        socket.emit("error", { message: "Room does not exist" });
      }
    });

    socket.on("makeMove", async ({ gameId, row, col }) => {
      const roomDataStr = await redisClient.get(`room:${gameId}`);
      if (roomDataStr) {
        const roomData = JSON.parse(roomDataStr);
        const { board, currentTurn } = roomData.gameState;

        if (socket.id !== currentTurn || board[row][col] !== "") {
          socket.emit("error", { message: "Invalid move" });
          return;
        }

        board[row][col] = currentTurn === roomData.players[0] ? "X" : "O";
        const nextTurn = currentTurn === roomData.players[0] ? roomData.players[1] : roomData.players[0];

        roomData.gameState.board = board;
        roomData.gameState.currentTurn = nextTurn;
        await redisClient.set(`room:${gameId}`, JSON.stringify(roomData));

        io.to(gameId).emit("moveMade", { board, currentTurn: nextTurn });
      } else {
        socket.emit("error", { message: "Room does not exist" });
      }
    });

    socket.on("disconnect", async () => {
      for (const key of await redisClient.keys("room:*")) {
        const roomDataStr = await redisClient.get(key);
        if (roomDataStr) {
          const roomData = JSON.parse(roomDataStr);
          if (roomData.players.includes(socket.id)) {
            roomData.players = roomData.players.filter((id: string) => id !== socket.id);
            if (roomData.players.length === 0) {
              await redisClient.del(key);
            } else {
              await redisClient.set(key, JSON.stringify(roomData));
              io.to(key.split(":")[1]).emit("playerLeft", { playerId: socket.id });
            }
            break;
          }
        }
      }
    });
  });
}
