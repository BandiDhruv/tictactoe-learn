import { Routes, Route } from 'react-router-dom';
import TicTacToeGame from './components/tictactoe';
import Game from './components/game';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<TicTacToeGame />} />
      <Route path="/game/:gameId" element={<Game />} />
    </Routes>
  );
};

export default App;
