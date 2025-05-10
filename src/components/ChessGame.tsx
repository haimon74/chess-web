import React, { useState } from 'react';
import { GameState, GameSettings as GameSettingsType, Position } from '../types/chess';
import ChessBoard from './ChessBoard';
import GameSettings from './GameSettings';
import { initializeBoard, makeMove, calculateValidMoves } from '../utils/chessLogic';
import { calculateComputerMove } from '../utils/chessAI';
import './ChessGame.css';

const ChessGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [settings, setSettings] = useState<GameSettingsType>({
    playerColor: 'white',
    computerLevel: 2,
    boardTheme: 'classic',
  });

  const startNewGame = (newSettings: GameSettingsType) => {
    setSettings(newSettings);
    const initialBoard = initializeBoard();
    setGameState({
      board: initialBoard,
      currentTurn: 'white',
      selectedPiece: null,
      validMoves: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      computerLevel: newSettings.computerLevel,
      playerColor: newSettings.playerColor,
      boardTheme: newSettings.boardTheme,
    });
  };

  const handlePieceClick = (position: Position) => {
    if (!gameState) return;

    const piece = gameState.board[position.row][position.col];
    if (!piece || piece.color !== gameState.currentTurn) return;

    const validMoves = calculateValidMoves(position, gameState);
    setGameState({
      ...gameState,
      selectedPiece: position,
      validMoves,
    });
  };

  const handleSquareClick = (position: Position) => {
    if (!gameState || !gameState.selectedPiece) return;

    const isValid = gameState.validMoves.some(
      move => move.row === position.row && move.col === position.col
    );

    if (isValid) {
      const newGameState = makeMove(gameState, gameState.selectedPiece, position);
      setGameState(newGameState);

      // Computer's turn
      if (newGameState.currentTurn !== settings.playerColor && !newGameState.isCheckmate) {
        setIsComputerThinking(true);
        setTimeout(() => {
          const computerMove = calculateComputerMove(newGameState);
          if (computerMove) {
            const updatedGameState = makeMove(newGameState, computerMove.from, computerMove.to);
            setGameState(updatedGameState);
          }
          setIsComputerThinking(false);
        }, 500);
      }
    }
  };

  if (!gameState) {
    return <GameSettings onStart={startNewGame} />;
  }

  return (
    <div className="chess-game">
      <div className="game-info">
        <h2>Chess Game</h2>
        <div className="turn-info">
          <button onClick={() => startNewGame(settings)}>New Game</button>
          <p>Current Turn: {gameState.currentTurn}</p>
          <div className={`computer-thinking ${isComputerThinking ? 'visible' : ''}`}>
            <div className="spinner"></div>
            <span>Computer is thinking...</span>
          </div>
        </div>
        {gameState.isCheckmate && <p className="checkmate">Checkmate!</p>}
        {gameState.isStalemate && <p className="stalemate">Stalemate!</p>}
      </div>
      <div className="board-container">
        <ChessBoard
          board={gameState.board}
          selectedPiece={gameState.selectedPiece}
          validMoves={gameState.validMoves}
          onPieceClick={handlePieceClick}
          onSquareClick={handleSquareClick}
          theme={gameState.boardTheme}
          isCheck={gameState.isCheck}
          gameState={gameState}
        />
      </div>
    </div>
  );
};

export default ChessGame; 