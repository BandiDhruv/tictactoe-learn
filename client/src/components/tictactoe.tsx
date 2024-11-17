'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function TicTacToeGame() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [gameCode, setGameCode] = useState('')

  const handleJoinGame = () => {
    // Here you would implement the logic to join the game with the entered code
    console.log('Joining game with code:', gameCode)
    setIsJoinModalOpen(false)
    setGameCode('')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-200 to-zinc-300 p-4">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-zinc-800 mb-8">
          Welcome to TicTacToe Game
        </h1>
        <p className="text-xl text-zinc-600 mb-8">
          By Dhruv Bandi
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => setIsJoinModalOpen(true)}
            className="w-full max-w-xs"
          >
            Join A Game
          </Button>
          <Button 
            variant="outline"
            className="w-full max-w-xs"
          >
            Create A Game
          </Button>
        </div>
      </div>

      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join a Game</DialogTitle>
            <DialogDescription>
              Enter the game code to join an existing game.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gameCode" className="text-right">
                Game Code
              </Label>
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
            <Button type="submit" onClick={handleJoinGame}>Join Game</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}