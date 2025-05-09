import React, { useState } from 'react';
import { GameSettings as GameSettingsType, PieceColor, BoardTheme } from '../types/chess';
import './GameSettings.css';

interface GameSettingsProps {
  onStart: (settings: GameSettingsType) => void;
}

const GameSettings: React.FC<GameSettingsProps> = ({ onStart }) => {
  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [computerLevel, setComputerLevel] = useState<number>(2);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('classic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      playerColor,
      computerLevel,
      boardTheme,
    });
  };

  return (
    <div className="game-settings">
      <h2>Chess Game Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="setting-group">
          <label>
            Choose Your Color:
            <select
              value={playerColor}
              onChange={(e) => setPlayerColor(e.target.value as PieceColor)}
            >
              <option value="white">White (First Move)</option>
              <option value="black">Black</option>
            </select>
          </label>
        </div>

        <div className="setting-group">
          <label>
            Computer Level (1-5):
            <input
              type="range"
              min="1"
              max="5"
              value={computerLevel}
              onChange={(e) => setComputerLevel(parseInt(e.target.value))}
            />
            <span>{computerLevel}</span>
          </label>
        </div>

        <div className="setting-group">
          <label>
            Board Theme:
            <select
              value={boardTheme}
              onChange={(e) => setBoardTheme(e.target.value as BoardTheme)}
            >
              <option value="classic">Classic</option>
              <option value="brown">Wood</option>
              <option value="green">Nature</option>
              <option value="navy">Ocean</option>
            </select>
          </label>
        </div>

        <button type="submit" className="start-button">
          Start Game
        </button>
      </form>
    </div>
  );
};

export default GameSettings; 