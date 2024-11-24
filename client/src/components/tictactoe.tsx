import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import socket from "@/utils/socket";

export default function TicTacToeGame() {
  const navigate = useNavigate();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Handle socket connection status
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    // Handle socket events
    function onError(error: { message: string }) {
      setErrorMessage(error.message || "An unexpected error occurred");
      setIsErrorModalOpen(true);
    }

    function onRoomJoined(data: { players: string[] }) {
      console.log("Room joined successfully:", data);
      setIsJoinModalOpen(false);
      setGameCode("");
      navigate(`/game/${gameCode}`);
    }

    function onRoomCreated(data: { roomId: string }) {
      console.log("Room created:", data);
      navigate(`/game/${data.roomId}`);
    }

    // Set up event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("error", onError);
    socket.on("roomJoined", onRoomJoined);
    socket.on("roomCreated", onRoomCreated);

    // Cleanup event listeners
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("error", onError);
      socket.off("roomJoined", onRoomJoined);
      socket.off("roomCreated", onRoomCreated);
    };
  }, [navigate, gameCode]);

  const handleJoinGame = async () => {
    try {
      if (!isConnected) {
        throw new Error("Not connected to server");
      }

      if (!gameCode.trim()) {
        throw new Error("Please enter a valid game code");
      }

      socket.emit("joinRoom", gameCode);
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred");
      setIsErrorModalOpen(true);
    }
  };

  const handleCreateGame = async () => {
    try {
      if (!isConnected) {
        throw new Error("Not connected to server");
      }

      const res = await axios.get(`${import.meta.env.VITE_BACKEND_IP}/createRoom`);
      if (res.status === 200 && res.data.roomId) {
        socket.emit("createRoom", res.data.roomId);
      } else {
        throw new Error("Error creating room");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred while creating the game");
      setIsErrorModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-200 to-zinc-300 p-4">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-zinc-800 mb-8">Welcome to TicTacToe Game</h1>
        <p className="text-xl text-zinc-600 mb-8">By Dhruv Bandi</p>
        {!isConnected && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>Not connected to server. Please check your connection.</AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <Button 
            onClick={() => setIsJoinModalOpen(true)} 
            className="w-full max-w-xs"
            disabled={!isConnected}
          >
            Join A Game
          </Button>
          <Button 
            onClick={handleCreateGame} 
            variant="outline" 
            className="w-full max-w-xs"
            disabled={!isConnected}
          >
            Create A Game
          </Button>
        </div>
      </div>

      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join a Game</DialogTitle>
            <DialogDescription>Enter the game code to join an existing game.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gameCode" className="text-right">Game Code</Label>
              <Input
                id="gameCode"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                className="col-span-3"
                placeholder="Enter game code"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleJoinGame}
              disabled={!isConnected || !gameCode.trim()}
            >
              Join Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Oops! Something went wrong</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button type="button" onClick={() => setIsErrorModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

