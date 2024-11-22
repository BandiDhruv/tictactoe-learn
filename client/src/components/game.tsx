import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../utils/socket";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Trophy, Home, Repeat } from 'lucide-react';

type BoardState = Array<Array<string>>;

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<BoardState>([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | "">("");
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  
  useEffect(() => {
    if (gameId) {
      socket.emit("joinRoom", gameId);

      socket.on("roomJoined", (data: { players: string[] }) => {
        const symbol = data.players[0] === socket.id ? "X" : "O";
        setPlayerSymbol(symbol);
      });

      socket.on("gameState", (data: { board: BoardState; currentTurn: string }) => {
        setBoard(data.board);
        setCurrentPlayer(data.currentTurn);
      });

      socket.on("moveMade", (data: { board: BoardState; currentTurn: string }) => {
        setBoard(data.board);
        setCurrentPlayer(data.currentTurn);
        const result = checkWin(data.board);
        if (result) {
          setGameResult(result);
          setIsResultModalOpen(true);
        }
      });

      return () => {
        socket.off("roomJoined");
        socket.off("gameState");
        socket.off("moveMade");
      };
    }
  }, [gameId]);

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] === "" && currentPlayer === socket.id) {
      socket.emit("makeMove", { gameId, row, col });
    }
  };

  const checkWin = (board: BoardState) => {
    const winningCombinations = [
      [[0, 0], [0, 1], [0, 2]],
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]],
    ];

    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        board[a[0]][a[1]] !== "" &&
        board[a[0]][a[1]] === board[b[0]][b[1]] &&
        board[a[0]][a[1]] === board[c[0]][c[1]]
      ) {
        return board[a[0]][a[1]];
      }
    }
    return board.flat().includes("") ? null : "Draw";
  };

  const handlePlayAgain = () => {
    socket.emit("playAgain", gameId);
  };
  
  useEffect(() => {
    socket.on("gameReset", (newGameState) => {
      setBoard(newGameState.board);
      setCurrentPlayer(newGameState.currentTurn);
      setGameResult(null);
      setIsResultModalOpen(false);
    });
  
    return () => {
      socket.off("gameReset");
    };
  }, []);

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-200 to-zinc-300 p-4">
      <h1 className="text-4xl font-bold mb-8">Game ID: {gameId}</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Button
              key={`${rowIndex}-${colIndex}`}
              className="w-24 h-24 text-4xl font-bold"
              variant={cell ? "default" : "outline"}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              disabled={cell !== "" || currentPlayer !== socket.id || gameResult !== null}
            >
              {cell}
            </Button>
          ))
        )}
      </div>
      <p className="text-xl mb-4">
        {gameResult ? "Game Over" : currentPlayer === socket.id ? "Your turn" : "Opponent's turn"}
      </p>
      <p className="text-lg">You are playing as: {playerSymbol}</p>

      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-center">
              <Trophy className="w-8 h-8 mr-2 text-yellow-400" />
              Game Over!
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center text-lg">
            {gameResult === "Draw" ? (
              <span className="text-blue-600 font-bold">It's a draw!</span>
            ) : gameResult === playerSymbol ? (
              <span className="text-green-600 font-bold">Congratulations! You won!</span>
            ) : (
              <span className="text-red-600 font-bold">You lost. Better luck next time!</span>
            )}
          </DialogDescription>
          <DialogFooter className="flex justify-center space-x-4">
            <Button onClick={handlePlayAgain} className="flex items-center">
              <Repeat className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button onClick={handleReturnHome} variant="outline" className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;