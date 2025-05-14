import React, { useState } from 'react';
import { GameState, GameSettings as GameSettingsType, Position, PieceColor } from '../types/chess';
import ChessBoard from './ChessBoard';
import GameSettings from './GameSettings';
import { initializeBoard, makeMove, calculateValidMoves } from '../utils/chessLogic';
import { calculateComputerMove } from '../utils/chessAI';
import './ChessGame.css';

const ChessGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [moveHistory, setMoveHistory] = useState<GameState[]>([]);
  const [settings, setSettings] = useState<GameSettingsType>({
    playerColor: 'white',
    computerLevel: 2,
    boardTheme: 'green',
  });

  const startNewGame = (newSettings: GameSettingsType) => {
    setSettings(newSettings);
    setShowSettings(false);
    const initialBoard = initializeBoard();
    const initialState: GameState = {
      board: initialBoard,
      currentTurn: 'white' as PieceColor,
      selectedPiece: null,
      validMoves: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      computerLevel: newSettings.computerLevel,
      playerColor: newSettings.playerColor,
      boardTheme: newSettings.boardTheme,
    };
    setGameState(initialState);
    setMoveHistory([initialState]);
  };

  const handleRevert = () => {
    if (!gameState || gameState.currentTurn !== settings.playerColor) return;
    
    // Need to go back at least 2 moves (player's move and computer's move)
    if (moveHistory.length < 3) return;
    
    // Remove the last two states (computer's move and player's move)
    const newHistory = moveHistory.slice(0, -2);
    setMoveHistory(newHistory);
    setGameState(newHistory[newHistory.length - 1]);
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
      setMoveHistory(prev => [...prev, newGameState]);

      // Computer's turn
      if (newGameState.currentTurn !== settings.playerColor && !newGameState.isCheckmate) {
        setIsComputerThinking(true);
        setTimeout(() => {
          const computerMove = calculateComputerMove(newGameState);
          if (computerMove) {
            const updatedGameState = makeMove(newGameState, computerMove.from, computerMove.to);
            setGameState(updatedGameState);
            setMoveHistory(prev => [...prev, updatedGameState]);
          } else if (newGameState.isCheck) {
            // If computer can't move and is in check, it's checkmate
            setGameState({
              ...newGameState,
              isCheckmate: true
            });
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
        <div className="turn-info">
          <button onClick={() => setShowSettings(true)}>New Game</button>
          <button 
            style={{ fontSize: '20px', lineHeight: '0.7em' }}
            onClick={handleRevert}
            disabled={gameState.currentTurn !== settings.playerColor || moveHistory.length < 3}
            className="revert-button"
            title="Undo Move"
          >
            <b>&#8630;</b>
          </button>
          <p className="turn-label">
            Current Turn: {gameState.currentTurn}
            <div className={`spinner ${isComputerThinking ? 'visible' : ''}`}></div>
          </p>
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
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <GameSettings onStart={startNewGame} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame; 