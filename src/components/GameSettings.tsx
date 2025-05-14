import React, { useState } from 'react';
import { GameSettings as GameSettingsType, PieceColor, BoardTheme } from '../types/chess';
import styles from './GameSettings.module.css';

interface GameSettingsProps {
  onStart: (settings: GameSettingsType) => void;
}

const GameSettings: React.FC<GameSettingsProps> = ({ onStart }) => {
  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [computerLevel, setComputerLevel] = useState<number>(2);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('green');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      playerColor,
      computerLevel,
      boardTheme,
    });
  };

  return (
    <div className={styles.gameSettings}>
      <h2 className={styles.title}>Game Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.settingGroup}>
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

        <div className={styles.settingGroup}>
          <label>
            Computer Level (1-3):
            <input
              type="range"
              min="1"
              max="3"
              value={computerLevel}
              onChange={(e) => setComputerLevel(parseInt(e.target.value))}
            />
            <span>{computerLevel}</span>
          </label>
        </div>

        <div className={styles.settingGroup}>
          <label>
            Board Theme:
            <select
              value={boardTheme}
              onChange={(e) => setBoardTheme(e.target.value as BoardTheme)}
            >
              <option value="green">Nature</option>
              <option value="classic">Classic</option>
              <option value="brown">Wood</option>
              <option value="navy">Ocean</option>
            </select>
          </label>
        </div>

        <button type="submit" className={styles.startButton}>
          Start Game
        </button>
      </form>
    </div>
  );
};

export default GameSettings; 