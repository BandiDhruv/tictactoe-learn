import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import socket from '../utils/socket';

const Game: React.FC = () => {
  const { gameId } = useParams();

  // useEffect(() => {
  //   socket.emit('joinGame', gameId, (response: { success: boolean; error?: string }) => {
  //     if (!response.success) {
  //       alert(response.error || 'Failed to join the game');
  //     }
  //   });

  //   return () => {
  //     socket.off('joinGame'); // Clean up event listener
  //   };
  // }, [gameId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold">Game ID: {gameId}</h1>
      <p className="text-lg text-gray-700">Game in progress...</p>
    </div>
  );
};

export default Game;
