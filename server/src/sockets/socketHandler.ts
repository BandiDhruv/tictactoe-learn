import { Server as SocketIOServer, Socket } from "socket.io";
import redisClient from "../config/redisClient";

export default function initializeSockets(io: SocketIOServer): void {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("createRoom", async (roomId) => {
      if (socket.id) {
        const roomData = {
          players: [socket.id],
          gameState: {
            board: [["", "", ""], ["", "", ""], ["", "", ""]],
            currentTurn: socket.id,
          },
          playerCount: 1,
        };

        await redisClient.set(`room:${roomId}`, JSON.stringify(roomData), { EX: 3600 });

        socket.join(roomId);
        socket.emit("roomCreated", { roomId }); // Add this line
        io.to(roomId).emit("gameState", {
          ...roomData.gameState,
          players: roomData.players,
          playerCount: roomData.playerCount,
        });
      } else {
        socket.emit("error", { message: "Socket not connected" });
      }
    });

    socket.on("joinRoom", async (roomId) => {
      if (!socket.id) {
        socket.emit("error", { message: "Socket not connected" });
        return;
      }

      const roomDataStr = await redisClient.get(`room:${roomId}`);
      if (roomDataStr) {
        const roomData = JSON.parse(roomDataStr);
        if (!roomData.players.includes(socket.id)) {
          if (roomData.players.length < 2) {
            roomData.players.push(socket.id);
            roomData.playerCount = 2;
            await redisClient.set(`room:${roomId}`, JSON.stringify(roomData), { EX: 3600 });
            socket.join(roomId);
            socket.emit("roomJoined", { players: roomData.players });
            io.to(roomId).emit("gameState", {
              ...roomData.gameState,
              players: roomData.players,
              playerCount: roomData.playerCount,
            });
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

    socket.on("getGameState", async (roomId) => {
      const roomDataStr = await redisClient.get(`room:${roomId}`);
      if (roomDataStr) {
        const roomData = JSON.parse(roomDataStr);
        socket.emit("gameState", {
          ...roomData.gameState,
          players: roomData.players,
          playerCount: roomData.playerCount,
        });
      } else {
        socket.emit("error", { message: "Room does not exist" });
      }
    });

    socket.on("makeMove", async ({ gameId, row, col }) => {
      if (!socket.id) {
        socket.emit("error", { message: "Socket not connected" });
        return;
      }

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
        await redisClient.set(`room:${gameId}`, JSON.stringify(roomData), { EX: 3600 });

        io.to(gameId).emit("moveMade", { board, currentTurn: nextTurn });
      } else {
        socket.emit("error", { message: "Room does not exist" });
      }
    });

    socket.on("playAgain", async (gameId) => {
      const roomDataStr = await redisClient.get(`room:${gameId}`);
      if (roomDataStr) {
        const roomData = JSON.parse(roomDataStr);
        roomData.gameState = {
          board: [["", "", ""], ["", "", ""], ["", "", ""]],
          currentTurn: roomData.players[0],
        };
        await redisClient.set(`room:${gameId}`, JSON.stringify(roomData), { EX: 3600 });
        io.to(gameId).emit("gameReset", {
          ...roomData.gameState,
          players: roomData.players,
          playerCount: roomData.playerCount,
        });
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
            roomData.playerCount = roomData.players.length;
            if (roomData.players.length === 0) {
              await redisClient.del(key);
            } else {
              await redisClient.set(key, JSON.stringify(roomData), { EX: 3600 });
              io.to(key.split(":")[1]).emit("playerLeft", { playerCount: roomData.playerCount });
            }
            break;
          }
        }
      }
    });
  });
}

